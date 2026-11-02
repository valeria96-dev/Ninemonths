import type { L } from "@/lib/i18n";

// Open-Meteo: free, no key, CORS-enabled, so the phone asks it directly.

export type UvToday = { max: number; hours: Array<{ hour: number; uv: number }> };

export async function fetchUv(lat: number, lon: number): Promise<UvToday> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=uv_index&daily=uv_index_max&timezone=auto&forecast_days=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("uv");
  const data = await res.json();
  const hours = (data.hourly.time as string[]).map((t, i) => ({ hour: Number(t.slice(11, 13)), uv: data.hourly.uv_index[i] as number }));
  return { max: Math.round(data.daily.uv_index_max[0]), hours };
}

export async function searchCity(q: string, lang: string) {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=${lang}`);
  const data = await res.json();
  // Biggest places first, and the state/region so "Miami, Florida" and
  // "Miami, Oklahoma" are not five identical rows.
  const rows = ((data.results ?? []) as Array<{ name: string; admin1?: string; country: string; latitude: number; longitude: number; population?: number }>)
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .map((r) => ({
      name: [r.name, r.admin1 && r.admin1 !== r.name ? r.admin1 : null, r.country].filter(Boolean).join(", "),
      lat: r.latitude,
      lon: r.longitude,
    }));
  return rows.filter((r, i) => rows.findIndex((x) => x.name === r.name) === i);
}

export function uvLabel(uv: number): L {
  if (uv >= 11) return { es: "Extremo", en: "Extreme" };
  if (uv >= 8) return { es: "Muy alto", en: "Very high" };
  if (uv >= 6) return { es: "Alto", en: "High" };
  if (uv >= 3) return { es: "Moderado", en: "Moderate" };
  return { es: "Bajo", en: "Low" };
}

/** Reapply every two hours across the window where UV is 3 or more. */
export function reapplyTimes(uv: UvToday): number[] {
  const strong = uv.hours.filter((h) => h.uv >= 3).map((h) => h.hour);
  if (strong.length === 0) return [];
  const out: number[] = [];
  for (let h = strong[0]; h <= strong[strong.length - 1]; h += 2) out.push(h);
  return out;
}
