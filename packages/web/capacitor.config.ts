import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dev.dataspaceconnect',
  appName: 'dataspace_connect_mobile',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    }
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true,
  }
};

export default config;
