// // src/boot/statusBar.ts
// import { Capacitor } from '@capacitor/core';
// import { StatusBar, Style } from '@capacitor/status-bar';

// export async function setupStatusBar() {
//   if (!Capacitor.isNativePlatform()) return;

//   try {
//     // Don’t let the status bar overlap the webview content
//     await StatusBar.setOverlaysWebView({ overlay: false });

//     // Match your app background (helps avoid a seam at the top)
//     await StatusBar.setBackgroundColor({ color: '#0B0B0B' });

//     // Light icons if your top area is dark; switch to .Dark if yours is light
//     await StatusBar.setStyle({ style: Style.Light });
//   } catch (e) {
//     console.error("Status bar error:", e);
//   }
// }