import { useEffect, useState } from "react";
import { getLeaderboard, type LeaderboardEntry } from "../services/leaderboard";

type TrackFilter = "all" | "monaco" | "silverstone" | "monza";

export function Leaderboard({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [track, setTrack] = useState<TrackFilter>("all");
  const [loading, setLoading] = useState(true);

  // Load leaderboard
  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);

      const data =
        track === "all" ? await getLeaderboard() : await getLeaderboard(track);

      setEntries(data);
      setLoading(false);
    }

    loadLeaderboard();
  }, [track]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "#050505",
        color: "#fff",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",

        // Dedicated scroll container
        overflowY: "scroll",
        overflowX: "hidden",

        WebkitOverflowScrolling: "touch",

        paddingTop: "clamp(25px, 6vw, 50px)",
        paddingBottom: "60px",
        paddingLeft: "clamp(15px, 5vw, 40px)",
        paddingRight: "clamp(15px, 5vw, 40px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          paddingBottom: "30px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: "clamp(9px, 2vw, 11px)",
                fontWeight: 800,
                letterSpacing: "clamp(2px, 0.8vw, 4px)",
                color: "#e10600",
                marginBottom: "8px",
              }}
            >
              FORMULA X
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(28px, 8vw, 42px)",
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: "-1px",
              }}
            >
              LEADERBOARD
            </h1>
          </div>

          {/* BACK BUTTON */}
          <button
            onClick={onBack}
            style={{
              flexShrink: 0,
              padding: "10px 16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "1.5px",
            }}
          >
            BACK
          </button>
        </div>

        {/* TRACK FILTERS */}
        <div
          style={{
            display: "flex",
            gap: "7px",
            marginBottom: "22px",
            flexWrap: "wrap",
          }}
        >
          {(["all", "monaco", "silverstone", "monza"] as TrackFilter[]).map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setTrack(filter)}
                style={{
                  padding: "10px 15px",
                  border:
                    track === filter
                      ? "1px solid #e10600"
                      : "1px solid rgba(255,255,255,0.12)",
                  background:
                    track === filter ? "#e10600" : "rgba(255,255,255,0.035)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "9px",
                  fontWeight: 900,
                  letterSpacing: "1.3px",
                  textTransform: "uppercase",
                }}
              >
                {filter === "all" ? "Overall" : filter}
              </button>
            ),
          )}
        </div>

        {/* LEADERBOARD CONTAINER */}
        <div
          style={{
            width: "100%",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.025)",
            boxSizing: "border-box",
          }}
        >
          {/* TABLE HEADER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "clamp(45px, 10vw, 70px) minmax(0, 1fr) clamp(80px, 15vw, 140px) clamp(80px, 15vw, 130px)",
              alignItems: "center",
              gap: "8px",
              padding: "15px clamp(12px, 4vw, 20px)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)",
              fontSize: "9px",
              fontWeight: 900,
              letterSpacing: "2px",
            }}
          >
            <div>POS</div>

            <div>DRIVER</div>

            <div>TRACK</div>

            <div
              style={{
                textAlign: "right",
              }}
            >
              SCORE
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "rgba(255,255,255,0.5)",
                fontSize: "11px",
                letterSpacing: "2px",
              }}
            >
              LOADING...
            </div>
          ) : entries.length === 0 ? (
            /* NO RESULTS */
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "rgba(255,255,255,0.5)",
                fontSize: "11px",
                letterSpacing: "2px",
              }}
            >
              NO RACE RESULTS YET
            </div>
          ) : (
            /* RESULTS */
            entries.map((entry, index) => (
              <div
                key={entry.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "clamp(45px, 10vw, 70px) minmax(0, 1fr) clamp(80px, 15vw, 140px) clamp(80px, 15vw, 130px)",
                  alignItems: "center",
                  gap: "8px",
                  padding: "17px clamp(12px, 4vw, 20px)",
                  borderBottom:
                    index === entries.length - 1
                      ? "none"
                      : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* POSITION */}
                <div
                  style={{
                    fontSize: "clamp(14px, 4vw, 18px)",
                    fontWeight: 900,
                    color: index === 0 ? "#e10600" : "rgba(255,255,255,0.55)",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* DRIVER username */}
                <div
                  style={{
                    minWidth: 0,
                    fontSize: "clamp(10px, 2.5vw, 13px)",
                    fontWeight: 700,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={entry.username ?? "Unknown Driver"}
                >
                  {entry.username ?? "Unknown Driver"}
                </div>

                {/* TRACK */}
                <div
                  style={{
                    minWidth: 0,
                    fontSize: "clamp(8px, 2vw, 10px)",
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.55)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.track}
                </div>

                {/* SCORE */}
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "clamp(13px, 3.5vw, 17px)",
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: "18px",
            color: "rgba(255,255,255,0.3)",
            fontSize: "9px",
            letterSpacing: "1.5px",
            textAlign: "center",
          }}
        >
          TOP 10 RACE RESULTS
        </div>
      </div>
    </div>
  );
}
