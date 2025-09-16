// // src/Boot.tsx
// import { useEffect } from "react";
// import type { PropsWithChildren } from "react";
// import { Capacitor } from "@capacitor/core";

// export default function Boot({ children }: PropsWithChildren) {
//   useEffect(() => {
//     (async () => {
//       try {
//         if (Capacitor.isNativePlatform()) {
//           const { StatusBar, Style } = await import("@capacitor/status-bar");

//           // Let web content extend under the status bar
//           await StatusBar.setOverlaysWebView({ overlay: true });

//           // >>> THIS WAS MISSING – makes the bar actually transparent
//           await StatusBar.setBackgroundColor({ color: "transparent" });

//           // Pick text/icon color that contrasts your top background
//           await StatusBar.setStyle({ style: Style.Dark }); // or Style.Light if your header is dark
//         }
//       } catch {
//         /* noop on web */
//       }
//     })();
//   }, []);

//   return <>{children}</>;
// }

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