"use client";

import { useId, type CSSProperties } from "react";
import { useLang } from "@/lib/i18n";
import { ZONES, ZONE_LABEL, type ZoneId } from "@/lib/skin/types";

/** Editorial artwork and schematic zones. Never presented as a clinical scan. */
export function SkinPortrait({ compact = false }: { compact?: boolean }) {
  const { t } = useLang();
  return (
    <div className={`skin-portrait ${compact ? "skin-portrait-compact" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/skin-sculpture.webp"
        alt={t({
          es: "Ilustración escultórica de un rostro",
          en: "Sculptural illustration of a face",
        })}
        width={800}
        height={1000}
        fetchPriority={compact ? "auto" : "high"}
      />
      <div className="portrait-vignette" />
      <svg
        className="portrait-overlay"
        viewBox="0 0 400 500"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M95 118V94h24M281 94h24v24M95 323v24h24M281 347h24v-24"
          stroke="white"
          strokeWidth="1.4"
          opacity=".8"
        />
        <ellipse
          cx="200"
          cy="211"
          rx="83"
          ry="115"
          stroke="white"
          strokeDasharray="3 7"
          opacity=".4"
        />
        <path
          d="m152 185 48-49 48 49-12 63h-72Zm12 63 36 60 36-60M152 185l84 63M248 185l-84 63M200 136v172"
          stroke="white"
          strokeWidth=".6"
          opacity=".28"
        />
        {[
          [200, 155],
          [146, 229],
          [254, 229],
          [200, 268],
          [200, 297],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r={i === 0 ? 22 : 17}
              fill="#e9c3b8"
              fillOpacity=".18"
              stroke="#fff0de"
              strokeDasharray="2 3"
            />
            <circle cx={cx} cy={cy} r="3" fill="white" />
          </g>
        ))}
        <g className="scan-sweep">
          <path d="M96 110h208" stroke="#fff" strokeWidth="1.2" />
          <path d="M96 110h208v20H96z" fill="white" fillOpacity=".08" />
        </g>
      </svg>
      {!compact && (
        <div className="portrait-caption">
          <span className="status-pip" />
          {t({
            es: "ILUSTRACIÓN · 5 ZONAS FACIALES",
            en: "ILLUSTRATION · 5 FACIAL ZONES",
          })}
        </div>
      )}
    </div>
  );
}

const LOCATIONS: Record<ZoneId, [number, number, number, number]> = {
  forehead: [100, 63, 30, 18],
  cheekL: [65, 112, 19, 15],
  cheekR: [135, 112, 19, 15],
  upperLip: [100, 138, 15, 7],
  chin: [100, 162, 19, 10],
};

export function ZoneFace({
  values,
}: {
  values?: Partial<Record<ZoneId, number>>;
}) {
  const id = useId();
  const { t } = useLang();
  return (
    <svg
      viewBox="0 0 200 210"
      className="zone-face"
      role="img"
      aria-label={t({
        es: "Esquema de pigmentación por zona facial",
        en: "Pigmentation schematic by facial zone",
      })}
    >
      <defs>
        <linearGradient id={id} x2="0" y2="1">
          <stop stopColor="var(--tint-1)" />
          <stop offset="1" stopColor="var(--tint-2)" />
        </linearGradient>
      </defs>
      <path
        d="M48 80C45 25 65 16 100 16s55 9 52 64l-7 49c-4 30-30 61-45 61s-41-31-45-61Z"
        fill={`url(#${id})`}
        stroke="var(--tint-1-line)"
        strokeWidth="1.5"
      />
      <path
        d="M65 91q10-7 21 0m28 0q10-7 21 0M100 99l-6 22h12M87 149q13 6 26 0"
        fill="none"
        stroke="var(--brand-deep)"
        strokeWidth="1.5"
        opacity=".4"
        strokeLinecap="round"
      />
      {ZONES.map((z) => {
        const [cx, cy, rx, ry] = LOCATIONS[z];
        const v = values?.[z];
        return (
          <g key={z}>
            <title>{`${t(ZONE_LABEL[z])}: ${v ?? "—"}`}</title>
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="var(--brand)"
              fillOpacity={
                v == null ? 0.08 : 0.12 + Math.min(100, Math.max(0, v)) / 150
              }
              stroke="var(--brand)"
              strokeOpacity=".25"
              strokeDasharray="2 3"
            />
            {v != null && (
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={v > 55 ? "white" : "var(--brand-deep)"}
              >
                {v}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function Sparkline({
  values,
  className = "",
}: {
  values: number[];
  className?: string;
}) {
  const id = useId();
  const W = 400,
    H = 130,
    P = 10;
  const max = Math.max(50, ...values) + 10;
  const point = (v: number, i: number) => [
    P + (i * (W - P * 2)) / Math.max(1, values.length - 1),
    H - P - (v / max) * (H - P * 2),
  ];
  const pts = values.map(point);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`sparkline ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x2="0" y2="1">
          <stop stopColor="var(--brand)" stopOpacity=".2" />
          <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 70, 110].map((y) => (
        <line
          key={y}
          x1="0"
          x2={W}
          y1={y}
          y2={y}
          stroke="var(--line)"
          strokeDasharray="4 5"
        />
      ))}
      {pts.length > 1 && (
        <path
          d={`${d}L${pts.at(-1)![0]},${H}L${P},${H}Z`}
          fill={`url(#${id})`}
        />
      )}
      <path
        className="chart-line"
        d={d}
        pathLength="1"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="4"
          fill="var(--surface)"
          stroke="var(--brand)"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export function ScoreRing({
  value,
  size = 56,
}: {
  value?: number;
  size?: number;
}) {
  return (
    <div
      className="score-ring"
      style={
        {
          "--score": Math.max(0, Math.min(100, value ?? 0)),
          width: size,
          height: size,
        } as CSSProperties
      }
    >
      <span>{value ?? "—"}</span>
    </div>
  );
}
