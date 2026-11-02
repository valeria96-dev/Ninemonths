import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Claim guard: a pregnancy app must never promise a diagnosis, a cure or
// absolute safety. Scans every user-facing string in the app (comments are
// ignored); a phrase is allowed only when it is negated ("not a diagnosis").

const ROOTS = ["app", "components", "lib"];
const BANNED: RegExp[] = [
  /\bdiagnos(e|es|ed|is|ing)\b/i,
  /\bdiagn[oó]stic(o|a|ar)\b/i,
  /\bcur(e|es|ed|ing)\b/i,
  /\bcura(r|mos)?\b/i,
  /\bheals?\b/i,
  /\btreats? (your )?melasma\b/i,
  /\bguarantee(d|s)?\b/i,
  /\bgarantiza(mos)?\b/i,
  /\bclinically (proven|validated|tested)\b/i,
  /\bcl[ií]nicamente (probad|validad|comprobad)/i,
  /\bFDA[- ]approved\b/i,
  /\b(100%|completely|totally) safe\b/i,
  /\b(100%|totalmente|completamente) segur[oa]\b/i,
];
const NEGATION = /\b(no|not|never|nunca|ni|isn't|doesn't|does not|don't|sin)\b[^.]{0,40}$/i;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|jsx?)$/.test(p) ? [p] : [];
  });
}
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

describe("claim guard", () => {
  const hits: string[] = [];
  for (const f of ROOTS.flatMap(files)) {
    const src = stripComments(readFileSync(f, "utf8"));
    for (const re of BANNED) {
      const g = new RegExp(re.source, re.flags + "g");
      for (const m of src.matchAll(g)) {
        const before = src.slice(Math.max(0, m.index! - 60), m.index!);
        if (!NEGATION.test(before)) hits.push(`${f}: "…${before.slice(-30)}${m[0]}…"`);
      }
    }
  }
  it("no user-facing text promises a diagnosis, cure or absolute safety", () => {
    expect(hits).toEqual([]);
  });
});
