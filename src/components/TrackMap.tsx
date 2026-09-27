import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";

import MonacoTrack from "/assets/tracks/monaco.svg";
import MonzaTrack from "/assets/tracks/monza.svg";
import SilverstoneTrack from "/assets/tracks/silverstone.svg";

const trackMaps: Record<string, string> = {
  monaco: MonacoTrack,
  monza: MonzaTrack,
  silverstone: SilverstoneTrack,
};

interface CarDot {
  x: number;
  y: number;
  player: boolean;
}

export const TrackMap = () => {
  const selectedTrack = useGameStore((state: any) => state.selectedTrack);

  const elapsedTime = useGameStore((state: any) => state.elapsedTime);

  const [cars, setCars] = useState<CarDot[]>([]);

  const currentTrack = trackMaps[selectedTrack] || MonacoTrack;

  /* =======================================================
     UPDATE CAR POSITIONS
  ======================================================= */

  useEffect(() => {
    const svg = document.querySelector("#track-path") as SVGPathElement | null;

    if (!svg) return;

    const length = svg.getTotalLength();

    const playerProgress = (elapsedTime * 0.03) % 1;

    const newCars: CarDot[] = [];

    /* -------------------------------------------------------
       PLAYER
    ------------------------------------------------------- */

    const playerPoint = svg.getPointAtLength(playerProgress * length);

    newCars.push({
      x: (playerPoint.x / 400) * 100,
      y: (playerPoint.y / 320) * 100,
      player: true,
    });

    /* -------------------------------------------------------
       AI CARS
    ------------------------------------------------------- */

    for (let i = 0; i < 5; i++) {
      const aiProgress = (playerProgress - (i + 1) * 0.12) % 1;

      const corrected = aiProgress < 0 ? aiProgress + 1 : aiProgress;

      const point = svg.getPointAtLength(corrected * length);

      newCars.push({
        x: (point.x / 400) * 100,
        y: (point.y / 320) * 100,
        player: false,
      });
    }

    setCars(newCars);
  }, [elapsedTime, selectedTrack]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="track-map-inner"
      style={{
        position: "relative",

        width: "100%",
        height: "100%",

        minWidth: 0,
        minHeight: 0,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        overflow: "hidden",
      }}
    >
      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div
        style={{
          position: "absolute",
          inset: 0,

          borderRadius: "clamp(10px, 1.5vw, 20px)",

          background:
            "radial-gradient(circle at center, rgba(0,255,157,0.08), transparent 70%)",

          pointerEvents: "none",

          zIndex: 0,
        }}
      />

      {/* =====================================================
          TRACK SVG
      ===================================================== */}

      <img
        src={currentTrack}
        alt="Track Map"
        draggable={false}
        style={{
          position: "absolute",

          width: "100%",
          height: "100%",

          maxWidth: "100%",
          maxHeight: "100%",

          objectFit: "contain",

          filter: "drop-shadow(0 0 clamp(5px, 1vw, 12px) rgba(0,255,157,0.35))",

          opacity: 0.95,

          pointerEvents: "none",

          userSelect: "none",

          zIndex: 1,
        }}
      />

      {/* =====================================================
          HIDDEN TRACK PATH
      ===================================================== */}

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 320"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute",
          inset: 0,

          width: "100%",
          height: "100%",

          opacity: 0,

          pointerEvents: "none",

          zIndex: 2,
        }}
      >
        <path
          id="track-path"
          d={
            selectedTrack === "monaco"
              ? "M 120 300 C 90 285, 70 245, 68 195 C 66 145, 78 95, 108 62 C 148 25, 215 22, 275 30 C 325 36, 355 55, 360 90 C 364 120, 350 142, 325 148 C 298 154, 280 140, 278 115 C 276 88, 292 60, 328 52 C 360 45, 378 64, 374 102 C 368 168, 332 235, 270 275 C 225 304, 175 320, 138 320 C 126 320, 122 312, 120 300"
              : selectedTrack === "monza"
                ? "M 70 55 C 120 25, 220 25, 285 60 C 320 85, 320 140, 280 175 C 235 215, 150 225, 90 200 C 50 180, 40 140, 45 100 C 48 78, 58 62, 70 55"
                : "M 55 145 C 70 72, 125 35, 200 28 C 275 22, 340 48, 370 95 C 392 130, 390 180, 360 210 C 330 238, 285 245, 240 228 C 210 216, 182 210, 150 220 C 115 232, 82 220, 60 192 C 45 172, 42 158, 55 145"
          }
        />
      </svg>

      {/* =====================================================
          CAR DOTS
      ===================================================== */}

      {cars.map((car, index) => (
        <div
          key={index}
          className={car.player ? "track-map-player" : "track-map-ai"}
          style={{
            position: "absolute",

            left: `${car.x}%`,
            top: `${car.y}%`,

            width: car.player
              ? "clamp(9px, 1.4vw, 14px)"
              : "clamp(6px, 1vw, 9px)",

            height: car.player
              ? "clamp(9px, 1.4vw, 14px)"
              : "clamp(6px, 1vw, 9px)",

            borderRadius: "50%",

            background: car.player ? "#ff2bd6" : "#00FF9D",

            boxShadow: car.player
              ? `
                0 0 clamp(5px, 1vw, 10px) #ff2bd6,
                0 0 clamp(10px, 2vw, 20px) #ff2bd6
              `
              : `
                0 0 clamp(4px, 0.8vw, 8px) #00FF9D,
                0 0 clamp(8px, 1.5vw, 16px) #00FF9D
              `,

            transform: "translate(-50%, -50%)",

            transition: "all 0.2s linear",

            zIndex: car.player ? 10 : 5,

            pointerEvents: "none",
          }}
        />
      ))}

      {/* =====================================================
          TRACK LABEL
      ===================================================== */}

      <div
        style={{
          position: "absolute",

          bottom: "clamp(3px, 0.7vw, 8px)",

          left: "50%",

          transform: "translateX(-50%)",

          fontSize: "clamp(6px, 0.7vw, 10px)",

          letterSpacing: "clamp(0.12em, 0.25vw, 0.35em)",

          color: "rgba(255,255,255,0.5)",

          fontFamily: "Orbitron, sans-serif",

          whiteSpace: "nowrap",

          pointerEvents: "none",

          zIndex: 20,
        }}
      >
        {selectedTrack.toUpperCase()} GP
      </div>
    </div>
  );
};
