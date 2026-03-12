export type TailDir = "bl" | "bc" | "br";
export type Category = "Adventure" | "Learning" | "Connecting" | "Going wild" | "Going solo";

export interface Story {
  id: number;
  title: string;
  category: Category;
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
