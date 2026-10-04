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
  OrthographicCamera,
  PlaneGeometry,
  PointLight,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";
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
const earthFragment = `
uniform sampler2D dayMap;
uniform sampler2D nightMap;
uniform vec3 sunPosition;
varying vec3 worldNormal;
varying vec3 worldPosition;
varying vec2 surfaceUv;
void main() {
  float sunlight = dot(normalize(worldNormal), normalize(sunPosition - worldPosition));
  vec3 daylight = texture2D(dayMap, surfaceUv).rgb * (0.3 + 1.1 * max(sunlight, 0.0));
  vec3 cities = texture2D(nightMap, surfaceUv).rgb * (1.0 - smoothstep(-0.25, 0.12, sunlight));
  gl_FragColor = vec4(daylight + cities * 0.85, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
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
    powerPreference: "low-power",
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 3000);
  camera.position.z = 1600;
  const solarRoot = new Group();
  solarRoot.name = "solar-system";
  scene.add(solarRoot);
  const sunlight = new PointLight(0xffe6c2, 3.6, 0, 0);
  sunlight.name = "sunlight";
  solarRoot.add(sunlight);
  const ambient = new HemisphereLight(0xc4d2e6, 0x35465a, 1.15);
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
  const sphere = geometry(new SphereGeometry(1, 48, 32));
  const bodies: Body[] = [];
  const orbits: { config: SolarPlanet; line: Line; positions: Float32Array }[] = [];
  let sun: Body | undefined;
  let moon: Body | undefined;
  let corona: Mesh<PlaneGeometry, ShaderMaterial> | undefined;
  let earthMaterial: ShaderMaterial | undefined;
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
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  let averageDrawCost = 0;

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
    return new Mesh(
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
    corona.position.z = -2;
    solarRoot.add(corona);
    const sunShell = new Mesh(sphere, glow(0xffc578, 0.85));
    sunShell.name = "sun-corona";
    sunTilt.add(sunShell);
    for (const config of solarPlanets) {
      const orbit = new Group(),
        tilt = new Group();
      orbit.name = `${config.name}-orbit`;
      tilt.rotation.set(0.24, 0, (config.tilt * Math.PI) / 180);
      let surface: Material;
      if (config.name === "earth") {
        earthMaterial = material(
          new ShaderMaterial({
            vertexShader: surfaceVertex,
            fragmentShader: earthFragment,
            uniforms: {
              dayMap: { value: textures.get("earth") },
              nightMap: { value: textures.get("earth-night") },
              sunPosition: { value: new Vector3() },
            },
          }),
        );
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
    const head = new Mesh(sphere, material(new MeshBasicMaterial({ color: 0xd9f1ff })));
    head.scale.setScalar(1.2);
    meteor.add(head);
  };

  const update = () => {
    const mobile = width < 640;
    solarRoot.position.set(width * (mobile ? 0.22 : 0.12), height * 0.04, 0);
    const sunRadius = (mobile ? 52 : 90) / 2;
    sun?.mesh.scale.setScalar(sunRadius);
    if (sun) {
      sun.mesh.rotation.y = (elapsed * Math.PI * 2) / 180;
      sun.tilt.children[1]?.scale.setScalar(sunRadius * 1.16);
    }
    corona?.scale.set(sunRadius * 6.4, sunRadius * 6.4, 1);
    if (corona) corona.material.uniforms.time.value = elapsed;
    earthMaterial?.uniforms.sunPosition.value.copy(solarRoot.position);
    for (const body of bodies) {
      if (!body.config) continue;
      const config = body.config;
      const angle = solarPhase(config, mobile) + (elapsed * Math.PI * 2) / config.period;
      const position = solarOrbitPoint(config, angle, width, height, mobile);
      body.orbit.position.set(position.x, position.y, position.z);
      const radius = (mobile ? config.mobileDiameter : config.diameter) / 2;
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
        moon.mesh.scale.setScalar(mobile ? 4.5 : 7);
        moon.mesh.rotation.y = -angle + Math.PI / 2;
      }
    }
    if (meteor && meteorMaterial) {
      const cycle = elapsed % 47,
        progress = (cycle - 18) / 1.6;
      meteor.visible = progress >= 0 && progress <= 1;
      meteor.position.set(
        -width * 0.44 + width * 0.65 * progress,
        height * 0.33 - height * 0.29 * progress,
        300,
      );
      meteorMaterial.uniforms.strength.value =
        Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI) * 0.8;
    }
  };
  const draw = () => {
    if (disposed || !loaded || !contextAvailable) return;
    update();
    const started = performance.now();
    renderer.render(scene, camera);
    framesRendered++;
    averageDrawCost = averageDrawCost * 0.92 + (performance.now() - started) * 0.08;
    if (framesRendered % 120 === 0 && averageDrawCost > 12 && pixelRatio > 0.85) {
      pixelRatio = Math.max(0.85, pixelRatio * 0.8);
      renderer.setPixelRatio(pixelRatio);
    }
  };
  const animate = (time: number) => {
    frame = 0;
    if (disposed || paused || !contextAvailable || !loaded) return;
    if (options.fixedTime === null)
      elapsed += lastTime ? Math.min(0.05, (time - lastTime) / 1000) : 0;
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
    pixelRatio = Math.min(pixelRatio, width < 640 ? 1.25 : 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
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
    ambient.intensity = light ? 1.3 : 1.15;
    for (const orbit of orbits)
      (orbit.line.material as LineBasicMaterial).opacity = light ? 0.025 : 0.04;
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
          screen: { x: ((point.x + 1) * width) / 2, y: ((1 - point.y) * height) / 2, radius },
          axialTilt: body.tilt.rotation.toArray(),
          texture: image instanceof HTMLImageElement ? image.currentSrc || image.src : null,
          textureColorSpace: texture?.colorSpace ?? null,
        };
      });
      const saturnRings = bodies.find(({ name }) => name === "saturn")?.rings;
      const ringMaterial =
        saturnRings && !Array.isArray(saturnRings.material) ? saturnRings.material : null;
      return {
        elapsed,
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
      const texture = await loader.loadAsync(solarTextureUrl(name));
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      textures.set(name, texture);
    }),
  )
    .then(() => {
      if (disposed) return;
      createBodies();
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
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
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
