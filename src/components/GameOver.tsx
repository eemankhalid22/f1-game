import { useEffect, useState } from "react";
import React from "react";

import { useGameStore } from "../store/gameStore";

export const GameOver = React.memo(() => {
  const score = useGameStore((state: any) => state.score);
  const elapsedTime = useGameStore((state: any) => state.elapsedTime);
  const dodgeCount = useGameStore((state: any) => state.dodgeCount);
  const startGame = useGameStore((state: any) => state.startGame);
  const setPhase = useGameStore((state: any) => state.setPhase);

  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("dgg-f1-best-score");
    const savedScore = saved ? parseInt(saved, 10) : 0;
    const newBest = Math.max(savedScore, score);

    setBestScore(newBest);

    if (score > savedScore) {
      localStorage.setItem("dgg-f1-best-score", score.toString());
    }
  }, [score]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const isNewRecord = score > 0 && score >= bestScore;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fff 0, #fff 1px, transparent 1px, transparent 9px)",
          }}
        />

        {/* Red accent line */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[#e10600]/30" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* ====================================================== */}
        {/* RACE CONTROL HEADER */}
        {/* ====================================================== */}

        <div className="flex h-9 items-center bg-[#e10600] px-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black italic text-white">DGG</span>

            <span className="h-3.5 w-px bg-white/40" />

            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white">
              Race Control
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-white" />
            <span className="h-1.5 w-1.5 bg-white/50" />
            <span className="h-1.5 w-1.5 bg-white/30" />
          </div>
        </div>

        {/* ====================================================== */}
        {/* MAIN PANEL */}
        {/* ====================================================== */}

        <div className="overflow-hidden bg-[#f2f2f2] text-black shadow-2xl">
          {/* ================================================== */}
          {/* SESSION HEADER */}
          {/* ================================================== */}

          <div className="relative border-b border-black/10 px-7 pb-6 pt-7 sm:px-8">
            {/* Diagonal detail */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-32 overflow-hidden opacity-[0.04]">
              <div
                className="h-full w-[180%] -skew-x-12"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, #000 0, #000 2px, transparent 2px, transparent 10px)",
                }}
              />
            </div>

            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 bg-[#e10600]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-black/45">
                  Session Complete
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-4xl font-black uppercase italic leading-none tracking-[-0.04em] sm:text-5xl">
                    Finish
                  </h1>

                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-black/40">
                    Driver Session
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/30">
                    Status
                  </div>

                  <div className="mt-1 text-xs font-black uppercase italic text-[#e10600]">
                    Classified
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* CLASSIFICATION */}
          {/* ================================================== */}

          <div className="border-b-4 border-black bg-white px-7 py-6 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.25em] text-black/35">
                  Final Score
                </div>

                <div className="text-5xl font-black tabular-nums tracking-[-0.05em] sm:text-6xl">
                  {score.toLocaleString()}
                </div>
              </div>

              {isNewRecord && (
                <div className="flex items-center gap-2 bg-[#e10600] px-3 py-2">
                  <span className="h-1.5 w-1.5 bg-white" />

                  <span className="text-[8px] font-black uppercase tracking-[0.15em] text-white">
                    New Best
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ================================================== */}
          {/* TELEMETRY */}
          {/* ================================================== */}

          <div className="grid grid-cols-3 border-b border-black/10">
            {/* Best */}
            <div className="border-r border-black/10 px-5 py-5">
              <div className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-black/35">
                Best Score
              </div>

              <div className="text-xl font-black tabular-nums">
                {bestScore.toLocaleString()}
              </div>
            </div>

            {/* Time */}
            <div className="border-r border-black/10 px-5 py-5">
              <div className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-black/35">
                Race Time
              </div>

              <div className="text-xl font-black tabular-nums">
                {formatTime(elapsedTime)}
              </div>
            </div>

            {/* Dodges */}
            <div className="px-5 py-5">
              <div className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-black/35">
                Dodges
              </div>

              <div className="text-xl font-black tabular-nums">
                {dodgeCount}
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* ACTIONS */}
          {/* ================================================== */}

          <div className="bg-[#e9e9e9] p-5 sm:p-6">
            <button
              onClick={startGame}
              className="group relative mb-2.5 flex h-14 w-full items-center justify-between overflow-hidden bg-[#e10600] px-5 text-left text-white transition-colors duration-200 hover:bg-[#c90500] active:scale-[0.99]"
            >
              <span className="relative z-10 text-xs font-black uppercase italic tracking-[0.18em]">
                Start New Race
              </span>

              <span className="relative z-10 text-xl font-black transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>

              {/* Racing stripe */}
              <span className="absolute right-12 top-0 h-full w-20 -skew-x-[25deg] bg-white/10 transition-transform duration-300 group-hover:translate-x-3" />
            </button>

            <button
              onClick={() => setPhase("menu")}
              className="group flex h-14 w-full items-center justify-between border border-black/15 bg-white px-5 text-left transition-colors duration-200 hover:border-black/30 hover:bg-[#fafafa] active:scale-[0.99]"
            >
              <span className="text-xs font-black uppercase italic tracking-[0.18em]">
                Change Track
              </span>

              <span className="text-lg font-black transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          <div className="flex h-8 items-center justify-between bg-black px-5">
            <span className="text-[7px] font-bold uppercase tracking-[0.25em] text-white/40">
              Race Control
            </span>

            <div className="flex gap-1">
              <span className="h-1 w-4 bg-[#e10600]" />
              <span className="h-1 w-4 bg-white/20" />
              <span className="h-1 w-4 bg-white/20" />
            </div>

            <span className="text-[7px] font-bold uppercase tracking-[0.25em] text-white/40">
              Session Finished
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
