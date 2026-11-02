import type { L } from "@/lib/i18n";
import type { Profile, Scan } from "@/lib/store";

// The routine names ingredients to look for, never brands: she can match it
// against what she already owns (checked products) or buys at her pharmacy.

export type Step = { when: "am" | "pm" | "body"; title: L; look: L; why: L };

export function buildPlan(profile: Profile, latest: Scan | undefined, week: number): Step[] {
  const zoneVals = latest ? Object.values(latest.zones).filter((n): n is number => n != null) : [];
  const zoneMax = zoneVals.length ? Math.max(...zoneVals) : 0;
  const spots = profile.concerns.includes("spots") || (latest?.scores.age_spot ?? 100) < 70 || zoneMax >= 40;
  const acne = profile.concerns.includes("acne") || (latest?.scores.acne ?? 100) < 70;
  const dry = profile.concerns.includes("dryness") || (latest?.scores.moisture ?? 100) < 60;
  const darkerSkin = ["IV", "V", "VI"].includes(profile.fitzpatrick ?? "");

  const steps: Step[] = [
    {
      when: "am",
      title: { es: "Limpiador suave", en: "Gentle cleanser" },
      look: acne
        ? { es: "Con peróxido de benzoilo (o ácido salicílico, porque se enjuaga)", en: "With benzoyl peroxide (or salicylic acid, since it rinses off)" }
        : { es: "Sin fragancia, pH suave", en: "Fragrance-free, gentle pH" },
      why: { es: "La piel en el embarazo está más sensible.", en: "Pregnancy skin is more sensitive." },
    },
  ];
  if (spots)
    steps.push({
      when: "am",
      title: { es: "Antioxidante", en: "Antioxidant" },
      look: { es: "Vitamina C o niacinamida", en: "Vitamin C or niacinamide" },
      why: { es: "Ayudan a que las manchas no se oscurezcan más.", en: "They help keep dark patches from deepening." },
    });
  steps.push({
    when: "am",
    title: { es: "Protector solar mineral SPF 50 — el paso más importante", en: "Mineral sunscreen SPF 50 — the most important step" },
    look: darkerSkin || spots
      ? { es: "Óxido de zinc u óxido de hierro (con color): el óxido de hierro también bloquea la luz visible que oscurece el melasma", en: "Zinc oxide or iron oxides (tinted): iron oxides also block the visible light that darkens melasma" }
      : { es: "Óxido de zinc o dióxido de titanio", en: "Zinc oxide or titanium dioxide" },
    why: { es: "El sol es lo que más empeora el melasma. Reaplica cada 2 horas si estás afuera.", en: "Sun is what worsens melasma most. Reapply every 2 hours outdoors." },
  });
  if (dry || spots || acne)
    steps.push({
      when: "pm",
      title: spots || acne ? { es: "Tratamiento de noche", en: "Night treatment" } : { es: "Hidratante de noche", en: "Night moisturiser" },
      look:
        spots || acne
          ? { es: "Ácido azelaico (15–20%): sirve para manchas y acné y es de las opciones más seguras en el embarazo", en: "Azelaic acid (15–20%): works on spots and acne and is among the safest pregnancy options" }
          : { es: "Ceramidas, glicerina o ácido hialurónico", en: "Ceramides, glycerin or hyaluronic acid" },
      why: { es: "Reemplaza a los retinoides y la hidroquinona, que se evitan en el embarazo.", en: "It replaces retinoids and hydroquinone, which are avoided in pregnancy." },
    });
  // Skip the generic moisturiser when the night step already is one.
  if (spots || acne || !dry) steps.push({
    when: "pm",
    title: { es: "Hidratante", en: "Moisturiser" },
    look: { es: "Ceramidas o glicerina, sin fragancia", en: "Ceramides or glycerin, fragrance-free" },
    why: { es: "Una piel bien hidratada se irrita menos.", en: "Well-hydrated skin gets irritated less." },
  });
  steps.push({
    when: "body",
    title: { es: "Crema corporal en abdomen, caderas y pechos", en: "Body cream on belly, hips and breasts" },
    look: { es: "Cualquier crema hidratante segura; la más barata funciona igual", en: "Any safe moisturiser; the cheapest works just as well" },
    why:
      week >= 20
        ? { es: "Alivia la picazón de la piel estirada. Ninguna crema ha demostrado evitar estrías: no pagues más por esa promesa.", en: "It eases itching from stretched skin. No cream has been shown to prevent stretch marks: don't pay extra for that promise." }
        : { es: "Mantener la piel hidratada desde ahora reduce la picazón más adelante.", en: "Keeping skin moisturised now reduces itching later." },
  });
  return steps;
}
