"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

const TRACK_LENGTH = 400;
const TRACK_Z = -80;

const TrackMonza = () => {
  const bannerTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load(
      "/assets/formula-x-banner.png",
    );

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    return texture;
  }, []);
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
  const asphaltMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        nearColor: {
          value: new THREE.Color("#3A2924"),
        },

        midColor: {
          value: new THREE.Color("#5A3021"),
        },

        farColor: {
          value: new THREE.Color("#9A5128"),
        },
      },

      vertexShader: `
      varying float vDepth;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        vDepth = -mvPosition.z;

        gl_Position = projectionMatrix * mvPosition;
      }
    `,

      fragmentShader: `
  uniform vec3 nearColor;
  uniform vec3 midColor;
  uniform vec3 farColor;

  varying float vDepth;

  void main() {

    // Smooth transition from near → middle
    float nearToMid = smoothstep(
      5.0,
      70.0,
      vDepth
    );

    // Smooth transition from middle → far
    float midToFar = smoothstep(
      55.0,
      130.0,
      vDepth
    );

    // First blend: dark → warm brown
    vec3 color = mix(
      nearColor,
      midColor,
      nearToMid
    );

    // Second blend: warm brown → orange
    color = mix(
      color,
      farColor,
      midToFar
    );

    gl_FragColor = vec4(color, 1.0);
  }
`,
    });
  }, []);
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, TRACK_Z]}
        renderOrder={10000}
        frustumCulled={false}
      >
        <planeGeometry args={[14, TRACK_LENGTH]} />

        <primitive object={asphaltMaterial} attach="material" />
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
      {/* =========================================================
    MONZA SUNSET —  FORMULA X GANTRY
========================================================= */}
      <group position={[0, 0, -60]} renderOrder={1000000}>
        {/* =======================================================
      LEFT SUPPORT
  ======================================================= */}

        <mesh position={[-7.2, 4, 0]} renderOrder={1000000}>
          <cylinderGeometry args={[0.2, 0.24, 8, 10]} />

          <meshBasicMaterial
            color="#211c20"
            depthTest={true}
            depthWrite={true}
            toneMapped={false}
          />
        </mesh>

        {/* =======================================================
      RIGHT SUPPORT
  ======================================================= */}

        <mesh position={[7.2, 4, 0]} renderOrder={1000000}>
          <cylinderGeometry args={[0.2, 0.24, 8, 10]} />

          <meshBasicMaterial
            color="#211c20"
            depthTest={true}
            depthWrite={true}
            toneMapped={false}
          />
        </mesh>

        {/* =======================================================
      TOP BEAM
  ======================================================= */}

        <mesh position={[0, 8.15, 0]} renderOrder={1000001}>
          <boxGeometry args={[14.8, 0.38, 0.42]} />

          <meshBasicMaterial
            color="#211c20"
            depthTest={true}
            depthWrite={true}
            toneMapped={false}
          />
        </mesh>

        {/* =======================================================
    FORMULA X BANNER
======================================================= */}

        <mesh position={[0, 7.2, 0]} renderOrder={1000001}>
          <planeGeometry args={[12, 2]} />
          <meshBasicMaterial map={bannerTexture} />
        </mesh>
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
