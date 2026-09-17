import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

let skyCache: THREE.CanvasTexture | null = null;
let sunCache: THREE.CanvasTexture | null = null;

// =====================================================
// 🌅 ORANGE ITALIAN SUNSET SKY
// =====================================================

const createSky = () => {
  if (skyCache) return skyCache;

  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 768;

  const ctx = canvas.getContext("2d")!;

  // 🌅 Warm orange and golden sunset
  const gradient = ctx.createLinearGradient(0, 0, 0, 768);

  gradient.addColorStop(0, "#211A35"); // Deep evening blue-purple
  gradient.addColorStop(0.22, "#51405A"); // Muted violet
  gradient.addColorStop(0.43, "#A95D59"); // Warm muted rose
  gradient.addColorStop(0.62, "#E58A61"); // Orange
  gradient.addColorStop(0.8, "#F5B45F"); // Golden orange
  gradient.addColorStop(1, "#FFD47A"); // Yellow horizon

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2048, 768);

  // ☀️ Large golden sunset glow
  const glow = ctx.createRadialGradient(1060, 500, 0, 1060, 500, 380);

  glow.addColorStop(0, "rgba(255,248,190,0.98)");
  glow.addColorStop(0.22, "rgba(255,207,120,0.7)");
  glow.addColorStop(0.5, "rgba(255,157,92,0.3)");
  glow.addColorStop(1, "rgba(239,117,90,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 2048, 768);

  // ☁️ Warm subtle clouds
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#FFE3B5";

  for (let i = 0; i < 20; i++) {
    const x = (i * 173 + 80) % 2048;
    const y = 90 + ((i * 47) % 180);

    ctx.beginPath();
    ctx.ellipse(x, y, 100 + (i % 4) * 35, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  skyCache = new THREE.CanvasTexture(canvas);
  skyCache.colorSpace = THREE.SRGBColorSpace;
  skyCache.needsUpdate = true;

  return skyCache;
};
// =====================================================
// ☀️ SUN GLOW
// =====================================================

const createSun = () => {
  if (sunCache) return sunCache;

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);

  gradient.addColorStop(0, "rgba(255,247,190,1)");
  gradient.addColorStop(0.35, "rgba(255,190,115,0.75)");
  gradient.addColorStop(0.7, "rgba(255,125,110,0.2)");
  gradient.addColorStop(1, "rgba(255,110,100,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  sunCache = new THREE.CanvasTexture(canvas);
  sunCache.colorSpace = THREE.SRGBColorSpace;
  sunCache.needsUpdate = true;

  return sunCache;
};

// =====================================================
// 🏙️ IMAGE-BASED CITY SKYLINE
// =====================================================
// Place the image at:
// public/assets/monza/monza-buildings.png
//
// Recommended image:
// - PNG with transparent background
// - Buildings only
// - Wide composition
// - Bottom edge aligned with the horizon
// =====================================================
// =====================================================
// 🏡 REPEATED MONZA COUNTRYSIDE SKYLINE
// =====================================================

// =====================================================
// 🏡 ALIGNED REPEATED MONZA COUNTRYSIDE SKYLINE
// =====================================================

const BuildingsLayer = () => {
  const [buildingsTextures, setBuildingsTextures] = useState<THREE.Texture[]>(
    [],
  );

  const buildingImages = [
    "/assets/monza/monza-buildings1.png",
    "/assets/monza/monza-buildings2.png",
    "/assets/monza/monza-buildings3.png",
  ];

  useEffect(() => {
    const loader = new THREE.TextureLoader();

    Promise.all(
      buildingImages.map(
        (imagePath) =>
          new Promise<THREE.Texture>((resolve, reject) => {
            loader.load(
              imagePath,
              (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.needsUpdate = true;

                resolve(texture);
              },
              undefined,
              reject,
            );
          }),
      ),
    )
      .then((textures) => {
        setBuildingsTextures(textures);
      })
      .catch((error) => {
        console.error("Failed to load Monza buildings:", error);
      });
  }, []);

  if (buildingsTextures.length !== 3) return null;

  // =====================================================
  // SKYLINE SETTINGS
  // =====================================================

  const repeatCount = 35;

  // All images have the same visual height
  const imageHeight = 50;

  // Shared bottom alignment
  const horizonY = -12;

  // Small overlap prevents visible gaps
  const overlap = 1.5;

  // Build the layout first so it can be centered
  const skylineImages = Array.from(
    { length: repeatCount },
    (_, index) => buildingsTextures[index % 3],
  );

  const imageWidths = skylineImages.map((texture) => {
    const aspectRatio = texture.image.width / texture.image.height;

    return imageHeight * aspectRatio;
  });

  const totalWidth =
    imageWidths.reduce((sum, width) => sum + width, 0) -
    overlap * (repeatCount - 1);

  let currentX = -totalWidth / 2;

  return (
    <group>
      {skylineImages.map((texture, index) => {
        const imageWidth = imageWidths[index];

        const xPosition = currentX + imageWidth / 2;

        // Every image ends at exactly the same Y position
        const yPosition = horizonY + imageHeight / 2;

        currentX += imageWidth - overlap;

        return (
          <mesh
            key={index}
            position={[xPosition, yPosition, -220]}
            scale={[imageWidth, imageHeight, 1]}
            renderOrder={-5}
            frustumCulled={false}
          >
            <planeGeometry args={[1, 1]} />

            <meshBasicMaterial
              map={texture}
              transparent
              opacity={1}
              depthWrite={false}
              depthTest={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};
// =====================================================
// 🌊 MONZA LAKE - RIGHT SIDE
// =====================================================
// =====================================================
// 🌊 MONZA LAKE - RIGHT SIDE WITH SUNSET SHIMMER
// =====================================================
// =====================================================
// 🌊 MONZA LAKE - DARK WATER WITH WAVES AND GLITTER
// =====================================================
// =====================================================
// 🌊 MONZA LAKE - RIGHT SIDE WITH GRADIENT + SHIMMER
// =====================================================

const LakeLayer = () => {
  const lakeRef = useRef<THREE.Mesh>(null);

  const lakeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },

      transparent: false,
      depthWrite: true,
      depthTest: true,
      side: THREE.DoubleSide,

      vertexShader: `
        varying vec2 vUv;
        varying float vLakeHeight;

        uniform float uTime;

        void main() {
          vUv = uv;

          vec3 pos = position;

          // Normalize actual lake height
         vLakeHeight = clamp(vUv.y, 0.0, 1.0);
          // Gentle wave movement
          pos.z += sin(
            pos.x * 0.08 + uTime * 0.5
          ) * 0.12;

          pos.z += cos(
            pos.y * 0.12 + uTime * 0.4
          ) * 0.08;

          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
  uniform float uTime;

  varying vec2 vUv;
  varying float vLakeHeight;

  void main() {
    vec2 uv = vUv;
// =====================================
// 🌌 DEEP INDIGO → BLUE → SUBTLE PINK → SOFT ORANGE
// =====================================

float h = clamp(vLakeHeight, 0.0, 1.0);

vec3 deepIndigo = vec3(
  0.002,
  0.003,
  0.035
);

vec3 strongIndigo = vec3(
  0.006,
  0.012,
  0.11
);

vec3 oceanBlue = vec3(
  0.01,
  0.035,
  0.20
);
vec3 subtlePink = vec3(
  0.22,
  0.025,
  0.09
);

vec3 softOrange = vec3(
  0.48,
  0.10,
  0.025
);
vec3 waterColor;
// =====================================
// DEEP INDIGO → BLUE
// =====================================

if (h < 0.40) {
  float t = smoothstep(0.0, 0.40, h);

  waterColor = mix(
    deepIndigo,
    strongIndigo,
    t
  );

// =====================================
// BLUE → OCEAN BLUE
// =====================================

} else if (h < 0.58) {
  float t = smoothstep(0.40, 0.58, h);

  waterColor = mix(
    strongIndigo,
    oceanBlue,
    t
  );

// =====================================
// OCEAN BLUE → MUTED PINK
// WIDER SMOOTH TRANSITION
// =====================================

} else if (h < 0.82) {
  float t = smoothstep(0.58, 0.82, h);

  waterColor = mix(
    oceanBlue,
    subtlePink,
    t
  );

// =====================================
// MUTED PINK → SOFT ORANGE
// =====================================

} else {
  float t = smoothstep(0.82, 1.0, h);

  waterColor = mix(
    subtlePink,
    softOrange,
    t
  );
}

    // =====================================
    // 🌊 MOVING SOFT WAVES
    // =====================================

    float wave1 = sin(
      uv.x * 35.0 +
      sin(uv.y * 8.0) +
      uTime * 0.8
    );

    float wave2 = sin(
      uv.x * 65.0 -
      uv.y * 12.0 +
      uTime * 1.1
    );

    float waves =
      wave1 * 0.6 +
      wave2 * 0.4;

    float waveHighlight = smoothstep(
      0.65,
      0.95,
      waves
    );

    waterColor += vec3(
      0.015,
      0.06,
      0.10
    ) * waveHighlight;

    // =====================================
    // 🌅 SOFT PINK-ORANGE SHIMMER
    // =====================================

    float shimmerWave = sin(
      uv.x * 42.0 +
      sin(uv.y * 10.0) * 2.0 +
      uTime * 1.3
    );

    float shimmerWave2 = sin(
      uv.x * 75.0 -
      uv.y * 16.0 +
      uTime * 0.9
    );

    float shimmer =
      shimmerWave * 0.65 +
      shimmerWave2 * 0.35;

    float shimmerMask = smoothstep(
      0.60,
      0.92,
      shimmer
    );

    // Reflection toward upper lake
    float sunsetArea = smoothstep(
      0.35,
      0.90,
      vLakeHeight
    );

    vec3 sunsetReflection = vec3(
      1.0,
      0.25,
      0.12
    );

    waterColor +=
      sunsetReflection *
      shimmerMask *
      sunsetArea *
      0.025;

    // =====================================
    // ✨ LARGE GLIMMERS
    // =====================================

    vec2 sparkleGrid = floor(
      uv * vec2(24.0, 18.0)
    );

    vec2 sparkleUV = fract(
      uv * vec2(24.0, 18.0)
    );

    float randomValue = fract(
      sin(
        dot(
          sparkleGrid,
          vec2(12.9898, 78.233)
        )
      ) * 43758.5453
    );

    float sparkleMask = step(
      0.9,
      randomValue
    );

    float sparklePulse = sin(
      uTime * 2.0 +
      randomValue * 30.0
    ) * 0.5 + 0.5;

    // Horizontal sparkle shape
    float horizontalShape = smoothstep(
      0.48,
      0.04,
      abs(sparkleUV.y - 0.5)
    );

    // Vertical sparkle shape
    float verticalShape = smoothstep(
      0.50,
      0.12,
      abs(sparkleUV.x - 0.5)
    );

    float sparkleShape =
      horizontalShape *
      verticalShape;

    float glimmer =
      sparkleMask *
      sparklePulse *
      sparkleShape *
      sunsetArea;

    waterColor += vec3(
      1.0,
      0.45,
      0.20
    ) * glimmer * 0.12;

    // =====================================
    // 🎨 FINAL COLOR LIMIT
    // =====================================

    waterColor = clamp(
      waterColor,
      vec3(0.0),
      vec3(0.85)
    );

    gl_FragColor = vec4(
      waterColor,
      1.0
    );
  }
`,
    });
  }, []);

  // =====================================
  // ⏱️ ANIMATE WATER
  // =====================================

  useFrame((_, delta) => {
    lakeMaterial.uniforms.uTime.value += delta;
  });

  // =====================================
  // 🌊 LAKE SHAPE
  // =====================================

  const lakeShape = useMemo(() => {
    const shape = new THREE.Shape();

    shape.moveTo(-175, 68);
    shape.lineTo(250, 68);
    shape.lineTo(200, -30);
    shape.lineTo(-175, -10);
    shape.closePath();

    return shape;
  }, []);

  // =====================================
  // 🎮 RENDER LAKE
  // =====================================

  return (
    <mesh
      ref={lakeRef}
      position={[200, -70, -250]}
      renderOrder={-10}
      frustumCulled={false}
      material={lakeMaterial}
    >
      <shapeGeometry args={[lakeShape]} />
    </mesh>
  );
};
// =====================================================
// ⛵ YACHT IMAGE - RIGHT SIDE OF LAKE
// =====================================================
const YachtLayer = () => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();

    loader.load(
      "/assets/monza/monza-yachts.png",
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.needsUpdate = true;

        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error("Failed to load yacht image:", error);
      },
    );
  }, []);

  if (!texture) return null;

  // =====================================
  // ⛵ YACHT POSITIONS AND SIZES
  // =====================================
  const yachts = [
    { x: 200, y: -15, z: -248, width: 7 },

    { x: 325, y: -35, z: -248, width: 6 },
    { x: 365, y: -30, z: -248, width: 5 },
  ];

  const imageAspect = texture.image.width / texture.image.height;

  return (
    <>
      {yachts.map((yacht, index) => {
        const imageHeight = yacht.width / imageAspect;

        return (
          <mesh
            key={index}
            position={[yacht.x, yacht.y + imageHeight / 2, yacht.z]}
            scale={[yacht.width, imageHeight, 1]}
            renderOrder={-6}
            frustumCulled={false}
          >
            <planeGeometry args={[1, 1]} />

            <meshBasicMaterial
              map={texture}
              transparent
              opacity={1}
              depthWrite={false}
              depthTest={false}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </>
  );
};

// =====================================================
// 🌿 MONZA FIELD IMAGE
// =====================================================

const GreenFieldLayer = () => {
  const texture = useLoader(
    THREE.TextureLoader,
    "/assets/monza/monza-field.png",
  );

  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh
      position={[-75, -10, -228]}
      scale={[220, 150, 1]}
      renderOrder={-8}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />

      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
};

// =====================================================
// 🌇 MONZA ENVIRONMENT
// =====================================================

export const MonzaEnvironment = () => {
  const sunRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  const skyTexture = useMemo(() => createSky(), []);
  const sunTexture = useMemo(() => createSun(), []);

  const particles = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];

    const palette = [
      new THREE.Color("#F7A5D5"),
      new THREE.Color("#FFBD86"),
      new THREE.Color("#8BDDE4"),
      new THREE.Color("#F8D6A1"),
    ];

    for (let i = 0; i < 260; i++) {
      positions.push(
        (Math.random() - 0.5) * 150,
        5 + Math.random() * 42,
        -35 - Math.random() * 115,
      );

      const color = palette[i % palette.length];
      colors.push(color.r, color.g, color.b);
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
    };
  }, []);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.002;
    }

    if (sunRef.current) {
      sunRef.current.rotation.z += delta * 0.01;
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} color="#D9A1C5" />
      <directionalLight
        position={[-45, 45, -80]}
        intensity={0.7}
        color="#FFB17C"
      />
      <hemisphereLight args={["#8D5EAA", "#211D30", 0.7]} />
      {/* Existing orange sunset background */}
      <mesh position={[0, 45, -155]} renderOrder={-20}>
        <planeGeometry args={[1000, 90]} />
        <meshBasicMaterial
          map={skyTexture}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
      {/* Sun glow */}
      <sprite position={[0, 43, -142]} scale={[34, 34, 1]} renderOrder={-15}>
        <spriteMaterial
          map={sunTexture}
          transparent
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </sprite>
      <mesh ref={sunRef} position={[0, 43, -141]} renderOrder={-14}>
        <sphereGeometry args={[8.5, 32, 32]} />
        <meshBasicMaterial color="#FFE7AA" />
      </mesh>
      <pointLight
        position={[0, 42, -135]}
        color="#FF9A78"
        intensity={1}
        distance={180}
      />
      {/* Buildings now come from one transparent image */}
      <GreenFieldLayer />
      <MonzaLeftFieldScenery /> <LakeLayer />
      <BuildingsLayer />
      <YachtLayer />
      {/* Subtle particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particles.colors.length / 3}
            array={particles.colors}
            itemSize={3}
          />
        </bufferGeometry>

        <pointsMaterial
          size={0.22}
          vertexColors
          transparent
          opacity={0.28}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
};

export default MonzaEnvironment;
