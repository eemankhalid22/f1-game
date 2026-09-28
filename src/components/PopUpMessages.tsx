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
  const setPhase = useGameStore((state: any) => state.setPhase);

  const [countdown, setCountdown] = useState<number | "go" | null>(null);
  const [showLights, setShowLights] = useState(false);
  const [showFlags, setShowFlags] = useState(false);
  const [message, setMessage] = useState("");

  const [isVisible, setIsVisible] = useState(false);

  const [messageType, setMessageType] = useState<"crash" | "gameplay">(
    "gameplay",
  );

  const [prevLives, setPrevLives] = useState(lives);

  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    setShowFlags(false);
    setShowLights(false);

    let current = 3;

    let countdownInterval: number | undefined;
    let lightsTimeout: number | undefined;
    let goTimeout: number | undefined;

    setCountdown(current);

    countdownInterval = window.setInterval(() => {
      current -= 1;

      if (current > 0) {
        setCountdown(current);
        return;
      }

      window.clearInterval(countdownInterval);

      // Show red lights
      setShowLights(true);
      setCountdown(null);

      // Hold red lights
      lightsTimeout = window.setTimeout(() => {
        setShowLights(false);

        // LIGHTS OUT!
        setCountdown("go");

        // Give the message a moment before starting
        goTimeout = window.setTimeout(() => {
          setCountdown(null);
          setShowFlags(false);

          // Race starts HERE
          setPhase("playing");
        }, 700);
      }, 900);
    }, 1000);

    return () => {
      if (countdownInterval) {
        window.clearInterval(countdownInterval);
      }

      if (lightsTimeout) {
        window.clearTimeout(lightsTimeout);
      }

      if (goTimeout) {
        window.clearTimeout(goTimeout);
      }
    };
  }, [phase, setPhase]);

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
    <>
      {/* ============================================================
        F1 RACE START COUNTDOWN
    ============================================================ */}

      <AnimatePresence>
        {phase === "countdown" && (
          <motion.div
            className="
        fixed
        inset-0
        z-[500]
        flex
        items-center
        justify-center
        pointer-events-none
        overflow-hidden
      "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* DARK OVERLAY */}
            <motion.div
              className="absolute inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />

            {/* LEFT FLAG */}
            {showFlags && (
              <motion.div
                className="
      absolute
      left-[-25px]
      sm:left-[3vw]
      top-[22%]
      w-[150px]
      sm:w-[220px]
      z-50
    "
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <img
                  src="/assets/f1-checkered-flag.gif"
                  alt=""
                  className="w-full h-auto"
                />
              </motion.div>
            )}

            {/* RIGHT FLAG */}
            {showFlags && (
              <motion.div
                className="
      absolute
      right-[-25px]
      sm:right-[3vw]
      bottom-[22%]
      w-[150px]
      sm:w-[220px]
      z-50
    "
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <img
                  src="/assets/f1-checkered-flag.gif"
                  alt=""
                  className="w-full h-auto scale-x-[-1]"
                />
              </motion.div>
            )}

            {/* CENTER */}
            <div className="relative flex flex-col items-center justify-center">
              {/* RED LIGHTS */}
              {showLights && (
                <motion.div
                  className="
              flex
              gap-3
              sm:gap-5
              mb-8
              sm:mb-10
            "
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{
                    scale: [0.95, 1, 0.95],
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                  }}
                >
                  {[0, 1, 2, 3, 4].map((light) => (
                    <div
                      key={light}
                      className="
                  w-7
                  h-7
                  sm:w-11
                  sm:h-11
                  md:w-14
                  md:h-14
                  rounded-full
                  bg-red-500
                  border-2
                  border-red-300
                "
                      style={{
                        boxShadow: `
                    0 0 10px #ff0000,
                    0 0 25px #ff0000,
                    0 0 50px rgba(255,0,0,0.8)
                  `,
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* 3 / 2 / 1 */}
              {typeof countdown === "number" && (
                <motion.div
                  key={countdown}
                  initial={{
                    opacity: 0,
                    scale: 1.7,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.7,
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                  className="
              text-[11rem]
              sm:text-[10rem]
              md:text-[13rem]
              lg:text-[16rem]
              leading-none
              font-black
            "
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    color: "#ffffff",
                    WebkitTextStroke: "2px rgba(255,255,255,0.8)",
                    textShadow: `
                0 0 10px rgba(255,255,255,0.9),
                0 0 30px rgba(255,255,255,0.8),
                0 0 70px rgba(255,0,60,0.7)
              `,
                  }}
                >
                  {countdown}
                </motion.div>
              )}

              {/* LIGHTS OUT */}
              {countdown === "go" && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 1.4,
                  }}
                  animate={{
                    opacity: [0, 1, 1],
                    scale: [1.4, 1, 1],
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="
              text-center
              whitespace-nowrap
            "
                >
                  <div
                    className="
                text-[3.5rem]
                sm:text-[4rem]
                md:text-[6rem]
                lg:text-[8rem]
                leading-none
              "
                    style={{
                      fontFamily: "Orbitron, sans-serif",
                      fontWeight: 900,
                      letterSpacing: "0.04em",
                      color: "#ffffff",
                      textShadow: `
                  0 0 8px #ffffff,
                  0 0 25px #ff003c,
                  0 0 50px #ff003c,
                  0 0 100px rgba(255,0,60,0.8)
                `,
                    }}
                  >
                    LIGHTS OUT!
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="
                mt-3
                sm:mt-5
                text-[1.1rem]
                sm:text-[2rem]
                md:text-[3rem]
              "
                    style={{
                      fontFamily: "Orbitron, sans-serif",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#00FF9D",
                      textShadow: `
                  0 0 8px #00FF9D,
                  0 0 25px #00FF9D,
                  0 0 50px rgba(0,255,157,0.7)
                `,
                    }}
                  >
                    AND AWAY WE GO!
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
    </>
  );
});
