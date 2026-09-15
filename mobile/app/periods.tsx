import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Stack } from 'expo-router';

import { usePeriods, Period } from '../src/api/periods';
import { AppCard, AppBadge, AppSkeleton } from '../src/components/ui';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function PeriodsScreen() {
  const theme = useTheme();
  const { data, isLoading, isError, error, refetch, isRefetching } = usePeriods();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: 'Periods' }} />

      {isLoading && <AppSkeleton message="Memuat data periode..." />}

      {isError && (
        <View style={styles.center}>
          <Text variant="bodyMedium" style={{ color: theme.colors.error, textAlign: 'center' }}>
            {(error as any)?.response?.data?.message || 'Gagal memuat data periode dari server.'}
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
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Belum ada periode akuntansi yang dibuat.
              </Text>
            </View>
          }
          renderItem={({ item }: { item: Period }) => (
            <AppCard title={item.periodName} subtitle={`${formatDate(item.startDate)} - ${formatDate(item.endDate)}`}>
              <View style={styles.badgeRow}>
                <AppBadge
                  label={item.isClosed ? 'Closed' : 'Open'}
                  variant={item.isClosed ? 'error' : 'success'}
                />
                {item.id === data?.selectedPeriodId && (
                  <AppBadge label="Sedang Dipilih" variant="info" />
                )}
              </View>
            </AppCard>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  list: { paddingBottom: 24 },
  center: { padding: 32, alignItems: 'center' },
  badgeRow: { flexDirection: 'row', gap: 8 },
});
