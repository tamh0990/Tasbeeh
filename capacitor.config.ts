import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.harbi.tasbeeh',
  appName: 'مسبحة',
  webDir: 'dist/public',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#1a4731',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'Default',
    },
  },
};

export default config;
