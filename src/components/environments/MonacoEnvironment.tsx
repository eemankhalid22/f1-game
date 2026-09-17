import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Cache textures outside component to prevent recreation
let cachedSynthwaveSkyline: THREE.CanvasTexture | null = null;
let cachedDarkSkyline: THREE.CanvasTexture | null = null;
let cachedStarTexture: THREE.CanvasTexture | null = null;

// Create circular star texture
const createStarTexture = () => {
  if (cachedStarTexture) return cachedStarTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;

  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);

  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.3)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  cachedStarTexture = new THREE.CanvasTexture(canvas);

  return cachedStarTexture;
};

// Create synthwave city skyline
const createSynthwaveSkyline = () => {
  if (cachedSynthwaveSkyline) return cachedSynthwaveSkyline;

  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;

  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);

  gradient.addColorStop(0, "#050010");
  gradient.addColorStop(0.3, "#150030");
  gradient.addColorStop(0.6, "#350060");
  gradient.addColorStop(1, "#9b0090");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2048, 512);

  // Huge sun glow
  const sunGradient = ctx.createRadialGradient(1024, 380, 0, 1024, 380, 350);

  sunGradient.addColorStop(0, "#ffffff");
  sunGradient.addColorStop(0.15, "#ffffcc");
  sunGradient.addColorStop(0.3, "#ffcc00");
  sunGradient.addColorStop(0.45, "#ff00aa");
  sunGradient.addColorStop(0.65, "#9900ff");
  sunGradient.addColorStop(0.85, "#440066");
  sunGradient.addColorStop(1, "rgba(68, 0, 102, 0)");

  ctx.fillStyle = sunGradient;
  ctx.fillRect(0, 0, 2048, 512);

  // City buildings
  const buildings: any[] = [];
  let currentX = 0;

  while (currentX < 2048) {
    const width = 60 + Math.random() * 120;
    const height = 80 + Math.random() * 320;

    const depth = Math.random() > 0.4;
    const depthAmount = depth ? 8 + Math.random() * 12 : 0;

    const setbacks =
      Math.random() > 0.5 ? Math.floor(Math.random() * 4) + 1 : 0;

    const hasAntenna = Math.random() > 0.6;

    const antennaCount = hasAntenna ? Math.floor(Math.random() * 3) + 1 : 0;

    const hasSpire = Math.random() > 0.8;

    const buildingType = Math.random() > 0.7 ? "modern" : "classic";

    buildings.push({
      x: currentX,
      width,
      height,
      depth,
      depthAmount,
      setbacks,
      hasAntenna,
      antennaCount,
      hasSpire,
      buildingType,
    });

    currentX += width - 20;
  }

  // Draw buildings
  buildings.forEach((b) => {
    const bodyGradient = ctx.createLinearGradient(
      b.x,
      512 - b.height,
      b.x + b.width,
      512,
    );

    bodyGradient.addColorStop(0, b.depth ? "#120024" : "#180038");

    bodyGradient.addColorStop(0.5, b.depth ? "#1a0030" : "#200040");

    bodyGradient.addColorStop(1, b.depth ? "#0d0018" : "#150028");

    ctx.fillStyle = bodyGradient;

    ctx.fillRect(b.x, 512 - b.height, b.width, b.height);

    // 3D side
    if (b.depth) {
      const sideGradient = ctx.createLinearGradient(
        b.x + b.width,
        512 - b.height,
        b.x + b.width + b.depthAmount,
        512,
      );

      sideGradient.addColorStop(0, "#080012");
      sideGradient.addColorStop(1, "#05000a");

      ctx.fillStyle = sideGradient;

      ctx.fillRect(b.x + b.width, 512 - b.height, b.depthAmount, b.height);

      // Top face
      ctx.fillStyle = "#280050";

      ctx.beginPath();

      ctx.moveTo(b.x, 512 - b.height);

      ctx.lineTo(
        b.x + b.depthAmount * 0.6,
        512 - b.height - b.depthAmount * 0.6,
      );

      ctx.lineTo(
        b.x + b.width + b.depthAmount * 0.6,
        512 - b.height - b.depthAmount * 0.6,
      );

      ctx.lineTo(b.x + b.width, 512 - b.height);

      ctx.closePath();
      ctx.fill();
    }

    // Building setbacks
    if (b.setbacks > 0) {
      for (let s = 0; s < b.setbacks; s++) {
        const setbackWidth = b.width * (0.65 - s * 0.12);

        const setbackHeight = b.height * (0.75 - s * 0.12);

        const setbackX = b.x + (b.width - setbackWidth) / 2;

        const setbackGradient = ctx.createLinearGradient(
          setbackX,
          512 - setbackHeight,
          setbackX + setbackWidth,
          512,
        );

        setbackGradient.addColorStop(0, b.depth ? "#1a0035" : "#220045");

        setbackGradient.addColorStop(0.5, b.depth ? "#250050" : "#2d0058");

        setbackGradient.addColorStop(1, b.depth ? "#150028" : "#1d0038");

        ctx.fillStyle = setbackGradient;

        ctx.fillRect(
          setbackX,
          512 - setbackHeight,
          setbackWidth,
          setbackHeight,
        );

        ctx.strokeStyle = "#3a0070";
        ctx.lineWidth = 1;

        ctx.strokeRect(
          setbackX,
          512 - setbackHeight,
          setbackWidth,
          setbackHeight,
        );
      }
    }

    // Antennas
    if (b.hasAntenna) {
      for (let a = 0; a < b.antennaCount; a++) {
        const antennaX = b.x + b.width / 2 + (a - (b.antennaCount - 1) / 2) * 8;

        const antennaHeight = 30 + Math.random() * 50;

        ctx.fillStyle = "#2a0050";

        ctx.fillRect(
          antennaX - 1.5,
          512 - b.height - antennaHeight,
          3,
          antennaHeight,
        );

        ctx.fillStyle = "#ff0000";
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 8;

        ctx.beginPath();

        ctx.arc(
          antennaX,
          512 - b.height - antennaHeight - 3,
          2.5,
          0,
          Math.PI * 2,
        );

        ctx.fill();

        ctx.shadowBlur = 0;
      }
    }

    // Spire
    if (b.hasSpire && b.buildingType === "modern") {
      ctx.fillStyle = "#350060";

      ctx.beginPath();

      ctx.moveTo(b.x + b.width / 2, 512 - b.height);

      ctx.lineTo(b.x + b.width / 2 - 6, 512 - b.height - 25);

      ctx.lineTo(b.x + b.width / 2 + 6, 512 - b.height - 25);

      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 10;

      ctx.beginPath();

      ctx.arc(b.x + b.width / 2, 512 - b.height - 28, 2, 0, Math.PI * 2);

      ctx.fill();

      ctx.shadowBlur = 0;
    }

    // Modern decorative lines
    if (b.buildingType === "modern") {
      ctx.strokeStyle = "#400080";
      ctx.lineWidth = 1;

      for (let line = 0; line < 3; line++) {
        const lineY = 512 - b.height + (b.height * (line + 1)) / 4;

        ctx.beginPath();

        ctx.moveTo(b.x + 5, lineY);

        ctx.lineTo(b.x + b.width - 5, lineY);

        ctx.stroke();
      }
    }
  });

  // Window lights
  const windowColors = [
    "#ff00ff",
    "#ff0088",
    "#ff4400",
    "#ffaa00",
    "#00ffff",
    "#ffffff",
    "#8800ff",
    "#ff66ff",
  ];

  for (let i = 0; i < 800; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];

    const gridX = Math.floor(Math.random() * 8);

    const gridY = Math.floor(Math.random() * 12);

    const cellWidth = (building.width - 20) / 8;

    const cellHeight = (building.height - 40) / 12;

    const wx = building.x + 10 + gridX * cellWidth + cellWidth * 0.2;

    const wy =
      512 - building.height + 20 + gridY * cellHeight + cellHeight * 0.2;

    const ww = cellWidth * 0.6;
    const wh = cellHeight * 0.6;

    ctx.fillStyle =
      windowColors[Math.floor(Math.random() * windowColors.length)];

    ctx.globalAlpha = 0.4 + Math.random() * 0.6;

    ctx.fillRect(wx, wy, ww, wh);
  }

  ctx.globalAlpha = 1;

  // Neon signs
  const neonColors = [
    "#ff00ff",
    "#00ffff",
    "#ff0044",
    "#ffff00",
    "#ff8800",
    "#00ff88",
  ];

  for (let i = 0; i < 25; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];

    const nx = building.x + Math.random() * (building.width - 60) + 20;

    const ny = 512 - building.height + Math.random() * 100 + 30;

    const nw = 30 + Math.random() * 40;

    const nh = 12 + Math.random() * 10;

    const color = neonColors[Math.floor(Math.random() * neonColors.length)];

    ctx.shadowColor = color;
    ctx.shadowBlur = 25;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.95;

    ctx.fillRect(nx, ny, nw, nh);

    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.3;

    ctx.fillRect(nx + 2, ny + 2, nw - 4, nh - 4);

    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;

  // Vertical neon stripes
  for (let i = 0; i < 20; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];

    const stripeX = building.x + Math.random() * (building.width - 10) + 5;

    const stripeHeight = building.height * (0.3 + Math.random() * 0.5);

    const stripeY =
      512 - building.height + Math.random() * (building.height - stripeHeight);

    const stripeColor =
      neonColors[Math.floor(Math.random() * neonColors.length)];

    ctx.shadowColor = stripeColor;
    ctx.shadowBlur = 15;
    ctx.fillStyle = stripeColor;
    ctx.globalAlpha = 0.8;

    ctx.fillRect(stripeX, stripeY, 3, stripeHeight);

    ctx.shadowBlur = 0;
  }

  ctx.globalAlpha = 1;

  cachedSynthwaveSkyline = new THREE.CanvasTexture(canvas);

  return cachedSynthwaveSkyline;
};

// Create darker background skyline
const createDarkSkyline = () => {
  if (cachedDarkSkyline) return cachedDarkSkyline;

  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 512;

  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, 0, 512);

  gradient.addColorStop(0, "#080010");
  gradient.addColorStop(0.5, "#1a0030");
  gradient.addColorStop(1, "#4a0050");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2048, 512);

  // Darker sun
  const sunGradient = ctx.createRadialGradient(1024, 350, 0, 1024, 350, 280);

  sunGradient.addColorStop(0, "#aa8800");

  sunGradient.addColorStop(0.3, "#884400");

  sunGradient.addColorStop(0.6, "#440055");

  sunGradient.addColorStop(1, "rgba(68, 0, 85, 0)");

  ctx.fillStyle = sunGradient;
  ctx.fillRect(0, 0, 2048, 512);

  // Dark buildings
  ctx.fillStyle = "#0d0020";

  const buildings: any[] = [];
  let currentX = 0;

  while (currentX < 2048) {
    const width = 40 + Math.random() * 80;

    const height = 100 + Math.random() * 220;

    buildings.push({
      x: currentX,
      width,
      height,
    });

    currentX += width - 10;
  }

  buildings.forEach((b) => {
    ctx.fillRect(b.x, 512 - b.height, b.width, b.height);
  });

  // Fewer windows
  const windowColors = ["#8800aa", "#660088", "#440066"];

  for (let i = 0; i < 200; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];

    const wx = building.x + Math.random() * (building.width - 12) + 6;

    const wy =
      512 - building.height + Math.random() * (building.height - 20) + 10;

    ctx.fillStyle =
      windowColors[Math.floor(Math.random() * windowColors.length)];

    ctx.globalAlpha = 0.4 + Math.random() * 0.3;

    ctx.fillRect(wx, wy, 4, 6);
  }

  ctx.globalAlpha = 1;

  cachedDarkSkyline = new THREE.CanvasTexture(canvas);

  return cachedDarkSkyline;
};

export const MonacoEnvironment = () => {
  const skylineTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const darkSkylineTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const shootingStarsRef = useRef<any[]>([]);

  const particlesRef = useRef<THREE.Points | null>(null);

  const gridRef = useRef<THREE.LineSegments | null>(null);

  const starfieldRef = useRef<THREE.Points | null>(null);

  const tempVecRef = useRef(new THREE.Vector3());

  useEffect(() => {
    skylineTextureRef.current = createSynthwaveSkyline();

    darkSkylineTextureRef.current = createDarkSkyline();

    createStarTexture();

    // Shooting stars
    shootingStarsRef.current = Array(10)
      .fill(null)
      .map(() => ({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 300,
          40 + Math.random() * 60,
          -100 - Math.random() * 150,
        ),

        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          -0.3 - Math.random() * 0.3,
          -0.5 - Math.random() * 1,
        ),

        life: Math.random(),
        size: 2 + Math.random() * 3,
      }));
  }, []);

  // Floating particles
  const particles = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];

    const colorPalette = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#e0f7ff"),
      new THREE.Color("#cceeff"),
      new THREE.Color("#b3d9ff"),
      new THREE.Color("#99c2ff"),
      new THREE.Color("#ffebd6"),
      new THREE.Color("#fff4e0"),
      new THREE.Color("#00ffff"),
      new THREE.Color("#ff00ff"),
    ];

    for (let i = 0; i < 5000; i++) {
      const theta = Math.random() * Math.PI * 2;

      const phi = Math.random() * Math.PI * 0.6;

      const radius = 80 + Math.random() * 120;

      const x = radius * Math.sin(phi) * Math.cos(theta);

      const y = radius * Math.cos(phi) + 35;

      const z = radius * Math.sin(phi) * Math.sin(theta);

      if (y > 15) {
        positions.push(x, y, z);

        const color =
          colorPalette[Math.floor(Math.random() * colorPalette.length)];

        colors.push(color.r, color.g, color.b);

        sizes.push(0.05 + Math.random() * 0.15);
      }
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      sizes: new Float32Array(sizes),
    };
  }, []);

  // Background stars
  const backgroundStars = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];

    const starColors = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#e8f4ff"),
      new THREE.Color("#d4e8ff"),
      new THREE.Color("#c0dcff"),
      new THREE.Color("#a8d0ff"),
      new THREE.Color("#fff8e8"),
      new THREE.Color("#ffe8d4"),
    ];

    for (let i = 0; i < 8000; i++) {
      const theta = Math.random() * Math.PI * 2;

      const phi = Math.random() * Math.PI;

      const radius = 180 + Math.random() * 70;

      const x = radius * Math.sin(phi) * Math.cos(theta);

      const y = radius * Math.cos(phi) + 40;

      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions.push(x, y, z);

      const color = starColors[Math.floor(Math.random() * starColors.length)];

      colors.push(color.r, color.g, color.b);

      sizes.push(0.2 + Math.random() * 0.4);
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      sizes: new Float32Array(sizes),
    };
  }, []);

  // Neon grid
  const gridLines = useMemo(() => {
    const positions: number[] = [];

    // Left horizontal
    for (let i = 0; i < 20; i++) {
      const z = -i * 5;

      positions.push(-40, 0.01, z, -8, 0.01, z);
    }

    // Right horizontal
    for (let i = 0; i < 20; i++) {
      const z = -i * 5;

      positions.push(8, 0.01, z, 40, 0.01, z);
    }

    // Left vertical
    for (let i = 0; i < 8; i++) {
      const x = -40 + i * (32 / 7);

      positions.push(x, 0.01, 0, x, 0.01, -100);
    }

    // Right vertical
    for (let i = 0; i < 8; i++) {
      const x = 8 + i * (32 / 7);

      positions.push(x, 0.01, 0, x, 0.01, -100);
    }

    return new Float32Array(positions);
  }, []);

  useFrame((state: any, delta: number) => {
    // Shooting stars
    shootingStarsRef.current.forEach((star: any) => {
      tempVecRef.current.copy(star.velocity).multiplyScalar(delta * 30);

      star.position.add(tempVecRef.current);

      star.life -= delta * 0.5;

      if (star.life <= 0 || star.position.y < 0 || star.position.z > 50) {
        star.position.set(
          (Math.random() - 0.5) * 200,
          30 + Math.random() * 50,
          -100 - Math.random() * 100,
        );

        star.life = 1;
      }
    });

    // Floating particle rotation
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.02;
    }

    // Neon grid movement
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 10) % 5;
    }
  });

  return (
    <>
      {/* Monaco atmosphere */}
      <fog attach="fog" args={["#0d0015", 60, 250]} />

      <ambientLight intensity={1} color="#ffffff" />

      <directionalLight position={[10, 20, 10]} intensity={1} color="#ffffff" />

      {/* Main synthwave skyline */}
      {skylineTextureRef.current && (
        <mesh position={[0, 28, -115]}>
          <planeGeometry args={[280, 80]} />

          <meshBasicMaterial
            map={skylineTextureRef.current}
            transparent={false}
          />
        </mesh>
      )}

      {/* Dark background skyline */}
      {darkSkylineTextureRef.current && (
        <mesh position={[0, 20, -140]}>
          <planeGeometry args={[350, 60]} />

          <meshBasicMaterial
            map={darkSkylineTextureRef.current}
            transparent={false}
          />
        </mesh>
      )}

      {/* 3D moon/sun */}
      <mesh position={[0, 45, -130]}>
        <sphereGeometry args={[16, 32, 32]} />

        <meshBasicMaterial color="#ffffdd" />
      </mesh>

      {/* Glow halos */}
      <mesh position={[0, 45, -130]}>
        <sphereGeometry args={[20, 32, 32]} />

        <meshBasicMaterial color="#ff88ff" transparent opacity={0.5} />
      </mesh>

      <mesh position={[0, 45, -130]}>
        <sphereGeometry args={[26, 32, 32]} />

        <meshBasicMaterial color="#ff00aa" transparent opacity={0.3} />
      </mesh>

      <mesh position={[0, 45, -130]}>
        <sphereGeometry args={[34, 32, 32]} />

        <meshBasicMaterial color="#8800ff" transparent opacity={0.15} />
      </mesh>

      <mesh position={[0, 45, -130]}>
        <sphereGeometry args={[45, 32, 32]} />

        <meshBasicMaterial color="#440088" transparent opacity={0.08} />
      </mesh>

      <pointLight
        position={[0, 45, -130]}
        color="#ff44aa"
        intensity={6}
        distance={400}
      />

      {/* Background starfield */}
      <points ref={starfieldRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={backgroundStars.positions.length / 3}
            array={backgroundStars.positions}
            itemSize={3}
          />

          <bufferAttribute
            attach="attributes-color"
            count={backgroundStars.colors.length / 3}
            array={backgroundStars.colors}
            itemSize={3}
          />

          <bufferAttribute
            attach="attributes-size"
            count={backgroundStars.sizes.length}
            array={backgroundStars.sizes}
            itemSize={1}
          />
        </bufferGeometry>

        <pointsMaterial
          size={0.3}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          map={createStarTexture()}
        />
      </points>

      {/* Floating particles */}
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

          <bufferAttribute
            attach="attributes-size"
            count={particles.sizes.length}
            array={particles.sizes}
            itemSize={1}
          />
        </bufferGeometry>

        <pointsMaterial
          size={0.8}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          map={createStarTexture()}
        />
      </points>

      {/* Shooting stars */}
      {shootingStarsRef.current.map((star: any, i: number) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={
                new Float32Array([
                  star.position.x,
                  star.position.y,
                  star.position.z,

                  star.position.x - star.velocity.x * 4,

                  star.position.y - star.velocity.y * 4,

                  star.position.z - star.velocity.z * 4,
                ])
              }
              itemSize={3}
            />
          </bufferGeometry>

          <lineBasicMaterial
            color="#00ffff"
            transparent
            opacity={star.life * 0.8}
            linewidth={star.size || 3}
          />
        </line>
      ))}

      {/* Neon ground grid */}
      <lineSegments ref={gridRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={gridLines.length / 3}
            array={gridLines}
            itemSize={3}
          />
        </bufferGeometry>

        <lineBasicMaterial color="#ff00ff" transparent opacity={0.4} />
      </lineSegments>
    </>
  );
};

export default MonacoEnvironment;
