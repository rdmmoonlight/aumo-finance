import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';

export interface Column<T> {
  key: string;
  title: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
}

interface AppTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
}

export function AppTable<T>({ columns, data, keyExtractor }: AppTableProps<T>) {
  const theme = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <View style={{ minWidth: '100%' }}>
        <View style={[styles.headerRow, { backgroundColor: theme.colors.surfaceVariant }]}>
          {columns.map((col) => (
            <View
              key={col.key}
              style={[
                styles.cell,
                { width: col.width || 120, alignItems: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' },
              ]}
            >
              <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {col.title}
              </Text>
            </View>
          ))}
        </View>
        <Divider />
        {data.map((item) => (
          <React.Fragment key={keyExtractor(item)}>
            <View style={styles.dataRow}>
              {columns.map((col) => (
                <View
                  key={col.key}
                  style={[
                    styles.cell,
                    { width: col.width || 120, alignItems: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' },
                  ]}
                >
                  {col.render ? (
                    col.render(item)
                  ) : (
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                      {(item as any)[col.key] ?? '-'}
                    </Text>
                  )}
                </View>
              ))}
            </View>
            <Divider />
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 8 },
  dataRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8 },
  cell: { justifyContent: 'center', paddingHorizontal: 4 },
});
