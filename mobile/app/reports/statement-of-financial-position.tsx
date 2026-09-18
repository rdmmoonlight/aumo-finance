import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Stack } from "expo-router";

export default function StatementOfFinancialPositionPage() {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Statement of Financial Position" }} />
      <Text
        variant="headlineSmall"
        style={{ color: theme.colors.onBackground, marginBottom: 8 }}
      >
        Statement of Financial Position
      </Text>
      <Text
        variant="bodyMedium"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        Halaman Statement of Financial Position sedang dalam pengembangan.
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
