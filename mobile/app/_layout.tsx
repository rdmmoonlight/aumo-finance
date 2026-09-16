import { useEffect } from 'react';
import { Alert } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';
import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import * as Sentry from 'sentry-expo';

import { customDarkTheme } from '../src/theme/theme';
import { queryClient } from '../queryClient';
import { checkForUpdateSilently } from '../src/services/appUpdateService';

// Inisialisasi Sentry di module scope (di luar komponen)
// Membaca dsn dari app.config.js (extra.sentryDsn)
const sentryDsn = Constants.expoConfig?.extra?.sentryDsn || Constants.manifest?.extra?.sentryDsn;

Sentry.init({
  dsn: sentryDsn,
  enableInExpoDevelopment: true, // Ubah ke false jika tidak ingin track di dev local
  debug: __DEV__,
});

export default function RootLayout() {
  // Logika Auto-Detect & Auto-Apply Update Terbaru dari Expo
  useEffect(() => {
    async function handleAutoUpdate() {
      try {
        // Jangan jalankan pengecekan di mode development
        if (__DEV__) return;

        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          // Unduh update di background
          await Updates.fetchUpdateAsync();

          // Beri tahu pengguna & muat ulang aplikasi
          Alert.alert(
            'Pembaruan Aplikasi',
            'Versi terbaru telah diunduh. Aplikasi akan dimuat ulang sekarang.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await Updates.reloadAsync();
                },
              },
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.warn('Gagal memeriksa pembaruan Expo:', error);
        // Kirim error gagal update ke Sentry agar bisa di-monitor
        Sentry.Native.captureException(error);
      }
    }

    handleAutoUpdate();
  }, []);

  // Cek update APK penuh (native) dari GitHub Releases
  useEffect(() => {
    checkForUpdateSilently();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={customDarkTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </QueryClientProvider>
  );
}