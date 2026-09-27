import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

import { useGameStore } from "../store/gameStore";

const F1_MESSAGES = {
  crash: [
    "CONTACT!",
    "COLLISION!",
    "CAR DAMAGED!",
    "WING BROKEN!",
    "RED FLAG!",
    "RETIREMENT!",
  ],

  gameplay: [
    "DRS ENABLED!",
    "FASTEST LAP!",
    "OVERTAKE!",
    "PUSHING HARD!",
    "PERFECT LINE!",
    "GAP CLOSING!",
    "PUSH NOW!",
    "ENGINE MODE!",
  ],
};

export const PopUpMessages = React.memo(() => {
  const phase = useGameStore((state: any) => state.phase);

  const lives = useGameStore((state: any) => state.lives);

  const [message, setMessage] = useState("");

  const [isVisible, setIsVisible] = useState(false);

  const [messageType, setMessageType] = useState<"crash" | "gameplay">(
    "gameplay",
  );

  const [prevLives, setPrevLives] = useState(lives);

  /*
   * ============================================================
   * CRASH DETECTION
   * ============================================================
   */

  useEffect(() => {
    if (lives < prevLives) {
      const msg =
        F1_MESSAGES.crash[Math.floor(Math.random() * F1_MESSAGES.crash.length)];

      setMessage(msg);
      setMessageType("crash");
      setIsVisible(true);

      const timeout = window.setTimeout(() => {
        setIsVisible(false);
      }, 1500);

      return () => window.clearTimeout(timeout);
    }

    setPrevLives(lives);
  }, [lives, prevLives]);

  /*
   * ============================================================
   * RANDOM GAMEPLAY MESSAGES
   * ============================================================
   */

  useEffect(() => {
    if (phase !== "playing") {
      return;
    }

    const interval = window.setInterval(() => {
      if (Math.random() > 0.6 && !isVisible) {
        const msg =
          F1_MESSAGES.gameplay[
            Math.floor(Math.random() * F1_MESSAGES.gameplay.length)
          ];

        setMessage(msg);
        setMessageType("gameplay");
        setIsVisible(true);

        window.setTimeout(() => {
          setIsVisible(false);
        }, 1200);
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [phase, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 1.04,
          }}
          transition={{
            duration: 0.35,
          }}
          className="
            fixed
            inset-0
            flex
            items-start
            justify-center
            pointer-events-none
            z-[200]

            pt-[18vh]

            sm:pt-20
            md:pt-24
          "
        >
          {/* ==================================================
              CRASH POPUP
          ================================================== */}

          {messageType === "crash" ? (
            <motion.div
              animate={{
                opacity: [0.75, 1, 0.75],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
              className="
                relative
                max-w-[92vw]
                text-center
              "
            >
              {/* RED GLOW */}

              <div
                className="
                  absolute
                  inset-0
                  blur-[45px]
                  sm:blur-[70px]
                  md:blur-[90px]
                "
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,0,60,0.45) 0%, transparent 70%)",
                }}
              />

              {/* CRASH TEXT */}

              <h1
                className="
                  relative
                  uppercase
                  leading-none
                  whitespace-nowrap
                  text-[2.5rem]
                  sm:text-[4rem]
                  md:text-[6rem]
                  lg:text-[8rem]
                "
                style={{
                  fontFamily: "Orbitron, sans-serif",

                  fontWeight: 900,

                  letterSpacing: "0.05em",

                  background: `
                    linear-gradient(
                      to bottom,
                      #ffffff 0%,
                      #ffb3c7 20%,
                      #ff4d88 45%,
                      #ff0055 60%,
                      #ff9dbd 80%,
                      #ffffff 100%
                    )
                  `,

                  WebkitBackgroundClip: "text",

                  WebkitTextFillColor: "transparent",

                  textShadow: `
                    0 0 8px rgba(255,0,85,0.6),
                    0 0 25px rgba(255,0,85,0.5),
                    0 0 60px rgba(255,0,85,0.35),
                    0 0 120px rgba(255,0,85,0.2)
                  `,
                }}
              >
                {message}
              </h1>
            </motion.div>
          ) : (
            /* ==================================================
               GAMEPLAY POPUP
            ================================================== */

            <motion.div
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
              }}
              className="
                relative
                max-w-[92vw]
                text-center
              "
            >
              {/* GREEN GLOW */}

              <div
                className="
                  absolute
                  inset-0
                  blur-[35px]
                  sm:blur-[55px]
                  md:blur-[70px]
                "
                style={{
                  background:
                    "radial-gradient(circle, rgba(124,255,91,0.28) 0%, transparent 70%)",
                }}
              />

              {/* GAMEPLAY TEXT */}

              <div
                className="
                  relative
                  whitespace-nowrap
                  text-[1.5rem]
                  sm:text-[2.5rem]
                  md:text-[4rem]
                  lg:text-[5.5rem]
                "
                style={{
                  fontFamily: "Orbitron, sans-serif",

                  fontWeight: 700,

                  letterSpacing: "0.05em",

                  color: "transparent",

                  WebkitTextStroke: "1.5px #00FF9D",

                  textShadow: `
                    0 0 3px #00FF9D,
                    0 0 8px #00FF9D,
                    0 0 18px rgba(0,255,157,0.95),
                    0 0 36px rgba(0,255,157,0.82),
                    0 0 72px rgba(0,255,157,0.5),
                    0 0 120px rgba(0,255,157,0.25)
                  `,
                }}
              >
                {message}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
