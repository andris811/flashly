// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const USE_REMOTE = process.env.FLASHLY_USE_REMOTE === 'true';

const config: CapacitorConfig = {
  appId: 'com.avdev.flashly',
  appName: 'Flashly',
  webDir: 'dist', // used when bundled
  server: USE_REMOTE
    ? {
        // Remote mode (loads from Vercel)
        url: 'https://flashly-iota.vercel.app/',
        cleartext: false,
        allowNavigation: [
          'flashly.vercel.app',
          '*.vercel.app',
          'flashly-api.onrender.com',
          '*.onrender.com',
        ],
      }
    : {
        // Bundled mode (offline; for review/production)
        iosScheme: 'capacitor',
        hostname: 'localhost',
        androidScheme: 'https',
        allowNavigation: [
          'flashly-api.onrender.com',
          '*.onrender.com',
        ],
      },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#0B0B0B',
      showSpinner: false,
    },
  },
};

export default config;