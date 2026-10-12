import { readingChunk } from "./solar-system-reading";

/**
 * GLSL for the solar renderer. Every material writes premultiplied color and is drawn with
 * `premultipliedOver` blending: alpha 0 adds light (glows over the dark page) while alpha 1
 * covers it (opaque bodies). One blend mode therefore serves both themes without
 * post-processing passes.
 */

const noise = /* glsl */ `
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x),
        mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x),
        mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 6; octave++) {
    if (octave >= octaves) break;
    value += amplitude * noise3(p);
    p = p * 2.03 + vec3(17.1, 9.2, 4.7);
    amplitude *= 0.5;
  }
  return value;
}`;

/**
 * Tone-maps and encodes linear HDR color for the sRGB canvas. `cover` writes premultiplied color
 * that hides the page by `alpha`; `glow` adds light. Both recede behind reading text.
 */
const output = /* glsl */ `
${readingChunk}
vec3 encode(vec3 color) {
  vec4 encoded = vec4(max(color, 0.0), 1.0);
  #if defined(TONE_MAPPING)
  encoded.rgb = toneMapping(encoded.rgb);
  #endif
  return linearToOutputTexel(encoded).rgb;
}
/** Design colors (ink, guides) keep their exact tone: color-space encoding without tone mapping. */
vec4 plain(vec3 color, float alpha) {
  return vec4(linearToOutputTexel(vec4(color, 1.0)).rgb * alpha, alpha) * readingFactor();
}
vec4 cover(vec3 color, float alpha) { return vec4(encode(color) * alpha, alpha) * readingFactor(); }
vec4 glow(vec3 color) { return vec4(encode(color), 0.0) * readingFactor(); }
`;

/** Sphere surfaces: equirectangular UVs (textures uploaded without a Y flip) and an east tangent. */
export const sphereVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vTangent;
varying vec3 vObject;
void main() {
  vUv = vec2(uv.x, 1.0 - uv.y);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPosition = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec3 east = vec3(position.z, 0.0, -position.x);
  vTangent = mat3(modelMatrix) * (dot(east, east) > 1e-8 ? normalize(east) : vec3(1.0, 0.0, 0.0));
  vObject = position;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

export const planetFragment = /* glsl */ `
uniform sampler2D dayMap;
uniform vec3 sunPosition;
uniform vec3 sunColor;
uniform vec3 ambientColor;
uniform float bump;
uniform float lunar;
uniform float terminator;
uniform float limb;
uniform vec3 atmosphereColor;
uniform float atmosphereStrength;
uniform float nightAlpha;
#ifdef EARTH
uniform sampler2D nightMap;
uniform sampler2D normalMap;
uniform sampler2D specularMap;
uniform sampler2D cloudMap;
uniform float cloudOffset;
uniform float hasNight;
uniform float hasNormal;
uniform float hasSpecular;
uniform float hasClouds;
#endif
#ifdef RINGED
uniform sampler2D ringMap;
uniform vec3 ringNormal;
uniform vec3 planetCenter;
uniform float ringInner;
uniform float ringOuter;
#endif
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vTangent;
${output}
float luma(vec3 color) { return dot(color, vec3(0.2126, 0.7152, 0.0722)); }
void main() {
  vec3 N = normalize(vNormal);
  // Near the poles the interpolated east vector can vanish; any perpendicular axis will do there.
  vec3 tangent = vTangent - N * dot(vTangent, N);
  vec3 fallback = abs(N.y) < 0.99 ? cross(vec3(0.0, 1.0, 0.0), N) : cross(vec3(1.0, 0.0, 0.0), N);
  vec3 T = normalize(dot(tangent, tangent) > 1e-6 ? tangent : fallback);
  vec3 north = cross(N, T);
  vec3 L = normalize(sunPosition - vPosition);
  vec3 V = normalize(cameraPosition - vPosition);
  vec3 albedo = texture2D(dayMap, vUv).rgb;
  vec3 surface = N;
#ifdef EARTH
  if (hasNormal > 0.5) {
    vec3 tangentNormal = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    surface = normalize(T * tangentNormal.x * 0.55 + north * tangentNormal.y * 0.55 + N * tangentNormal.z);
  }
#else
  if (bump > 0.0) {
    vec2 texelSize = 1.0 / vec2(textureSize(dayMap, 0));
    float height = luma(albedo);
    float east = luma(texture2D(dayMap, vUv + vec2(texelSize.x, 0.0)).rgb) - height;
    float south = luma(texture2D(dayMap, vUv + vec2(0.0, texelSize.y)).rgb) - height;
    surface = normalize(N - bump * (east * T - south * north));
  }
#endif
  float geometric = dot(N, L);
  float incidence = max(dot(surface, L), 0.0);
  float emergence = max(dot(surface, V), 1e-3);
  float wrapped = clamp((dot(surface, L) + terminator) / (1.0 + terminator), 0.0, 1.0);
  float lommel = min(1.6, 2.0 * incidence / (incidence + emergence + 1e-4));
  float diffuse = mix(wrapped, (1.0 - 0.6) * incidence + 0.6 * lommel, lunar);
  // Relief can never light the hemisphere facing away from the Sun.
  diffuse *= smoothstep(-0.04 - terminator, 0.06, geometric);
  diffuse *= mix(1.0, pow(max(dot(N, V), 0.0), 0.32), limb);
  vec3 color = albedo * (sunColor * diffuse + ambientColor);
  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  float daylight = smoothstep(-0.28, 0.45, geometric);
  color += atmosphereColor * rim * daylight * atmosphereStrength;
#ifdef EARTH
  vec2 cloudUv = vUv + vec2(cloudOffset, 0.0);
  float cloud = hasClouds > 0.5 ? texture2D(cloudMap, cloudUv).a : 0.0;
  if (hasSpecular > 0.5) {
    float ocean = texture2D(specularMap, vUv).r;
    vec3 halfway = normalize(L + V);
    float glint = pow(max(dot(N, halfway), 0.0), 70.0) * ocean * (1.0 - cloud);
    color += sunColor * vec3(1.0, 0.93, 0.8) * glint * 0.9 * step(0.0, geometric);
  }
  color *= 1.0 - cloud * 0.42 * smoothstep(0.0, 0.25, geometric);
  if (hasNight > 0.5) {
    vec3 cities = texture2D(nightMap, vUv).rgb;
    float night = (1.0 - smoothstep(-0.2, 0.1, geometric));
    color += cities * vec3(1.0, 0.74, 0.42) * 1.25 * night * (1.0 - cloud * 0.75);
  }
  float twilightBand = geometric / 0.14;
  float twilight = exp(-twilightBand * twilightBand);
  color += vec3(1.0, 0.42, 0.18) * twilight * rim * 0.55;
#endif
#ifdef RINGED
  float facing = dot(L, ringNormal);
  if (abs(facing) > 1e-4) {
    float travel = dot(planetCenter - vPosition, ringNormal) / facing;
    if (travel > 0.0) {
      float ring = length(vPosition + L * travel - planetCenter);
      float band = (ring - ringInner) / (ringOuter - ringInner);
      if (band > 0.0 && band < 1.0) color *= 1.0 - texture2D(ringMap, vec2(band, 0.5)).a * 0.82;
    }
  }
#endif
  float alpha = mix(nightAlpha, 1.0, smoothstep(-0.2, 0.3, geometric));
  gl_FragColor = cover(color, alpha);
}`;

export const cloudFragment = /* glsl */ `
uniform sampler2D cloudMap;
uniform vec3 sunPosition;
uniform vec3 sunColor;
uniform float nightAlpha;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
${output}
void main() {
  vec3 N = normalize(vNormal);
  float light = dot(N, normalize(sunPosition - vPosition));
  float coverage = texture2D(cloudMap, vUv).a;
  vec3 color = sunColor * (0.01 + 0.99 * smoothstep(-0.12, 0.45, light)) * 0.9;
  float alpha = coverage * 0.9 * mix(nightAlpha, 1.0, smoothstep(-0.2, 0.25, light));
  gl_FragColor = cover(color, alpha);
}`;

/** Additive limb glow outside a planet: brightest at the surface, fading to the shell edge. */
export const atmosphereFragment = /* glsl */ `
uniform vec3 sunPosition;
uniform vec3 glowColor;
uniform float glowStrength;
uniform float innerRatio;
uniform float lightMode;
varying vec3 vNormal;
varying vec3 vPosition;
${output}
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vPosition);
  float facing = dot(N, V);
  float impact = sqrt(max(0.0, 1.0 - facing * facing));
  float height = clamp((impact - innerRatio) / (1.0 - innerRatio), 0.0, 1.0);
  float density = pow(1.0 - height, 2.2) * smoothstep(0.0, 0.08, height + 0.04);
  float day = smoothstep(-0.35, 0.35, dot(N, normalize(sunPosition - vPosition)));
  float forward = pow(max(0.0, dot(-V, normalize(sunPosition - vPosition))), 6.0);
  vec3 color = glowColor * density * (day + forward * 1.5) * glowStrength;
  float haze = density * day * glowStrength * 0.5;
  gl_FragColor = mix(glow(color), cover(glowColor, haze), lightMode);
}`;

export const sunFragment = /* glsl */ `
uniform sampler2D sunMap;
uniform float time;
uniform float intensity;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vObject;
${noise}
${output}
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vPosition);
  float mu = clamp(dot(N, V), 0.0, 1.0);
  vec3 surface = texture2D(sunMap, vUv).rgb;
  vec3 p = normalize(vObject);
  float cells = fbm(p * 22.0 + vec3(0.0, time * 0.035, 0.0), 3);
  float fine = noise3(p * 90.0 - vec3(time * 0.06));
  float darkening = 1.0 - 0.56 * (1.0 - mu) - 0.2 * (1.0 - mu) * (1.0 - mu);
  vec3 temperature = mix(vec3(1.0, 0.34, 0.07), vec3(1.0, 0.84, 0.6), pow(mu, 0.55));
  float granulation = 0.78 + 0.34 * cells + 0.1 * fine;
  vec3 color = (surface * 1.5 + 0.22) * temperature * darkening * granulation * intensity;
  gl_FragColor = cover(color, 1.0);
}`;

export const billboardVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 view = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec2 scale = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
  view.xy += position.xy * scale;
  gl_Position = projectionMatrix * view;
}`;

/** Corona in units of the solar radius: chromosphere ring, K-corona falloff and slow streamers. */
export const coronaFragment = /* glsl */ `
uniform sampler2D streamerMap;
uniform float time;
uniform float sunRatio;
uniform float strength;
uniform float lightMode;
varying vec2 vUv;
${output}
void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float edge = length(p);
  float r = max(edge / sunRatio, 1.0);
  float angle = atan(p.y, p.x);
  // Precomputed angular noise: red holds broad streamers, green fine rays; rows evolve slowly.
  float around = angle / 6.2831853 + 0.5;
  float streamers = texture2D(streamerMap, vec2(around, time * 0.0016 + r * 0.004)).r;
  float rays = texture2D(streamerMap, vec2(around, time * 0.0011 + 0.37)).g;
  rays *= rays;
  float halo = 1.0 / pow(r, 2.7);
  float chromosphere = exp(-(r - 1.0) * 10.0);
  float glare = exp(-r * 0.45) * 0.022;
  float light = halo * (0.3 + 0.8 * streamers + 0.7 * rays) * 0.42 + chromosphere * 0.55 + glare;
  light *= (1.0 - smoothstep(0.55, 1.0, edge));
  vec3 tint = mix(vec3(1.0, 0.5, 0.18), vec3(1.0, 0.86, 0.66), clamp(1.6 / r, 0.0, 1.0));
  vec3 color = tint * light * strength;
  float warmth = clamp(light * strength * 0.35, 0.0, 0.55);
  gl_FragColor = mix(glow(color), cover(vec3(1.0, 0.62, 0.3), warmth), lightMode);
}`;

/** Stars: per-point size, color temperature and slow scintillation; sub-pixel stars dim instead of shimmering. */
export const starVertex = /* glsl */ `
attribute float size;
attribute vec3 tint;
attribute float phase;
uniform float time;
uniform float pixelRatio;
uniform float brightness;
uniform float twinkle;
varying vec3 vColor;
varying float vAlpha;
varying float vGlow;
void main() {
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * view;
  float pixels = size * pixelRatio;
  float scintillation = 1.0 + twinkle * 0.32 * sin(time * (0.7 + fract(phase * 7.31) * 2.1) + phase * 6.2831);
  gl_PointSize = max(1.5, pixels * 2.2);
  vAlpha = min(1.0, pixels) * scintillation * brightness;
  vGlow = smoothstep(1.4, 2.8, size);
  vColor = tint;
}`;

export const starFragment = /* glsl */ `
uniform float lightMode;
uniform vec3 inkColor;
varying vec3 vColor;
varying float vAlpha;
varying float vGlow;
${output}
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float core = exp(-d * d * 9.0);
  float halo = exp(-d * 4.0) * 0.3 * vGlow;
  float light = (core + halo) * vAlpha * (1.0 - smoothstep(0.8, 1.0, d));
  if (light < 0.003) discard;
  gl_FragColor = mix(glow(vColor * light), plain(inkColor, light * 0.55), lightMode);
}`;

/** One-time bake of the Milky Way band into an equirectangular target; stored as sqrt for precision. */
export const galaxyBakeVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export const galaxyBakeFragment = /* glsl */ `
uniform vec3 pole;
uniform vec3 core;
varying vec2 vUv;
${noise}
vec3 direction(vec2 uv) {
  float longitude = (uv.x - 0.5) * 6.2831853;
  float latitude = (uv.y - 0.5) * 3.1415927;
  return vec3(cos(latitude) * sin(longitude), sin(latitude), cos(latitude) * cos(longitude));
}
void main() {
  vec3 d = direction(vUv);
  float latitude = dot(d, pole);
  float toCore = acos(clamp(dot(normalize(d - pole * latitude), core), -1.0, 1.0));
  float clouds = fbm(d * 3.2, 5);
  float detail = fbm(d * 11.0 + 3.1, 4);
  float width = 0.11 + 0.05 * clouds;
  float band = exp(-latitude * latitude / (2.0 * width * width));
  float bulge = exp(-toCore * toCore / 0.55) * exp(-latitude * latitude / 0.06);
  float lanes = smoothstep(0.42, 0.68, fbm(d * 7.0 + 11.0, 4)) * exp(-latitude * latitude / 0.004);
  float glow = band * (0.35 + 0.9 * clouds * detail) + bulge * 0.9;
  glow *= 1.0 - lanes * 0.75;
  vec3 color = mix(vec3(0.3, 0.42, 0.95), vec3(0.62, 0.7, 1.0), detail) * glow * 0.55;
  color += vec3(1.0, 0.82, 0.62) * bulge * (0.45 + 0.5 * detail) * (1.0 - lanes * 0.8);
  float nebula = smoothstep(0.62, 0.8, fbm(d * 5.0 + 7.0, 4)) * band;
  color += mix(vec3(0.85, 0.32, 0.55), vec3(0.3, 0.55, 1.0), detail) * nebula * 0.22;
  color += vec3(0.05, 0.08, 0.16) * (0.4 + 0.6 * clouds) * 0.25;
  gl_FragColor = vec4(sqrt(clamp(color, 0.0, 1.0)), 1.0);
}`;

export const skyVertex = /* glsl */ `
varying vec3 vDirection;
void main() {
  vDirection = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const skyFragment = /* glsl */ `
uniform sampler2D galaxy;
uniform float strength;
varying vec3 vDirection;
${output}
void main() {
  vec3 d = normalize(vDirection);
  vec2 uv = vec2(atan(d.x, d.z) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.1415927 + 0.5);
  vec3 stored = texture2D(galaxy, uv).rgb;
  vec3 color = stored * stored * strength;
  // Dither after encoding so faint gradients do not band in the 8-bit canvas.
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  vec4 light = glow(color);
  gl_FragColor = vec4(max(light.rgb + dither / 255.0, 0.0), light.a);
}`;

/** Belt particles orbit on the GPU; no per-frame CPU work or buffer upload. */
export const beltVertex = /* glsl */ `
attribute vec4 orbit;
attribute float size;
attribute float shade;
uniform float time;
uniform float pixelScale;
uniform vec3 sunPosition;
varying float vLight;
varying float vShade;
void main() {
  float angle = orbit.y + time * orbit.w;
  vec3 local = vec3(cos(angle) * orbit.x, orbit.z, sin(angle) * orbit.x);
  vec4 world = modelMatrix * vec4(local, 1.0);
  vec4 view = viewMatrix * world;
  gl_Position = projectionMatrix * view;
  float pixels = size * pixelScale / -view.z;
  gl_PointSize = clamp(pixels, 1.0, 5.0);
  vec3 toSun = normalize(sunPosition - world.xyz);
  vec3 toCamera = normalize(cameraPosition - world.xyz);
  vLight = (0.35 + 0.65 * (0.5 + 0.5 * dot(toSun, toCamera))) * min(1.0, pixels);
  vShade = shade;
}`;

export const beltFragment = /* glsl */ `
uniform vec3 dustColor;
uniform float strength;
uniform float lightMode;
uniform vec3 inkColor;
varying float vLight;
varying float vShade;
${output}
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float alpha = (1.0 - smoothstep(0.35, 1.0, d)) * vLight * strength;
  if (alpha < 0.004) discard;
  gl_FragColor = mix(cover(dustColor * vShade, alpha), plain(inkColor, alpha), lightMode);
}`;

/** Orbit guides brighten behind each body, so the path itself shows direction of travel. */
export const orbitVertex = /* glsl */ `
attribute float along;
varying float vAlong;
void main() {
  vAlong = along;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const orbitFragment = /* glsl */ `
uniform float head;
uniform float base;
uniform float trail;
uniform vec3 lineColor;
varying float vAlong;
${output}
void main() {
  float behind = fract(head - vAlong);
  gl_FragColor = plain(lineColor, base + trail * pow(1.0 - behind, 5.0));
}`;

export const meteorFragment = /* glsl */ `
uniform float strength;
uniform float lightMode;
uniform vec3 inkColor;
varying vec2 vUv;
${output}
void main() {
  float along = vUv.x;
  float across = (vUv.y - 0.5) * 2.0;
  float width = 0.12 + 0.88 * along * along;
  float body = pow(along, 2.4) * exp(-across * across / (width * width * 0.18));
  float tip = (1.0 - along) * 9.0;
  float head = exp(-tip * tip - across * across * 3.0);
  float light = (body + head * 1.4) * strength;
  vec3 color = mix(vec3(0.62, 0.8, 1.0), vec3(1.0), head);
  gl_FragColor = mix(glow(color * light), plain(inkColor, light * 0.5), lightMode);
}`;

/** Selection halo drawn on a thin ring mesh; `vUv.x` runs from the inner to the outer edge. */
export const markerFragment = /* glsl */ `
uniform vec3 markerColor;
uniform float strength;
varying vec2 vUv;
${output}
void main() {
  float across = vUv.x * 2.0 - 1.0;
  float line = 1.0 - smoothstep(0.0, 0.22, abs(across));
  float halo = (1.0 - abs(across)) * 0.25;
  gl_FragColor = plain(markerColor, (line + halo) * strength);
}`;

/** Rings lit on the sunward face, translucent from behind, and shadowed by their planet. */
export const ringVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vPosition = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

export const ringFragment = /* glsl */ `
uniform sampler2D ringMap;
uniform float textured;
uniform vec3 sunPosition;
uniform vec3 sunColor;
uniform vec3 planetCenter;
uniform float planetRadius;
uniform vec3 ringNormal;
uniform float opacity;
varying vec2 vUv;
varying vec3 vPosition;
${output}
void main() {
  vec4 band = textured > 0.5
    ? texture2D(ringMap, vec2(vUv.x, 0.5))
    : vec4(0.62, 0.7, 0.72, 0.22 * (1.0 - abs(vUv.x - 0.5) * 2.0));
  vec3 L = normalize(sunPosition - vPosition);
  vec3 V = normalize(cameraPosition - vPosition);
  float sunSide = dot(ringNormal, L);
  float viewSide = dot(ringNormal, V);
  float lit = sunSide * viewSide > 0.0 ? 0.35 + 0.65 * abs(sunSide) : 0.18 * (1.0 - band.a);
  float scatter = pow(max(0.0, dot(-V, L)), 8.0) * (1.0 - band.a) * 1.4;
  float along = dot(planetCenter - vPosition, L);
  float miss = length(planetCenter - vPosition - L * along);
  float shadow = along > 0.0 ? smoothstep(planetRadius * 0.97, planetRadius * 1.04, miss) : 1.0;
  gl_FragColor = cover(band.rgb * sunColor * (lit + scatter) * shadow, band.a * opacity);
}`;
