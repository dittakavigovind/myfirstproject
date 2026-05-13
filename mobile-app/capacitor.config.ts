import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.way2astro.mobile',
  appName: 'way2astro-mobile',
  webDir: 'out',
  server: {
    androidScheme: 'http',
    hostname: 'localhost'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: "native",
      style: "dark",
    },
  },
};

export default config;
