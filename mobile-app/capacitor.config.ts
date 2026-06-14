import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.way2astro.mobile',
  appName: 'Way2Astro',
  webDir: 'out',
  server: {
    androidScheme: 'http',
    hostname: 'localhost',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge"],
    },
    Keyboard: {
      resize: "native",
      style: "dark",
    },
    SplashScreen: {
      launchShowDuration: 500,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
