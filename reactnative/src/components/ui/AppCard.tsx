import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

interface AppCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AppCard({ title, subtitle, children, style }: AppCardProps) {
  const theme = useTheme();
  return (
    <Card
      mode="outlined"
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline },
        style,
      ]}
    >
      {(title || subtitle) && (
        <Card.Title
          title={title}
          subtitle={subtitle}
          titleStyle={{ color: theme.colors.onSurface, fontWeight: 'bold' }}
          subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
        />
      )}
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginVertical: 6, borderRadius: 12 },
});
