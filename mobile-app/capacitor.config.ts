import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.way2astro.mobile',
  appName: 'way2astro-mobile',
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
  },
};

export default config;
