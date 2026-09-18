import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { Stack, router } from "expo-router";

export default function HomePage() {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Home" }} />
      <Text
        variant="headlineSmall"
        style={{ color: theme.colors.onBackground, marginBottom: 8 }}
      >
        Home
      </Text>
      <Text
        variant="bodyMedium"
        style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}
      >
        Halaman Home sedang dalam pengembangan.
      </Text>
      {/* Sementara untuk tes Login + Periods, hapus setelah navigasi asli dibangun */}
      <Button mode="contained" onPress={() => router.push("/(auth)/login")}>
        Tes: Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
