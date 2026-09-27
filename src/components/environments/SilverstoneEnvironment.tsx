"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import watercolorClouds from "/assets/watercolourClouds.png";
import treeImage from "/assets/watercolourTree.png";
import silverstoneBackground from "/assets/silverstoneBackground.png";
import sheepImage from "/assets/watercolourSheep.png";
import flowersImage from "/assets/watercolourFlowers.png";
import treeImage1 from "/assets/watercolourTree1.png";
import treeImage2 from "/assets/watercolourTree2.png";
import bushImage from "/assets/watercolourBush.png";
import cowImage from "/assets/cow.png";
import watercolorSun from "/assets/watercolourSun.png";
/* =========================================================
   TYPES
========================================================= */

type Vec3 = [number, number, number];

type SceneryKind = "tree" | "sheep" | "cow" | "flowers";

/* =========================================================
   CONTROLS
========================================================= */

const SHOW_TREES = true;
const SHOW_FLOWERS = true;
const SHOW_SHEEP = true;
const SHOW_COW = true;

/* =========================================================
   TEXTURE CACHE
========================================================= */

const sceneryTextures = new Map<SceneryKind, THREE.Texture>();

const treeTexture = new THREE.TextureLoader().load(treeImage);

treeTexture.colorSpace = THREE.SRGBColorSpace;
treeTexture.minFilter = THREE.LinearFilter;
treeTexture.magFilter = THREE.LinearFilter;
treeTexture.generateMipmaps = false;

const sheepTexture = new THREE.TextureLoader().load(sheepImage);

sheepTexture.colorSpace = THREE.SRGBColorSpace;
sheepTexture.minFilter = THREE.LinearFilter;
sheepTexture.magFilter = THREE.LinearFilter;
sheepTexture.generateMipmaps = false;
const cowTexture = new THREE.TextureLoader().load(cowImage);

cowTexture.colorSpace = THREE.SRGBColorSpace;
cowTexture.minFilter = THREE.LinearFilter;
cowTexture.magFilter = THREE.LinearFilter;
cowTexture.generateMipmaps = false;

const flowersTexture = new THREE.TextureLoader().load(flowersImage);

flowersTexture.colorSpace = THREE.SRGBColorSpace;
flowersTexture.minFilter = THREE.LinearFilter;
flowersTexture.magFilter = THREE.LinearFilter;
flowersTexture.generateMipmaps = false;

const silverstoneBackgroundTexture = new THREE.TextureLoader().load(
  silverstoneBackground,
);

silverstoneBackgroundTexture.colorSpace = THREE.SRGBColorSpace;

silverstoneBackgroundTexture.minFilter = THREE.LinearFilter;

silverstoneBackgroundTexture.magFilter = THREE.LinearFilter;

silverstoneBackgroundTexture.generateMipmaps = false;

let grassTextureCache: THREE.CanvasTexture | null = null;

/* =========================================================
   SCENERY TEXTURES
========================================================= */

function createSceneryTexture(kind: SceneryKind) {
  const cached = sceneryTextures.get(kind);

  if (cached) return cached;

  const canvas = document.createElement("canvas");

  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create scenery texture");
  }

  ctx.clearRect(0, 0, 256, 256);

  /* =======================================================
     TREE
  ======================================================= */
  if (kind === "tree") {
    return treeTexture;
  }
  /* =======================================================
     SHEEP
  ======================================================= */
  if (kind === "sheep") {
    return sheepTexture;
  }
  if (kind === "flowers") {
    return flowersTexture;
  }
  /* =======================================================
     cow
  ======================================================= */
  if (kind === "cow") {
    return cowTexture;
  }

  /* =======================================================
     FLOWER PATCH
  ======================================================= */
  /* =======================================================
   WATERCOLOUR WILDFLOWERS
======================================================= */

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  texture.minFilter = THREE.LinearFilter;

  texture.magFilter = THREE.LinearFilter;

  texture.generateMipmaps = false;

  texture.needsUpdate = true;

  sceneryTextures.set(kind, texture);

  return texture;
}
function LandscapeSprite({
  image,
  position,
  scale = [30, 35],
  opacity = 1,
}: {
  image: string;
  position: Vec3;
  scale?: [number, number];
  opacity?: number;
}) {
  const sourceTexture = useLoader(THREE.TextureLoader, image);

  const texture = useMemo(() => {
    const img = sourceTexture.image as HTMLImageElement;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");

    if (!ctx) return sourceTexture;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const data = imageData.data;

    // Remove white background
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const brightness = (r + g + b) / 3;

      if (brightness > 245) {
        data[i + 3] = 0;
      } else if (brightness > 215) {
        data[i + 3] = Math.max(
          0,
          Math.min(255, 255 - ((brightness - 215) / 30) * 255),
        );
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const processedTexture = new THREE.CanvasTexture(canvas);

    processedTexture.colorSpace = THREE.SRGBColorSpace;
    processedTexture.minFilter = THREE.LinearFilter;
    processedTexture.magFilter = THREE.LinearFilter;
    processedTexture.generateMipmaps = false;
    processedTexture.needsUpdate = true;

    return processedTexture;
  }, [sourceTexture]);

  return (
    <sprite position={position} scale={[scale[0], scale[1], 1]} renderOrder={0}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        depthTest={true}
      />
    </sprite>
  );
}
type LandscapeElement = {
  image: string;
  position: Vec3;
  scale: [number, number];
  opacity?: number;
};
function generateLandscapeElements(): LandscapeElement[] {
  const elements: LandscapeElement[] = [];

  const addElement = (
    image: string,
    x: number,
    z: number,
    scale: [number, number],
  ) => {
    elements.push({
      image,
      position: [x, scale[1] / 2 - 1, z],
      scale,
    });
  };

  // ==========================================
  // BACK ROW — full width
  // ==========================================

  for (let x = -260; x <= 260; x += 15) {
    const image =
      x % 3 === 0 ? treeImage1 : x % 2 === 0 ? treeImage2 : bushImage;

    const scale: [number, number] = image === bushImage ? [14, 11] : [16, 22];

    addElement(image, x, -150, scale);
  }

  // ==========================================
  // MIDDLE ROW — full width
  // ==========================================

  for (let x = -260; x <= 260; x += 15) {
    const image =
      x % 3 === 0 ? bushImage : x % 2 === 0 ? treeImage1 : treeImage2;

    const scale: [number, number] = image === bushImage ? [16, 12] : [18, 24];

    addElement(image, x, -130, scale);
  }

  // ==========================================
  // FRONT ROW — full width
  // ==========================================

  for (let x = -260; x <= 260; x += 15) {
    const image = x % 2 === 0 ? treeImage2 : bushImage;

    const scale: [number, number] = image === bushImage ? [18, 13] : [20, 26];

    addElement(image, x, -100, scale);
  }

  return elements;
}

function WatercolorCountryside() {
  const elements = useMemo(() => generateLandscapeElements(), []);
  return (
    <group>
      {elements.map((element, index) => (
        <LandscapeSprite
          key={index}
          image={element.image}
          position={element.position}
          scale={element.scale}
          opacity={element.opacity}
        />
      ))}
    </group>
  );
}
/* =========================================================
   SPRITE
========================================================= */
function ScenerySprite({
  kind,
  position,
  scale = 1,
}: {
  kind: SceneryKind;
  position: Vec3;
  scale?: number;
}) {
  const texture = useMemo(() => createSceneryTexture(kind), [kind]);

  const spriteRef = useRef<THREE.Sprite>(null);

  let width = 5;
  let height = 5;

  switch (kind) {
    case "tree":
      width = 13;
      height = 15;
      break;

    case "sheep":
      width = 3;
      height = 3;
      break;

    case "cow":
      width = 10;
      height = 10;
      break;

    case "flowers":
      width = 7;
      height = 5;
      break;
  }
  let groundOffset = 0;

  if (kind === "tree") {
    groundOffset = (height * scale) / 2;
  }

  if (kind === "sheep") {
    groundOffset = (height * scale) / 2;
  }

  if (kind === "cow") {
    groundOffset = (height * scale) / 2;
  }

  if (kind === "flowers") {
    groundOffset = height * scale * 0.1;
  }

  useFrame((state) => {
    if (!spriteRef.current || kind !== "tree") return;

    const time = state.clock.elapsedTime;
    spriteRef.current.rotation.z =
      Math.sin(time * 0.7 + position[2] * 0.08) * 0.025;
    spriteRef.current.position.x =
      position[0] + Math.sin(time * 0.55 + position[2] * 0.04) * 0.12;
  });

  return (
    <sprite
      ref={spriteRef}
      position={[position[0], position[1] - groundOffset, position[2]]}
      scale={[width * scale, height * scale, 1]}
      renderOrder={1}
    >
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.96}
        depthWrite={true}
        depthTest={true}
      />
    </sprite>
  );
}

/* =========================================================
   GRASS TEXTURE

========================================================= */

function createGrassTexture() {
  if (grassTextureCache) {
    return grassTextureCache;
  }

  const canvas = document.createElement("canvas");

  canvas.width = 1024;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create grass texture");
  }

  /* =======================================================
     BASE GRASS
  ======================================================= */

  ctx.fillStyle = "#668f4d";

  ctx.fillRect(0, 0, 1024, 1024);

  /* =======================================================
     SOFT GRASS WASHES
  ======================================================= */

  const washes = [
    "rgba(92,137,67,0.28)",
    "rgba(119,154,79,0.23)",
    "rgba(53,102,54,0.20)",
    "rgba(145,165,91,0.15)",
  ];

  for (let i = 0; i < 1100; i++) {
    const x = Math.random() * 1024;

    const y = Math.random() * 1024;

    const radius = 4 + Math.random() * 24;

    ctx.fillStyle = washes[Math.floor(Math.random() * washes.length)];

    ctx.beginPath();

    ctx.arc(x, y, radius, 0, Math.PI * 2);

    ctx.fill();
  }

  /* =======================================================
     GRASS BLADES
  ======================================================= */

  for (let i = 0; i < 3500; i++) {
    const x = Math.random() * 1024;

    const y = Math.random() * 1024;

    ctx.strokeStyle =
      Math.random() > 0.5 ? "rgba(39,82,39,0.25)" : "rgba(160,180,100,0.20)";

    ctx.lineWidth = 0.5 + Math.random();

    ctx.beginPath();

    ctx.moveTo(x, y + 3);

    ctx.lineTo(x + (Math.random() - 0.5) * 4, y - 4 - Math.random() * 10);

    ctx.stroke();
  }

  /* =======================================================
     🌼 FLOWERS EVERYWHERE
     
     Hundreds of tiny flowers directly painted
     into the grass texture.

     This costs essentially ONE texture,
     regardless of how many flowers are visible.
  ======================================================= */

  const flowerColors = [
    "rgba(255,244,185,0.88)",
    "rgba(255,249,230,0.82)",
    "rgba(236,181,202,0.78)",
    "rgba(174,203,223,0.78)",
    "rgba(242,208,83,0.82)",
  ];

  for (let i = 0; i < 1700; i++) {
    const x = Math.random() * 1024;

    const y = Math.random() * 1024;

    const size = 1.2 + Math.random() * 2.5;

    const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];

    /*
     * Stem.
     */

    ctx.strokeStyle = "rgba(54,105,53,0.45)";

    ctx.lineWidth = 0.7;

    ctx.beginPath();

    ctx.moveTo(x, y + 3);

    ctx.lineTo(x + (Math.random() - 0.5) * 2, y);

    ctx.stroke();

    /*
     * Flower head.
     */

    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.arc(x, y, size, 0, Math.PI * 2);

    ctx.fill();

    /*
     * Some flowers get four petals.
     */

    if (i % 5 === 0) {
      ctx.beginPath();

      ctx.arc(x - size, y, size * 0.7, 0, Math.PI * 2);

      ctx.arc(x + size, y, size * 0.7, 0, Math.PI * 2);

      ctx.arc(x, y - size, size * 0.7, 0, Math.PI * 2);

      ctx.arc(x, y + size, size * 0.7, 0, Math.PI * 2);

      ctx.fill();
    }
  }

  /* =======================================================
     A FEW LARGER FLOWERS
  ======================================================= */

  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 1024;

    const y = Math.random() * 1024;

    const size = 3 + Math.random() * 3;

    ctx.fillStyle =
      flowerColors[Math.floor(Math.random() * flowerColors.length)];

    ctx.beginPath();

    ctx.arc(x, y, size, 0, Math.PI * 2);

    ctx.fill();
  }

  grassTextureCache = new THREE.CanvasTexture(canvas);

  grassTextureCache.wrapS = THREE.RepeatWrapping;

  grassTextureCache.wrapT = THREE.RepeatWrapping;

  /*
   * Lots of repetition across the
   * enormous grass plane.
   */

  grassTextureCache.repeat.set(50, 50);

  grassTextureCache.colorSpace = THREE.SRGBColorSpace;

  grassTextureCache.minFilter = THREE.LinearFilter;

  grassTextureCache.magFilter = THREE.LinearFilter;

  grassTextureCache.generateMipmaps = false;

  return grassTextureCache;
}

/* =========================================================
   WATERCOLOR CLOUD IMAGE
========================================================= */

function WatercolorClouds({
  position,
  scale = 1,
  opacity = 0.9,
  flip = false,
}: {
  position: Vec3;
  scale?: number;
  opacity?: number;
  flip?: boolean;
}) {
  const texture = useLoader(THREE.TextureLoader, watercolorClouds);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return (
    <mesh
      position={position}
      scale={[flip ? -scale * 1.15 : scale * 1.15, scale * 1.15, 1]}
    >
      <planeGeometry args={[220, 110]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        depthTest={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* =========================================================
   WATERCOLOR SUN IMAGE
========================================================= */

function Sun() {
  const texture = useLoader(THREE.TextureLoader, watercolorSun);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return (
    <mesh position={[-75, 105, -235]} scale={[25, 25, 1]}>
      <planeGeometry args={[2, 2]} />

      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.85}
        depthWrite={false}
        depthTest={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
function RoadsideLoop({ children }: { children: React.ReactNode }) {
  const groupsRef = useRef<THREE.Group[]>([]);

  const LOOP_LENGTH = 60;
  const LOOP_COUNT = 10;
  const SPEED = 35;

  useFrame((_, delta) => {
    groupsRef.current.forEach((group) => {
      if (!group) return;

      group.position.z += SPEED * delta;

      if (group.position.z > LOOP_LENGTH / 2) {
        group.position.z -= LOOP_LENGTH * LOOP_COUNT;
      }
    });
  });

  return (
    <>
      {Array.from({ length: LOOP_COUNT }, (_, index) => (
        <group
          key={index}
          ref={(group) => {
            if (group) groupsRef.current[index] = group;
          }}
          position={[0, 0, -index * LOOP_LENGTH]}
        >
          {children}
        </group>
      ))}
    </>
  );
}
/* =========================================================
   MAIN ENVIRONMENT
========================================================= */

export default function SilverstoneEnvironment() {
  const grassTexture = useMemo(() => createGrassTexture(), []);

  return (
    <>
      {/* ===================================================
          LIGHTING
      =================================================== */}

      <ambientLight intensity={1.3} color="#d9ecf0" />

      <directionalLight
        position={[-80, 120, 50]}
        intensity={1.8}
        color="#fff3d5"
      />

      {/* ===================================================
          SKY
      =================================================== */}

      <mesh>
        <sphereGeometry args={[500, 32, 20]} />

        <meshBasicMaterial color="#8fc9e9" side={THREE.BackSide} />
      </mesh>
      {/* ===================================================
    SILVERSTONE PAINTED COUNTRYSIDE BACKGROUND
=================================================== */}

      <mesh position={[0, 78, -260]}>
        <planeGeometry args={[900, 300]} />

        <meshBasicMaterial
          map={silverstoneBackgroundTexture}
          side={THREE.DoubleSide}
        />
      </mesh>
      <WatercolorCountryside />
      {/* ===================================================
          SUN
      =================================================== */}

      <Sun />

      {/* ===================================================
    WATERCOLOR CLOUDSCAPE
=================================================== */}

      {/* Left cloud */}
      <WatercolorClouds
        position={[-125, 105, -210]}
        scale={0.45}
        opacity={0.82}
      />

      {/* Center cloud */}
      <WatercolorClouds position={[0, 115, -230]} scale={0.5} opacity={0.88} />

      {/* Right cloud */}
      <WatercolorClouds
        position={[125, 100, -215]}
        scale={0.45}
        opacity={0.8}
        flip
      />

      {/* Higher distant clouds */}
      <WatercolorClouds
        position={[-70, 145, -280]}
        scale={0.34}
        opacity={0.7}
        flip
      />

      <WatercolorClouds
        position={[85, 150, -275]}
        scale={0.32}
        opacity={0.68}
      />

      {/* Smaller clouds toward horizon */}
      <WatercolorClouds
        position={[-150, 72, -190]}
        scale={0.28}
        opacity={0.62}
      />

      <WatercolorClouds
        position={[155, 78, -195]}
        scale={0.26}
        opacity={0.6}
        flip
      />
      {/* ===================================================
          GRASS
          
          The entire grass plane has tiny flowers
          baked into its texture.
      =================================================== */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[1000, 1000]} />

        <meshStandardMaterial
          map={grassTexture}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* ===================================================
          🌳 TREES
          
          Spread across the whole countryside.
      =================================================== */}
      <RoadsideLoop>
        {SHOW_TREES && (
          <>
            {/* CLOSE */}

            <ScenerySprite kind="tree" position={[-18, 7, -10]} scale={0.55} />
            <ScenerySprite kind="tree" position={[20, 7, -15]} scale={0.55} />
            <ScenerySprite kind="tree" position={[-32, 7, -22]} scale={0.62} />
            <ScenerySprite kind="tree" position={[35, 8, -27]} scale={0.58} />
            <ScenerySprite kind="tree" position={[-50, 8, -18]} scale={0.65} />
            <ScenerySprite kind="tree" position={[52, 8, -25]} scale={0.6} />
            <ScenerySprite kind="tree" position={[-65, 8, -32]} scale={0.58} />
            <ScenerySprite kind="tree" position={[67, 8, -38]} scale={0.62} />

            {/* MID */}

            <ScenerySprite kind="tree" position={[-25, 8, -65]} scale={0.6} />
            <ScenerySprite kind="tree" position={[28, 8, -72]} scale={0.58} />
            <ScenerySprite kind="tree" position={[-45, 8, -82]} scale={0.65} />
            <ScenerySprite kind="tree" position={[48, 8, -90]} scale={0.62} />
            <ScenerySprite kind="tree" position={[-63, 8, -105]} scale={0.6} />
            <ScenerySprite kind="tree" position={[66, 8, -112]} scale={0.65} />

            {/* FAR */}

            <ScenerySprite kind="tree" position={[-30, 8, -130]} scale={0.58} />
            <ScenerySprite kind="tree" position={[34, 8, -138]} scale={0.62} />
            <ScenerySprite kind="tree" position={[-52, 8, -155]} scale={0.65} />
            <ScenerySprite kind="tree" position={[57, 8, -162]} scale={0.6} />
            <ScenerySprite kind="tree" position={[-68, 8, -180]} scale={0.58} />
            <ScenerySprite kind="tree" position={[70, 8, -190]} scale={0.62} />
          </>
        )}

        {/* ===================================================
          🌼 FLOWERS
          
          Larger watercolor flower patches are spread
          across the FULL width of the grass.
          
          They stay outside the barriers.
      =================================================== */}

        {SHOW_FLOWERS && (
          <>
            {/* VERY CLOSE */}

            <ScenerySprite
              kind="flowers"
              position={[-11, 1.0, -6]}
              scale={0.55}
            />

            <ScenerySprite
              kind="flowers"
              position={[11, 1.0, -9]}
              scale={0.55}
            />

            <ScenerySprite
              kind="flowers"
              position={[-18, 1.0, -12]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[20, 1.0, -15]}
              scale={0.58}
            />

            {/* WIDE CLOSE FIELD */}

            <ScenerySprite
              kind="flowers"
              position={[-30, 1.0, -18]}
              scale={0.65}
            />

            <ScenerySprite
              kind="flowers"
              position={[33, 1.0, -21]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[-45, 1.0, -14]}
              scale={0.62}
            />

            <ScenerySprite
              kind="flowers"
              position={[48, 1.0, -20]}
              scale={0.65}
            />

            <ScenerySprite
              kind="flowers"
              position={[-60, 1.0, -28]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[63, 1.0, -32]}
              scale={0.62}
            />

            {/* SECTION 2 */}

            <ScenerySprite
              kind="flowers"
              position={[-13, 1.0, -42]}
              scale={0.55}
            />

            <ScenerySprite
              kind="flowers"
              position={[14, 1.0, -46]}
              scale={0.58}
            />

            <ScenerySprite
              kind="flowers"
              position={[-25, 1.0, -50]}
              scale={0.65}
            />

            <ScenerySprite
              kind="flowers"
              position={[28, 1.0, -55]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[-42, 1.0, -47]}
              scale={0.65}
            />

            <ScenerySprite
              kind="flowers"
              position={[46, 1.0, -52]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[-60, 1.0, -58]}
              scale={0.62}
            />

            <ScenerySprite
              kind="flowers"
              position={[64, 1.0, -63]}
              scale={0.58}
            />

            {/* SECTION 3 */}

            <ScenerySprite
              kind="flowers"
              position={[-15, 1.0, -75]}
              scale={0.58}
            />

            <ScenerySprite
              kind="flowers"
              position={[17, 1.0, -80]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[-30, 1.0, -72]}
              scale={0.65}
            />

            <ScenerySprite
              kind="flowers"
              position={[34, 1.0, -86]}
              scale={0.62}
            />

            <ScenerySprite
              kind="flowers"
              position={[-48, 1.0, -82]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[52, 1.0, -92]}
              scale={0.65}
            />

            <ScenerySprite
              kind="flowers"
              position={[-65, 1.0, -96]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[67, 1.0, -103]}
              scale={0.62}
            />

            {/* SECTION 4 */}

            <ScenerySprite
              kind="flowers"
              position={[-13, 1.0, -110]}
              scale={0.55}
            />

            <ScenerySprite
              kind="flowers"
              position={[15, 1.0, -116]}
              scale={0.58}
            />

            <ScenerySprite
              kind="flowers"
              position={[-27, 1.0, -122]}
              scale={0.62}
            />

            <ScenerySprite
              kind="flowers"
              position={[31, 1.0, -127]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[-45, 1.0, -118]}
              scale={0.65}
            />

            <ScenerySprite
              kind="flowers"
              position={[50, 1.0, -130]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[-62, 1.0, -138]}
              scale={0.58}
            />

            <ScenerySprite
              kind="flowers"
              position={[67, 1.0, -145]}
              scale={0.62}
            />

            {/* SECTION 5 */}

            <ScenerySprite
              kind="flowers"
              position={[-16, 1.0, -150]}
              scale={0.58}
            />

            <ScenerySprite
              kind="flowers"
              position={[18, 1.0, -157]}
              scale={0.55}
            />

            <ScenerySprite
              kind="flowers"
              position={[-32, 1.0, -165]}
              scale={0.65}
            />

            <ScenerySprite
              kind="flowers"
              position={[37, 1.0, -170]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[-50, 1.0, -162]}
              scale={0.62}
            />

            <ScenerySprite
              kind="flowers"
              position={[55, 1.0, -178]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[-66, 1.0, -185]}
              scale={0.58}
            />

            <ScenerySprite
              kind="flowers"
              position={[68, 1.0, -192]}
              scale={0.62}
            />

            {/* FAR END */}

            <ScenerySprite
              kind="flowers"
              position={[-22, 1.0, -210]}
              scale={0.58}
            />

            <ScenerySprite
              kind="flowers"
              position={[24, 1.0, -215]}
              scale={0.55}
            />

            <ScenerySprite
              kind="flowers"
              position={[-45, 1.0, -220]}
              scale={0.6}
            />

            <ScenerySprite
              kind="flowers"
              position={[50, 1.0, -225]}
              scale={0.58}
            />
          </>
        )}

        {SHOW_SHEEP && (
          <>
            {/* ===================================================
    🐑 SHEEP
=================================================== */}

            {SHOW_SHEEP && (
              <>
                {/* LEFT FIELD */}
                <ScenerySprite
                  kind="sheep"
                  position={[-15.7, 2, -10]}
                  scale={0.65}
                />

                <ScenerySprite
                  kind="sheep"
                  position={[-38, 2, -45]}
                  scale={0.6}
                />

                <ScenerySprite
                  kind="sheep"
                  position={[-15, 2, -50]}
                  scale={0.55}
                />

                {/* RIGHT FIELD */}
                <ScenerySprite
                  kind="sheep"
                  position={[30, 2, -15]}
                  scale={0.65}
                />

                <ScenerySprite
                  kind="sheep"
                  position={[40, 2, -25]}
                  scale={0.6}
                />

                <ScenerySprite
                  kind="sheep"
                  position={[18, 2, -40]}
                  scale={0.55}
                />
              </>
            )}
          </>
        )}
        {/* ===================================================
    🐄 COWS — USING SHEEP COORDINATES
=================================================== */}

        {SHOW_COW && (
          <>
            {/* CLOSE */}

            <ScenerySprite kind="cow" position={[-25, 6, -30]} scale={0.85} />

            <ScenerySprite kind="cow" position={[25, 6, -25]} scale={0.8} />

            <ScenerySprite kind="cow" position={[-51, 6, -27]} scale={0.8} />

            <ScenerySprite kind="cow" position={[57, 6, -31]} scale={0.78} />

            {/* MID */}

            <ScenerySprite kind="cow" position={[-29, 5.2, -62]} scale={0.75} />

            <ScenerySprite kind="cow" position={[38, 5.2, -68]} scale={0.75} />

            {/* FAR */}

            <ScenerySprite kind="cow" position={[-50, 5.2, -76]} scale={0.7} />

            <ScenerySprite kind="cow" position={[57, 5.2, -83]} scale={0.7} />
          </>
        )}
      </RoadsideLoop>
    </>
  );
}
