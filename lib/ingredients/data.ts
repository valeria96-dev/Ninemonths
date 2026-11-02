import type { L } from "@/lib/i18n";

// The ingredient safety list. Every entry cites at least one published source
// (SOURCES below). The list is deliberately conservative where evidence is
// thin: "caution" means "limited data, ask your doctor", never "dangerous".
// Anything not listed is reported as "not on our risk list", not as "safe".
//
// Patterns run against a normalised ingredient name: lowercase, no accents,
// single spaces. Watch for false friends: "ethylhexyl salicylate" is a
// sunscreen filter, not salicylic acid, and "BHA" on a label is usually the
// antioxidant butylated hydroxyanisole, not beta-hydroxy acid.

export type Status = "safe" | "caution" | "avoid";

export type ProductType = "rinse" | "leave" | "sunscreen" | "peel" | "hairdye" | "straightener" | "body" | "other";

export const PRODUCT_TYPES: Array<{ id: ProductType; label: L }> = [
  { id: "leave", label: { es: "Crema o sérum (se queda en la piel)", en: "Cream or serum (stays on)" } },
  { id: "rinse", label: { es: "Limpiador o champú (se enjuaga)", en: "Cleanser or shampoo (rinsed off)" } },
  { id: "sunscreen", label: { es: "Protector solar", en: "Sunscreen" } },
  { id: "body", label: { es: "Crema o aceite corporal / antiestrías", en: "Body cream or oil / stretch marks" } },
  { id: "peel", label: { es: "Peeling o exfoliante fuerte", en: "Peel or strong exfoliant" } },
  { id: "hairdye", label: { es: "Tinte de cabello", en: "Hair dye" } },
  { id: "straightener", label: { es: "Alisado o keratina", en: "Hair straightening / keratin" } },
  { id: "other", label: { es: "Otro", en: "Other" } },
];

export type SourceId = "acog" | "aad" | "bozzo" | "murase" | "cochrane" | "rcog";

export const SOURCES: Record<SourceId, { label: string; url: string }> = {
  acog: { label: "ACOG — Skin Conditions During Pregnancy (FAQ)", url: "https://www.acog.org/womens-health/faqs/skin-conditions-during-pregnancy" },
  aad: { label: "American Academy of Dermatology — Acne treatment in pregnancy", url: "https://www.aad.org/public/diseases/acne/derm-treat/pregnancy" },
  bozzo: { label: "Bozzo et al. Safety of skin care products during pregnancy. Can Fam Physician 2011", url: "https://pubmed.ncbi.nlm.nih.gov/21673209/" },
  murase: { label: "Murase et al. Safety of dermatologic medications in pregnancy. J Am Acad Dermatol 2014", url: "https://pubmed.ncbi.nlm.nih.gov/24528911/" },
  cochrane: { label: "Brennan et al. Topical preparations for preventing stretch marks in pregnancy. Cochrane 2012", url: "https://pubmed.ncbi.nlm.nih.gov/23152199/" },
  rcog: { label: "RCOG Green-top Guideline 43 — Intrahepatic cholestasis of pregnancy", url: "https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/intrahepatic-cholestasis-of-pregnancy-green-top-guideline-no-43/" },
};

export type Entry = {
  id: string;
  name: L;
  patterns: RegExp[];
  status: Status;
  /** Product-type overrides, e.g. salicylic acid in a rinse-off cleanser. */
  byType?: Partial<Record<ProductType, Status>>;
  /** First-trimester override (the only rule here that depends on the week). */
  firstTrimester?: Status;
  why: L;
  instead?: L;
  sources: SourceId[];
};

export const ENTRIES: Entry[] = [
  // ── Avoid ──────────────────────────────────────────────────────────────
  {
    id: "retinoids",
    name: { es: "Retinoides (retinol, tretinoína, adapaleno…)", en: "Retinoids (retinol, tretinoin, adapalene…)" },
    patterns: [/\bretin(ol|al|oic|oate|yl)/, /tretinoin/, /adapalen/, /tazaroten/, /trifaroten/, /isotretinoin/, /acido retinoico/, /palmitato de retinilo/],
    status: "avoid",
    why: {
      es: "Los retinoides orales causan malformaciones; los de crema se absorben poco, pero por precaución las guías recomiendan no usarlos durante todo el embarazo.",
      en: "Oral retinoids cause birth defects; creams absorb little, but guidelines advise avoiding them throughout pregnancy as a precaution.",
    },
    instead: { es: "Para manchas, acné o arrugas: ácido azelaico, niacinamida o vitamina C.", en: "For spots, acne or wrinkles: azelaic acid, niacinamide or vitamin C." },
    sources: ["acog", "aad", "bozzo", "murase"],
  },
  {
    id: "hydroquinone",
    name: { es: "Hidroquinona", en: "Hydroquinone" },
    patterns: [/hydroquinon/, /hidroquinon/],
    status: "avoid",
    why: {
      es: "Es el despigmentante clásico para manchas, pero se absorbe mucho más que otros ingredientes (cerca de un tercio). Con pocos datos en embarazo, lo prudente es esperar.",
      en: "It is the classic spot-lightener, but it absorbs far more than most ingredients (around a third). With little pregnancy data, the prudent choice is to wait.",
    },
    instead: { es: "Ácido azelaico y protector solar mineral todos los días.", en: "Azelaic acid and mineral sunscreen every day." },
    sources: ["bozzo", "murase"],
  },
  {
    id: "formaldehyde",
    name: { es: "Formaldehído (alisados tipo keratina)", en: "Formaldehyde (keratin-type straighteners)" },
    patterns: [/formaldehyd/, /methylene glycol/, /metilenglicol/, /formalin/, /formol/],
    status: "avoid",
    why: {
      es: "Se libera como gas al aplicar calor en los alisados; es irritante y se inhala. Mejor posponer estos tratamientos hasta después del parto.",
      en: "It is released as a gas when heat is applied in straightening treatments; it is irritating and inhaled. Better to postpone these treatments until after birth.",
    },
    sources: ["bozzo"],
  },
  {
    id: "minoxidil",
    name: { es: "Minoxidil (caída del cabello)", en: "Minoxidil (hair loss)" },
    patterns: [/minoxidil/],
    status: "avoid",
    why: {
      es: "No se recomienda en el embarazo. La caída del cabello suele llegar después del parto y es temporal.",
      en: "Not recommended in pregnancy. Hair shedding usually comes after birth and is temporary.",
    },
    sources: ["murase"],
  },
  {
    id: "oral-acne",
    name: { es: "Tetraciclinas o espironolactona (medicamentos para acné)", en: "Tetracyclines or spironolactone (acne medicines)" },
    patterns: [/doxycyclin/, /doxiciclin/, /minocyclin/, /minociclin/, /tetracyclin/, /tetraciclin/, /spironolacton/, /espironolacton/],
    status: "avoid",
    why: {
      es: "Son medicamentos, no cosméticos: las tetraciclinas afectan los dientes y huesos del bebé y la espironolactona actúa sobre hormonas. Habla con tu médico antes de seguir tomándolos.",
      en: "These are medicines, not cosmetics: tetracyclines affect the baby's teeth and bones and spironolactone acts on hormones. Talk to your doctor before continuing them.",
    },
    sources: ["aad", "murase"],
  },
  // ── Caution ────────────────────────────────────────────────────────────
  {
    id: "salicylic",
    name: { es: "Ácido salicílico", en: "Salicylic acid" },
    patterns: [/\bsalicylic acid\b/, /acido salicilico/, /beta hydroxy acid/],
    status: "caution",
    byType: { rinse: "safe", peel: "avoid", body: "caution" },
    why: {
      es: "En limpiadores que se enjuagan está bien. En cremas que se quedan, mejor en zonas pequeñas. Los peelings de salicílico y las dosis altas se evitan.",
      en: "Fine in rinse-off cleansers. In leave-on creams, keep it to small areas. Salicylic peels and high doses are avoided.",
    },
    instead: { es: "Para acné: peróxido de benzoilo o ácido azelaico.", en: "For acne: benzoyl peroxide or azelaic acid." },
    sources: ["acog", "aad", "bozzo"],
  },
  {
    id: "oxybenzone",
    name: { es: "Oxibenzona (filtro solar químico)", en: "Oxybenzone (chemical sunscreen filter)" },
    patterns: [/oxybenzone/, /oxibenzona/, /benzophenone 3/, /benzofenona 3/],
    status: "caution",
    why: {
      es: "Se absorbe en la piel y hay dudas sin resolver sobre efectos hormonales. No es una alarma: simplemente existen protectores mejores para el embarazo.",
      en: "It is absorbed through the skin and there are unresolved questions about hormonal effects. Not an alarm: there are simply better sunscreens for pregnancy.",
    },
    instead: { es: "Protector mineral con óxido de zinc o dióxido de titanio, SPF 50.", en: "Mineral sunscreen with zinc oxide or titanium dioxide, SPF 50." },
    sources: ["bozzo"],
  },
  {
    id: "hair-dye",
    name: { es: "Tinte permanente (PPD y similares)", en: "Permanent dye (PPD and similar)" },
    patterns: [/phenylenediamine/, /fenilendiamina/, /\bppd\b/, /toluene 2 5 diamine/, /aminophenol/],
    status: "safe",
    firstTrimester: "caution",
    why: {
      es: "Se absorbe muy poco y no se ha relacionado con daño al bebé. Por prudencia, muchas guías sugieren esperar a la semana 13 y teñir en un lugar ventilado.",
      en: "Very little is absorbed and it has not been linked to harm. As a precaution many guides suggest waiting until week 13 and dyeing in a ventilated room.",
    },
    sources: ["bozzo"],
  },
  {
    id: "formaldehyde-releasers",
    name: { es: "Conservantes que liberan formaldehído", en: "Formaldehyde-releasing preservatives" },
    patterns: [/dmdm hydantoin/, /imidazolidinyl urea/, /diazolidinyl urea/, /quaternium 15/, /bronopol/, /2 bromo 2 nitropropane/, /sodium hydroxymethylglycinate/],
    status: "caution",
    why: {
      es: "En cremas liberan cantidades mínimas; no hay evidencia de daño, pero si tienes opción, elige otro producto.",
      en: "In creams they release tiny amounts; there is no evidence of harm, but if you have the choice, pick another product.",
    },
    sources: ["bozzo"],
  },
  {
    id: "essential-oils",
    name: { es: "Aceites esenciales concentrados", en: "Concentrated essential oils" },
    patterns: [/rosmarinus/, /salvia (officinalis|sclarea)/, /\bclary sage\b/, /mentha piperita/, /peppermint oil/, /eucalyptus/, /cinnamomum/, /juniperus/, /essential oil/, /aceite esencial/],
    status: "caution",
    why: {
      es: "Hay muy pocos estudios en embarazo. En cantidades pequeñas dentro de una crema suelen estar bien; los aceites puros o muy concentrados, mejor no.",
      en: "There are very few pregnancy studies. Small amounts inside a cream are usually fine; pure or highly concentrated oils, better not.",
    },
    sources: ["bozzo"],
  },
  {
    id: "limited-data-lighteners",
    name: { es: "Aclarantes con pocos datos (kójico, arbutina, tranexámico)", en: "Lighteners with little data (kojic, arbutin, tranexamic)" },
    patterns: [/kojic/, /kojico/, /arbutin/, /tranexamic/, /tranexamico/],
    status: "caution",
    why: {
      es: "No hay estudios suficientes en embarazo. La arbutina se transforma en parte en hidroquinona. Pregunta a tu dermatólogo antes de usarlos.",
      en: "There are not enough pregnancy studies. Arbutin partly converts into hydroquinone. Ask your dermatologist before using them.",
    },
    instead: { es: "Ácido azelaico, niacinamida o vitamina C.", en: "Azelaic acid, niacinamide or vitamin C." },
    sources: ["murase"],
  },
  {
    id: "bakuchiol",
    name: { es: "Bakuchiol", en: "Bakuchiol" },
    patterns: [/bakuchiol/],
    status: "caution",
    why: {
      es: "Se vende como 'retinol natural', pero casi no hay datos en embarazo. Mejor consultarlo.",
      en: "It is sold as 'natural retinol', but there is almost no pregnancy data. Better to ask first.",
    },
    sources: ["murase"],
  },
  {
    id: "strong-acids",
    name: { es: "Peelings fuertes (TCA, fenol)", en: "Strong peels (TCA, phenol)" },
    patterns: [/trichloroacetic/, /tricloroacetico/, /\bphenol\b/, /\bfenol\b/],
    status: "avoid",
    why: { es: "Son tratamientos agresivos que no se recomiendan en el embarazo.", en: "These are aggressive treatments not recommended in pregnancy." },
    sources: ["murase"],
  },
  // ── Safe (shown so she sees why her product passed) ────────────────────
  {
    id: "azelaic",
    name: { es: "Ácido azelaico", en: "Azelaic acid" },
    patterns: [/azelaic/, /azelaico/],
    status: "safe",
    why: { es: "De las mejores opciones en el embarazo para manchas y acné.", en: "One of the best pregnancy options for dark spots and acne." },
    sources: ["acog", "aad", "murase"],
  },
  {
    id: "benzoyl",
    name: { es: "Peróxido de benzoilo", en: "Benzoyl peroxide" },
    patterns: [/benzoyl peroxide/, /peroxido de benzoilo/],
    status: "safe",
    why: { es: "Se absorbe muy poco; las guías lo consideran una opción para el acné en el embarazo.", en: "Very little is absorbed; guidelines consider it an option for acne in pregnancy." },
    sources: ["acog", "aad"],
  },
  {
    id: "aha",
    name: { es: "Ácido glicólico o láctico", en: "Glycolic or lactic acid" },
    patterns: [/glycolic acid/, /acido glicolico/, /lactic acid/, /acido lactico/, /mandelic acid/, /acido mandelico/],
    status: "safe",
    byType: { peel: "caution" },
    why: {
      es: "En concentraciones de uso diario están bien. Los peelings fuertes, mejor consultarlos.",
      en: "Fine at everyday concentrations. Strong peels, better to ask first.",
    },
    sources: ["acog", "bozzo"],
  },
  {
    id: "mineral-filters",
    name: { es: "Óxido de zinc / dióxido de titanio", en: "Zinc oxide / titanium dioxide" },
    patterns: [/zinc oxide/, /oxido de zinc/, /titanium dioxide/, /dioxido de titanio/],
    status: "safe",
    why: { es: "Filtros minerales: se quedan en la superficie. Son el protector ideal en el embarazo.", en: "Mineral filters stay on the surface. The ideal sunscreen in pregnancy." },
    sources: ["bozzo"],
  },
  {
    id: "vitamins",
    name: { es: "Vitamina C, niacinamida, ácido hialurónico", en: "Vitamin C, niacinamide, hyaluronic acid" },
    patterns: [/ascorbic/, /ascorbico/, /ascorbyl/, /niacinamide/, /niacinamida/, /hyaluron/, /hialuron/],
    status: "safe",
    why: { es: "Sin riesgo conocido en el embarazo. La vitamina C también ayuda con las manchas.", en: "No known pregnancy risk. Vitamin C also helps with dark spots." },
    sources: ["bozzo"],
  },
  {
    id: "body-butters",
    name: { es: "Manteca de cacao o karité, centella, aceites vegetales", en: "Cocoa or shea butter, centella, plant oils" },
    patterns: [/theobroma cacao/, /butyrospermum/, /shea butter/, /karite/, /centella/, /prunus amygdalus/, /almond oil/, /simmondsia/, /argania/, /rosa (canina|moschata|rubiginosa)/],
    status: "safe",
    why: {
      es: "Son seguras e hidratan, lo que alivia la picazón. Pero ojo: ningún estudio ha demostrado que eviten las estrías.",
      en: "Safe and moisturising, which eases itching. But note: no study has shown they prevent stretch marks.",
    },
    sources: ["cochrane"],
  },
];
