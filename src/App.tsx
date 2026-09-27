import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "./lib/supabase";

import { useGameStore } from "./store/gameStore";
import { Game } from "./components/Game";
import { StartScreen } from "./components/StartScreen";
import { GameOver } from "./components/GameOver";
import LoginScreen from "./components/auth/LoginScreen";

export default function App() {
  const phase = useGameStore((state: any) => state.phase);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <>
      {phase === "menu" && <StartScreen />}
      {phase === "playing" && <Game />}
      {phase === "gameover" && <GameOver />}
    </>
  );
}
