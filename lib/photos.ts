"use client";

import { del, get, set } from "idb-keyval";

// Photos stay in IndexedDB on the phone; localStorage only holds their keys.

export async function savePhoto(key: string, dataUrl: string) {
  try {
    await set(`photo:${key}`, dataUrl);
    return key;
  } catch {
    return null;
  }
}

export async function loadPhoto(key: string | null): Promise<string | null> {
  if (!key) return null;
  try {
    return ((await get(`photo:${key}`)) as string | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function deletePhoto(key: string | null) {
  if (key) await del(`photo:${key}`).catch(() => {});
}
