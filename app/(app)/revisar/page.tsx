"use client";

import { LabelScan } from "@/components/LabelScan";
import { CameraIcon } from "@/components/icons";
import { Ready } from "@/components/AppGate";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Disclaimer, SectionTitle, VerdictBadge } from "@/components/ui";
import { useLang } from "@/lib/i18n";
import {
  PRODUCT_TYPES,
  SOURCES,
  type ProductType,
} from "@/lib/ingredients/data";
import { checkIngredients, type Result } from "@/lib/ingredients/engine";
import { readLabelOnDevice } from "@/lib/ocr";
import { canCheck, FREE_CHECKS, uid, update } from "@/lib/store";
import { useProfile } from "@/lib/useProfile";

// Generic example products (no real brands) so anyone can try the checker
// without a bottle at hand.
const EXAMPLES: Array<{
  name: { es: string; en: string };
  type: ProductType;
  text: string;
}> = [
  {
    name: { es: "Sérum antiedad de noche", en: "Night anti-aging serum" },
    type: "leave",
    text: "Aqua, Glycerin, Squalane, Retinol, Retinyl Palmitate, Niacinamide, Tocopherol, Phenoxyethanol, Parfum",
  },
  {
    name: {
      es: "Crema aclaradora de manchas",
      en: "Dark-spot lightening cream",
    },
    type: "leave",
    text: "Aqua, Cetearyl Alcohol, Hydroquinone, Kojic Acid, Glycerin, Sodium Metabisulfite, Methylparaben",
  },
  {
    name: { es: "Limpiador para acné", en: "Acne cleanser" },
    type: "rinse",
    text: "Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Salicylic Acid, Glycerin, Sodium Chloride, Citric Acid",
  },
  {
    name: {
      es: "Protector solar mineral SPF 50",
      en: "Mineral sunscreen SPF 50",
    },
    type: "sunscreen",
    text: "Aqua, Zinc Oxide, Titanium Dioxide, Caprylic/Capric Triglyceride, Glycerin, Iron Oxides, Tocopherol",
  },
  {
    name: { es: "Aceite antiestrías", en: "Stretch-mark oil" },
    type: "body",
    text: "Prunus Amygdalus Dulcis Oil, Rosa Canina Fruit Oil, Centella Asiatica Extract, Rosmarinus Officinalis Leaf Oil, Lavandula Angustifolia Oil, Tocopherol",
  },
];

function Check() {
  const { t } = useLang();
  const { state, week } = useProfile();
  const [name, setName] = useState("");
  const [type, setType] = useState<ProductType>("leave");
  const [text, setText] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const labelUrl = useRef<string | null>(null);
  const [labelPreview, setLabelPreview] = useState<string | null>(null);
  const [labelSample, setLabelSample] = useState(false);
  useEffect(() => () => { if (labelUrl.current) URL.revokeObjectURL(labelUrl.current); }, []);
  const allowed = canCheck(state);

  function run(n = name, ty = type, tx = text) {
    const r = checkIngredients(tx, ty, week);
    setResult(r);
    const id = uid();
    setSavedId(id);
    update((s) => ({
      ...s,
      checks: [
        ...s.checks,
        {
          id,
          date: new Date().toISOString(),
          week,
          name:
            n.trim() || t({ es: "Producto sin nombre", en: "Unnamed product" }),
          type: ty,
          ingredientsText: tx,
          verdict: r.verdict,
          flagged: r.matches
            .filter((m) => m.status !== "safe")
            .map((m) => m.entry.id),
          inUse: false,
        },
      ],
    }));
    setTimeout(
      () =>
        document
          .getElementById("result")
          ?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  async function readPhoto(file: File, nameHint?: string) {
    const n0 = nameHint ?? name;
    if (labelUrl.current) URL.revokeObjectURL(labelUrl.current);
    labelUrl.current = URL.createObjectURL(file);
    setLabelPreview(labelUrl.current);
    setLabelSample(Boolean(nameHint));
    setReading(true);
    setProgress(0);
    setNote(null);
    try {
      const small = await shrink(file);
      let server: {
        readable?: boolean;
        productName?: string;
        productType?: ProductType;
        ingredients?: string[];
      } | null = null;
      try {
        const form = new FormData();
        form.append("image", small);
        const res = await fetch("/api/label", { method: "POST", body: form });
        if (res.ok) server = await res.json();
      } catch {
        // offline or no key: fall through to on-device reading
      }

      if (server?.readable && server.ingredients?.length) {
        const n = server.productName || n0;
        const ty = server.productType ?? type;
        const tx = server.ingredients.join(", ");
        setName(n);
        setType(ty);
        setText(tx);
        run(n, ty, tx);
        return;
      }

      // On-device OCR: works without any key and the photo stays on the phone.
      const tx = await readLabelOnDevice(file, setProgress);
      if (tx.split(",").filter((x) => x.trim().length > 2).length < 2) {
        setNote(
          t({
            es: "No pudimos leer la lista de ingredientes. Acércate a la lista, con buena luz y la etiqueta recta.",
            en: "We couldn't read the ingredient list. Get closer to the list, with good light and the label straight.",
          }),
        );
        return;
      }
      setText(tx);
      run(n0, type, tx);
      setNote(
        t({
          es: "Leído en tu teléfono. Si falta algún ingrediente, corrígelo y vuelve a revisar.",
          en: "Read on your phone. If an ingredient is missing, fix it and check again.",
        }),
      );
    } catch {
      setNote(
        t({
          es: "No pudimos leer la foto. Escribe los ingredientes o prueba un ejemplo.",
          en: "We couldn't read the photo. Type the ingredients or try an example.",
        }),
      );
    } finally {
      setReading(false);
    }
  }

  // A judge preset (/demo) opens this page with a sample label photo to read.
  useEffect(() => {
    let url: string | null = null;
    try {
      url = sessionStorage.getItem("nm.preset.label");
      sessionStorage.removeItem("nm.preset.label");
    } catch {}
    if (!url) return;
    fetch(url)
      .then((res) => res.blob())
      .then((b) => {
        setName("Radiance Night Serum");
        return readPhoto(new File([b], "label.jpg", { type: "image/jpeg" }), "Radiance Night Serum");
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saved = state.checks.find((c) => c.id === savedId);

  return (
    <div>
      <SectionTitle
        kicker={t({ es: `Semana ${week}`, en: `Week ${week}` })}
        title={t({ es: "¿Puedo usar esto?", en: "Can I use this?" })}
        sub={t({
          es: "Toma una foto de la lista de ingredientes (suele estar atrás, en letra pequeña).",
          en: "Take a photo of the ingredient list (usually on the back, in small print).",
        })}
      />

      {labelPreview && <LabelScan src={labelPreview} reading={reading} progress={progress} sample={labelSample} />}
      {!allowed ? (
        <div className="card p-5">
          <p className="font-semibold">
            {t({
              es: `Ya usaste tus ${FREE_CHECKS} revisiones gratis`,
              en: `You've used your ${FREE_CHECKS} free checks`,
            })}
          </p>
          <p className="mt-1 text-sm text-ink-2">
            {t({
              es: "Con el pase de embarazo revisas todos los productos que quieras hasta el parto.",
              en: "With the pregnancy pass you can check every product you want until birth.",
            })}
          </p>
          <Link href="/pase" className="btn btn-primary mt-4">
            {t({ es: "Ver el pase · $9.99", en: "See the pass · $9.99" })}
          </Link>
        </div>
      ) : (
        <div className="card label-checker space-y-4 p-5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && readPhoto(e.target.files[0])
            }
          />
          <button
            className="label-upload"
            onClick={() => fileRef.current?.click()}
            disabled={reading}
          >
            {reading ? (
              `${t({ es: "Leyendo la etiqueta…", en: "Reading the label…" })}${progress > 0 ? ` ${Math.round(progress * 100)}%` : ""}`
            ) : (
              <>
                <span className="label-upload-icon">
                  <CameraIcon width={25} height={25} />
                </span>
                <strong>
                  {t({
                    es: "Tu etiqueta tiene respuestas.",
                    en: "Your label has answers.",
                  })}
                </strong>
                <span>
                  {t({
                    es: "Fotografía la lista de ingredientes",
                    en: "Photograph the ingredient list",
                  })}
                </span>
                <small>
                  {t({
                    es: "Buena luz · Lista completa · Sin reflejos",
                    en: "Good light · Full list · No glare",
                  })}
                </small>
              </>
            )}
          </button>
          {reading && (
            <div
              className="analysis-progress"
              role="progressbar"
              aria-label={t({
                es: "Leyendo ingredientes",
                en: "Reading ingredients",
              })}
            />
          )}
          <p className="label-divider">
            {t({
              es: "O AGREGA TUS INGREDIENTES",
              en: "OR ADD YOUR INGREDIENTS",
            })}
          </p>
          {note && (
            <p className="rounded-xl bg-surface-muted p-3 text-sm">{note}</p>
          )}
          <input
            className="input"
            placeholder={t({
              es: "Nombre del producto (opcional)",
              en: "Product name (optional)",
            })}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as ProductType)}
            aria-label={t({ es: "Tipo de producto", en: "Product type" })}
          >
            {PRODUCT_TYPES.map((p) => (
              <option key={p.id} value={p.id}>
                {t(p.label)}
              </option>
            ))}
          </select>
          <textarea
            className="input min-h-28 text-sm"
            placeholder={t({
              es: "…o escribe o pega los ingredientes, separados por comas",
              en: "…or type or paste the ingredients, comma-separated",
            })}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="btn btn-ghost w-full"
            onClick={() => run()}
            disabled={text.trim().length < 3}
          >
            {t({ es: "Revisar", en: "Check" })}
          </button>
          <details className="text-sm">
            <summary className="cursor-pointer text-ink-2">
              {t({
                es: "¿No tienes un producto a mano? Prueba un ejemplo",
                en: "No product at hand? Try an example",
              })}
            </summary>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.name.es}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:border-brand"
                  onClick={() => {
                    setName(t(ex.name));
                    setType(ex.type);
                    setText(ex.text);
                    run(t(ex.name), ex.type, ex.text);
                  }}
                >
                  {t(ex.name)}
                </button>
              ))}
            </div>
          </details>
        </div>
      )}

      {result && (
        <section id="result" className="ingredient-results mt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <VerdictBadge v={result.verdict} big />
            {saved && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={saved.inUse}
                  onChange={(e) =>
                    update((s) => ({
                      ...s,
                      checks: s.checks.map((c) =>
                        c.id === saved.id
                          ? { ...c, inUse: e.target.checked }
                          : c,
                      ),
                    }))
                  }
                  className="accent-[var(--brand)]"
                />
                {t({ es: "Lo uso ahora", en: "I use it now" })}
              </label>
            )}
          </div>
          {result.matches.map((m, i) => (
            <div
              key={m.entry.id}
              style={{ animationDelay: `${Math.min(i, 8) * 65}ms` }}
              className={`ingredient-result rounded-2xl p-4 ${m.status === "avoid" ? "bg-avoid-tint" : m.status === "caution" ? "bg-caution-tint" : "bg-safe-tint"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{t(m.entry.name)}</p>
                <VerdictBadge v={m.status} item />
              </div>
              <p className="mt-0.5 text-xs text-ink-2">
                {t({ es: "En la etiqueta:", en: "On the label:" })}{" "}
                <i>{m.found}</i>
              </p>
              <p className="mt-2 text-sm leading-relaxed">{t(m.entry.why)}</p>
              {m.entry.firstTrimester && week <= 13 && (
                <p className="mt-1 text-sm font-medium">
                  {t({
                    es: "Esta regla cambia después de la semana 13.",
                    en: "This rule changes after week 13.",
                  })}
                </p>
              )}
              {m.entry.instead && m.status !== "safe" && (
                <p className="mt-2 text-sm">
                  <b>{t({ es: "En su lugar: ", en: "Instead: " })}</b>
                  {t(m.entry.instead)}
                </p>
              )}
              <p className="mt-2 text-[11px] text-ink-2">
                {m.entry.sources.map((s, i) => (
                  <a
                    key={s}
                    href={SOURCES[s].url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2"
                  >
                    {i > 0 && " · "}
                    {SOURCES[s].label.split(" — ")[0].split(".")[0]}
                  </a>
                ))}
              </p>
            </div>
          ))}
          <p className="text-sm text-ink-2">
            {result.verdict === "safe"
              ? t({
                  es: `Revisamos ${result.ingredientCount} ingredientes y ninguno está en nuestra lista de riesgo para el embarazo.`,
                  en: `We checked ${result.ingredientCount} ingredients and none is on our pregnancy risk list.`,
                })
              : t({
                  es: `Los otros ${result.unmatched.length} ingredientes no están en nuestra lista de riesgo.`,
                  en: `The other ${result.unmatched.length} ingredients are not on our risk list.`,
                })}
          </p>
        </section>
      )}

      {state.checks.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">
            {t({ es: "Mis productos", en: "My products" })}
          </h2>
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
            {[...state.checks].reverse().map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="text-xs text-ink-2">
                    {t({ es: `Semana ${c.week}`, en: `Week ${c.week}` })}
                    {c.inUse && ` · ${t({ es: "en uso", en: "in use" })}`}
                  </p>
                </div>
                <VerdictBadge v={c.verdict} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <Disclaimer />
    </div>
  );
}

/** Keep uploads small: long side 1600 px, JPEG. */
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob((b) => res(b!), "image/jpeg", 0.88));
}

export default function Page() {
  return (
    <Ready>
      <Check />
    </Ready>
  );
}
