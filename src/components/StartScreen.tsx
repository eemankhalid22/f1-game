import { motion } from "framer-motion";
import { Flag, Gauge, Trophy } from "lucide-react";
import React from "react";

import { useGameStore } from "../store/gameStore";

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

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center overflow-hidden bg-[#080808]">
      {/* ====================================================== */}
      {/* BACKGROUND */}
      {/* ====================================================== */}

      <div className="pointer-events-none absolute inset-0">
        {/* Subtle horizontal timing lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "100% 36px",
          }}
        />

        {/* Carbon texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 6px)",
          }}
        />

        {/* Red ambient accent */}
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#e10600]/10 blur-[150px]" />

        {/* Bottom line */}
        <div className="absolute bottom-12 left-0 right-0 h-px bg-white/5" />
      </div>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <div className="relative w-full max-w-6xl px-6 py-10">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {/* Race weekend label */}
          <div className="mb-5 flex items-center gap-3">
            <div className="h-2 w-2 bg-[#e10600]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
              DGG Formula Racing
            </span>

            <div className="h-px w-16 bg-white/10" />

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
              Race Selection
            </span>
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-6xl font-black uppercase italic leading-[0.82] tracking-[-0.06em] text-white sm:text-7xl md:text-8xl">
                Choose
                <br />
                <span className="text-[#e10600]">Circuit</span>
              </h1>

              <p className="mt-5 max-w-md text-xs uppercase tracking-[0.18em] text-white/35">
                Select your circuit and prepare for lights out.
              </p>
            </div>

            {/* Session information */}
            <div className="hidden text-right md:block">
              <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">
                Session
              </div>

              <div className="mt-1 text-sm font-black uppercase italic text-white">
                Race
              </div>
            </div>
          </div>
        </motion.div>

        {/* ================================================== */}
        {/* TRACKS */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TRACKS.map((track, index) => {
            const selected = selectedTrack === track.id;

            return (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.12,
                  duration: 0.5,
                }}
                onClick={() => setTrack(track.id)}
                className={`
                  group relative overflow-hidden text-left
                  transition-all duration-300
                  ${
                    selected
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[0.035] text-white hover:border-white/25 hover:bg-white/[0.06]"
                  }
                `}
              >
                {/* Selected red strip */}
                {selected && (
                  <motion.div
                    layoutId="track-selection"
                    className="absolute left-0 top-0 h-full w-1 bg-[#e10600]"
                  />
                )}

                {/* Top bar */}
                <div
                  className={`
                    flex items-center justify-between border-b px-5 py-3
                    ${selected ? "border-black/10" : "border-white/10"}
                  `}
                >
                  <span
                    className={`
                      text-[9px] font-bold uppercase tracking-[0.25em]
                      ${selected ? "text-black/40" : "text-white/30"}
                    `}
                  >
                    Circuit {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-xl">{track.flag}</span>
                </div>

                {/* Track name */}
                <div className="px-5 pb-5 pt-6">
                  <h2
                    className={`
                      text-3xl font-black uppercase italic leading-none tracking-[-0.03em]
                      ${selected ? "text-black" : "text-white"}
                    `}
                  >
                    {track.name}
                  </h2>

                  <div
                    className={`
                      mt-2 text-[9px] font-bold uppercase tracking-[0.2em]
                      ${selected ? "text-black/40" : "text-white/30"}
                    `}
                  >
                    {track.id === "monaco"
                      ? "Street Circuit"
                      : track.id === "silverstone"
                        ? "Grand Prix Circuit"
                        : "High Speed Circuit"}
                  </div>
                </div>

                {/* Stats */}
                <div
                  className={`
                    border-t px-5 py-4
                    ${
                      selected
                        ? "border-black/10 bg-black/[0.025]"
                        : "border-white/10 bg-black/10"
                    }
                  `}
                >
                  {/* Speed */}
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`
                        flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em]
                        ${selected ? "text-black/40" : "text-white/35"}
                      `}
                    >
                      <Gauge size={13} />
                      Difficulty
                    </div>

                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`
                            h-1.5 w-7
                            ${
                              level <= track.difficulty
                                ? "bg-[#e10600]"
                                : selected
                                  ? "bg-black/10"
                                  : "bg-white/10"
                            }
                          `}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Track type */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`
                        flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em]
                        ${selected ? "text-black/40" : "text-white/35"}
                      `}
                    >
                      <Flag size={13} />
                      Type
                    </div>

                    <span
                      className={`
                        text-[9px] font-black uppercase tracking-[0.12em]
                        ${selected ? "text-black" : "text-white"}
                      `}
                    >
                      {track.id === "monaco"
                        ? "Street"
                        : track.id === "silverstone"
                          ? "Classic"
                          : "High Speed"}
                    </span>
                  </div>
                </div>

                {/* Selected indicator */}
                {selected && (
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#e10600]">
                      Selected
                    </span>

                    <span className="h-1.5 w-1.5 bg-[#e10600]" />
                  </div>
                )}

                {/* Hover diagonal */}
                {!selected && (
                  <div className="pointer-events-none absolute -right-20 top-0 h-full w-32 -skew-x-[25deg] bg-white/[0.025] transition-transform duration-500 group-hover:translate-x-[-25px]" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* ================================================== */}
        {/* START SECTION */}
        {/* ================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8"
        >
          <button
            onClick={startGame}
            className="group relative flex h-16 w-full items-center justify-between overflow-hidden bg-[#e10600] px-7 text-left text-white transition-colors duration-200 hover:bg-[#c90500]"
          >
            <div className="relative z-10 flex items-center gap-4">
              <Trophy size={20} strokeWidth={2.5} />

              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/60">
                  Lights Out
                </div>

                <div className="text-sm font-black uppercase italic tracking-[0.15em]">
                  Start Race
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <span className="hidden text-[8px] font-bold uppercase tracking-[0.2em] text-white/50 sm:block">
                {TRACKS.find((track) => track.id === selectedTrack)?.name}
              </span>

              <span className="text-2xl font-black transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </div>

            {/* Diagonal racing stripe */}
            <div className="absolute right-24 top-0 h-full w-28 -skew-x-[25deg] bg-white/[0.08] transition-transform duration-500 group-hover:translate-x-5" />
          </button>

          {/* Controls */}
          <div className="mt-5 flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-white/10" />

            <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/25">
              ← → Select Circuit
            </span>

            <div className="h-px w-8 bg-white/10" />
          </div>
        </motion.div>
      </div>
    </div>
  );
});
