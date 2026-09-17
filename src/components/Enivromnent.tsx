"use client";

import React from "react";
import SilverstoneEnvironment from "./environments/SilverstoneEnvironment";
import MonacoEnvironment from "./environments/MonacoEnvironment";
import MonzaEnvironment from "./environments/MonzaEnvironment";

import { useGameStore } from "../store/gameStore";

export const Environment = React.memo(() => {
  const selectedTrack = useGameStore((state: any) => state.selectedTrack);

  switch (selectedTrack) {
    case "silverstone":
      return <SilverstoneEnvironment />;

    case "monza":
      // Temporary: use Monaco environment
      // until MonzaEnvironment is created.
      return <MonacoEnvironment />;

    case "monaco":
    default:
      return <MonzaEnvironment />;
  }
});

Environment.displayName = "Environment";

export default Environment;
