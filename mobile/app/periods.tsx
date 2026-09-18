import React from "react";
import { View, StyleSheet } from "react-native";
import { FlatList } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { Stack } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

import {
  usePeriods,
  useSelectPeriod,
  useClosePeriod,
  Period,
} from "../src/api/periods";
import { AppCard, AppBadge, AppSkeleton } from "../src/components/ui";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function PeriodsScreen() {
  const theme = useTheme();
  // Query dimatikan saat layar tidak fokus - mencegah FlatList di-render
  // ulang dengan props yang belum lengkap akibat notifikasi background
  // refetch pada layar yang sedang di-freeze oleh react-native-screens.
  // (fix untuk Sentry REACT-NATIVE-4: "Cannot read property 'getItem' of undefined")
  const isFocused = useIsFocused();
  const { data, isLoading, isError, error, refetch, isRefetching } =
    usePeriods({ enabled: isFocused });

  const selectPeriod = useSelectPeriod();
  const closePeriod = useClosePeriod();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Periods" }} />

      {isLoading && <AppSkeleton message="Memuat data periode..." />}

      {isError && (
        <View style={styles.center}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.error, textAlign: "center" }}
          >
            {(error as any)?.response?.data?.message ||
              "Gagal memuat data periode dari server."}
          </Text>
        </View>
      )}

      {(selectPeriod.isError || closePeriod.isError) && (
        <View style={styles.center}>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.error, textAlign: "center" }}
          >
            {(selectPeriod.error as any)?.response?.data?.message ||
              (closePeriod.error as any)?.response?.data?.message ||
              "Aksi gagal diproses."}
          </Text>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={data?.periods ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Belum ada periode akuntansi yang dibuat.
              </Text>
            </View>
          }
          renderItem={({ item }: { item: Period }) => {
            const isSelected = item.id === data?.selectedPeriodId;
            return (
              <AppCard
                title={item.periodName}
                subtitle={`${formatDate(item.startDate)} - ${formatDate(item.endDate)}`}
                onPress={
                  isSelected
                    ? undefined
                    : () => selectPeriod.mutate(item.id)
                }
              >
                <View style={styles.badgeRow}>
                  <AppBadge
                    label={item.isClosed ? "Closed" : "Open"}
                    variant={item.isClosed ? "error" : "success"}
                  />
                  {isSelected && (
                    <AppBadge label="Sedang Dipilih" variant="info" />
                  )}
                </View>

                {isSelected && !item.isClosed && (
                  <Button
                    mode="outlined"
                    style={styles.closeButton}
                    loading={closePeriod.isPending}
                    disabled={closePeriod.isPending}
                    onPress={() => closePeriod.mutate(item.id)}
                  >
                    Tutup Periode
                  </Button>
                )}
              </AppCard>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  list: { paddingBottom: 24 },
  center: { padding: 32, alignItems: "center" },
  badgeRow: { flexDirection: "row", gap: 8 },
  closeButton: { marginTop: 12 },
});
