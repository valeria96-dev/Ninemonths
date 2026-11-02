import { ENTRIES, type Entry, type ProductType, type Status } from "@/lib/ingredients/data";

export type Verdict = Status | "unknown";

export type Match = {
  entry: Entry;
  status: Status;
  /** The label text that matched, as she would see it on the bottle. */
  found: string;
};

export type Result = {
  verdict: Verdict;
  matches: Match[];
  ingredientCount: number;
  unmatched: string[];
};

const RANK: Record<Status, number> = { safe: 0, caution: 1, avoid: 2 };

export function normalise(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
}

/** Split an INCI list as printed: commas, semicolons, bullets or new lines. */
export function splitIngredients(text: string): string[] {
  return text
    .replace(/^(ingredients?|ingredientes|inci|composicion|composición)\s*[:.-]/i, "")
    .split(/[,;\n•·|]+|\s\/\s/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

export function statusFor(entry: Entry, type: ProductType, week: number): Status {
  if (week <= 13 && entry.firstTrimester) return entry.firstTrimester;
  return entry.byType?.[type] ?? entry.status;
}

export function checkIngredients(text: string, type: ProductType, week: number): Result {
  const items = splitIngredients(text);
  const byEntry = new Map<string, Match>();
  const unmatched: string[] = [];

  for (const raw of items) {
    const norm = normalise(raw);
    const entry = ENTRIES.find((e) => e.patterns.some((p) => p.test(norm)));
    if (!entry) {
      unmatched.push(raw);
      continue;
    }
    const seen = byEntry.get(entry.id);
    if (seen) seen.found += ` · ${raw}`;
    else byEntry.set(entry.id, { entry, status: statusFor(entry, type, week), found: raw });
  }

  const matches = [...byEntry.values()].sort((a, b) => RANK[b.status] - RANK[a.status]);
  const worst = matches.find((m) => m.status !== "safe")?.status;
  const verdict: Verdict = worst ?? (items.length === 0 ? "unknown" : "safe");
  return { verdict, matches, ingredientCount: items.length, unmatched };
}
