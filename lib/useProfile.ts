"use client";

import { weekFromDueDate, trimester } from "@/lib/pregnancy";
import { useAppState, type Profile, type State } from "@/lib/store";

/** For pages inside the (app) group, where the layout guarantees a profile. */
export function useProfile(): { state: State; profile: Profile; week: number; tri: 1 | 2 | 3 } {
  const state = useAppState()!;
  const profile = state.profile!;
  const week = weekFromDueDate(profile.dueDate);
  return { state, profile, week, tri: trimester(week) };
}
