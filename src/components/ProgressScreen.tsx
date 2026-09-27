import { useEffect, useState } from "react";

import { getPlayerProgress } from "../services/raceResults";

interface Progress {
  totalRaces: number;
  bestScore: number;
  totalDodges: number;
  racesByTrack: {
    monaco: number;
    silverstone: number;
    monza: number;
  };
}

export function ProgressScreen({ onBack }: { onBack: () => void }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      const data = await getPlayerProgress();
      setProgress(data);
      setLoading(false);
    };

    loadProgress();
  }, []);

  /* ============================================================
     LOADING
  ============================================================ */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          width: "100%",
          background: "#050505",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        Loading progress...
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */
  if (!progress) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          width: "100%",
          background: "#050505",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Could not load progress.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        background: "#050505",
        color: "#fff",
        padding: "14px 12px 20px",
        boxSizing: "border-box",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* ======================================================
            TITLE
        ====================================================== */}
        <h1
          style={{
            fontSize: "clamp(26px, 8vw, 42px)",
            lineHeight: 0.9,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: "-1.5px",
            margin: 30,
          }}
        >
          YOUR
          <br />
          <span style={{ color: "#e10600" }}>PROGRESS</span>
        </h1>

        {/* Red line */}
        <div
          style={{
            height: "2px",
            width: "100%",
            background: "#e10600",
            margin: "10px 0 14px",
          }}
        />

        {/* ======================================================
            STAT CARDS
        ====================================================== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "6px",
            width: "100%",
          }}
        >
          <Stat label="RACES" value={progress.totalRaces} />

          <Stat
            label="BEST SCORE"
            value={progress.bestScore.toLocaleString()}
          />

          <Stat label="DODGES" value={progress.totalDodges} />
        </div>

        {/* ======================================================
            TRACKS TITLE
        ====================================================== */}
        <h2
          style={{
            marginTop: "22px",
            marginBottom: "8px",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "1.5px",
          }}
        >
          TRACKS
        </h2>

        {/* ======================================================
            TRACKS
        ====================================================== */}
        <Track name="MONACO" races={progress.racesByTrack.monaco} />

        <Track name="SILVERSTONE" races={progress.racesByTrack.silverstone} />

        <Track name="MONZA" races={progress.racesByTrack.monza} />

        {/* ======================================================
            BACK BUTTON BOTTOM
        ====================================================== */}
        <button
          onClick={onBack}
          style={{
            width: "100%",
            height: "34px",
            marginTop: "12px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid #222",
            color: "#777",
            cursor: "pointer",
            fontSize: "8px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          ← Back to Race Selection
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        minWidth: 0,
        background: "#111",
        border: "1px solid #222",
        padding: "10px 8px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          color: "#666",
          fontSize: "6px",
          fontWeight: 700,
          letterSpacing: "0.8px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "4px",
          fontSize: "clamp(18px, 6vw, 32px)",
          lineHeight: 1,
          fontWeight: 900,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ================================================================
   TRACK ROW
================================================================ */

function Track({ name, races }: { name: string; races: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        minHeight: "38px",
        padding: "8px 10px",
        marginBottom: "5px",
        background: "#111",
        border: "1px solid #222",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize: "9px",
          letterSpacing: "0.5px",
        }}
      >
        {name}
      </span>

      <span
        style={{
          color: "#e10600",
          fontWeight: 700,
          fontSize: "8px",
          letterSpacing: "0.5px",
          whiteSpace: "nowrap",
        }}
      >
        {races} RACES
      </span>
    </div>
  );
}
