import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import * as Sentry from "sentry-expo";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// Menangkap crash di fase render (mis. bug di dalam satu layar) supaya
// tidak menjatuhkan seluruh aplikasi ke titik "mental ke home" - user
// cukup lihat layar retry ini, dan errornya tetap terkirim ke Sentry
// (React error boundary TIDAK menangkap error di luar fase render, seperti
// di event handler atau promise - itu tetap tertangkap terpisah oleh
// Sentry.init() di app/_layout.tsx).
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.Native.captureException(error, {
      extra: { componentStack: info.componentStack },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text variant="titleMedium" style={styles.title}>
            Terjadi kesalahan
          </Text>
          <Text variant="bodyMedium" style={styles.body}>
            Layar ini mengalami error. Laporan sudah terkirim otomatis.
          </Text>
          <Button mode="contained" onPress={this.handleRetry}>
            Coba Lagi
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  title: { color: "#FAFAFA" },
  body: { color: "#A3A3A3", textAlign: "center", marginBottom: 8 },
});
