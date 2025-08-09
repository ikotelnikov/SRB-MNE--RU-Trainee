import { Word, ProgressState } from "./types";
import { SEED_WORDS } from "./data/seedWords";

export const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

export function choice<T>(arr: T[], n: number): T[] {
  const s = shuffle(arr);
  return s.slice(0, Math.min(n, s.length));
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const LS_DICT = "srb-trainer-dict-v1";
const LS_PROGRESS = "srb-trainer-progress-v1";

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(LS_PROGRESS);
    if (!raw) return { xp: 0, level: 1, streak: 0, mastered: {} };
    return JSON.parse(raw);
  } catch {
    return { xp: 0, level: 1, streak: 0, mastered: {} };
  }
}

export function saveProgress(p: ProgressState) {
  localStorage.setItem(LS_PROGRESS, JSON.stringify(p));
}

export function loadDict(): Word[] {
  try {
    const raw = localStorage.getItem(LS_DICT);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SEED_WORDS;
}

export function saveDict(d: Word[]) {
  localStorage.setItem(LS_DICT, JSON.stringify(d));
}

export function xpToLevel(xp: number) {
  let lvl = 1;
  let need = 100;
  let remaining = xp;
  while (remaining >= need && lvl < 50) {
    remaining -= need;
    lvl += 1;
    need += 150;
  }
  return lvl;
}
