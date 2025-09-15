// src/Boot.tsx
import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { Capacitor } from "@capacitor/core";

export default function Boot({ children }: PropsWithChildren) {
  useEffect(() => {
    (async () => {
      try {
        // Only try to hide splash on a native platform
        if (Capacitor.isNativePlatform()) {
          const { SplashScreen } = await import("@capacitor/splash-screen");
          // Allow one frame for the first paint, then hide splash
          requestAnimationFrame(() => {
            SplashScreen.hide().catch(() => {});
          });
        }
      } catch {
        // Running on web or plugin unavailable — ignore
      }
    })();
  }, []);

  return <>{children}</>;
}