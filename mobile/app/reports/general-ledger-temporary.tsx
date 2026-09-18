import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Stack } from "expo-router";

export default function GeneralLedgerTemporaryPage() {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "General Ledger Temporary" }} />
      <Text
        variant="headlineSmall"
        style={{ color: theme.colors.onBackground, marginBottom: 8 }}
      >
        General Ledger Temporary
      </Text>
      <Text
        variant="bodyMedium"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        Halaman General Ledger Temporary sedang dalam pengembangan.
      </Text>
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
