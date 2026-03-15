import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tasbeeh.app',
  appName: 'tasbeeh',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
};

export default config;
