import React from "react";

import { useGameStore } from "../store/gameStore";
import TrackSilverstone from "./game/TrackSilverstone";
import { TrackMonaco } from "./game/TrackMonaco";
import TrackMonza from "./game/TrackMonza";

// import TrackMonza from "./TrackMonza";

export const Track = React.memo(() => {
  const selectedTrack = useGameStore((state) => state.selectedTrack);

  console.log("Current track:", selectedTrack);

  switch (selectedTrack) {
    case "silverstone":
      return <TrackSilverstone />;

    case "monza":
      return <TrackMonza />;

    case "monaco":
    default:
      return <TrackMonaco />;
  }
});

Track.displayName = "Track";

export default Track;
