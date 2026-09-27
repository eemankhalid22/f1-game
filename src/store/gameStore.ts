import { create } from "zustand";

interface GameState {
  phase: "menu" | "playing" | "gameover";
  selectedTrack: "monaco" | "silverstone" | "monza";
  speed: number;
  score: number;
  lives: number;
  dodgeCount: number;
  elapsedTime: number;
  obstacleSpeed: number;
  playerLane: number;
  playerZ: number;
  position: number;
  totalRacers: number;
  currentLap: number;
  totalLaps: number;
  rpm: number;
  fuel: number;
  lapTime: number;
}

interface GameActions {
  startGame: () => void;
  loseLife: () => void;
  addScore: (points: number) => void;
  setTrack: (track: "monaco" | "silverstone" | "monza") => void;
  endGame: () => void;
  setSpeed: (speed: number) => void;
  setElapsedTime: (time: number) => void;
  setPhase: (phase: "menu" | "playing" | "gameover") => void;
  setObstacleSpeed: (speed: number) => void;
  setPlayerLane: (lane: number) => void;
  setPlayerZ: (z: number) => void;
  incrementDodgeCount: () => void;
  setPosition: (position: number) => void;
  setCurrentLap: (lap: number) => void;
  setRpm: (rpm: number) => void;
  setFuel: (fuel: number) => void;
  setLapTime: (time: number) => void;
}

type GameStore = GameState & GameActions;

const INITIAL_SPEED = 400;
const INITIAL_LIVES = 5;
const INITIAL_PLAYER_Z = 4;

export const useGameStore = create<GameStore>((set: any) => ({
  phase: "menu",
  selectedTrack: "monaco",
  speed: INITIAL_SPEED,
  score: 0,
  lives: INITIAL_LIVES,
  dodgeCount: 0,
  elapsedTime: 0,
  obstacleSpeed: 50,
  playerLane: 1,
  playerZ: INITIAL_PLAYER_Z,
  position: 9,
  totalRacers: 12,
  currentLap: 1,
  totalLaps: 2,
  rpm: 3000,
  fuel: 100,
  lapTime: 0,

  startGame: () =>
    set({
      phase: "playing",
      speed: INITIAL_SPEED,
      score: 0,
      lives: INITIAL_LIVES,
      dodgeCount: 0,
      elapsedTime: 0,
      obstacleSpeed: 60,
      playerLane: 1,
      playerZ: INITIAL_PLAYER_Z,
      position: 9,
      totalRacers: 12,
      currentLap: 1,
      totalLaps: 2,
      rpm: 3000,
      fuel: 100,
      lapTime: 0,
    }),

  loseLife: () =>
    set((state: any) => ({
      lives: Math.max(0, state.lives - 1),
    })),

  addScore: (points: number) =>
    set((state: any) => ({
      score: state.score + points,
    })),

  setTrack: (track: "monaco" | "silverstone" | "monza") =>
    set({
      selectedTrack: track,
    }),

  endGame: () =>
    set({
      phase: "gameover",
    }),

  setSpeed: (speed: number) =>
    set({
      speed,
    }),

  setElapsedTime: (time: number) =>
    set({
      elapsedTime: time,
    }),

  setPhase: (phase: "menu" | "playing" | "gameover") =>
    set({
      phase,
    }),

  setObstacleSpeed: (speed: number) =>
    set({
      obstacleSpeed: speed,
    }),

  setPlayerLane: (lane: number) =>
    set({
      playerLane: lane,
    }),

  setPlayerZ: (z: number) =>
    set({
      playerZ: z,
    }),

  incrementDodgeCount: () =>
    set((state: any) => ({
      dodgeCount: state.dodgeCount + 1,
    })),

  setPosition: (position: number) =>
    set({
      position,
    }),

  setCurrentLap: (lap: number) =>
    set({
      currentLap: lap,
    }),

  setRpm: (rpm: number) =>
    set({
      rpm,
    }),

  setFuel: (fuel: number) =>
    set({
      fuel,
    }),

  setLapTime: (time: number) =>
    set({
      lapTime: time,
    }),
}));
