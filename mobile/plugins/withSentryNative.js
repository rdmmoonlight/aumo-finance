const { withAndroidManifest, withAppBuildGradle } = require('@expo/config-plugins');

// Autolinking @sentry/react-native gagal diam-diam di project ini (dicek
// langsung dari APK hasil build: tidak ada libsentry.so ataupun class
// io.sentry.* sama sekali di classes.dex, padahal kode JS-nya sudah ikut
// ter-bundle). Daripada bergantung pada autolinking yang bermasalah itu,
// plugin ini pasang native Sentry Android SDK secara langsung dan
// deklaratif: dependency Gradle + meta-data DSN di AndroidManifest. Sentry
// Android SDK auto-init lewat ContentProvider begitu ketemu meta-data DSN
// itu, sama sekali tidak butuh kode native tambahan atau native module RN.
//
// Referensi: https://docs.sentry.io/platforms/android/manual-configuration/

const SENTRY_ANDROID_VERSION = '6.34.0';

function withSentryManifest(config, { dsn }) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0];
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }
    const alreadyThere = application['meta-data'].some(
      (item) => item.$ && item.$['android:name'] === 'io.sentry.dsn'
    );
    if (!alreadyThere) {
      application['meta-data'].push({
        $: { 'android:name': 'io.sentry.dsn', 'android:value': dsn },
      });
    }
    return config;
  });
}

function withSentryGradleDependency(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('io.sentry:sentry-android')) {
      return config;
    }
    const isGroovy = config.modResults.language !== 'kt';
    const depLine = isGroovy
      ? `    implementation 'io.sentry:sentry-android:${SENTRY_ANDROID_VERSION}'`
      : `    implementation("io.sentry:sentry-android:${SENTRY_ANDROID_VERSION}")`;
    config.modResults.contents = config.modResults.contents.replace(
      /dependencies\s*\{/,
      (match) => `${match}\n${depLine}`
    );
    return config;
  });
}

module.exports = function withSentryNative(config, { dsn }) {
  config = withSentryManifest(config, { dsn });
  config = withSentryGradleDependency(config);
  return config;
};
