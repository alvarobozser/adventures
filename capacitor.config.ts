import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moiradante.game',
  appName: 'Moira & Dante Adventures',
  webDir: 'dist/phaser-ionic-game/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;