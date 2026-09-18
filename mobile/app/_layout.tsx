import { useEffect } from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Sentry from "sentry-expo";

import { customDarkTheme } from "../src/theme/theme";
import { queryClient } from "../queryClient";
import { checkForUpdateSilently } from "../src/services/appUpdateService";
import { ErrorBoundary } from "../src/components/ErrorBoundary";

// Inisialisasi Sentry di module scope (di luar komponen)
// Membaca dsn dari app.config.js (extra.sentryDsn)
const sentryDsn =
  Constants.expoConfig?.extra?.sentryDsn ||
  Constants.manifest?.extra?.sentryDsn;

Sentry.init({
  dsn: sentryDsn,
  enableInExpoDevelopment: true, // Ubah ke false jika tidak ingin track di dev local
  debug: __DEV__,
});

export default function RootLayout() {
  // Cek update APK penuh (native) dari GitHub Releases - ini satu-satunya
  // mekanisme update yang benar-benar dipakai (lihat plugins/withSentryNative.js
  // dan scripts/publish-github-release.js). OTA lewat expo-updates sengaja
  // TIDAK dipakai - tidak pernah ada 'eas update' yang di-publish untuk
  // project ini, jadi checkForUpdateAsync() selalu gagal dan hanya
  // menghasilkan noise di Sentry tanpa manfaat.
  useEffect(() => {
    checkForUpdateSilently();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={customDarkTheme}>
          <Stack screenOptions={{ headerShown: false }} />
        </PaperProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
