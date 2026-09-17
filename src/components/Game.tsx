"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { Track } from "./Track";
import { PlayerCar } from "./PlayerCar";
import { Obstacles } from "./Obstacles";
import { HUD } from "./HUD";
import { StartScreen } from "./StartScreen";
import { GameOver } from "./GameOver";
import { PopUpMessages } from "./PopUpMessages";

import { useGameStore } from "../store/gameStore";

import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  HueSaturation,
} from "@react-three/postprocessing";

import MonacoEnvironment from "./environments/MonacoEnvironment";
import SilverstoneEnvironment from "./environments/SilverstoneEnvironment";
import MonzaEnvironment from "./environments/MonzaEnvironment";

const GameScene = () => {
  const { setFrameloop } = useThree();

  const [, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    const handlePause = (event: KeyboardEvent) => {
      if (event.code !== "KeyP") return;

      if (useGameStore.getState().phase !== "playing") return;

      setIsPaused((previousPaused: boolean) => {
        const nextPaused = !previousPaused;

        setFrameloop(nextPaused ? "never" : "always");

        return nextPaused;
      });
    };

    window.addEventListener("keydown", handlePause);

    return () => {
      window.removeEventListener("keydown", handlePause);
      setFrameloop("always");
    };
  }, [setFrameloop]);
  const phase = useGameStore((state: any) => state.phase);

  const selectedTrack = useGameStore((state: any) => state.selectedTrack);

  const endGame = useGameStore((state: any) => state.endGame);

  const lives = useGameStore((state: any) => state.lives);

  const playerLane = useGameStore((state: any) => state.playerLane);

  const cameraShakeRef = useRef(0);

  const heatHazeRef = useRef<THREE.Mesh | null>(null);
  const elapsedTimeRef = useRef(useGameStore.getState().elapsedTime);
  const pendingScoreRef = useRef(0);
  const lastStoreUpdateRef = useRef(0);

  /*
   * ==========================================
   * GAME LOOP
   * ==========================================
   */

  useFrame((state: any, delta: number) => {
    /*
     * ------------------------------
     * GAMEPLAY
     * ------------------------------
     */

    if (phase === "playing") {
      const newElapsedTime = elapsedTimeRef.current + delta;
      elapsedTimeRef.current = newElapsedTime;

      /*
       * SPEED LEVEL SYSTEM
       */

      let dynamicObstacleSpeed = 15;

      if (newElapsedTime > 3) {
        dynamicObstacleSpeed = 21;
      }

      if (newElapsedTime > 6) {
        dynamicObstacleSpeed = 26;
      }

      if (newElapsedTime > 9) {
        dynamicObstacleSpeed = 30;
      }

      if (newElapsedTime > 12) {
        dynamicObstacleSpeed = 35;
      }

      if (newElapsedTime > 15) {
        dynamicObstacleSpeed = 40;
      }

      if (newElapsedTime > 18) {
        dynamicObstacleSpeed = 45;
      }

      if (newElapsedTime > 21) {
        dynamicObstacleSpeed = 50;
      }

      if (newElapsedTime > 24) {
        dynamicObstacleSpeed = 55;
      }

      /*
       * APPLY SPEED
       */

      pendingScoreRef.current += delta * dynamicObstacleSpeed * 2;

      // HUD and obstacle consumers do not need a store notification every frame.
      if (state.clock.elapsedTime - lastStoreUpdateRef.current >= 0.1) {
        lastStoreUpdateRef.current = state.clock.elapsedTime;
        const currentScore = useGameStore.getState().score;
        useGameStore.setState({
          elapsedTime: newElapsedTime,
          obstacleSpeed: dynamicObstacleSpeed,
          score: currentScore + Math.round(pendingScoreRef.current),
          speed: Math.round(180 + dynamicObstacleSpeed * 25),
        });
        pendingScoreRef.current = 0;
      }

      /*
       * GAME OVER
       */

      if (lives <= 0) {
        endGame();
      }
    }

    /*
     * ==========================================
     * CAMERA
     * ==========================================
     */

    const laneX = playerLane === 0 ? -4 : playerLane === 1 ? 0 : 4;

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      laneX * 0.3,
      0.05,
    );

    state.camera.position.y =
      2.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;

    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 68, 0.03);

    state.camera.updateProjectionMatrix();

    state.camera.lookAt(laneX * 0.1, 0.8, -20);

    /*
     * ==========================================
     * CAMERA SHAKE
     * ==========================================
     */

    if (cameraShakeRef.current > 0) {
      cameraShakeRef.current *= 0.9;

      if (cameraShakeRef.current < 0.01) {
        cameraShakeRef.current = 0;
      }
    }

    /*
     * ==========================================
     * HEAT HAZE
     * ==========================================
     *
     * Kept here for compatibility with
     * any existing heat haze logic.
     */

    if (heatHazeRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.02;

      heatHazeRef.current.scale.set(scale, scale, 1);
    }
  });

  /*
   * ==========================================
   * ENVIRONMENT
   * ==========================================
   *
   * Monaco:
   * - Synthwave city
   * - Stars
   * - Moon/sun
   * - Neon grid
   * - Purple/pink atmosphere
   *
   * Silverstone:
   * - Daytime
   * - Blue sky
   * - Clouds
   * - Grass
   * - Trees
   * - Countryside
   *
   * Monza:
   * Temporarily uses Monaco until
   * MonzaEnvironment is created.
   */

  const environment =
    selectedTrack === "monza" ? (
      <MonzaEnvironment />
    ) : selectedTrack === "silverstone" ? (
      <SilverstoneEnvironment />
    ) : (
      <MonacoEnvironment />
    );

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <>
      {/* Environment */}
      {environment}

      {/* Track */}
      <Track />

      {/* Player */}
      <Suspense fallback={null}>
        <PlayerCar />
      </Suspense>

      {/* Obstacles */}
      {phase === "playing" && <Obstacles />}

      {/* ====================================== */}
      {/* POST PROCESSING */}
      {/* ====================================== */}

      {selectedTrack === "silverstone" ? (
        /*
         * SILVERSTONE
         *
         * Keep the image clean and realistic.
         * No bloom / chromatic distortion.
         */
        <EffectComposer multisampling={0}>
          <Vignette darkness={0.15} offset={0.2} />
        </EffectComposer>
      ) : (
        /*
         * MONACO / MONZA
         *
         * Keep the original synthwave
         * post-processing.
         */
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur={false}
            levels={4}
          />

          <ChromaticAberration
            offset={new THREE.Vector2(0.002, 0.002)}
            radialModulation
            modulationOffset={0.3}
          />

          <Vignette darkness={0.6} offset={0.2} />

          <HueSaturation saturation={0.15} />
        </EffectComposer>
      )}
    </>
  );
};

/*
 * ==========================================
 * MAIN GAME COMPONENT
 * ==========================================
 */

export const Game = () => {
  const phase = useGameStore((state: any) => state.phase);
  const selectedTrack = useGameStore((state: any) => state.selectedTrack);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* ====================================== */}
      {/* 3D CANVAS */}
      {/* ====================================== */}

      <Canvas
        camera={{
          position: [0, 2.5, 9],
          fov: 75,
        }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
        }}
        dpr={
          selectedTrack === "silverstone"
            ? Math.min(window.devicePixelRatio, 1)
            : Math.min(window.devicePixelRatio, 1.5)
        }
        frameloop="always"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
      >
        <GameScene />
      </Canvas>

      {/* ====================================== */}
      {/* HUD OVERLAY */}
      {/* ====================================== */}

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 100,
        }}
      >
        {phase === "playing" && (
          <>
            <HUD />
            <PopUpMessages />
          </>
        )}
      </div>

      {/* ====================================== */}
      {/* SCREENS */}
      {/* ====================================== */}

      {phase === "menu" && <StartScreen />}

      {phase === "gameover" && <GameOver />}
    </div>
  );
};

export default Game;
