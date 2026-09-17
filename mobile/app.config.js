const fs = require('fs');
const path = require('path');

const versionStatePath = path.join(__dirname, 'build-version.json');
const versionState = JSON.parse(fs.readFileSync(versionStatePath, 'utf8'));
const [year, month] = versionState.month.split('-').map(Number);
// MANUAL_BUILD_VERSION di-set oleh workflow GitHub Actions manual
// (.github/workflows/build-apk-manual.yml, format vYY.MM.urutan).
// Jalur EAS Build (eas-build-pre-install) tidak mengeset env ini,
// jadi skema versi EAS lama tetap tidak berubah.
const appVersion = process.env.MANUAL_BUILD_VERSION || `${year}.${month}.${versionState.build}`;
const sentryDsn =
  'https://f1723103ea0cc6b4a9f8c5d68b4988ee@o4512092717121536.ingest.us.sentry.io/4512092731670528';

module.exports = {
  expo: {
    name: 'Aumo',
    slug: 'reactnative',
    scheme: 'aumomobile',
    version: appVersion,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    android: {
      package: 'com.rdmmoonlight.aumo',
      minSdkVersion: 28,
      targetSdkVersion: 34,
      permissions: ['INTERNET', 'REQUEST_INSTALL_PACKAGES'],
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: {
        projectId: 'd6be87c0-882a-4c24-aa65-db6806b9f59a',
      },
      sentryDsn,
    },
    owner: 'obscuron',
    plugins: [
      'expo-router',
      [
        'sentry-expo',
        {
          organization: 'blue-and-rich-corporation',
          project: 'react-native',
        },
      ],
      ['./plugins/withSentryNative', { dsn: sentryDsn }],
    ],
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/d6be87c0-882a-4c24-aa65-db6806b9f59a',
      enabled: true,
      checkAutomatically: 'NEVER',
      fallbackToCacheTimeout: 0,
    },
  },
};
