import { supabase } from "../lib/supabase";

interface RaceResult {
  track: "monaco" | "silverstone" | "monza";
  score: number;
  elapsedTime: number;
  dodgeCount: number;
}

export async function saveRaceResult(result: RaceResult) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Could not get current user:", userError);
    return { success: false, error: userError.message };
  }

  if (!user) {
    console.error("No authenticated user");
    return {
      success: false,
      error: "User is not authenticated",
    };
  }

  const { data, error } = await supabase
    .from("race_results")
    .insert({
      user_id: user.id,
      track: result.track,
      score: result.score,
      elapsed_time: result.elapsedTime,
      dodge_count: result.dodgeCount,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to save race result:", error);
    return {
      success: false,
      error: error.message,
    };
  }

  console.log("Race result saved:", data);

  return {
    success: true,
    data,
  };
}
export async function getBestScore() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return 0;
  }

  const { data, error } = await supabase
    .from("race_results")
    .select("score")
    .eq("user_id", user.id)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to get best score:", error);
    return 0;
  }

  return data?.score ?? 0;
}

export async function getPlayerProgress() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("race_results")
    .select("track, score, dodge_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to get player progress:", error);
    return null;
  }

  const results = data ?? [];

  const totalRaces = results.length;

  const bestScore =
    results.length > 0 ? Math.max(...results.map((result) => result.score)) : 0;

  const totalDodges = results.reduce(
    (total, result) => total + result.dodge_count,
    0,
  );

  const racesByTrack = {
    monaco: results.filter((result) => result.track === "monaco").length,

    silverstone: results.filter((result) => result.track === "silverstone")
      .length,

    monza: results.filter((result) => result.track === "monza").length,
  };

  return {
    totalRaces,
    bestScore,
    totalDodges,
    racesByTrack,
  };
}
