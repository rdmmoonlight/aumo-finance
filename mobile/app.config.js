const fs = require('fs');
const path = require('path');

// Baca angka urutan build bulan ini dari build-version.json (dinaikkan
// oleh scripts/bump-build-number.js lewat "npm run build:android",
// BUKAN di sini - supaya file ini aman dievaluasi berkali-kali tanpa
// ikut menaikkan angkanya).
const versionStatePath = path.join(__dirname, 'build-version.json');
const versionState = JSON.parse(fs.readFileSync(versionStatePath, 'utf8'));
const [year, month] = versionState.month.split('-').map(Number);
const appVersion = `${year}.${month}.${versionState.build}`;
const sentryDsn =
  'https://f1723103ea0cc6b4a9f8c5d68b4988ee@o4512092717121536.ingest.us.sentry.io/4512092731670528';

module.exports = {
  expo: {
    name: 'Aumo Mobile',
    slug: 'reactnative',
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
      package: 'com.rdmmoonlight.aumomobile',
      minSdkVersion: 28,
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
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
    },
  },
};
