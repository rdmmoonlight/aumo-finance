import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Switch, useTheme } from "react-native-paper";
import { Stack } from "expo-router";

import {
  isAutoUpdateEnabled,
  setAutoUpdateEnabled,
} from "../../src/services/appUpdateService";

export default function SettingsPage() {
  const theme = useTheme();
  const [autoUpdate, setAutoUpdate] = useState(true);

  useEffect(() => {
    isAutoUpdateEnabled().then(setAutoUpdate);
  }, []);

  const handleToggle = async (value: boolean) => {
    setAutoUpdate(value);
    await setAutoUpdateEnabled(value);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Settings" }} />
      <Text
        variant="headlineSmall"
        style={{ color: theme.colors.onBackground, marginBottom: 16 }}
      >
        Settings
      </Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text
            variant="bodyLarge"
            style={{ color: theme.colors.onBackground }}
          >
            Auto-Update
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Cek dan pasang versi APK terbaru otomatis dari GitHub Releases saat
            app dibuka.
          </Text>
        </View>
        <Switch value={autoUpdate} onValueChange={handleToggle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
});
