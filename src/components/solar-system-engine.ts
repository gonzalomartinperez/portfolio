import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  HemisphereLight,
  Line,
  LineBasicMaterial,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NoColorSpace,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import {
  type SolarPlanet,
  solarOrbitPoint,
  solarPhase,
  solarPlanets,
  solarTextureNames,
  solarTextureUrl,
} from "./solar-system-scene";

export type SolarEngine = {
  setPaused(value: boolean): void;
  setLight(value: boolean): void;
  setHost(host: HTMLElement | null): void;
  setImmersive(value: boolean, interactionElement?: HTMLElement): void;
  resetView(): void;
  rotateView(delta: number): void;
  highlightBody(name: string | null): void;
  dispose(): void;
};
type SolarOptions = {
  paused: boolean;
  light: boolean;
  fixedTime: number | null;
  debug: boolean;
  onReady(): void;
  onUnavailable(reason: "context" | "texture"): void;
};
type SolarCanvas = HTMLCanvasElement & { getSolarDebugSnapshot?: () => unknown };
type Body = {
  name: string;
  mesh: Mesh;
  orbit: Group;
  tilt: Group;
  config?: SolarPlanet;
  clouds?: Mesh;
  atmosphere?: Mesh;
  rings?: Mesh;
};

const surfaceVertex = `
varying vec3 worldNormal;
varying vec3 worldPosition;
varying vec2 surfaceUv;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  worldPosition = world.xyz;
  worldNormal = normalize(mat3(modelMatrix) * normal);
  surfaceUv = uv;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;
const atmosphereFragment = `
uniform vec3 glowColor;
uniform float glowStrength;
varying vec3 worldNormal;
varying vec3 worldPosition;
void main() {
  vec3 eye = normalize(cameraPosition - worldPosition);
  float rim = pow(1.0 - abs(dot(normalize(worldNormal), eye)), 2.4);
  gl_FragColor = vec4(glowColor, rim * glowStrength);
  #include <colorspace_fragment>
}`;
const coronaFragment = `
varying vec2 surfaceUv;
uniform float time;
void main() {
  vec2 p = surfaceUv - 0.5;
  float radius = length(p);
  float rays = 0.88 + 0.12 * sin(atan(p.y, p.x) * 16.0 + time * 0.08);
  float glow = exp(-radius * 4.5) * (1.0 - smoothstep(0.28, 0.5, radius));
  gl_FragColor = vec4(1.0, 0.48, 0.12, glow * rays * 0.82);
  #include <colorspace_fragment>
}`;

/** Owns its GPU resources and RAF; disposal also invalidates in-flight texture callbacks. */
export function createSolarSystemEngine(canvas: SolarCanvas, options: SolarOptions): SolarEngine {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 1800);
  let defaultDistance = 190;
  let immersive = false;
  let highlighted: string | null = null;
  let controls: OrbitControls | undefined;
  const originalHost = canvas.parentElement;
  const baseTarget = new WebGLRenderTarget(1, 1);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(1, 1), 0.38, 0.55, 2.1);
  composer.addPass(bloom);
  const alphaPass = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, base: { value: baseTarget.texture } },
    vertexShader:
      "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:
      "uniform sampler2D tDiffuse; uniform sampler2D base; varying vec2 vUv; void main(){vec4 lit=texture2D(tDiffuse,vUv); vec4 original=texture2D(base,vUv); vec3 halo=max(vec3(0.),lit.rgb-original.rgb); float alpha=max(original.a,min(.8,max(halo.r,max(halo.g,halo.b)))); gl_FragColor=vec4(lit.rgb,alpha);}",
  });
  composer.addPass(alphaPass);
  composer.addPass(new OutputPass());
  const solarRoot = new Group();
  solarRoot.name = "solar-system";
  scene.add(solarRoot);
  const sunlight = new PointLight(0xffefdc, 5.5, 0, 0);
  sunlight.name = "sunlight";
  solarRoot.add(sunlight);
  const ambient = new HemisphereLight(0xc4d2e6, 0x35465a, 0.23);
  scene.add(ambient);
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Map<string, Texture>();
  const geometry = <T extends BufferGeometry>(value: T) => {
    geometries.add(value);
    return value;
  };
  const material = <T extends Material>(value: T) => {
    materials.add(value);
    return value;
  };
  const sphere = geometry(new SphereGeometry(1, 64, 40));
  const bodies: Body[] = [];
  const orbits: { config: SolarPlanet; line: Line; positions: Float32Array }[] = [];
  let sun: Body | undefined;
  let moon: Body | undefined;
  let corona: Mesh<PlaneGeometry, ShaderMaterial> | undefined;
  const sunTime = { value: 0 };
  const ringShadows: { center: { value: Vector3 }; radius: { value: number }; mesh: Mesh }[] = [];
  let earthMaterial: MeshStandardMaterial | undefined;
  let meteor: Group | undefined;
  let meteorMaterial: ShaderMaterial | undefined;
  let width = 0,
    height = 0;
  let elapsed = options.fixedTime ?? 0;
  let lastTime = 0,
    frame = 0,
    framesRendered = 0;
  let paused = options.paused,
    light = options.light,
    disposed = false,
    loaded = false,
    contextAvailable = true;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  let averageFrameCost = 0;
  let textureBytes = 0;
  let estimatedGpuBytes = 0;
  let starsMaterial: PointsMaterial | undefined;
  let selectionHalo: Mesh | undefined;
  let drawing = false;

  const glow = (color: number, strength: number) =>
    material(
      new ShaderMaterial({
        vertexShader: surfaceVertex,
        fragmentShader: atmosphereFragment,
        uniforms: { glowColor: { value: new Color(color) }, glowStrength: { value: strength } },
        side: BackSide,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
  const ring = (inner: number, outer: number, textured: boolean) => {
    const shape = geometry(new RingGeometry(inner, outer, 96));
    const positions = shape.getAttribute("position");
    const uv = shape.getAttribute("uv");
    for (let index = 0; index < positions.count; index++) {
      const radius = Math.hypot(positions.getX(index), positions.getY(index));
      uv.setXY(index, (radius - inner) / (outer - inner), 0.5);
    }
    shape.rotateX(-Math.PI / 2);
    const mesh = new Mesh(
      shape,
      material(
        new MeshStandardMaterial({
          map: textured ? textures.get("saturn-rings") : null,
          color: textured ? 0xffffff : 0x94adad,
          roughness: 0.95,
          metalness: 0,
          transparent: true,
          opacity: textured ? 0.9 : 0.2,
          alphaTest: 0.01,
          side: DoubleSide,
          depthWrite: false,
        }),
      ),
    );
    const ringMaterial = mesh.material;
    const center = { value: new Vector3() };
    const radius = { value: 1 };
    ringMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.planetCenter = center;
      shader.uniforms.planetRadius = radius;
      shader.vertexShader =
        "varying vec3 ringWorld;\n" +
        shader.vertexShader.replace(
          "#include <worldpos_vertex>",
          "#include <worldpos_vertex>\nringWorld=(modelMatrix*vec4(transformed,1.0)).xyz;",
        );
      shader.fragmentShader =
        "varying vec3 ringWorld; uniform vec3 planetCenter; uniform float planetRadius;\n" +
        shader.fragmentShader.replace(
          "#include <color_fragment>",
          "#include <color_fragment>\nvec3 ray=normalize(-ringWorld); vec3 toCenter=planetCenter-ringWorld; float along=dot(toCenter,ray); float separation=length(toCenter-ray*max(0.0,along)); float shadow=1.0-smoothstep(planetRadius*.93,planetRadius*1.08,separation); diffuseColor.rgb*=1.0-shadow*step(0.0,along)*.8;",
        );
    };
    ringShadows.push({ center, radius, mesh });
    return mesh;
  };
  const createBodies = () => {
    const sunOrbit = new Group(),
      sunTilt = new Group();
    const sunMesh = new Mesh(
      sphere,
      material(
        new MeshStandardMaterial({
          map: textures.get("sun"),
          emissiveMap: textures.get("sun"),
          emissive: 0xffebc8,
          emissiveIntensity: 3.0,
          roughness: 1,
        }),
      ),
    );
    const sunMaterial = sunMesh.material;
    sunMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.solarTime = sunTime;
      shader.fragmentShader =
        "uniform float solarTime;\n" +
        shader.fragmentShader.replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\nfloat limb=.52+.48*pow(max(0.0,dot(normal,normalize(vViewPosition))),.45); float convection=.97+.03*sin(vMapUv.x*620.0+sin(vMapUv.y*430.0)+solarTime*.13); totalEmissiveRadiance*=limb*convection;",
        );
    };
    sunMesh.name = "sun";
    sunTilt.add(sunMesh);
    sunOrbit.add(sunTilt);
    solarRoot.add(sunOrbit);
    sun = { name: "sun", mesh: sunMesh, orbit: sunOrbit, tilt: sunTilt };
    bodies.push(sun);
    corona = new Mesh(
      geometry(new PlaneGeometry(1, 1)),
      material(
        new ShaderMaterial({
          vertexShader: surfaceVertex,
          fragmentShader: coronaFragment,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
          uniforms: { time: { value: 0 } },
        }),
      ),
    );
    corona.position.z = 0;
    solarRoot.add(corona);
    const sunShell = new Mesh(sphere, glow(0xffc578, 0.85));
    sunShell.name = "sun-corona";
    sunTilt.add(sunShell);
    for (const config of solarPlanets) {
      const orbit = new Group(),
        tilt = new Group();
      orbit.name = `${config.name}-orbit`;
      tilt.rotation.set(0, 0, (config.tilt * Math.PI) / 180);
      let surface: Material;
      if (config.name === "earth") {
        earthMaterial = material(
          new MeshStandardMaterial({
            map: textures.get("earth"),
            normalMap: textures.get("earth-normal"),
            normalScale: new Vector2(0.38, 0.38),
            roughnessMap: textures.get("earth-specular"),
            roughness: 0.85,
            metalness: 0,
            emissiveMap: textures.get("earth-night"),
            emissive: 0xffd69a,
            emissiveIntensity: textures.has("earth-night") ? 0.9 : 0,
          }),
        );
        earthMaterial.onBeforeCompile = (shader) => {
          shader.vertexShader =
            "varying vec3 solarNormal; varying vec3 solarPosition;\n" +
            shader.vertexShader.replace(
              "#include <worldpos_vertex>",
              "#include <worldpos_vertex>\nsolarNormal=normalize(mat3(modelMatrix)*normal); solarPosition=(modelMatrix*vec4(transformed,1.0)).xyz;",
            );
          shader.fragmentShader = shader.fragmentShader.replace(
            "roughnessFactor *= texelRoughness.g;",
            "roughnessFactor *= 1.0 - texelRoughness.g * 0.85;",
          );
          shader.fragmentShader =
            "varying vec3 solarNormal; varying vec3 solarPosition;\n" +
            shader.fragmentShader.replace(
              "#include <emissivemap_fragment>",
              "#include <emissivemap_fragment>\ntotalEmissiveRadiance *= 1.0-smoothstep(-0.22,0.12,dot(normalize(solarNormal),normalize(-solarPosition))); ",
            );
        };
        surface = earthMaterial;
      } else
        surface = material(
          new MeshStandardMaterial({
            map: textures.get(config.name),
            roughness: config.name === "venus" ? 0.8 : 0.96,
            metalness: 0,
          }),
        );
      const mesh = new Mesh(sphere, surface);
      mesh.name = config.name;
      mesh.rotation.y = config.name === "pluto" ? 1.2 : 0.7;
      tilt.add(mesh);
      orbit.add(tilt);
      solarRoot.add(orbit);
      const body: Body = { name: config.name, mesh, orbit, tilt, config };
      if (config.name === "earth") {
        body.clouds = new Mesh(
          sphere,
          material(
            new MeshStandardMaterial({
              map: textures.get("earth-clouds"),
              transparent: true,
              opacity: 0.48,
              roughness: 1,
              depthWrite: false,
            }),
          ),
        );
        body.clouds.name = "earth-clouds";
        body.clouds.visible = textures.has("earth-clouds");
        tilt.add(body.clouds);
        body.atmosphere = new Mesh(sphere, glow(0x4bafff, 0.6));
        body.atmosphere.name = "earth-atmosphere";
        tilt.add(body.atmosphere);
        const moonOrbit = new Group(),
          moonTilt = new Group();
        const moonMesh = new Mesh(
          sphere,
          material(new MeshStandardMaterial({ map: textures.get("moon"), roughness: 1 })),
        );
        moonMesh.name = "moon";
        moonOrbit.name = "earth-moon-orbit";
        moonTilt.add(moonMesh);
        moonOrbit.add(moonTilt);
        orbit.add(moonOrbit);
        moon = { name: "moon", mesh: moonMesh, orbit: moonOrbit, tilt: moonTilt };
        bodies.push(moon);
      }
      if (config.name === "saturn" || config.name === "uranus") {
        body.rings = ring(
          config.name === "saturn" ? 1.3 : 1.35,
          config.name === "saturn" ? 2.1 : 1.65,
          config.name === "saturn",
        );
        body.rings.name = `${config.name}-rings`;
        tilt.add(body.rings);
      }
      bodies.push(body);
      const positions = new Float32Array(129 * 3);
      const path = geometry(new BufferGeometry());
      path.setAttribute("position", new BufferAttribute(positions, 3));
      const line = new Line(
        path,
        material(
          new LineBasicMaterial({
            color: 0x7eabc5,
            transparent: true,
            opacity: 0.04,
            depthWrite: false,
          }),
        ),
      );
      line.name = `${config.name}-path`;
      solarRoot.add(line);
      orbits.push({ config, line, positions });
    }
    meteor = new Group();
    meteor.name = "shooting-star";
    scene.add(meteor);
    const tail = geometry(new BufferGeometry());
    const positions = new Float32Array(24 * 3),
      fade = new Float32Array(24);
    for (let index = 0; index < 24; index++) {
      positions[index * 3] = -index * 4;
      positions[index * 3 + 1] = index * 1.7;
      fade[index] = (1 - index / 24) ** 2;
    }
    tail.setAttribute("position", new BufferAttribute(positions, 3));
    tail.setAttribute("fade", new BufferAttribute(fade, 1));
    meteorMaterial = material(
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        vertexShader:
          "attribute float fade; varying float tailFade; void main(){ tailFade=fade; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
        fragmentShader:
          "uniform float strength; varying float tailFade; void main(){ gl_FragColor=vec4(0.65,0.83,1.0,tailFade*strength); }",
        uniforms: { strength: { value: 0 } },
      }),
    );
    meteor.add(new Line(tail, meteorMaterial));
    meteor.scale.setScalar(0.045);
    const head = new Mesh(sphere, material(new MeshBasicMaterial({ color: 0xd9f1ff })));
    head.scale.setScalar(1.2);
    meteor.add(head);
  };

  const createStars = () => {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    let seed = 48271;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let index = 0; index < count; index++) {
      const theta = random() * Math.PI * 2;
      const y = random() * 2 - 1;
      const radius = 500;
      const span = Math.sqrt(1 - y * y);
      positions.set(
        [Math.cos(theta) * span * radius, y * radius, Math.sin(theta) * span * radius],
        index * 3,
      );
      const brightness = 0.25 + random() * 0.65;
      colors.set([brightness * 0.86, brightness * 0.94, brightness], index * 3);
    }
    const field = geometry(new BufferGeometry());
    field.setAttribute("position", new BufferAttribute(positions, 3));
    field.setAttribute("color", new BufferAttribute(colors, 3));
    const stars = new Points(
      field,
      material(
        new PointsMaterial({
          size: 0.65,
          vertexColors: true,
          transparent: true,
          opacity: 0.78,
          depthWrite: false,
        }),
      ),
    );
    starsMaterial = stars.material;
    stars.material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        "diffuseColor.a*=1.0-smoothstep(.12,.5,length(gl_PointCoord-.5));\n#include <opaque_fragment>",
      );
    };
    stars.name = "solar-stars";
    scene.add(stars);
  };
  const createSelectionHalo = () => {
    selectionHalo = new Mesh(sphere, glow(0x8edbff, 0.35));
    selectionHalo.name = "solar-selection";
    selectionHalo.visible = false;
    scene.add(selectionHalo);
  };
  const resetView = () => {
    const elevation = (Math.PI * 35) / 180;
    camera.position.set(
      0,
      Math.sin(elevation) * defaultDistance,
      Math.cos(elevation) * defaultDistance,
    );
    camera.lookAt(0, 0, 0);
    controls?.target.set(0, 0, 0);
    camera.updateMatrixWorld();
  };
  const controlChanged = () => {
    if (paused) draw();
  };
  const update = () => {
    const mobile = width < 640;
    sunTime.value = elapsed;
    solarRoot.position.set(0, 0, 0);
    const sunRadius = 6;
    sun?.mesh.scale.setScalar(sunRadius);
    if (sun) {
      sun.mesh.rotation.y = (elapsed * Math.PI * 2) / 180;
      sun.tilt.children[1]?.scale.setScalar(sunRadius * 1.1);
    }
    corona?.scale.set(sunRadius * 5.5, sunRadius * 5.5, 1);
    if (corona) {
      corona.material.uniforms.time.value = elapsed;
      corona.quaternion.copy(camera.quaternion);
    }
    for (const body of bodies) {
      if (!body.config) continue;
      const config = body.config;
      const angle = solarPhase(config, mobile) + (elapsed * Math.PI * 2) / config.period;
      const position = solarOrbitPoint(config, angle, width, height, mobile);
      body.orbit.position.set(position.x, position.y, position.z);
      const radius = config.radius;
      body.mesh.scale.setScalar(radius);
      body.mesh.rotation.y =
        (config.name === "pluto" ? 1.2 : 0.7) + (elapsed * Math.PI * 2) / config.spin;
      body.clouds?.scale.setScalar(radius * 1.025);
      if (body.clouds) body.clouds.rotation.y = body.mesh.rotation.y + elapsed * 0.006;
      body.atmosphere?.scale.setScalar(radius * 1.09);
      body.rings?.scale.setScalar(radius);
      if (config.name === "earth" && moon) {
        const angle = 0.8 + (elapsed * Math.PI * 2) / 72;
        moon.orbit.position.set(
          Math.cos(angle) * radius * 1.65,
          Math.sin(angle) * radius * 0.48,
          Math.sin(angle) * radius * 1.4,
        );
        moon.mesh.scale.setScalar(0.22);
        moon.mesh.rotation.y = -angle + Math.PI / 2;
      }
    }
    solarRoot.updateMatrixWorld(true);
    if (selectionHalo) {
      const selected = bodies.find((body) => body.name === highlighted);
      selectionHalo.visible = !!selected;
      if (selected) {
        selected.mesh.getWorldPosition(selectionHalo.position);
        selectionHalo.scale.setScalar(selected.mesh.scale.x * 1.25);
      }
    }
    for (const shadow of ringShadows) {
      shadow.mesh.getWorldPosition(shadow.center.value);
      shadow.radius.value = shadow.mesh.scale.x;
    }
    if (meteor && meteorMaterial) {
      const cycle = elapsed % 47,
        progress = (cycle - 18) / 1.6;
      meteor.visible = progress >= 0 && progress <= 1;
      meteor.position.set(-55 + 85 * progress, 38 - 36 * progress, -15);
      meteorMaterial.uniforms.strength.value =
        Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI) * 0.8;
    }
  };
  const draw = () => {
    if (disposed || !loaded || !contextAvailable || drawing) return;
    drawing = true;
    update();
    controls?.update();
    renderer.setRenderTarget(baseTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    composer.render();
    framesRendered++;
    drawing = false;
    if (framesRendered % 180 === 0 && averageFrameCost > 21 && pixelRatio > 0.8) {
      pixelRatio = Math.max(0.8, pixelRatio * 0.85);
      resize();
    }
  };
  const animate = (time: number) => {
    frame = 0;
    if (disposed || paused || !contextAvailable || !loaded) return;
    if (options.fixedTime === null)
      elapsed += lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0;
    if (lastTime) averageFrameCost = averageFrameCost * 0.95 + (time - lastTime) * 0.05;
    lastTime = time;
    draw();
    frame = requestAnimationFrame(animate);
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (loaded && contextAvailable && !paused && !disposed) frame = requestAnimationFrame(animate);
  };
  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    width = bounds.width;
    height = bounds.height;
    const memoryLimit = (width < 640 ? 128 : 256) * 1024 * 1024;
    const memoryPixels = Math.max(250_000, ((memoryLimit - textureBytes) * 0.98) / 40);
    pixelRatio = Math.min(
      pixelRatio,
      width < 640 ? 1.5 : 2,
      Math.sqrt(Math.min(width < 640 ? 1_500_000 : 3_500_000, memoryPixels) / (width * height)),
    );
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(width, height);
    bloom.setSize(Math.ceil(width * pixelRatio * 0.6), Math.ceil(height * pixelRatio * 0.6));
    baseTarget.setSize(Math.ceil(width * pixelRatio), Math.ceil(height * pixelRatio));
    estimatedGpuBytes =
      textureBytes + Math.ceil(width * pixelRatio) * Math.ceil(height * pixelRatio) * 40;
    camera.aspect = width / height;
    defaultDistance = (60 / Math.sin((Math.PI * 35) / 360)) * Math.max(1, 1 / camera.aspect);
    if (!immersive) resetView();
    camera.updateProjectionMatrix();
    for (const orbit of orbits) {
      for (let index = 0; index <= 128; index++) {
        const point = solarOrbitPoint(
          orbit.config,
          (index * Math.PI * 2) / 128,
          width,
          height,
          width < 640,
        );
        orbit.positions.set([point.x, point.y, point.z], index * 3);
      }
      orbit.line.geometry.getAttribute("position").needsUpdate = true;
      orbit.line.geometry.computeBoundingSphere();
    }
    draw();
  };
  const setLight = (value: boolean) => {
    light = value;
    starsMaterial?.color.set(light && !immersive ? 0x29466a : 0xffffff);
    if (starsMaterial) starsMaterial.opacity = light && !immersive ? 0.86 : 0.78;
    ambient.intensity = immersive ? 0.23 : light ? 0.32 : 0.23;
    for (const orbit of orbits)
      (orbit.line.material as LineBasicMaterial).opacity = light && !immersive ? 0.1 : 0.08;
    draw();
  };
  const lost = (event: Event) => {
    event.preventDefault();
    contextAvailable = false;
    sync();
    options.onUnavailable("context");
  };
  const restored = () => {
    if (disposed) return;
    contextAvailable = true;
    resize();
    if (loaded) options.onReady();
    sync();
  };
  canvas.addEventListener("webglcontextlost", lost);
  canvas.addEventListener("webglcontextrestored", restored);
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  window.addEventListener("resize", resize);
  resize();
  if (options.debug)
    canvas.getSolarDebugSnapshot = () => {
      scene.updateMatrixWorld(true);
      const bodySnapshot = bodies.map((body) => {
        const world = body.mesh.getWorldPosition(new Vector3());
        const point = world.clone().project(camera);
        const radius = body.mesh.scale.x;
        const surface = body.mesh.material;
        const candidate =
          surface instanceof ShaderMaterial
            ? surface.uniforms.dayMap?.value
            : surface instanceof MeshStandardMaterial
              ? surface.map
              : null;
        const texture = candidate instanceof Texture ? candidate : null;
        const image = texture?.source.data;

        return {
          name: body.name,
          geometry: body.mesh.geometry.type,
          material: Array.isArray(body.mesh.material) ? "multiple" : body.mesh.material.type,
          world: world.toArray(),
          parent: body.orbit.parent?.name ?? "",
          rotation: body.mesh.rotation.toArray(),
          screen: {
            x: ((point.x + 1) * width) / 2,
            y: ((1 - point.y) * height) / 2,
            radius:
              (Math.abs(
                world
                  .clone()
                  .add(
                    new Vector3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(radius),
                  )
                  .project(camera).x - point.x,
              ) *
                width) /
              2,
          },
          axialTilt: body.tilt.rotation.toArray(),
          texture:
            image instanceof HTMLImageElement
              ? image.currentSrc || image.src
              : (texture?.userData.sourceUrl ?? null),
          textureColorSpace: texture?.colorSpace ?? null,
        };
      });
      const saturnRings = bodies.find(({ name }) => name === "saturn")?.rings;
      const ringMaterial =
        saturnRings && !Array.isArray(saturnRings.material) ? saturnRings.material : null;
      return {
        elapsed,
        immersive,
        highlighted,
        camera: { type: camera.type, target: [0, 0, 0], position: camera.position.toArray() },
        averageFrameCost,
        estimatedGpuBytes,
        textureBytes,
        framesRendered,
        paused,
        contextAvailable,
        pixelRatio,
        textureCount: textures.size,
        gpuTextures: renderer.info.memory.textures,
        calls: renderer.info.render.calls,
        bodies: bodySnapshot,
        rings: {
          saturn: saturnRings?.geometry.type,
          depthTest: ringMaterial?.depthTest,
          depthWrite: ringMaterial?.depthWrite,
          side: ringMaterial?.side,
        },
        meteorVisible: meteor?.visible ?? false,
      };
    };
  const loader = new TextureLoader();
  void Promise.all(
    solarTextureNames.map(async (name) => {
      let texture: Texture;
      try {
        texture = await loader.loadAsync(solarTextureUrl(name));
      } catch (error) {
        if (
          name === "earth-normal" ||
          name === "earth-specular" ||
          name === "earth-night" ||
          name === "earth-clouds"
        )
          return;
        throw error;
      }
      if (disposed) {
        texture.dispose();
        return;
      }
      const source = texture.source.data;
      if (source instanceof HTMLImageElement) {
        texture.userData.sourceUrl = source.currentSrc || source.src;
        const prominent = name === "sun" || name === "earth" || name === "jupiter";
        const maxDimension = Math.min(
          renderer.capabilities.maxTextureSize,
          prominent ? (width < 640 ? 2048 : 4096) : 1024,
        );
        const factor = Math.min(
          1,
          maxDimension / Math.max(source.naturalWidth, source.naturalHeight),
        );
        if (factor < 1) {
          const decoded = document.createElement("canvas");
          decoded.width = Math.max(1, Math.round(source.naturalWidth * factor));
          decoded.height = Math.max(1, Math.round(source.naturalHeight * factor));
          const context = decoded.getContext("2d");
          if (context) {
            context.drawImage(source, 0, 0, decoded.width, decoded.height);
            texture.image = decoded;
          }
        }
        const decoded = texture.image;
        if (decoded instanceof HTMLCanvasElement || decoded instanceof HTMLImageElement)
          textureBytes += Math.ceil((decoded.width * decoded.height * 4 * 4) / 3);
      }
      texture.colorSpace =
        name === "earth-normal" || name === "earth-specular" ? NoColorSpace : SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      textures.set(name, texture);
    }),
  )
    .then(() => {
      if (disposed) return;
      createBodies();
      createStars();
      createSelectionHalo();
      loaded = true;
      resize();
      setLight(light);
      if (contextAvailable) options.onReady();
      sync();
    })
    .catch(() => {
      if (!disposed) options.onUnavailable("texture");
    });

  return {
    setPaused(value) {
      paused = value;
      sync();
    },
    setLight,
    setHost(host) {
      (host ?? originalHost)?.appendChild(canvas);
      resize();
    },
    setImmersive(value, interactionElement) {
      if (
        value === immersive &&
        (!value || controls?.domElement === (interactionElement ?? canvas))
      )
        return;
      immersive = value;
      controls?.dispose();
      controls = undefined;
      resetView();
      if (value) {
        controls = new OrbitControls(camera, interactionElement ?? canvas);
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minPolarAngle = (Math.PI * 25) / 180;
        controls.maxPolarAngle = (Math.PI * 75) / 180;
        controls.minDistance = defaultDistance * 0.3;
        controls.maxDistance = defaultDistance * 1.8;
        controls.target.set(0, 0, 0);
        controls.addEventListener("change", controlChanged);
      }
      setLight(light);
      resize();
    },
    resetView() {
      resetView();
      draw();
    },
    rotateView(delta) {
      const x = camera.position.x;
      const z = camera.position.z;
      camera.position.x = x * Math.cos(delta) + z * Math.sin(delta);
      camera.position.z = -x * Math.sin(delta) + z * Math.cos(delta);
      camera.lookAt(0, 0, 0);
      draw();
    },
    highlightBody(name) {
      highlighted = name;
      for (const orbit of orbits)
        (orbit.line.material as LineBasicMaterial).opacity =
          orbit.config.name === name ? 0.4 : light && !immersive ? 0.1 : 0.08;
      draw();
    },
    dispose() {
      if (disposed) return;
      originalHost?.appendChild(canvas);
      disposed = true;
      cancelAnimationFrame(frame);
      controls?.dispose();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      baseTarget.dispose();
      for (const pass of composer.passes) pass.dispose();
      composer.dispose();
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      delete canvas.getSolarDebugSnapshot;
      for (const texture of textures.values()) texture.dispose();
      for (const value of geometries) value.dispose();
      for (const value of materials) value.dispose();
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
