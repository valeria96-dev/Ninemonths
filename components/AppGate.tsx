"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell, Loading } from "@/components/ui";
import { useAppState } from "@/lib/store";

/**
 * The app pages need the on-device profile, which only exists in the browser.
 * The shell always renders its page (so Next can prerender the segment); each
 * page wraps its body in <Ready>, which waits for the profile.
 */
export function AppGate({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  const router = useRouter();
  useEffect(() => {
    if (state && !state.profile) router.replace("/empezar");
  }, [state, router]);

  return <AppShell>{children}</AppShell>;
}

export function Ready({ children }: { children: React.ReactNode }) {
  const state = useAppState();
  return state?.profile ? children : <Loading />;
}
