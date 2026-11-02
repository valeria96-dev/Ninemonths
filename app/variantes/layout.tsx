import type { Metadata } from "next";

// Internal design review page: keep it out of search engines.
export const metadata: Metadata = { title: "Ninemonths — Paletas", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
