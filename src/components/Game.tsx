"use client";

import { useEffect, useRef, useState, Suspense } from "react";

import { Canvas, useFrame } from "@react-three/fiber";
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

const PLAYER_START_Z = 4;
const TRACK_SEGMENT_LENGTH = 400;

/*
 * ============================================================
 * GAME SCENE
 * ============================================================
 */

const GameScene = () => {
  const phase = useGameStore((state: any) => state.phase);

  const selectedTrack = useGameStore((state: any) => state.selectedTrack);

  const endGame = useGameStore((state: any) => state.endGame);

  const lives = useGameStore((state: any) => state.lives);

  const playerLane = useGameStore((state: any) => state.playerLane);

  const cameraShakeRef = useRef(0);
  const previousLivesRef = useRef(lives);

  const heatHazeRef = useRef<THREE.Mesh | null>(null);

  const movingTrackRef = useRef<THREE.Group>(null);

  const elapsedTimeRef = useRef(useGameStore.getState().elapsedTime);

  const pendingScoreRef = useRef(0);

  const lastStoreUpdateRef = useRef(0);

  /*
   * ============================================================
   * GAME LOOP
   * ============================================================
   */

  useFrame((state: any, delta: number) => {
    /*
     * ==========================================================
     * COLLISION CAMERA SHAKE
     * ==========================================================
     */

    if (lives < previousLivesRef.current) {
      cameraShakeRef.current = 1.4;
    }

    previousLivesRef.current = lives;

    /*
     * ==========================================================
     * GAMEPLAY
     * ==========================================================
     */

    if (phase === "playing") {
      const newElapsedTime = elapsedTimeRef.current + delta;

      elapsedTimeRef.current = newElapsedTime;

      /*
       * --------------------------------------------------------
       * SPEED LEVEL SYSTEM
       * --------------------------------------------------------
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
       * --------------------------------------------------------
       * APPLY SPEED
       * --------------------------------------------------------
       */

      pendingScoreRef.current += delta * dynamicObstacleSpeed * 2;

      /*
       * Update store every 0.1 seconds instead of every frame.
       */

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
       * --------------------------------------------------------
       * GAME OVER
       * --------------------------------------------------------
       */

      if (lives <= 0) {
        endGame();
      }
    }

    /*
     * ==========================================================
     * MOVING TRACK
     * ==========================================================
     */

    if (movingTrackRef.current) {
      const playerZ = useGameStore.getState().playerZ;

      movingTrackRef.current.position.z = THREE.MathUtils.euclideanModulo(
        PLAYER_START_Z - playerZ,
        TRACK_SEGMENT_LENGTH,
      );
    }

    /*
     * ==========================================================
     * RESPONSIVE CAMERA
     * ==========================================================
     *
     * Desktop:
     * - Original cinematic framing
     *
     * Mobile:
     * - Camera follows player's lane
     * - Camera moves farther back
     * - Camera looks lower
     * - Car stays inside portrait viewport
     */

    const laneX = playerLane === 0 ? -4 : playerLane === 1 ? 0 : 4;

    const screenWidth = state.size.width;

    const screenHeight = state.size.height;

    const aspect = screenWidth / screenHeight;

    /*
     * Portrait / narrow mobile detection.
     *
     * This catches phones even when their
     * CSS width is slightly above 640px.
     */

    const isMobile = screenWidth <= 768 || aspect <= 0.85;

    /*
     * Extremely narrow portrait screens.
     */

    const isVeryNarrow = aspect <= 0.6;

    /*
     * Camera settings.
     */

    const mobileCameraX = isVeryNarrow ? 0.16 : 0.12;
    const cameraFollowAmount = isMobile ? mobileCameraX : 0.3;

    /*
     * Desktop camera.
     */

    const desktopCameraY = 2.5;
    const desktopCameraZ = 9;
    const desktopTargetY = 0.8;
    const desktopTargetZ = -20;
    const desktopFov = 68;

    /*
     * Mobile camera.
     *
     * Moving farther back gives the
     * portrait screen more usable width.
     */

    const mobileCameraY = isVeryNarrow ? 2.15 : 2.3;

    const mobileCameraZ = isVeryNarrow ? 12.5 : 11.5;

    const mobileTargetY = isVeryNarrow ? 0.25 : 0.35;

    const mobileTargetZ = isVeryNarrow ? -14 : -16;

    const mobileFov = isVeryNarrow ? 74 : 72;

    /*
     * Select camera configuration.
     */

    const targetCameraX = laneX * cameraFollowAmount;

    const targetCameraY = isMobile ? mobileCameraY : desktopCameraY;

    const targetCameraZ = isMobile ? mobileCameraZ : desktopCameraZ;

    const targetLookX = laneX * (isMobile ? mobileCameraX : 0.1);

    const targetLookY = isMobile ? mobileTargetY : desktopTargetY;

    const targetLookZ = isMobile ? mobileTargetZ : desktopTargetZ;

    const targetFov = isMobile ? mobileFov : desktopFov;

    /*
     * ==========================================================
     * CAMERA SHAKE
     * ==========================================================
     */

    const shake = cameraShakeRef.current;

    /*
     * Horizontal camera movement.
     *
     * On mobile the camera follows the lane
     * much more strongly so the car remains
     * centered.
     */

    state.camera.position.x =
      THREE.MathUtils.lerp(
        state.camera.position.x,
        targetCameraX,
        1 - Math.exp(-8 * delta),
      ) +
      Math.sin(state.clock.elapsedTime * 75) * shake * 0.18;

    /*
     * Vertical camera movement.
     */

    state.camera.position.y =
      targetCameraY +
      Math.sin(state.clock.elapsedTime * 1.5) * (isMobile ? 0.02 : 0.03) +
      Math.sin(state.clock.elapsedTime * 105) * shake * 0.1;

    /*
     * Mobile camera is farther back.
     */

    state.camera.position.z = targetCameraZ + shake * 0.25;

    /*
     * Responsive FOV.
     */

    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFov, 0.05);

    state.camera.updateProjectionMatrix();

    /*
     * ==========================================================
     * LOOK AT
     * ==========================================================
     *
     * Mobile looks lower and closer.
     * This brings the car upward into view.
     */

    state.camera.lookAt(targetLookX, targetLookY, targetLookZ);

    /*
     * Small collision rotation.
     */

    state.camera.rotation.z +=
      Math.sin(state.clock.elapsedTime * 48) * shake * 0.025;

    /*
     * ==========================================================
     * CAMERA SHAKE DECAY
     * ==========================================================
     */

    if (cameraShakeRef.current > 0) {
      cameraShakeRef.current = Math.max(0, cameraShakeRef.current - delta * 5);
    }

    /*
     * ==========================================================
     * HEAT HAZE
     * ==========================================================
     */

    if (heatHazeRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.02;

      heatHazeRef.current.scale.set(scale, scale, 1);
    }
  });

  /*
   * ============================================================
   * ENVIRONMENT
   * ============================================================
   */

  const environment =
    selectedTrack === "silverstone" ? (
      <SilverstoneEnvironment />
    ) : selectedTrack === "monza" ? (
      <MonzaEnvironment />
    ) : (
      <MonacoEnvironment />
    );

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      {/* Environment */}
      {environment}

      {/* ======================================================
          MOVING ROAD LOOP
      ====================================================== */}

      <group ref={movingTrackRef}>
        <Track />

        <group position={[0, 0, -TRACK_SEGMENT_LENGTH]}>
          <Track />
        </group>

        <group position={[0, 0, -TRACK_SEGMENT_LENGTH * 2]}>
          <Track />
        </group>
      </group>

      {/* Obstacles */}
      {phase === "playing" && <Obstacles />}

      {/* ======================================================
          PLAYER CAR
      ====================================================== */}

      <Suspense fallback={null}>
        <PlayerCar />
      </Suspense>

      {/* ======================================================
          POST PROCESSING
      ====================================================== */}

      {selectedTrack === "silverstone" ? (
        <EffectComposer multisampling={0}>
          <Vignette darkness={0.15} offset={0.2} />
        </EffectComposer>
      ) : selectedTrack === "monza" ? (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.65}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
            mipmapBlur={false}
            levels={4}
          />

          <Vignette darkness={0.45} offset={0.2} />

          <HueSaturation saturation={0.08} hue={0.02} />
        </EffectComposer>
      ) : (
        /*
         * ======================================================
         * MONACO
         *
         * ORIGINAL SETTINGS — UNCHANGED
         * ======================================================
         */

        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.5}
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
 * ============================================================
 * MAIN GAME COMPONENT
 * ============================================================
 */

export const Game = () => {
  const phase = useGameStore((state: any) => state.phase);

  const selectedTrack = useGameStore((state: any) => state.selectedTrack);

  const lives = useGameStore((state: any) => state.lives);

  const previousLivesRef = useRef(lives);

  const [collisionFlash, setCollisionFlash] = useState(false);

  /*
   * ==========================================================
   * COLLISION FLASH
   * ==========================================================
   */

  useEffect(() => {
    if (lives >= previousLivesRef.current) {
      previousLivesRef.current = lives;

      return;
    }

    previousLivesRef.current = lives;

    setCollisionFlash(true);

    const timeout = window.setTimeout(() => setCollisionFlash(false), 180);

    return () => window.clearTimeout(timeout);
  }, [lives]);

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div
      className="
        relative
        h-[100dvh]
        w-screen
        overflow-hidden
        bg-black
      "
    >
      {/* ======================================================
          RESPONSIVE HUD CSS
      ====================================================== */}

      <style>
        {`
          /*
           * Desktop HUD
           */
          .game-hud-responsive {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
          }

          /*
           * Portrait phones
           *
           * Scale the entire HUD down while keeping
           * its positions aligned to the viewport.
           */
          @media (max-width: 640px) and (orientation: portrait) {
            .game-hud-responsive {
              width: 128.2%;
              height: 128.2%;
              left: -14.1%;
              top: -14.1%;
              transform: scale(0.78);
              transform-origin: center center;
            }
          }

          /*
           * Very small portrait phones
           */
          @media (max-width: 390px) and (orientation: portrait) {
            .game-hud-responsive {
              width: 138%;
              height: 138%;
              left: -19%;
              top: -19%;
              transform: scale(0.725);
              transform-origin: center center;
            }
          }

          /*
           * Landscape phones / short screens
           */
          @media (max-height: 600px) and (max-width: 900px) {
            .game-hud-responsive {
              width: 116%;
              height: 116%;
              left: -8%;
              top: -8%;
              transform: scale(0.86);
              transform-origin: center center;
            }
          }
        `}
      </style>

      {/* ======================================================
          3D CANVAS
      ====================================================== */}

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
          height: "100dvh",
          touchAction: "none",
        }}
      >
        <GameScene />
      </Canvas>

      {/* ======================================================
          COLLISION FLASH
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          z-[90]
          transition-opacity
          duration-100
        "
        style={{
          opacity: collisionFlash ? 1 : 0,

          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(255, 0, 35, 0.48) 100%)",
        }}
      />

      {/* ======================================================
          RESPONSIVE HUD
      ====================================================== */}

      <div className="game-hud-responsive">
        {phase === "playing" && (
          <>
            <HUD />
            <PopUpMessages />
          </>
        )}
      </div>

      {/* ======================================================
          START SCREEN
      ====================================================== */}

      {phase === "menu" && <StartScreen />}

      {/* ======================================================
          GAME OVER
      ====================================================== */}

      {phase === "gameover" && <GameOver />}
    </div>
  );
};

export default Game;
