import { memo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "../store/gameStore";
import * as THREE from "three";

const LANE_POSITIONS = [-3.5, 0, 3.5];
const PLAYER_START_Z = 4;

// Preload the Ferrari model
useGLTF.preload("/models/car.glb");

export const PlayerCar = memo(() => {
  const targetLaneRef = useRef(1);

  const setPlayerLane = useGameStore((state: any) => state.setPlayerLane);
  const groupRef = useRef<THREE.Group>(null);

  // Load the Ferrari model
  const { scene } = useGLTF("/models/car.glb");

  useEffect(() => {
    scene.traverse((node: any) => {
      if (!node.isMesh) return;

      const name = node.name.toLowerCase();
      node.castShadow = true;
      node.material = node.material.clone();

      // BODY PANELS - McLaren papaya orange
      if (
        name.includes("body") ||
        name.includes("hood") ||
        name.includes("chassis") ||
        name.includes("car") ||
        name.includes("panel") ||
        name.includes("side") ||
        name.includes("top") ||
        name.includes("paint")
      ) {
        node.material.color.set("#FF8700");
        node.material.metalness = 0.15;
        node.material.roughness = 0.75;
        node.material.envMapIntensity = 0.8;
      }

      // WINGS - carbon black with orange accents
      else if (
        name.includes("wing") ||
        name.includes("spoiler") ||
        name.includes("diffuser") ||
        name.includes("floor")
      ) {
        node.material.color.set("#111111");
        node.material.metalness = 0.3;
        node.material.roughness = 0.6;
      }

      // WHEELS/TIRES - keep dark
      else if (
        name.includes("wheel") ||
        name.includes("tire") ||
        name.includes("tyre") ||
        name.includes("rim") ||
        name.includes("brake")
      ) {
        if (name.includes("rim") || name.includes("alloy")) {
          node.material.color.set("#aaaaaa");
          node.material.metalness = 0.95;
          node.material.roughness = 0.05;
        } else {
          node.material.color.set("#111111");
          node.material.metalness = 0.0;
          node.material.roughness = 1.0;
        }
      }

      // COCKPIT/INTERIOR - dark
      else if (
        name.includes("cockpit") ||
        name.includes("seat") ||
        name.includes("interior") ||
        name.includes("cabin") ||
        name.includes("halo")
      ) {
        node.material.color.set("#1a1a1a");
        node.material.metalness = 0.5;
        node.material.roughness = 0.5;
      }

      // GLASS/VISOR
      else if (
        name.includes("glass") ||
        name.includes("window") ||
        name.includes("visor") ||
        name.includes("screen")
      ) {
        node.material.color.set("#001122");
        node.material.metalness = 1.0;
        node.material.roughness = 0.0;
        node.material.transparent = true;
        node.material.opacity = 0.5;
      }

      // EXHAUST
      else if (name.includes("exhaust") || name.includes("pipe")) {
        node.material.color.set("#333333");
        node.material.metalness = 0.9;
        node.material.roughness = 0.2;
        node.material.emissive = new THREE.Color("#ff4400");
        node.material.emissiveIntensity = 0.5;
      }

      // DEFAULT - anything not matched gets orange
      // (catches body parts with generic names)
      else {
        node.material.color.set("#FF8700");
        node.material.metalness = 0.15;
        node.material.roughness = 0.75;
      }
    });

    // Add McLaren sticker details using canvas textures
    // Find the largest body mesh and add a decal texture
    let largestMesh: any = null;
    let largestArea = 0;
    scene.traverse((node: any) => {
      if (node.isMesh && node.geometry) {
        const box = new THREE.Box3().setFromObject(node);
        const size = box.getSize(new THREE.Vector3());
        const area = size.x * size.y * size.z;
        if (area > largestArea) {
          largestArea = area;
          largestMesh = node;
        }
      }
    });

    if (largestMesh) {
      // Create McLaren-style livery canvas texture
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;

      // Base orange
      ctx.fillStyle = "#FF8700";
      ctx.fillRect(0, 0, 1024, 512);

      // McLaren black section at rear
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 350, 1024, 162);

      // White McLaren logo area
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("McLAREN", 512, 420);

      // Gulf-style white stripe
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(0, 240, 1024, 40);

      // Number 81 (Piastri)
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 80px Arial";
      ctx.fillText("81", 200, 300);

      // Sponsor text
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("GULF", 512, 200);
      ctx.fillText("DGG", 800, 300);

      const texture = new THREE.CanvasTexture(canvas);
      largestMesh.material.map = texture;
      largestMesh.material.needsUpdate = true;
    }
  }, [scene]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scrolling
      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key.toLowerCase() === "a" ||
        e.key.toLowerCase() === "d"
      ) {
        e.preventDefault();
      }

      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        const nextLane = Math.max(0, targetLaneRef.current - 1);
        if (nextLane !== targetLaneRef.current) {
          targetLaneRef.current = nextLane;
          setPlayerLane(nextLane);
        }
      }

      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        const nextLane = Math.min(2, targetLaneRef.current + 1);
        if (nextLane !== targetLaneRef.current) {
          targetLaneRef.current = nextLane;
          setPlayerLane(nextLane);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const car = groupRef.current;

    const targetX = LANE_POSITIONS[targetLaneRef.current];
    const xSmoothing = 1 - Math.exp(-32 * delta);

    car.position.x = THREE.MathUtils.lerp(car.position.x, targetX, xSmoothing);

    if (Math.abs(car.position.x - targetX) < 0.001) {
      car.position.x = targetX;
    }
  });
  /* return (
    <group 
      position={[currentX, 0.0, 4]} 
      rotation={[0, Math.PI/2, 0]}
      scale={[1.0, 1.0, 1.0]}
      renderOrder={1000}
    >
      <primitive object={scene} />
      
      {/* McLaren brake light - center red }
      <mesh position={[0, 0.35, -2.2]}>
        <boxGeometry args={[0.15, 0.06, 0.03]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={6} 
        />
      </mesh>
      <pointLight position={[0, 0.35, -2.0]} color="#ff0000" intensity={4} distance={6} />
      <pointLight position={[0, 0.35, -2.0]} color="#ff4400" intensity={2} distance={10} />

      {/* Orange underglow - McLaren style }
      <pointLight position={[0, -0.3, 0]} color="#ff6600" intensity={1.5} distance={5} />
    </group>
  )*/

  return (
    <group
      ref={groupRef}
      position={[0, 0.0, PLAYER_START_Z]}
      rotation={[0, Math.PI, 0]}
      scale={[0.6, 0.6, 0.6]}
      renderOrder={1000}
    >
      {/* Car-only lighting */}
      <pointLight
        position={[0, 3, 0]}
        intensity={12}
        color="#ffffff"
        distance={12}
      />

      <primitive object={scene.clone()} />

      {/* brake light */}
      <mesh position={[0, 0.4, -2.2]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={5}
        />
      </mesh>

      {/* underglow */}
      <pointLight
        position={[0, -0.4, 0]}
        color="#ff3300"
        intensity={2}
        distance={5}
      />
    </group>
  );
});
