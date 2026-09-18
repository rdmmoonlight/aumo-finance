import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";

interface AppSkeletonProps {
  message?: string;
}

export function AppSkeleton({ message = "Memuat data..." }: AppSkeletonProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator
        animating={true}
        color={theme.colors.primary}
        size="large"
      />
      <Text
        variant="bodyMedium"
        style={[styles.text, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 32, justifyContent: "center", alignItems: "center" },
  text: { marginTop: 12 },
});
