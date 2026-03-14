import { supabase } from "./supabase";
import type { Category, DBStory } from "./storyTypes";

// ── Story submission input ─────────────────────────────────────────────────────
export interface StoryFormData {
  moment:   string;
  worth_it: string;
  advice:   string | null;
  category: Category;
  title:    string;
}

// ── Stories ────────────────────────────────────────────────────────────────────
export async function fetchStories(): Promise<DBStory[]> {
  const { data, error } = await supabase
    .from("stories")
    .select("id, title, category, moment, worth_it, advice, body, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DBStory[];
}

export async function submitStory(
  input: StoryFormData
): Promise<DBStory> {
  // Generate cohesive narrative via Claude
  let body: string | null = null;
  try {
    const res = await fetch("/api/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const json = await res.json();
      body = json.body ?? null;
    }
  } catch {
    // fall through — save without generated body
  }

  const { data, error } = await supabase
    .from("stories")
    .insert({ ...input, body, status: "published" })
    .select("id, title, category, moment, worth_it, advice, body, created_at")
    .single();

  if (error) throw error;
  return data as DBStory;
}

// ── Saves ──────────────────────────────────────────────────────────────────────
export async function fetchSavesWithStories(
  userId: string
): Promise<{ story: DBStory; is_done: boolean }[]> {
  const { data, error } = await supabase
    .from("saves")
    .select("is_done, stories(id, title, category, moment, worth_it, advice, body, created_at)")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    story:   row.stories as DBStory,
    is_done: row.is_done as boolean,
  }));
}

export async function saveStory(userId: string, storyId: string): Promise<void> {
  const { error } = await supabase
    .from("saves")
    .insert({ user_id: userId, story_id: storyId });

  // 23505 = unique_violation — already saved, not an error
  if (error && error.code !== "23505") throw error;
}

export async function unsaveStory(userId: string, storyId: string): Promise<void> {
  const { error } = await supabase
    .from("saves")
    .delete()
    .eq("user_id", userId)
    .eq("story_id", storyId);

  if (error) throw error;
}

export async function toggleDone(
  userId: string,
  storyId: string,
  isDone: boolean
): Promise<void> {
  const { error } = await supabase
    .from("saves")
    .update({ is_done: isDone })
    .eq("user_id", userId)
    .eq("story_id", storyId);

  if (error) throw error;
}
