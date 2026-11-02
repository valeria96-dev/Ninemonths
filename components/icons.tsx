import type { SVGProps } from "react";

// Hand-drawn line icons: 24×24, 1.6 stroke, round caps — the family style
// Size comes from the parent.

type P = SVGProps<SVGSVGElement>;
const base = (p: P): P => ({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", width: 22, height: 22, "aria-hidden": true, ...p });

export const HomeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1Z" />
  </svg>
);

/** A bottle with a label: "check a product". */
export const BottleIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M10 2.5h4M10.5 2.5v3M13.5 2.5v3" />
    <path d="M9 5.5h6a2 2 0 0 1 2 2V19a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 19V7.5a2 2 0 0 1 2-2Z" />
    <path d="M7 11h10M7 16h10" />
  </svg>
);

/** Face outline with a scan corner: "my skin". */
export const FaceIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 8V5.5a2 2 0 0 1 2-2H8M16 3.5h2.5a2 2 0 0 1 2 2V8M20.5 16v2.5a2 2 0 0 1-2 2H16M8 20.5H5.5a2 2 0 0 1-2-2V16" />
    <path d="M12 6.5c-2.8 0-4.5 2-4.5 5 0 3.2 2 6 4.5 6s4.5-2.8 4.5-6c0-3-1.7-5-4.5-5Z" />
    <circle cx="10.3" cy="11.2" r=".6" fill="currentColor" stroke="none" />
    <circle cx="13.7" cy="11.2" r=".6" fill="currentColor" stroke="none" />
  </svg>
);

/** Heart with a pulse line: "symptoms". */
export const PulseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20s-7.5-4.6-8.6-10.1C2.7 6.3 5 4 7.6 4c1.9 0 3.4 1 4.4 2.6C13 5 14.5 4 16.4 4 19 4 21.3 6.3 20.6 9.9 19.5 15.4 12 20 12 20Z" />
    <path d="M6 11.5h3l1.5-2.5 2 5 1.5-2.5H18" />
  </svg>
);

/** Moon and sparkle: "routine". */
export const RoutineIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" />
    <path d="M17 3.5v3M15.5 5h3" />
  </svg>
);

export const SunIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </svg>
);

export const CameraIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5Z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </svg>
);

export const UploadIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" />
    <path d="M4.5 14.5v3a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-3" />
  </svg>
);

export const ClipboardIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="4.5" width="14" height="16.5" rx="3" />
    <path d="M9 4.5V4a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4v.5" />
    <path d="M8.5 10h7M8.5 13.5h7M8.5 17h4" />
  </svg>
);

export const ShieldIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
);

export const SparkleIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z" />
    <path d="M18.5 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5Z" />
  </svg>
);

export const LockIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="10.5" width="14" height="10" rx="3" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </svg>
);

export const ArrowIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const CheckIcon = (p: P) => (
  <svg {...base({ strokeWidth: 2.2, ...p })}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const AlertIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4 2.8 19.5h18.4Z" />
    <path d="M12 10v4.5" />
    <circle cx="12" cy="17" r=".7" fill="currentColor" stroke="none" />
  </svg>
);

export const BookIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 5.5A2 2 0 0 1 6.5 3.5H19v14H6.5a2 2 0 0 0-2 2Z" />
    <path d="M4.5 19.5a2 2 0 0 0 2 2H19v-4" />
  </svg>
);
