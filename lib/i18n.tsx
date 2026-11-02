"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

export type Lang = "es" | "en";
/** A bilingual string. Copy is written inline next to where it is used. */
export type L = { es: string; en: string };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (s: L) => string };

const LangContext = createContext<Ctx | null>(null);
const KEY = "nueve.lang";

// The language lives in a tiny external store: saved choice first, then the
// browser language; Spanish is the default because the first market is LatAm.
const subs = new Set<() => void>();
let current: Lang | null = null;
function readLang(): Lang {
  if (current) return current;
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {}
  current = saved === "es" || saved === "en" ? saved : navigator.language.startsWith("en") ? "en" : "es";
  return current;
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(
    (l) => {
      subs.add(l);
      return () => subs.delete(l);
    },
    readLang,
    () => "es" as Lang,
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    current = l;
    subs.forEach((f) => f());
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  }, []);

  const t = useCallback((s: L) => s[lang], [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang outside LangProvider");
  return ctx;
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-full border border-line bg-white/70 p-1 text-[11px] font-bold backdrop-blur" role="group" aria-label="Language">
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${lang === l ? "bg-brand-deep text-white" : "text-ink-2"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
