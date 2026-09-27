import { useMemo } from "react";
import * as THREE from "three";
import React from "react";

export const TrackMonaco = React.memo(() => {
  // DGG banner texture
  const bannerTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;

    const ctx = canvas.getContext("2d")!;

    // Dark background
    ctx.fillStyle = "#1a0030";
    ctx.fillRect(0, 0, 512, 128);

    // Neon border
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 120);

    // Text
    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "#00ffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("DGG GRID RUSH", 256, 64);

    // Glow
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 20;
    ctx.fillText("DGG GRID RUSH", 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }, []);

  // Stable neon sign positions
  const signClusters = useMemo(() => {
    const colors = ["#ff00ff", "#00ffff", "#ff0044", "#ffff00", "#ff8800"];

    return {
      left: Array.from({ length: 12 }).map((_) => {
        const z = -Math.random() * 300 - 20;
        const y = 1.5 + Math.random() * 2;
        const clusterSize = Math.floor(Math.random() * 3) + 2;

        return {
          z,
          y,
          signs: Array.from({ length: clusterSize }).map((_, j) => ({
            x: j * 0.8 - (clusterSize - 1) * 0.4,
            y: Math.random() * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
          })),
        };
      }),

      right: Array.from({ length: 12 }).map((_) => {
        const z = -Math.random() * 300 - 20;
        const y = 1.5 + Math.random() * 2;
        const clusterSize = Math.floor(Math.random() * 3) + 2;

        return {
          z,
          y,
          signs: Array.from({ length: clusterSize }).map((_, j) => ({
            x: j * 0.8 - (clusterSize - 1) * 0.4,
            y: Math.random() * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
          })),
        };
      }),
    };
  }, []);

  return (
    <group>
      {/* ========================= */}
      {/* MAIN ROAD */}
      {/* ========================= */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -80]}>
        <planeGeometry args={[14, 400]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* ========================= */}
      {/* LEFT GRASS */}
      {/* ========================= */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-40, -0.01, -80]}>
        <planeGeometry args={[60, 400]} />
        <meshStandardMaterial color="#0a0a18" roughness={1} />
      </mesh>

      {/* ========================= */}
      {/* RIGHT GRASS */}
      {/* ========================= */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, -0.01, -80]}>
        <planeGeometry args={[60, 400]} />
        <meshStandardMaterial color="#0a0a18" roughness={1} />
      </mesh>

      {/* ========================= */}
      {/* ROAD EDGE NEON */}
      {/* ========================= */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.5, 0.01, -80]}>
        <planeGeometry args={[0.1, 400]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.5}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.5, 0.01, -80]}>
        <planeGeometry args={[0.1, 400]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* ========================= */}
      {/* CENTER GLOW */}
      {/* ========================= */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -80]}>
        <planeGeometry args={[0.15, 400]} />
        <meshStandardMaterial
          color="#00aaff"
          emissive="#00aaff"
          emissiveIntensity={2}
        />
      </mesh>

      {/* ========================= */}
      {/* LANE MARKERS */}
      {/* ========================= */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.5, 0.01, -80]}>
        <planeGeometry args={[0.07, 400]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.5, 0.01, -80]}>
        <planeGeometry args={[0.07, 400]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* ========================= */}
      {/* BARRIER WALLS */}
      {/* ========================= */}

      <mesh position={[-7.2, 0.4, -80]}>
        <boxGeometry args={[0.25, 0.8, 400]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      <mesh position={[7.2, 0.4, -80]}>
        <boxGeometry args={[0.25, 0.8, 400]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* ========================= */}
      {/* BARRIER NEON STRIPES */}
      {/* ========================= */}

      <mesh position={[-7.2, 0.75, -80]}>
        <boxGeometry args={[0.27, 0.12, 400]} />
        <meshStandardMaterial
          color="#0088ff"
          emissive="#0088ff"
          emissiveIntensity={1.5}
        />
      </mesh>

      <mesh position={[7.2, 0.75, -80]}>
        <boxGeometry args={[0.27, 0.12, 400]} />
        <meshStandardMaterial
          color="#0088ff"
          emissive="#0088ff"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* ========================= */}
      {/* FIXED NEON SIGNBOARDS */}
      {/* ========================= */}

      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`sign-left-${i}`} position={[-8.5, 2.5, -i * 40 + 20]}>
          <mesh>
            <boxGeometry args={[1.5, 1, 0.1]} />
            <meshStandardMaterial
              color="#001133"
              emissive="#001133"
              emissiveIntensity={0.5}
            />
          </mesh>

          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[1.3, 0.8]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`sign-right-${i}`} position={[8.5, 2.5, -i * 40 + 20]}>
          <mesh>
            <boxGeometry args={[1.5, 1, 0.1]} />
            <meshStandardMaterial
              color="#001133"
              emissive="#001133"
              emissiveIntensity={0.5}
            />
          </mesh>

          <mesh position={[0, 0, 0.06]}>
            <planeGeometry args={[1.3, 0.8]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}

      {/* ========================= */}
      {/* RANDOM NEON CLUSTERS */}
      {/* ========================= */}

      {signClusters.left.map((cluster, i) => (
        <group key={`cluster-left-${i}`} position={[-9, cluster.y, cluster.z]}>
          {cluster.signs.map((sign, j) => (
            <group key={j} position={[sign.x, sign.y, 0]}>
              <mesh>
                <boxGeometry args={[0.6, 0.4, 0.05]} />
                <meshStandardMaterial
                  color="#001133"
                  emissive="#001133"
                  emissiveIntensity={0.3}
                />
              </mesh>

              <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[0.5, 0.3]} />
                <meshStandardMaterial
                  color={sign.color}
                  emissive={sign.color}
                  emissiveIntensity={2.5}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {signClusters.right.map((cluster, i) => (
        <group key={`cluster-right-${i}`} position={[9, cluster.y, cluster.z]}>
          {cluster.signs.map((sign, j) => (
            <group key={j} position={[sign.x, sign.y, 0]}>
              <mesh>
                <boxGeometry args={[0.6, 0.4, 0.05]} />
                <meshStandardMaterial
                  color="#001133"
                  emissive="#001133"
                  emissiveIntensity={0.3}
                />
              </mesh>

              <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[0.5, 0.3]} />
                <meshStandardMaterial
                  color={sign.color}
                  emissive={sign.color}
                  emissiveIntensity={2.5}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ========================= */}
      {/* DGG GANTRY */}
      {/* ========================= */}

      <group position={[0, 0, -60]}>
        <mesh position={[-6.5, 4, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 8, 16]} />
          <meshStandardMaterial
            color="#333333"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        <mesh position={[6.5, 4, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 8, 16]} />
          <meshStandardMaterial
            color="#333333"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        <mesh position={[0, 8, 0]}>
          <boxGeometry args={[13, 0.3, 0.3]} />
          <meshStandardMaterial
            color="#333333"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        <mesh position={[0, 7.2, 0]}>
          <planeGeometry args={[12, 2]} />
          <meshBasicMaterial map={bannerTexture} />
        </mesh>
      </group>

      {/* ========================= */}
      {/* REFLECTIVE WATER */}
      {/* ========================= */}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-30, -0.1, -140]}>
        <planeGeometry args={[50, 300]} />
        <meshStandardMaterial
          color="#0a0020"
          metalness={0.9}
          roughness={0.05}
          emissive="#0044aa"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[30, -0.1, -140]}>
        <planeGeometry args={[50, 300]} />
        <meshStandardMaterial
          color="#0a0020"
          metalness={0.9}
          roughness={0.05}
          emissive="#0044aa"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
});

TrackMonaco.displayName = "TrackMonaco";

export default TrackMonaco;
