import { motion } from "framer-motion";
import { Flag, Trophy } from "lucide-react";
import React from "react";

import { useGameStore } from "../store/gameStore";
import { supabase } from "../lib/supabase";
import { ProgressScreen } from "./ProgressScreen";
import { Leaderboard } from "./Leaderboard";

const TRACKS = [
  {
    id: "monaco" as const,
    name: "MONACO",
    flag: "🇲🇨",
    difficulty: 3,
  },
  {
    id: "silverstone" as const,
    name: "SILVERSTONE",
    flag: "🇬🇧",
    difficulty: 2,
  },
  {
    id: "monza" as const,
    name: "MONZA",
    flag: "🇮🇹",
    difficulty: 1,
  },
];

export const StartScreen = React.memo(() => {
  const selectedTrack = useGameStore((state: any) => state.selectedTrack);
  const setTrack = useGameStore((state: any) => state.setTrack);
  const startGame = useGameStore((state: any) => state.startGame);

  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  const [showProgress, setShowProgress] = React.useState(false);

  if (showProgress) {
    return <ProgressScreen onBack={() => setShowProgress(false)} />;
  }

  if (showLeaderboard) {
    return <Leaderboard onBack={() => setShowLeaderboard(false)} />;
  }

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto overflow-x-hidden bg-[#080808]">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0">
        {/* Horizontal grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "100% 36px",
          }}
        />

        {/* Diagonal texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 6px)",
          }}
        />

        {/* Red glow */}
        <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-[#e10600]/10 blur-[130px] sm:h-[500px] sm:w-[500px]" />

        {/* Bottom line */}
        <div className="absolute bottom-6 left-0 right-0 h-px bg-white/5 sm:bottom-8" />
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <div className="start-screen-content relative mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center px-3 py-2 sm:px-5 sm:py-5">
        {/* =======================================================
            HEADER
        ======================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="start-screen-header mb-2 sm:mb-5"
        >
          {/* Small top label */}
          <div className="mb-1 flex items-center gap-1 sm:mb-3 sm:gap-2">
            <div className="h-1 w-1 bg-[#e10600] sm:h-1.5 sm:w-1.5" />

            <span className="text-[6px] font-bold uppercase tracking-[0.15em] text-white/50 sm:text-[8px]">
              Formula Racing
            </span>

            <div className="h-px w-5 bg-white/10 sm:w-10" />

            <span className="text-[6px] uppercase tracking-[0.12em] text-white/25 sm:text-[8px]">
              Race Selection
            </span>
          </div>

          {/* Header */}
          <div className="flex flex-col justify-between gap-1 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black uppercase italic leading-[0.82] tracking-[-0.06em] text-white sm:text-5xl md:text-6xl">
                Choose
                <br />
                <span className="text-[#e10600]">Circuit</span>
              </h1>

              <p className="mt-1 max-w-md text-[7px] uppercase tracking-[0.12em] text-white/35 sm:mt-2 sm:text-[9px] sm:tracking-[0.16em]">
                Select your circuit and prepare for lights out.
              </p>
            </div>

            {/* Desktop only */}
            <div className="hidden text-right md:block">
              <div className="text-[8px] uppercase tracking-[0.2em] text-white/20">
                Session
              </div>

              <div className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-white/50">
                Race
              </div>
            </div>
          </div>
        </motion.div>

        {/* =======================================================
            TRACK SELECTION
        ======================================================= */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2.5">
          {TRACKS.map((track, index) => {
            const selected = selectedTrack === track.id;

            return (
              <motion.button
                key={track.id}
                onClick={() => setTrack(track.id)}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className={`
                  group
                  relative
                  overflow-hidden
                  border
                  text-left
                  transition-all
                  duration-300
                  ${
                    selected
                      ? "border-[#e10600] bg-[#e10600]/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
                  }
                `}
              >
                {/* Selected red strip */}
                {selected && (
                  <div className="absolute left-0 top-0 h-full w-[2px] bg-[#e10600] sm:w-[3px]" />
                )}

                {/* =================================================
                    CARD TOP
                ================================================= */}
                <div className="flex items-center justify-between border-b border-white/10 px-2 py-1 sm:px-3 sm:py-2">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Flag
                      size={8}
                      className="text-white/30 sm:h-2.5 sm:w-2.5"
                    />

                    <span className="text-[5px] uppercase tracking-[0.12em] text-white/30 sm:text-[7px]">
                      Circuit
                    </span>
                  </div>

                  <span className="text-xs sm:text-base">{track.flag}</span>
                </div>

                {/* =================================================
                    TRACK NAME
                ================================================= */}
                <div className="px-2 pb-1.5 pt-1.5 sm:px-3 sm:pb-2.5 sm:pt-2.5">
                  <h2 className="truncate text-[11px] font-black italic tracking-tight text-white sm:text-xl">
                    {track.name}
                  </h2>

                  <p className="mt-0.5 text-[5px] uppercase leading-tight tracking-[0.08em] text-white/30 sm:mt-1 sm:text-[7px] sm:tracking-[0.1em]">
                    {track.id === "monaco" && "Street circuit • Monte Carlo"}

                    {track.id === "silverstone" &&
                      "Classic circuit • United Kingdom"}

                    {track.id === "monza" && "High speed circuit • Italy"}
                  </p>
                </div>

                {/* =================================================
                    STATS
                ================================================= */}
                <div className="border-t border-white/10 px-2 py-1 sm:px-3 sm:py-2">
                  <div className="flex items-center justify-between">
                    {/* Difficulty */}
                    <div>
                      <div className="mb-0.5 text-[5px] uppercase tracking-wider text-white/30 sm:mb-1 sm:text-[7px]">
                        Difficulty
                      </div>

                      <div className="flex gap-[2px] sm:gap-0.5">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`
                              h-0.5
                              w-2
                              sm:h-1
                              sm:w-5
                              ${
                                level <= track.difficulty
                                  ? "bg-[#e10600]"
                                  : "bg-white/10"
                              }
                            `}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Type */}
                    <div className="text-right">
                      <div className="mb-0.5 text-[5px] uppercase tracking-wider text-white/30 sm:mb-1 sm:text-[7px]">
                        Type
                      </div>

                      <div className="text-[5px] uppercase tracking-widest text-white/50 sm:text-[7px]">
                        {track.id === "monza"
                          ? "High Speed"
                          : track.id === "monaco"
                            ? "Street"
                            : "Grand Prix"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    SELECTED INDICATOR
                ================================================= */}
                {selected && (
                  <div className="absolute right-1 top-1 flex items-center gap-1 sm:right-2 sm:top-2 sm:gap-1.5">
                    <span className="h-1 w-1 animate-pulse bg-[#e10600] sm:h-1.5 sm:w-1.5" />

                    <span className="hidden text-[6px] font-bold uppercase tracking-widest text-[#e10600] sm:block">
                      Selected
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* =======================================================
            ACTIONS
        ======================================================= */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.35,
          }}
          className="start-screen-actions mt-2 sm:mt-4"
        >
          {/* START RACE */}
          <button
            onClick={startGame}
            className="group flex h-9 w-full items-center justify-between border border-[#e10600] bg-[#e10600] px-3 text-white transition-all duration-300 hover:bg-[#b80500] sm:h-12 sm:px-5"
          >
            {/* Left */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Trophy size={12} className="sm:h-4 sm:w-4" />

              <div className="text-left">
                <div className="text-[8px] font-black uppercase tracking-[0.12em] sm:text-[11px]">
                  Start Race
                </div>

                <div className="text-[5px] uppercase tracking-[0.1em] text-white/60 sm:text-[7px]">
                  Lights out
                </div>
              </div>
            </div>

            {/* Arrow */}
            <span className="text-sm transition-transform duration-300 group-hover:translate-x-1 sm:text-xl">
              →
            </span>
          </button>

          {/* Keyboard hint */}
          <div className="mt-1 flex items-center justify-center gap-1.5 text-[5px] uppercase tracking-[0.12em] text-white/20 sm:mt-2 sm:text-[7px]">
            <span>←</span>
            <span>→</span>
            <span>Select Circuit</span>
          </div>
        </motion.div>

        {/* =======================================================
            LEADERBOARD
        ======================================================= */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="
            mt-2
            flex h-9 w-full
            items-center justify-center
            border border-white/10
            bg-white/[0.035]
            text-white
            transition-all
            duration-200
            hover:border-white/25
            hover:bg-white/[0.06]
            sm:mt-3
            sm:h-9
          "
        >
          <span className="text-[8px] font-black uppercase tracking-[0.2em] sm:text-[9px]">
            Leaderboard
          </span>
        </button>

        {/* =======================================================
            VIEW PROGRESS
        ======================================================= */}
        <button
          onClick={() => setShowProgress(true)}
          className="
            mt-1
            flex h-7 w-full
            items-center justify-center
            border border-white/10
            bg-white/[0.03]
            text-[6px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-white/50
            transition
            hover:border-white/20
            hover:text-white
            sm:mt-1.5
            sm:h-8
            sm:text-[8px]
          "
        >
          View Progress
        </button>

        {/* =======================================================
            LOGOUT
        ======================================================= */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
          }}
          className="
            mx-auto
            mt-1.5
            mb-1
            flex h-6
            items-center
            justify-center
            border
            border-[#e10600]/60
            bg-[#e10600]/10
            px-4
            text-[6px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-[#e10600]
            transition
            hover:bg-[#e10600]
            hover:text-white
            sm:mt-2
            sm:h-7
            sm:px-5
            sm:text-[8px]
          "
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
});
