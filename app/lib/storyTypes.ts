export type TailDir = "bl" | "bc" | "br";
export type Category = "Adventure" | "Learning" | "Connecting" | "Going wild" | "Going solo";

// Raw DB story — what comes from Supabase
export interface DBStory {
  id: string;
  title: string;
  category: Category;
  moment: string;
  worth_it: string;
  advice: string | null;
  body: string | null;
  created_at: string;
}

// Canvas story — DB fields + computed placement for WanderFeed bubbles
export interface Story extends DBStory {
  x: number;
  y: number;
  rotation: number;
  bobDuration: number;
  bobDelay: number;
  tailDir: TailDir;
  seed: number;
  w: number;
  h: number;
}

export const CATEGORY_COLOR: Record<Category, string> = {
  Adventure:    "#20500C",
  Learning:     "#1D49A1",
  Connecting:   "#D56606",
  "Going wild": "#6E0476",
  "Going solo": "#9C1B35",
};
