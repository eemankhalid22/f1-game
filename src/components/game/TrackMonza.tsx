"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

/* =========================================================
   MONZA HIGH-SPEED CIRCUIT

   ONLY TRACK GEOMETRY

   Environment:
   MonzaEnvironment.tsx

   Optimized:
   - No malformed nested InstancedMesh
   - No giant number of kerb meshes
   - Fence posts use proper instancing
   - Track remains lightweight
========================================================= */

const TrackMonza = () => {
  /* =======================================================
     KERB TEXTURE

     Instead of 160 individual meshes, we use a single
     repeating red/white texture on each side.
  ======================================================= */

  const kerbTexture = useMemo(() => {
    const canvas = document.createElement("canvas");

    canvas.width = 128;
    canvas.height = 32;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    /* Red */

    ctx.fillStyle = "#d51f26";
    ctx.fillRect(0, 0, 64, 32);

    /* White */

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(64, 0, 64, 32);

    const texture = new THREE.CanvasTexture(canvas);

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    /*
     * 40 red/white sections along the track.
     */
    texture.repeat.set(40, 1);

    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
  }, []);

  return (
    <group>
      {/* =====================================================
          MAIN ASPHALT
      ===================================================== */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -80]}>
        <planeGeometry args={[16, 400]} />

        <meshStandardMaterial color="#45403D" roughness={0.94} metalness={0} />
      </mesh>

      {/* =====================================================
          WHITE EDGE LINES
      ===================================================== */}

      {[-7.45, 7.45].map((x) => (
        <mesh
          key={`edge-${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.025, -80]}
        >
          <planeGeometry args={[0.14, 400]} />

          <meshStandardMaterial color="#ffffff" roughness={0.75} />
        </mesh>
      ))}

      {/* Subtle warm track shoulders to catch the sunset light */}
      {[-7.1, 7.1].map((x) => (
        <mesh
          key={`shoulder-${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.018, -80]}
        >
          <planeGeometry args={[0.38, 400]} />
          <meshStandardMaterial color="#756457" roughness={1} metalness={0} />
        </mesh>
      ))}

      {/* =====================================================
          RED / WHITE KERBS

          ONE MESH PER SIDE

          No InstancedMesh required.
      ===================================================== */}

      {[-7.7, 7.7].map((x) => (
        <mesh
          key={`kerb-${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.035, -80]}
        >
          <planeGeometry args={[0.52, 400]} />

          <meshStandardMaterial
            map={kerbTexture ?? undefined}
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* =====================================================
          GRASS VERGES

          Monza uses broad natural verges rather than city-style
          roadside detailing. The sunset environment supplies the
          warm light and countryside atmosphere.
      ===================================================== */}

      {[-8.15, 8.15].map((x) => (
        <mesh
          key={`grass-${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.005, -80]}
        >
          <planeGeometry args={[2.5, 400]} />
          <meshStandardMaterial color="#6f8750" roughness={1} />
        </mesh>
      ))}

      {/* =====================================================
          TRACKSIDE SAFETY BARRIERS
      ===================================================== */}

      {[-8.45, 8.45].map((x) => (
        <group key={`barrier-${x}`}>
          {/* Main barrier */}

          <mesh position={[x, 0.48, -80]}>
            <boxGeometry args={[0.3, 0.95, 400]} />

            <meshStandardMaterial
              color="#a9a39b"
              metalness={0.2}
              roughness={0.72}
            />
          </mesh>

          {/* Top rail */}

          <mesh position={[x, 1.05, -80]}>
            <boxGeometry args={[0.12, 0.12, 400]} />

            <meshStandardMaterial
              color="#d8c8b4"
              metalness={0.35}
              roughness={0.6}
            />
          </mesh>
        </group>
      ))}

      {/* =====================================================
          FENCING

          Proper InstancedMesh.
      ===================================================== */}

      <TrackFence side={-1} />
      <TrackFence side={1} />

      {/* =====================================================
          MONZA SINGLE-SIDE GRANDSTAND
      ===================================================== */}

      <Grandstand position={[-14.5, 1.8, -115]} />

      {/* =====================================================
          MONZA START / FINISH GANTRY
      ===================================================== */}

      <group position={[0, 0, -60]}>
        {/* Left support */}

        <mesh position={[-7.5, 4, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 8, 10]} />

          <meshStandardMaterial
            color="#665b52"
            metalness={0.45}
            roughness={0.6}
          />
        </mesh>

        {/* Right support */}

        <mesh position={[7.5, 4, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 8, 10]} />

          <meshStandardMaterial
            color="#665b52"
            metalness={0.45}
            roughness={0.6}
          />
        </mesh>

        {/* Top beam */}

        <mesh position={[0, 8, 0]}>
          <boxGeometry args={[15, 0.4, 0.4]} />

          <meshStandardMaterial
            color="#444649"
            metalness={0.45}
            roughness={0.6}
          />
        </mesh>

        {/* White sign */}

        <mesh position={[0, 7.15, 0]}>
          <planeGeometry args={[13.5, 1.8]} />

          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
};

/* =========================================================
   TRACK FENCE

   ONE INSTANCED MESH PER SIDE
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

      <mesh position={[side * 9.5, 3.2, -203]}>
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

      <mesh position={[side * 9.5, 2.4, -203]}>
        <boxGeometry args={[0.04, 0.04, 420]} />

        <meshStandardMaterial color="#888888" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* ===================================================
          POSTS
      =================================================== */}

      <instancedMesh ref={postsRef} args={[undefined, undefined, count]}>
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

/* =========================================================
   GRANDSTAND
========================================================= */

function Grandstand({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      {/* Main structure */}

      <mesh>
        <boxGeometry args={[8, 3.5, 32]} />

        <meshStandardMaterial color="#e4e5e6" roughness={0.9} />
      </mesh>

      {/* Seating */}

      {Array.from({
        length: 5,
      }).map((_, i) => (
        <mesh key={`seat-${i}`} position={[0, 1 + i * 0.55, 0]}>
          <boxGeometry args={[8.5, 0.3, 30]} />

          <meshStandardMaterial
            color={i % 2 === 0 ? "#c8c9ca" : "#aaabad"}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* Roof */}

      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[9, 0.3, 33]} />

        <meshStandardMaterial color="#eeeeee" roughness={0.85} />
      </mesh>
    </group>
  );
}

TrackMonza.displayName = "TrackMonza";

export default TrackMonza;
