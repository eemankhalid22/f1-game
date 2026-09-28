import { supabase } from "../lib/supabase";

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string | null;
  track: "monaco" | "silverstone" | "monza";
  score: number;
  elapsed_time: number;
  dodge_count: number;
  created_at: string;
}

export async function getLeaderboard(
  track?: "monaco" | "silverstone" | "monza",
) {
  let query = supabase
    .from("leaderboard")
    .select(
      "id, user_id, username, track, score, elapsed_time, dodge_count, created_at",
    )
    .order("score", { ascending: false })
    .limit(10);

  if (track) {
    query = query.eq("track", track);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to get leaderboard:", error);
    return [];
  }

  return data as LeaderboardEntry[];
}
