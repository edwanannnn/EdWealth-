import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.edwealth.tracker',
  appName: 'EdWealth',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
