export type Word = { sr: string; ru: string; level: number; tag: string };
export type Mode = "multiple" | "sr_to_ru" | "ru_to_sr" | "typing" | "scramble" | "true_false" | "audio";
export type ProgressState = {
  xp: number;
  level: number;
  streak: number;
  mastered: Record<string, number>;
};
