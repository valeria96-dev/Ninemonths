"use client";

import { useSyncExternalStore } from "react";
import type { Verdict } from "@/lib/ingredients/engine";
import type { ProductType } from "@/lib/ingredients/data";
import type { ConcernId, ZoneId } from "@/lib/skin/types";

// Everything the app knows lives on the phone: one JSON blob in localStorage,
// photos in IndexedDB (lib/photos.ts). No account, no server copy — that is
// both the privacy promise and what lets a judge try it in ten seconds.

export type Profile = {
  dueDate: string; // YYYY-MM-DD
  city: { name: string; lat: number; lon: number } | null;
  concerns: Array<"spots" | "acne" | "dryness" | "stretch" | "itch">;
  fitzpatrick: "I" | "II" | "III" | "IV" | "V" | "VI" | null;
  createdAt: string;
};

export type Scan = {
  id: string;
  date: string; // ISO
  week: number;
  source: "youcam" | "demo" | "sample";
  /** YouCam raw_score, 1–100, higher = healthier skin. */
  scores: Partial<Record<ConcernId, number>>;
  /** Our own pigment index per melasma zone, 0–100, higher = more pigment spots. */
  zones: Partial<Record<ZoneId, number>>;
  photoKey: string | null;
  maskKey: string | null;
  /** Share (%) of each zone covered by YouCam's age_spot mask. */
  ycZones?: Partial<Record<ZoneId, number>>;
  /** Cheek colour (#rrggbb), for her tinted-sunscreen shade. */
  skinHex?: string;
  /** Full-size analysis crop (IndexedDB key), for the tinted-sunscreen try-on. */
  fullKey?: string | null;
};

export type ProductCheck = {
  id: string;
  date: string;
  week: number;
  name: string;
  type: ProductType;
  ingredientsText: string;
  verdict: Verdict;
  flagged: string[]; // ingredient entry ids that were not "safe"
  inUse: boolean;
};

export type SymptomLog = { id: string; date: string; week: number; symptomIds: string[]; level: number };

export type State = {
  profile: Profile | null;
  scans: Scan[];
  checks: ProductCheck[];
  symptoms: SymptomLog[];
  pass: boolean;
};

const KEY = "nueve.state.v1";
const EMPTY: State = { profile: null, scans: [], checks: [], symptoms: [], pass: false };

let cache: State | null = null;
const listeners = new Set<() => void>();

function read(): State {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

export function update(fn: (s: State) => State) {
  cache = fn(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {}
  listeners.forEach((l) => l());
}

export function resetAll() {
  update(() => EMPTY);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** null until mounted on the client, so server HTML never guesses the state. */
export function useAppState(): State | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ── Free tier ────────────────────────────────────────────────────────────
// Safety is never paywalled: the symptom check and the verdict on the first
// products are free. The pass buys continuity — unlimited checks, the weekly
// scan history and the doctor summary.
export const FREE_CHECKS = 3;
export const FREE_SCANS = 1;

export function canCheck(s: State) {
  return s.pass || s.checks.length < FREE_CHECKS;
}
export function canScan(s: State) {
  return s.pass || s.scans.length < FREE_SCANS;
}
