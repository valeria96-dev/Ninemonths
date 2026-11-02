import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ninemonths — For judges",
  description: "Three one-click walkthroughs of Ninemonths: weekly melasma tracking with YouCam AI, label safety check, symptom triage.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
