import type { CapacitorConfig } from '@capacitor/cli';

// Toggle with env; default to remote for dev
const USE_REMOTE = process.env.FLASHLY_USE_REMOTE === 'true' || true; // <- true while you're developing

const config: CapacitorConfig = {
  appId: 'com.avdev.flashly',
  appName: 'Flashly',
  webDir: 'dist', // used in bundled mode
  server: USE_REMOTE
    ? {
        // Remote mode (instant updates)
        url: 'https://flashly-iota.vercel.app/', // try '/index.html' if provisional load ever flakes
        cleartext: false,
        allowNavigation: [
          'flashly-iota.vercel.app',
          '*.vercel.app',
          'flashly-backend.onrender.com',
          '*.onrender.com',
        ],
      }
    : {
        // Bundled mode (offline; for App Review/production)
        iosScheme: 'capacitor',
        hostname: 'localhost',
        androidScheme: 'https',
        allowNavigation: [
          'flashly-backend.onrender.com',
          '*.onrender.com',
        ],
      },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#FDF8EA',
      showSpinner: false,
    },
  },
};

export default config;