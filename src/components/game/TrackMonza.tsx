"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const TRACK_LENGTH = 400;
const TRACK_Z = -80;

const TrackMonza = () => {
  /* =======================================================
     KERB TEXTURE
  ======================================================= */

  const kerbTexture = useMemo(() => {
    const canvas = document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 32;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    const stripeWidth = 64;

    ctx.fillStyle = "#c51f27";
    ctx.fillRect(0, 0, stripeWidth, 32);

    ctx.fillStyle = "#f1f1ed";
    ctx.fillRect(stripeWidth, 0, stripeWidth, 32);

    ctx.fillStyle = "#c51f27";
    ctx.fillRect(stripeWidth * 2, 0, stripeWidth, 32);

    ctx.fillStyle = "#f1f1ed";
    ctx.fillRect(stripeWidth * 3, 0, stripeWidth, 32);

    const texture = new THREE.CanvasTexture(canvas);

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    texture.repeat.set(20, 1);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    return texture;
  }, []);

  /* =======================================================
   ASPHALT TEXTURE

   Dark asphalt with a static golden-hour sunset
   reflection baked directly into the road texture.
======================================================= */

  const asphaltTexture = useMemo(() => {
    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    /* =====================================================
     BASE ASPHALT
  ===================================================== */

    ctx.fillStyle = "#302b29";
    ctx.fillRect(0, 0, 512, 512);

    /* =====================================================
     SUNSET REFLECTION

     Brightest toward the horizon.
     Darker toward the foreground.

     The warm colors are deliberately muted so
     the road still reads as asphalt.
  ===================================================== */

    const sunsetGradient = ctx.createLinearGradient(0, 0, 0, 512);

    sunsetGradient.addColorStop(0.0, "rgba(232, 145, 62, 0.48)");

    sunsetGradient.addColorStop(0.12, "rgba(205, 108, 40, 0.38)");

    sunsetGradient.addColorStop(0.28, "rgba(165, 76, 31, 0.28)");

    sunsetGradient.addColorStop(0.48, "rgba(115, 55, 29, 0.18)");

    sunsetGradient.addColorStop(0.7, "rgba(65, 39, 29, 0.09)");

    sunsetGradient.addColorStop(1.0, "rgba(30, 27, 26, 0.00)");

    ctx.fillStyle = sunsetGradient;
    ctx.fillRect(0, 0, 512, 512);

    /* =====================================================
     GOLDEN CENTER REFLECTION

     Creates the subtle bright strip down the middle
     similar to the sunset reference.
  ===================================================== */

    const centerGradient = ctx.createLinearGradient(0, 0, 512, 0);

    centerGradient.addColorStop(0.0, "rgba(180, 90, 35, 0.00)");

    centerGradient.addColorStop(0.2, "rgba(190, 96, 38, 0.04)");

    centerGradient.addColorStop(0.38, "rgba(220, 130, 55, 0.12)");

    centerGradient.addColorStop(0.5, "rgba(235, 150, 65, 0.18)");

    centerGradient.addColorStop(0.62, "rgba(220, 130, 55, 0.12)");

    centerGradient.addColorStop(0.8, "rgba(190, 96, 38, 0.04)");

    centerGradient.addColorStop(1.0, "rgba(180, 90, 35, 0.00)");

    ctx.fillStyle = centerGradient;
    ctx.fillRect(0, 0, 512, 512);

    /* =====================================================
     SOFT HORIZONTAL SUNSET BANDS

     Very subtle variation so the reflection doesn't
     look like one completely flat gradient.
  ===================================================== */

    for (let i = 0; i < 18; i++) {
      const y = i * 28 + Math.random() * 14;

      const bandGradient = ctx.createLinearGradient(0, y, 512, y);

      bandGradient.addColorStop(0, "rgba(255, 170, 75, 0)");

      bandGradient.addColorStop(0.35, "rgba(255, 170, 75, 0.025)");

      bandGradient.addColorStop(0.5, "rgba(255, 190, 90, 0.05)");

      bandGradient.addColorStop(0.65, "rgba(255, 170, 75, 0.025)");

      bandGradient.addColorStop(1, "rgba(255, 170, 75, 0)");

      ctx.fillStyle = bandGradient;

      ctx.fillRect(0, y, 512, 2 + Math.random() * 2);
    }

    /* =====================================================
     FINE ASPHALT GRAIN

     Keep this AFTER the sunset so the reflection still
     has visible road texture over it.
  ===================================================== */

    for (let i = 0; i < 18000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;

      const brightness = 32 + Math.random() * 24;

      ctx.fillStyle = `rgba(
      ${brightness + 8},
      ${brightness},
      ${brightness - 2},
      0.28
    )`;

      const size = Math.random() * 1.4 + 0.25;

      ctx.fillRect(x, y, size, size);
    }

    /* =====================================================
     LONGITUDINAL ROAD VARIATION
  ===================================================== */

    for (let i = 0; i < 45; i++) {
      const y = Math.random() * 512;

      ctx.fillStyle = `rgba(
      15,
      13,
      12,
      ${0.025 + Math.random() * 0.035}
    )`;

      ctx.fillRect(0, y, 512, Math.random() * 2 + 0.5);
    }

    /* =====================================================
     THREE.JS TEXTURE
  ===================================================== */

    const texture = new THREE.CanvasTexture(canvas);

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    /*
     IMPORTANT:

     Keep the existing repeat.

     The texture is attached to each TrackMonza
     segment, so it automatically moves and repeats
     with that segment.
  */
    texture.repeat.set(1, 1);

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    return texture;
  }, []);
  /* =======================================================
     TRACK
  ======================================================= */

  return (
    <group>
      {/* =====================================================
          MAIN ASPHALT
      ===================================================== */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, TRACK_Z]}
        renderOrder={10000}
        frustumCulled={false}
      >
        <planeGeometry args={[14, TRACK_LENGTH]} />

        <meshStandardMaterial
          map={asphaltTexture ?? undefined}
          color="#3a3431"
          roughness={0.91}
          metalness={0.01}
        />
      </mesh>
      {[-2.25, -0.75, 0.75, 2.25].map((x, index) => (
        <mesh
          key={`rubber-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.018, TRACK_Z]}
          renderOrder={10005}
          frustumCulled={false}
        >
          <planeGeometry args={[0.95, TRACK_LENGTH]} />

          <meshStandardMaterial
            color="#252628"
            roughness={1}
            metalness={0}
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      ))}
      {[-6.45, 6.45].map((x) =>
        Array.from({ length: 34 }).map((_, i) => (
          <mesh
            key={`edge-${x}-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[x, 0.035, -i * 12 - 4]}
            renderOrder={10020}
          >
            <planeGeometry args={[0.14, 5]} />

            <meshBasicMaterial
              color="#d8c8aa"
              toneMapped={false}
              transparent
              opacity={1}
              depthWrite={false}
            />
          </mesh>
        )),
      )}
      {[-7.7, 7.7].map((x) => (
        <mesh
          key={`kerb-${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.045, TRACK_Z]}
          renderOrder={10030}
          frustumCulled={false}
        >
          <planeGeometry args={[0.55, TRACK_LENGTH]} />

          <meshStandardMaterial
            map={kerbTexture ?? undefined}
            roughness={0.78}
            metalness={0}
          />
        </mesh>
      ))}
      {[-7.38, 7.38].map((x) => (
        <mesh
          key={`kerb-shadow-${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.028, TRACK_Z]}
          renderOrder={10025}
          frustumCulled={false}
        >
          <planeGeometry args={[0.16, TRACK_LENGTH]} />

          <meshStandardMaterial
            color="#202224"
            roughness={1}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      ))}
      \
      {[-8.15, 8.15].map((x) => (
        <mesh
          key={`grass-${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.005, TRACK_Z]}
          renderOrder={9000}
          frustumCulled={false}
        >
          <planeGeometry args={[2.5, TRACK_LENGTH]} />

          <meshStandardMaterial color="#667d48" roughness={1} metalness={0} />
        </mesh>
      ))}
      {[-8.95, 8.95].map((x) => (
        <mesh
          key={`grass-edge-${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.01, TRACK_Z]}
          renderOrder={9005}
          frustumCulled={false}
        >
          <planeGeometry args={[0.65, TRACK_LENGTH]} />

          <meshStandardMaterial color="#50663a" roughness={1} metalness={0} />
        </mesh>
      ))}
      {/* =====================================================
          TRACKSIDE SAFETY BARRIERS
      ===================================================== */}
      {[-8.45, 8.45].map((x) => (
        <group key={`barrier-${x}`}>
          {/* Main barrier */}
          <mesh position={[x, 0.48, TRACK_Z]} renderOrder={10100}>
            <boxGeometry args={[0.3, 0.95, TRACK_LENGTH]} />

            <meshStandardMaterial
              color="#a5a19b"
              metalness={0.22}
              roughness={0.72}
            />
          </mesh>

          {/* Dark barrier base */}
          <mesh position={[x, 0.08, TRACK_Z]} renderOrder={10101}>
            <boxGeometry args={[0.36, 0.16, TRACK_LENGTH]} />

            <meshStandardMaterial
              color="#55585a"
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>

          {/* Top rail */}
          <mesh position={[x, 1.05, TRACK_Z]} renderOrder={10102}>
            <boxGeometry args={[0.12, 0.12, TRACK_LENGTH]} />

            <meshStandardMaterial
              color="#d1c7ba"
              metalness={0.4}
              roughness={0.58}
            />
          </mesh>
        </group>
      ))}
      {/* =====================================================
          FENCING
      ===================================================== */}
      <TrackFence side={-1} />
      <TrackFence side={1} />
      {/* =====================================================
    START / FINISH GANTRY
===================================================== */}
      <group position={[0, 0, -60]}>
        {/* LEFT SUPPORT */}
        <mesh position={[-7.5, 4, 0]} renderOrder={100000}>
          <cylinderGeometry args={[0.18, 0.22, 8, 10]} />

          <meshStandardMaterial
            color="#665b52"
            metalness={0.45}
            roughness={0.6}
            side={THREE.DoubleSide}
            transparent
            depthTest={false}
            toneMapped={false}
          />
        </mesh>

        {/* RIGHT SUPPORT */}
        <mesh position={[7.5, 4, 0]} renderOrder={100001}>
          <cylinderGeometry args={[0.18, 0.22, 8, 10]} />

          <meshStandardMaterial
            color="#665b52"
            metalness={0.45}
            roughness={0.6}
            side={THREE.DoubleSide}
            transparent
            depthTest={false}
            toneMapped={false}
          />
        </mesh>

        {/* TOP BEAM */}
        <mesh position={[0, 8, 0]} renderOrder={1000}>
          <boxGeometry args={[15, 0.4, 0.4]} />

          <meshStandardMaterial
            color="#444649"
            metalness={0.45}
            roughness={0.6}
            side={THREE.DoubleSide}
            transparent
            depthTest={false}
            toneMapped={false}
          />
        </mesh>

        {/* WHITE BANNER */}
        <mesh position={[0, 7.15, 0]} renderOrder={1000}>
          <planeGeometry args={[13.5, 1.8]} />

          <meshBasicMaterial
            color="#f4f4f0"
            side={THREE.DoubleSide}
            transparent
            // opacity={1}
            depthTest={false}
            toneMapped={false}
          />
        </mesh>

        {/* START LIGHTS */}
        {[-4.5, -3, -1.5, 0, 1.5, 3, 4.5].map((x, i) => (
          <mesh
            key={`start-light-${i}`}
            position={[x, 7.15, 0.025]}
            renderOrder={100004}
          >
            <sphereGeometry args={[0.16, 12, 12]} />

            <meshStandardMaterial
              color={i % 2 === 0 ? "#8d1717" : "#651515"}
              emissive={i % 2 === 0 ? "#4d0808" : "#260404"}
              emissiveIntensity={0.8}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
      {/* =====================================================
          LANE MARKINGS
      ===================================================== */}
      {[-3.5, 3.5].map((x) =>
        Array.from({ length: 24 }).map((_, i) => (
          <mesh
            key={`lane-${x}-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[x, 0.04, -i * 16 - 8]}
            renderOrder={10040}
          >
            <planeGeometry args={[0.07, 7]} />

            <meshBasicMaterial color="#d8c8aa" toneMapped={false} />
          </mesh>
        )),
      )}
      {/* =====================================================
          CENTER DASHES

          IMPORTANT:
          No continuous center line.
      ===================================================== */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={`center-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.045, -i * 20 - 10]}
          renderOrder={10050}
        >
          <planeGeometry args={[0.12, 6]} />

          <meshBasicMaterial
            color="#d8c8aa"
            toneMapped={false}
            transparent
            opacity={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

/* =========================================================
   TRACK FENCE

   One InstancedMesh per side.
========================================================= */

function TrackFence({ side }: { side: -1 | 1 }) {
  const postsRef = useRef<THREE.InstancedMesh>(null);

  const count = 30;

  useEffect(() => {
    const mesh = postsRef.current;

    if (!mesh) {
      return;
    }

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      dummy.position.set(side * 9.5, 1.7, -i * 14);

      dummy.rotation.set(0, 0, 0);

      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [side]);

  return (
    <group>
      {/* ===================================================
          TOP RAIL
      =================================================== */}

      <mesh position={[side * 9.5, 3.2, -203]} renderOrder={90000}>
        <boxGeometry args={[0.06, 0.06, 420]} />

        <meshStandardMaterial
          color="#777777"
          metalness={0.35}
          roughness={0.65}
        />
      </mesh>

      {/* ===================================================
          MIDDLE RAIL
      =================================================== */}

      <mesh position={[side * 9.5, 2.4, -203]} renderOrder={90000}>
        <boxGeometry args={[0.04, 0.04, 420]} />

        <meshStandardMaterial color="#888888" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* ===================================================
          LOWER RAIL
      =================================================== */}

      <mesh position={[side * 9.5, 1.15, -203]} renderOrder={90000}>
        <boxGeometry args={[0.035, 0.035, 420]} />

        <meshStandardMaterial
          color="#777777"
          metalness={0.3}
          roughness={0.72}
        />
      </mesh>

      {/* ===================================================
          POSTS
      =================================================== */}

      <instancedMesh
        ref={postsRef}
        args={[undefined, undefined, count]}
        renderOrder={90000}
      >
        <boxGeometry args={[0.08, 3.4, 0.08]} />

        <meshStandardMaterial
          color="#686868"
          metalness={0.35}
          roughness={0.65}
        />
      </instancedMesh>
    </group>
  );
}

TrackMonza.displayName = "TrackMonza";

export default TrackMonza;
