import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

let skyCache: THREE.CanvasTexture | null = null;
let sunCache: THREE.CanvasTexture | null = null;
// =====================================================
// 🌅 MONZA CINEMATIC SUNSET SKY
// =====================================================

const createSky = () => {
  if (skyCache) return skyCache;

  const canvas = document.createElement("canvas");

  canvas.width = 2048;
  canvas.height = 2400;

  const W = canvas.width;
  const H = canvas.height;

  const ctx = canvas.getContext("2d")!;
  // =====================================
  // 🌌 PURPLE → RED → ORANGE SKY
  // =====================================

  const gradient = ctx.createLinearGradient(0, 0, 0, H);

  ctx.fillRect(0, 0, W, H);
  gradient.addColorStop(0.0, "#21182F");
  gradient.addColorStop(0.18, "#3C2948");
  gradient.addColorStop(0.38, "#79404F");
  gradient.addColorStop(0.58, "#B95751");
  gradient.addColorStop(0.74, "#E8754F");
  gradient.addColorStop(0.88, "#F99A4F");
  gradient.addColorStop(1.0, "#FFBE65");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
  // =====================================
  // 🌅 LARGE HORIZON GLOW
  // =====================================

  const glow = ctx.createRadialGradient(
    W / 2,
    H * 0.83,
    0,
    W / 2,
    H * 0.83,
    H * 0.63,
  );
  glow.addColorStop(0, "rgba(255,220,130,0.95)");

  glow.addColorStop(0.25, "rgba(255,160,90,0.45)");

  glow.addColorStop(0.6, "rgba(235,100,80,0.18)");

  glow.addColorStop(1, "rgba(235,100,80,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  // =====================================
  // ☁️ DISTANT HORIZONTAL CLOUD BANDS
  // =====================================

  const cloudBands = [
    { y: 280, width: 280, height: 10, alpha: 0.15 },
    { y: 350, width: 420, height: 12, alpha: 0.12 },
    { y: 440, width: 350, height: 9, alpha: 0.15 },
    { y: 550, width: 500, height: 14, alpha: 0.1 },
    { y: 650, width: 430, height: 12, alpha: 0.12 },
  ];

  cloudBands.forEach((band, index) => {
    const x = (index % 2 === 0 ? 420 : 1300) - band.width / 2;

    ctx.fillStyle = `rgba(90, 61, 90, ${band.alpha})`;

    ctx.fillRect(x, band.y, band.width, band.height);
  });

  skyCache = new THREE.CanvasTexture(canvas);

  skyCache.colorSpace = THREE.SRGBColorSpace;
  skyCache.minFilter = THREE.LinearFilter;
  skyCache.magFilter = THREE.LinearFilter;
  skyCache.needsUpdate = true;

  return skyCache;
};
const createSun = () => {
  if (sunCache) return sunCache;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);

  // Softer, less intense sun
  gradient.addColorStop(0.0, "rgba(255, 245, 190, 0.55)");
  gradient.addColorStop(0.1, "rgba(255, 215, 120, 0.40)");
  gradient.addColorStop(0.22, "rgba(255, 175, 75, 0.26)");
  gradient.addColorStop(0.38, "rgba(245, 125, 50, 0.14)");
  gradient.addColorStop(0.52, "rgba(225, 90, 45, 0.07)");

  gradient.addColorStop(0.65, "rgba(210, 75, 45, 0.025)");
  gradient.addColorStop(0.76, "rgba(200, 70, 45, 0.01)");
  gradient.addColorStop(0.88, "rgba(200, 70, 45, 0.002)");
  gradient.addColorStop(1.0, "rgba(200, 70, 45, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  sunCache = new THREE.CanvasTexture(canvas);
  sunCache.colorSpace = THREE.SRGBColorSpace;
  sunCache.minFilter = THREE.LinearFilter;
  sunCache.magFilter = THREE.LinearFilter;
  sunCache.needsUpdate = true;

  return sunCache;
};

let sunDiscCache: THREE.CanvasTexture | null = null;

const createSunDisc = () => {
  if (sunDiscCache) return sunDiscCache;

  const canvas = document.createElement("canvas");

  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 58);

  // White center with slightly blurred edges
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.75, "rgba(255,255,255,1)");
  gradient.addColorStop(0.92, "rgba(255,255,255,0.85)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  sunDiscCache = new THREE.CanvasTexture(canvas);

  sunDiscCache.colorSpace = THREE.SRGBColorSpace;
  sunDiscCache.needsUpdate = true;

  return sunDiscCache;
};

const BuildingsLayer = () => {
  const { size } = useThree();

  const isMobile = size.width < 700;

  const mobileScale = isMobile ? 0.45 : 1;
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

  const repeatCount = 35;

  // All images have the same visual height
  const imageHeight = 80;

  // Shared bottom alignment
  const horizonY = -20;

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
    <group scale={[mobileScale, mobileScale, 1]}>
      {" "}
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
            renderOrder={-600}
            frustumCulled={false}
          >
            <planeGeometry args={[1, 1]} />

            <meshBasicMaterial
              map={texture}
              transparent
              opacity={1}
              depthWrite={false}
              depthTest={true}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const LakeLayer = () => {
  const { size } = useThree();

  const isMobile = size.width < 700;

  const lakeScale = isMobile ? 0.42 : 1;
  const waterTexture = useLoader(
    THREE.TextureLoader,
    "/assets/monza/water/Foam002_Color.jpg",
  );
  waterTexture.wrapS = THREE.ClampToEdgeWrapping;
  waterTexture.wrapT = THREE.ClampToEdgeWrapping;

  waterTexture.repeat.set(1, 1);
  waterTexture.minFilter = THREE.LinearFilter;
  waterTexture.magFilter = THREE.LinearFilter;
  waterTexture.colorSpace = THREE.NoColorSpace;
  waterTexture.needsUpdate = true;
  const lakeShape = useMemo(() => {
    const shape = new THREE.Shape();

    shape.moveTo(-220, 30); // Top-left
    shape.lineTo(160, 30); // Top-right
    shape.lineTo(160, -30); // Bottom point

    shape.closePath();

    return shape;
  }, []);
  const lakeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {},

      vertexShader: `
        varying vec2 vLocalPosition;

        void main() {
          vLocalPosition = position.xy;

          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        varying vec2 vLocalPosition;

        void main() {
          // Normalize lake height
          float gradient = smoothstep(
            -30.0,
            68.0,
            vLocalPosition.y
          );

          // Bottom: deep dark blue
  vec3 bottomColor = vec3(
    0.012, 
    0.055, 
    0.16
  );

  // Middle: dark blue-purple
  vec3 middleColor = vec3(
    0.08, 
    0.045, 
    0.20
  );

  // Top: dark muted purple-magenta
  vec3 topColor = vec3(
    0.22, 
    0.055, 
    0.16
  );

          vec3 gradientColor;

          if (gradient < 0.5) {
            gradientColor = mix(
              bottomColor,
              middleColor,
              gradient * 2.0
            );
          } else {
            gradientColor = mix(
              middleColor,
              topColor,
              (gradient - 0.5) * 2.0
            );
          }

          gl_FragColor = vec4(gradientColor, 1.0);
        }
      `,

      side: THREE.DoubleSide,
    });
  }, []);
  const foamMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uWaterTexture: {
          value: waterTexture,
        },
        uTime: {
          value: 0,
        },
      },

      transparent: true,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,

      vertexShader: `
        varying vec2 vLocalPosition;

  void main() {
    vLocalPosition = position.xy;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
      `,
      fragmentShader: `
    uniform sampler2D uWaterTexture;
    uniform float uTime;

    varying vec2 vLocalPosition;

    void main() {
    // Match the complete lake shape bounds
  vec2 uv = (vLocalPosition - vec2(-200.0, -20.0))
        / vec2(520.0, 105.0);
      // Gentle wave movement
      uv.x += sin(uv.y * 7.0 + uTime * 0.35) * 0.018;
      uv.x += uTime * 0.008;

      uv.y += sin(uv.x * 5.0 + uTime * 0.25) * 0.012;

      uv = clamp(uv, 0.001, 0.999);

      vec3 textureColor = texture2D(uWaterTexture, uv).rgb;

      float brightness = dot(
        textureColor,
        vec3(0.299, 0.587, 0.114)
      );

      // Soft glow surrounding each wave
  float halo = smoothstep(0.25, 0.55, brightness);

      // Bright wave center
  float core = smoothstep(0.45, 0.70, brightness);
      // Warm golden-yellow glow
      vec3 haloColor = vec3(0.35, 0.48, 0.22);
      vec3 coreColor = vec3(2.3, 1.15, 0.38);

      // Blend warm colors into the existing wave pattern
      vec3 finalColor = mix(
        haloColor,
        coreColor,
        core
      );

      // Subtle animated glow
      float pulse = 0.92 + sin(uTime * 1.5) * 0.08;

      finalColor *= pulse;

      // Soft halo + bright core
      float alpha = halo * 0.28 + core * 0.70;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
    });
  }, [waterTexture]);
  useFrame((_, delta) => {
    foamMaterial.uniforms.uTime.value += delta;
  });
  const lakeY = isMobile ? -28 : -36;
  return (
    <group scale={[lakeScale, lakeScale, 1]}>
      {/* =====================================
          BASE LAKE COLOR
      ===================================== */}
      <mesh
        position={[200, lakeY, -230]}
        renderOrder={-800}
        frustumCulled={false}
        material={lakeMaterial}
      >
        <shapeGeometry args={[lakeShape]} />
      </mesh>
      {/* =====================================
          FOAM TEXTURE OVERLAY
      ===================================== */}
      <mesh
        position={[200, -36, -229]}
        renderOrder={-790}
        frustumCulled={false}
        material={foamMaterial}
      >
        <shapeGeometry args={[lakeShape]} />
      </mesh>
    </group>
  );
};
// =====================================================
// ⛵ TWO YACHTS - STATIC LOCATION, GENTLE MOVEMENT
// =====================================================

const YachtLayer = () => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  const yachtRefs = useRef<(THREE.Mesh | null)[]>([]);
  const { size } = useThree();
  const isMobile = size.width < 700;

  const yachtScale = isMobile ? 0.55 : 1;
  const depthMovement = isMobile ? 2 : 5;

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

  // =====================================================
  // ⛵ ONLY TWO YACHTS
  // =====================================================

  const yachts = [
    {
      x: 250,
      y: -20,
      z: -188,
      width: 18,
      phase: 0,
    },
    {
      x: 220,
      y: -15,
      z: -188,
      width: 16,
      phase: Math.PI,
    },
  ];

  // =====================================================
  // 🌊 STRONG YACHT MOVEMENT
  // =====================================================

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    yachtRefs.current.forEach((yacht, index) => {
      if (!yacht) return;

      const data = yachts[index];

      yacht.position.x = data.x + Math.sin(time * 0.35 + data.phase) * movement;
      yacht.position.y =
        data.y +
        Math.sin(time * 1.1 + data.phase) * 1.2 +
        Math.sin(time * 0.55 + data.phase) * 0.6;

      yacht.position.z =
        data.z + Math.sin(time * 0.28 + data.phase) * depthMovement;
      yacht.rotation.z = Math.sin(time * 0.9 + data.phase) * 0.06;

      // Slight pitch movement
      yacht.rotation.x = Math.sin(time * 0.65 + data.phase) * 0.025;
    });
  });

  if (!texture) return null;

  const imageAspect = texture.image.width / texture.image.height;
  const movement = isMobile ? 8 : 18;

  return (
    <>
      {yachts.map((yacht, index) => {
        const imageHeight = (yacht.width / imageAspect) * yachtScale;
        return (
          <group
            key={`yacht-${index}`}
            ref={(ref) => {
              yachtRefs.current[index] = ref as unknown as THREE.Mesh;
            }}
            position={[yacht.x, yacht.y + imageHeight / 2, yacht.z]}
          >
            {/* =================================================
              SOFT GLOW
          ================================================= */}

            <mesh
              scale={[yacht.width * yachtScale * 1.12, imageHeight * 1.12, 1]}
              renderOrder={490}
              frustumCulled={false}
            >
              <planeGeometry args={[1, 1]} />

              <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.18}
                color="#ffd6a0"
                depthWrite={false}
                depthTest={false}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>

            {/* =================================================
              MAIN YACHT
          ================================================= */}

            <mesh
              scale={[yacht.width * yachtScale, imageHeight, 1]}
              renderOrder={500}
              frustumCulled={false}
            >
              <planeGeometry args={[1, 1]} />

              <meshBasicMaterial
                map={texture}
                transparent
                opacity={0.92}
                alphaTest={0.01}
                depthWrite={false}
                depthTest={false}
                side={THREE.DoubleSide}
                toneMapped={false}
                color="#d4c7b5"
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

const GreenFieldLayer = () => {
  const [colorMap, normalMap, roughnessMap, aoMap] = useLoader(
    THREE.TextureLoader,
    [
      "/assets/monza/ground/Ground037_1K-PNG_Color.png",
      "/assets/monza/ground/Ground037_1K-PNG_NormalGL.png",
      "/assets/monza/ground/Ground037_1K-PNG_Roughness.png",
      "/assets/monza/ground/Ground037_1K-PNG_AmbientOcclusion.png",
    ],
  );

  const { size } = useThree();

  // =====================================================
  // MOBILE DETECTION
  // =====================================================

  const isMobile = size.width <= 700;

  const fieldPosition: [number, number, number] = isMobile
    ? [150, 0.5, -225]
    : [150, -3, -225];

  const fieldScale: [number, number, number] = isMobile
    ? [0.75, 0.45, 0.5]
    : [1.5, 1.5, 0.8];

  // =====================================================
  // GRASS TEXTURE
  // =====================================================

  colorMap.colorSpace = THREE.SRGBColorSpace;

  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;

  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;

  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;

  aoMap.wrapS = THREE.RepeatWrapping;
  aoMap.wrapT = THREE.RepeatWrapping;

  colorMap.repeat.set(5, 2);
  normalMap.repeat.set(5, 2);
  roughnessMap.repeat.set(5, 2);
  aoMap.repeat.set(5, 2);

  colorMap.anisotropy = 8;
  normalMap.anisotropy = 8;

  // =====================================================
  // FIELD SHAPE
  // =====================================================

  const fieldShape = useMemo(() => {
    const shape = new THREE.Shape();

    shape.moveTo(-180, 0);

    // Top edge
    shape.lineTo(-100, 1);
    shape.lineTo(0, 0);
    shape.lineTo(90, 1);
    shape.lineTo(180, 0);

    // Right side
    shape.lineTo(180, -12);

    // Bottom edge
    shape.lineTo(90, -11);
    shape.lineTo(0, -4);
    shape.lineTo(-90, -7);
    shape.lineTo(-180, -12);

    shape.closePath();

    return shape;
  }, []);

  // =====================================================
  // ROCKS
  // =====================================================

  const rocks = useMemo(() => {
    const positions: [number, number, number, number][] = [];

    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    for (let i = 0; i < 45; i++) {
      const x = random(-160, 160);
      const z = random(-10, 0);

      positions.push([x, 0.15, z, random(0.08, 0.22)]);
    }

    return positions;
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <group position={fieldPosition} scale={fieldScale}>
      {/* =====================================================
          GRASS FIELD
      ===================================================== */}

      <mesh renderOrder={-700} frustumCulled={false}>
        <shapeGeometry args={[fieldShape]} />

        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          aoMap={aoMap}
          roughness={0.94}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =====================================================
          ROCKS
      ===================================================== */}

      {rocks.map(([x, y, z, rockSize], i) => (
        <mesh
          key={i}
          position={[x, y, z]}
          scale={[rockSize * 1.4, rockSize * 0.7, rockSize]}
          rotation={[
            Math.random() * 0.5,
            Math.random() * Math.PI,
            Math.random() * 0.5,
          ]}
          renderOrder={-690}
        >
          <dodecahedronGeometry args={[1, 0]} />

          <meshStandardMaterial
            color={
              i % 3 === 0 ? "#756957" : i % 3 === 1 ? "#62594D" : "#847765"
            }
            roughness={1}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
};
const SHOW_MONZA_VILLAGE = true;

const VILLAGE_SETTINGS = {
  z: -260,
  renderOrder: -1000,

  centerX: -125,
  groundY: -34,

  scale: 1,

  hillRenderOrder: -1000,
  treesRenderOrder: -950,
  housesRenderOrder: -900,
  bushesRenderOrder: -850,
};
// =====================================================
// 🏡 VILLAGE IMAGE ASSETS
// =====================================================

const VILLAGE_ASSETS = [
  "/assets/monza/monza-buildings1.png",
  "/assets/monza/monza-buildings2.png",
  "/assets/monza/monza-buildings3.png",

  "/assets/monza/village/tree.png",

  "/assets/monza/village/bush1.png",
  "/assets/monza/village/bush2.png",

  "/assets/monza/village/hill.png",
];

// =====================================================
// 🌄 SMALL LEFT-SIDE HILL
// =====================================================

const VILLAGE_HILL = {
  texture: "/assets/monza/village/hill.png",

  position: [-170, -5, -190] as [number, number, number],

  width: 300,
  height: 90,

  opacity: 1,
};

// =====================================================
// 🏠 HOUSES
// =====================================================
const VILLAGE_HOUSES = [
  {
    texture: "/assets/monza/monza-buildings2.png",
    position: [-120, 15, -190] as [number, number, number],
    width: 60,
    height: 60,
    opacity: 1,
  },
];
// =====================================================
// 🌲 TALL TREES
// =====================================================
const VILLAGE_TREES = [
  {
    texture: "/assets/monza/village/tree.png",
    position: [-230, 27, -190] as [number, number, number],
    width: 50,
    height: 78,
    opacity: 1,
  },
  {
    texture: "/assets/monza/village/tree.png",
    position: [-160, 10, -170] as [number, number, number],
    width: 50,
    height: 70,
    opacity: 1,
  },
];
// =====================================================
// 🌿 BUSHES
// =====================================================

// =====================================================
// 🖼️ GENERIC VILLAGE IMAGE
// =====================================================
const VillageImage = ({
  texture,
  position,
  width,
  height,
  opacity = 1,
  renderOrder = -60,
}: {
  texture: THREE.Texture;
  position: [number, number, number];
  width: number;
  height: number;
  opacity?: number;
  renderOrder?: number;
}) => {
  return (
    <mesh
      position={position}
      scale={[width, height, 1]}
      renderOrder={renderOrder}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />

      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        alphaTest={0.01}
        depthWrite={false}
        depthTest={true}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
};

// =====================================================
// 🏡 MONZA VILLAGE LAYER
// =====================================================

const MonzaVillageLayer = () => {
  const textures = useLoader(THREE.TextureLoader, VILLAGE_ASSETS);

  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
  });

  const textureMap = useMemo(() => {
    return new Map(
      VILLAGE_ASSETS.map((path, index) => [path, textures[index]]),
    );
  }, [textures]);

  if (!SHOW_MONZA_VILLAGE) return null;

  return (
    <group scale={VILLAGE_SETTINGS.scale}>
      {/* =====================================
          🌄 HILL
      ===================================== */}

      <VillageImage
        texture={textureMap.get(VILLAGE_HILL.texture)!}
        position={VILLAGE_HILL.position}
        width={VILLAGE_HILL.width}
        height={VILLAGE_HILL.height}
        opacity={VILLAGE_HILL.opacity}
        renderOrder={VILLAGE_SETTINGS.hillRenderOrder}
      />

      {/* =====================================
          🌲 BACKGROUND TREES
      ===================================== */}

      {VILLAGE_TREES.map((tree, index) => (
        <VillageImage
          key={`tree-${index}`}
          texture={textureMap.get(tree.texture)!}
          position={tree.position}
          width={tree.width}
          height={tree.height}
          opacity={tree.opacity}
          renderOrder={VILLAGE_SETTINGS.treesRenderOrder}
        />
      ))}

      {/* =====================================
          🏠 HOUSES
      ===================================== */}

      {VILLAGE_HOUSES.map((house, index) => (
        <VillageImage
          key={`house-${index}`}
          texture={textureMap.get(house.texture)!}
          position={house.position}
          width={house.width}
          height={house.height}
          opacity={house.opacity}
          renderOrder={VILLAGE_SETTINGS.housesRenderOrder}
        />
      ))}
    </group>
  );
};
// =====================================================
// ☁️ MONZA LARGE LAYERED SUNSET CLOUDS
// =====================================================

const CloudsLayer = () => {
  const cloudTexture = useLoader(
    THREE.TextureLoader,
    "/assets/monza/clouds/2.png",
  );

  cloudTexture.colorSpace = THREE.SRGBColorSpace;
  cloudTexture.minFilter = THREE.LinearFilter;
  cloudTexture.magFilter = THREE.LinearFilter;
  cloudTexture.wrapS = THREE.ClampToEdgeWrapping;
  cloudTexture.wrapT = THREE.ClampToEdgeWrapping;
  cloudTexture.needsUpdate = true;

  const aspectRatio = cloudTexture.image.width / cloudTexture.image.height;

  // Cloud layers: large, rising from the horizon
  const clouds = [
    {
      x: -40,
      groundY: 20,
      z: -180,
      width: 240,
      opacity: 1,
    },
    {
      x: -180,
      groundY: 20,
      z: -185,
      width: 170,
      opacity: 0.85,
    },
    {
      x: 130,
      groundY: 10,
      z: -185,
      width: 185,
      opacity: 0.9,
    },
  ];

  return (
    <group>
      {clouds.map((cloud, index) => {
        const height = cloud.width / aspectRatio;

        // Align the visible cloud base with ground level.
        // The PNG contains transparent space below the cloud.
        const yPosition = cloud.groundY + height * 0.25;

        return (
          <mesh
            key={index}
            position={[cloud.x, yPosition, cloud.z]}
            scale={[cloud.width, height, 1]}
            renderOrder={-950}
            frustumCulled={false}
          >
            <planeGeometry args={[1, 1]} />

            <meshBasicMaterial
              map={cloudTexture}
              transparent
              opacity={cloud.opacity}
              alphaTest={0.01}
              depthWrite={false}
              depthTest={true}
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
// 🌇 MONZA ENVIRONMENT
// =====================================================

export const MonzaEnvironment = () => {
  const { size } = useThree();

  const isMobile = size.width < 700;

  // SKY SIZE
  const skyHeight = isMobile ? 150 : 100;
  const skyY = isMobile ? 55 : 48;
  const sunRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  const skyTexture = useMemo(() => createSky(), []);
  const sunTexture = useMemo(() => createSun(), []);
  const sunDiscTexture = useMemo(() => createSunDisc(), []);

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
      <mesh position={[0, skyY, -155]} renderOrder={-1000}>
        <planeGeometry args={[1000, skyHeight]} />

        <meshBasicMaterial
          map={skyTexture}
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </mesh>
      {/* ☁️ Sunset clouds */}
      <CloudsLayer />
      {/* ☀️ SUN GLOW */}
      <sprite position={[0, 10, -102]} scale={[90, 90, 1]} renderOrder={10000}>
        <spriteMaterial
          map={sunTexture}
          transparent
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </sprite>
      {/* ☀️ SOLID SUN DISC */}
      <sprite position={[0, 10, -143]} scale={[11, 11, 1]} renderOrder={-980}>
        <spriteMaterial
          map={sunDiscTexture}
          transparent
          depthWrite={false}
          depthTest={false}
          toneMapped={false}
        />
      </sprite>
      {/* =====================================
    🌅 SUNSET LIGHT
===================================== */}
      <pointLight
        position={[0, 10, -135]}
        color="#FF9A78"
        intensity={1.2}
        distance={180}
      />
      <GreenFieldLayer />
      <BuildingsLayer />

      {/* Buildings now come from one transparent image */}
      <MonzaVillageLayer />
      <LakeLayer />
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
