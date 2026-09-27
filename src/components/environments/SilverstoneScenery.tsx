"use client";

import { useMemo } from "react";
import * as THREE from "three";

/* =========================================================
   SILVERSTONE WATERCOLOR SCENERY

   Each scenery element = ONE transparent sprite.

   No:
   - 3D animal geometry
   - shadows
   - animation
   - expensive materials
   - dozens of meshes per object

   This is designed to keep the Silverstone background
   pretty while reducing rendering load.
========================================================= */

type Vec3 = [number, number, number];

type ElementType = "tree" | "sheep" | "cow" | "flowers";

/* =========================================================
   EASY CONTROLS
========================================================= */

const SHOW_TREES = true;
const SHOW_FLOWERS = true;
const SHOW_COWS = true;
const SHOW_SHEEP = true;

/*
 * Set these to false individually whenever you want.
 *
 * Example:
 *
 * const SHOW_TREES = false;
 *
 * Everything else stays.
 */

/* =========================================================
   TEXTURE CACHE
========================================================= */

const textureCache = new Map<ElementType, THREE.CanvasTexture>();

/* =========================================================
   WATERCOLOUR TEXTURE CREATOR
========================================================= */

function createWatercolorTexture(type: ElementType) {
  const existing = textureCache.get(type);

  if (existing) {
    return existing;
  }

  const canvas = document.createElement("canvas");

  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create scenery canvas");
  }

  /*
   * Important:
   *
   * We draw several semi-transparent shapes
   * over one another.
   *
   * This gives a painted / watercolor appearance
   * without requiring an actual watercolor shader.
   */

  ctx.clearRect(0, 0, 256, 256);

  /* =======================================================
     TREE
  ======================================================= */

  if (type === "tree") {
    /* watercolor trunk */

    for (let i = 0; i < 5; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(91,65,43,0.72)" : "rgba(116,81,50,0.45)";

      ctx.beginPath();

      ctx.ellipse(
        128 + (Math.random() - 0.5) * 8,
        174,
        15 + Math.random() * 3,
        55,
        (Math.random() - 0.5) * 0.08,
        0,
        Math.PI * 2,
      );

      ctx.fill();
    }

    /*
     * Main canopy.
     *
     * Several translucent circles give it
     * an irregular painted edge.
     */

    const canopy = [
      [128, 78, 55],
      [87, 91, 40],
      [168, 92, 42],
      [108, 54, 38],
      [151, 52, 42],
      [67, 112, 30],
      [190, 112, 31],
    ];

    canopy.forEach(([x, y, radius], index) => {
      ctx.fillStyle =
        index % 3 === 0
          ? "rgba(54,105,58,0.72)"
          : index % 3 === 1
            ? "rgba(74,126,65,0.68)"
            : "rgba(103,146,73,0.52)";

      ctx.beginPath();

      ctx.arc(x, y, radius, 0, Math.PI * 2);

      ctx.fill();
    });

    /* painted highlights */

    ctx.fillStyle = "rgba(165,188,101,0.30)";

    ctx.beginPath();

    ctx.arc(105, 55, 18, 0, Math.PI * 2);

    ctx.arc(151, 67, 15, 0, Math.PI * 2);

    ctx.fill();
  } else if (type === "sheep") {
    /* =======================================================
     SHEEP
  ======================================================= */
    /* wool */

    ctx.fillStyle = "rgba(248,245,235,0.94)";

    const wool = [
      [82, 140, 31],
      [113, 123, 34],
      [145, 137, 34],
      [105, 153, 34],
      [137, 155, 28],
    ];

    wool.forEach(([x, y, r]) => {
      ctx.beginPath();

      ctx.arc(x, y, r, 0, Math.PI * 2);

      ctx.fill();
    });

    /* head */

    ctx.fillStyle = "rgba(82,77,70,0.88)";

    ctx.beginPath();

    ctx.ellipse(175, 139, 23, 25, 0, 0, Math.PI * 2);

    ctx.fill();

    /* legs */

    ctx.fillStyle = "rgba(68,64,59,0.8)";

    ctx.fillRect(91, 163, 7, 37);

    ctx.fillRect(124, 166, 7, 34);

    ctx.fillRect(151, 163, 7, 37);
  } else if (type === "flowers") {
    /* =======================================================
     FLOWERS
  ======================================================= */
    const colors = [
      "rgba(244,211,76,0.85)",
      "rgba(250,244,221,0.9)",
      "rgba(222,164,193,0.82)",
      "rgba(151,190,218,0.8)",
    ];

    /*
     * One canvas.
     *
     * 16 painted flowers.
     */

    for (let i = 0; i < 16; i++) {
      const x = 25 + Math.random() * 206;

      const y = 140 + Math.random() * 55;

      const color = colors[i % colors.length];

      /* stem */

      ctx.strokeStyle = "rgba(65,110,59,0.7)";

      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.moveTo(x, 205);

      ctx.lineTo(x, y);

      ctx.stroke();

      /* flower */

      ctx.fillStyle = color;

      ctx.beginPath();

      ctx.arc(x, y, 6, 0, Math.PI * 2);

      ctx.fill();

      /* tiny watercolor bleed */

      ctx.fillStyle = color.replace("0.85", "0.18");

      ctx.beginPath();

      ctx.arc(x + 2, y - 2, 10, 0, Math.PI * 2);

      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;

  texture.minFilter = THREE.LinearFilter;

  texture.magFilter = THREE.LinearFilter;

  texture.generateMipmaps = false;

  textureCache.set(type, texture);

  return texture;
}

/* =========================================================
   WATERCOLOUR SPRITE
========================================================= */

function WatercolorSprite({
  type,
  position,
  scale = 1,
}: {
  type: ElementType;
  position: Vec3;
  scale?: number;
}) {
  const texture = useMemo(() => createWatercolorTexture(type), [type]);

  /*
   * Size depends on the element.
   */

  let width = 5;
  let height = 5;

  if (type === "tree") {
    width = 11;
    height = 13;
  }

  if (type === "sheep") {
    width = 6;
    height = 4.5;
  }

  if (type === "cow") {
    width = 3.5;
    height = 3.5;
  }

  if (type === "flowers") {
    width = 6;
    height = 5;
  }

  return (
    <sprite position={position} scale={[width * scale, height * scale, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        depthWrite={false}
        depthTest
        opacity={0.96}
      />
    </sprite>
  );
}

/* =========================================================
   SCENERY COMPONENTS
========================================================= */

function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return <WatercolorSprite type="tree" position={position} scale={scale} />;
}

function Cow({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return <WatercolorSprite type="cow" position={position} scale={scale} />;
}

function Sheep({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  return <WatercolorSprite type="sheep" position={position} scale={scale} />;
}

function FlowerPatch({
  position,
  scale = 1,
}: {
  position: Vec3;
  scale?: number;
}) {
  return <WatercolorSprite type="flowers" position={position} scale={scale} />;
}

/* =========================================================
   MAIN SILVERSTONE SCENERY
========================================================= */

export default function SilverstoneScenery() {
  return (
    <group>
      {/* ===================================================
          TREES

          Sparse.
          Outside the fence.
      =================================================== */}

      {SHOW_TREES && (
        <>
          <Tree position={[-16, 6, -35]} scale={0.8} />

          <Tree position={[19, 6, -58]} scale={0.7} />

          <Tree position={[-21, 6, -95]} scale={0.75} />

          <Tree position={[23, 6, -135]} scale={0.7} />

          <Tree position={[-24, 6, -185]} scale={0.68} />

          <Tree position={[20, 6, -230]} scale={0.72} />
        </>
      )}

      {/* ===================================================
          FLOWERS

          These are deliberately closer to the circuit.
      =================================================== */}

      {SHOW_FLOWERS && (
        <>
          <FlowerPatch position={[-12, 1, -22]} scale={0.9} />

          <FlowerPatch position={[13, 1, -38]} scale={0.75} />

          <FlowerPatch position={[-14, 1, -62]} scale={0.85} />

          <FlowerPatch position={[15, 1, -82]} scale={0.8} />

          <FlowerPatch position={[-16, 1, -110]} scale={0.9} />

          <FlowerPatch position={[17, 1, -145]} scale={0.75} />

          <FlowerPatch position={[-18, 1, -180]} scale={0.85} />

          <FlowerPatch position={[19, 1, -220]} scale={0.8} />
        </>
      )}

      {/* ===================================================
          COWS

          Four total.
          Spread apart.
      =================================================== */}

      {SHOW_COWS && (
        <>
          <Cow position={[-22, 2, -45]} scale={0.8} />

          <Cow position={[23, 2, -92]} scale={0.7} />

          <Cow position={[-25, 2, -145]} scale={0.75} />

          <Cow position={[25, 2, -205]} scale={0.68} />
        </>
      )}

      {/* ===================================================
          SHEEP
      =================================================== */}

      {SHOW_SHEEP && (
        <>
          <Sheep position={[18, 1.5, -30]} scale={0.75} />

          <Sheep position={[22, 1.5, -55]} scale={0.65} />

          <Sheep position={[-20, 1.5, -82]} scale={0.7} />

          <Sheep position={[24, 1.5, -125]} scale={0.65} />

          <Sheep position={[-22, 1.5, -170]} scale={0.65} />
        </>
      )}

      {/* ===================================================
          cowS

          Tiny details.
      =================================================== */}

      {SHOW_COWS && (
        <>
          <Cow position={[-12, 1, -34]} scale={0.65} />

          <Cow position={[14, 1, -72]} scale={0.58} />

          <Cow position={[-15, 1, -118]} scale={0.62} />

          <Cow position={[17, 1, -160]} scale={0.55} />

          <Cow position={[-18, 1, -215]} scale={0.58} />
        </>
      )}
    </group>
  );
}
