"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Vec3 = [number, number, number];

const TrackSilverstone = () => {
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

  const kerbTexture = useMemo(() => {
    const canvas = document.createElement("canvas");

    canvas.width = 128;
    canvas.height = 32;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    /* Red */

    ctx.fillStyle = "#e58fa3";
    ctx.fillRect(0, 0, 64, 32);

    /* White */

    ctx.fillStyle = "#f6e4d4";
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
        <planeGeometry args={[14, 400]} />
        <meshStandardMaterial
          color="#343d42"
          roughness={0.78}
          metalness={0.05}
        />
      </mesh>

      {/* =====================================================
          WHITE EDGE LINES
      ===================================================== */}

      {[-6.45, 6.45].map((x) => (
        <mesh
          key={`edge-${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.025, -80]}
        >
          <planeGeometry args={[0.14, 400]} />

          <meshStandardMaterial color="#ffffff" roughness={0.75} />
        </mesh>
      ))}

      {/* =====================================================
          RED / WHITE KERBS

          ONE MESH PER SIDE

          No InstancedMesh required.
      ===================================================== */}

      {[-6.72, 6.72].map((x) => (
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
    BROKEN LANE LINES
===================================================== */}

      {[-3.5, 3.5].map((x) =>
        Array.from({ length: 34 }).map((_, i) => (
          <mesh
            key={`lane-dash-${x}-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[x, 0.028, -i * 12 - 4]}
          >
            <planeGeometry args={[0.07, 5]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>
        )),
      )}

      {/* =====================================================
    CENTER DASHED LINE
===================================================== */}

      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={`center-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.04, -i * 20 - 10]}
        >
          <planeGeometry args={[0.12, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
      ))}

      {/* =====================================================
          SAFETY BARRIERS
      ===================================================== */}

      {[-7.3, 7.3].map((x) => (
        <group key={`barrier-${x}`}>
          {/* Main barrier */}

          <mesh position={[x, 0.48, -80]}>
            <boxGeometry args={[0.3, 0.95, 400]} />

            <meshStandardMaterial
              color="#b8babc"
              metalness={0.2}
              roughness={0.72}
            />
          </mesh>

          {/* Top rail */}

          <mesh position={[x, 1.05, -80]}>
            <boxGeometry args={[0.12, 0.12, 400]} />

            <meshStandardMaterial
              color="#d2d3d4"
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
          GRANDSTANDS
      ===================================================== */}

      <Grandstand position={[-14, 1.8, -100]} />

      <Grandstand position={[14, 1.8, -100]} rotationY={Math.PI} />

      {/* =====================================================
          START / FINISH GANTRY
      ===================================================== */}

      <group position={[0, 0, -60]}>
        {/* Left support */}

        <mesh position={[-6.5, 4, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 8, 10]} />

          <meshStandardMaterial
            color="#55575a"
            metalness={0.45}
            roughness={0.6}
          />
        </mesh>

        {/* Right support */}

        <mesh position={[6.5, 4, 0]}>
          <cylinderGeometry args={[0.18, 0.22, 8, 10]} />

          <meshStandardMaterial
            color="#55575a"
            metalness={0.45}
            roughness={0.6}
          />
        </mesh>

        {/* Top beam */}

        <mesh position={[0, 8, 0]}>
          <boxGeometry args={[13, 0.4, 0.4]} />

          <meshStandardMaterial
            color="#444649"
            metalness={0.45}
            roughness={0.6}
          />
        </mesh>

        {/* =====================================================
    FORMULA X BANNER
===================================================== */}

        <mesh position={[0, 7.2, 0]}>
          <planeGeometry args={[12, 2]} />
          <meshBasicMaterial map={bannerTexture} />
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
      dummy.position.set(side * 8.3, 1.7, -i * 14);

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

      <mesh position={[side * 8.3, 3.2, -203]}>
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

      <mesh position={[side * 8.3, 2.4, -203]}>
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
   SPECTATOR
========================================================= */

function Spectator({ position, color }: { position: Vec3; color: string }) {
  return (
    <group position={position}>
      {/* Head */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#b98265" roughness={0.9} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.28, 0.5, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.08, 0.03, 0]}>
        <boxGeometry args={[0.09, 0.35, 0.12]} />
        <meshStandardMaterial color="#292d35" roughness={0.9} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.08, 0.03, 0]}>
        <boxGeometry args={[0.09, 0.35, 0.12]} />
        <meshStandardMaterial color="#292d35" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* =========================================================
   STADIUM GRANDSTAND
========================================================= */

function Grandstand({
  position,
  rotationY = 0,
}: {
  position: Vec3;
  rotationY?: number;
}) {
  const ROWS = 7;
  const SEATS_PER_ROW = 9;

  const spectatorColors = [
    "#263f63",
    "#b83b43",
    "#e1d5b8",
    "#426b58",
    "#6c477a",
    "#d18b45",
    "#384b52",
  ];

  return (
    <group
      position={[position[0], -0.3, position[2]]}
      rotation={[0, Math.PI / 2 + rotationY, 0]}
    >
      {/* =====================================================
          GROUND FOUNDATION
      ===================================================== */}

      <mesh position={[0, -0.15, -7]}>
        <boxGeometry args={[9.5, 0.3, 18]} />

        <meshStandardMaterial color="#858581" roughness={0.95} />
      </mesh>

      {/* =====================================================
          STEPPED STADIUM SEATING
      ===================================================== */}

      {Array.from({ length: ROWS }).map((_, row) => {
        const rowHeight = row * 0.55;
        const rowDepth = -row * 2.1;

        return (
          <group key={`row-${row}`} position={[0, rowHeight, rowDepth]}>
            {/* Concrete step */}
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[8.5, 0.5, 2.3]} />

              <meshStandardMaterial color="#aaa9a3" roughness={0.95} />
            </mesh>

            {/* Seat row */}
            <mesh position={[0, 0.58, 0.35]}>
              <boxGeometry args={[7.8, 0.18, 0.55]} />

              <meshStandardMaterial color="#344d68" roughness={0.8} />
            </mesh>

            {/* Seat back */}
            <mesh position={[0, 0.85, 0.58]}>
              <boxGeometry args={[7.8, 0.45, 0.12]} />

              <meshStandardMaterial color="#293d54" roughness={0.85} />
            </mesh>

            {/* =================================================
                SPECTATORS IN EACH ROW
            ================================================= */}

            {Array.from({
              length: SEATS_PER_ROW,
            }).map((_, seat) => {
              const x = -3.15 + seat * 0.79;

              return (
                <Spectator
                  key={`spectator-${row}-${seat}`}
                  position={[x, 0.65, 0.1]}
                  color={
                    spectatorColors[(row * 3 + seat) % spectatorColors.length]
                  }
                />
              );
            })}
          </group>
        );
      })}

      {/* =====================================================
          SIDE CONCRETE SUPPORTS
      ===================================================== */}

      {[-4.5, 4.5].map((x, i) => (
        <mesh key={`side-support-${i}`} position={[x, 2.1, -7]}>
          <boxGeometry args={[0.45, 4.5, 17]} />

          <meshStandardMaterial color="#858581" roughness={0.95} />
        </mesh>
      ))}

      {/* =====================================================
          REAR WALKWAY
      ===================================================== */}

      <mesh position={[0, 4.1, -15]}>
        <boxGeometry args={[9.5, 0.35, 1.5]} />

        <meshStandardMaterial color="#999892" roughness={0.95} />
      </mesh>

      {/* =====================================================
          ROOF SUPPORT COLUMNS
      ===================================================== */}

      {[-3.9, 3.9].map((x, i) => (
        <mesh key={`roof-column-${i}`} position={[x, 5.2, -14.5]}>
          <boxGeometry args={[0.3, 9, 0.3]} />

          <meshStandardMaterial
            color="#555b60"
            metalness={0.65}
            roughness={0.55}
          />
        </mesh>
      ))}

      {/* =====================================================
          STADIUM ROOF
      ===================================================== */}

      <mesh position={[0, 9.2, -7]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[10.5, 0.3, 18]} />

        <meshStandardMaterial
          color="#777b7c"
          metalness={0.25}
          roughness={0.85}
        />
      </mesh>

      {/* =====================================================
          FRONT SAFETY RAILING
      ===================================================== */}

      <mesh position={[0, 4.1, 2.2]}>
        <boxGeometry args={[8.5, 0.08, 0.08]} />

        <meshStandardMaterial color="#454545" metalness={0.8} roughness={0.4} />
      </mesh>

      {[-3.8, 0, 3.8].map((x, i) => (
        <mesh key={`railing-post-${i}`} position={[x, 3.7, 2.2]}>
          <boxGeometry args={[0.08, 0.8, 0.08]} />

          <meshStandardMaterial
            color="#454545"
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

TrackSilverstone.displayName = "TrackSilverstone";

export default TrackSilverstone;
