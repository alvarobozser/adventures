import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moiradante.game',
  appName: 'Moira & Dante Adventures',
  webDir: 'dist/phaser-ionic-game/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    CapacitorStatusBar: {
      style: 'dark',
      overlaysWebView: true
    }
  },
  android: {
    backgroundColor: "#000000"
  }
};

export default config;