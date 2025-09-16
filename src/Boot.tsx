
// src/Boot.tsx
import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { Capacitor } from "@capacitor/core";

export default function Boot({ children }: PropsWithChildren) {
  useEffect(() => {
    (async () => {
      try {
        if (!Capacitor.isNativePlatform()) return;
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setOverlaysWebView({ overlay: true });
        await StatusBar.setStyle({ style: Style.Dark }); // try Style.Light if your top is darker
        console.log("[statusbar] overlay=true + style set");
      } catch (e) {
        console.log("[statusbar] error", e);
      }
    })();
  }, []);

  return <>{children}</>;
}