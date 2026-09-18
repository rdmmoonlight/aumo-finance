import React from "react";
import { Chip, useTheme } from "react-native-paper";

interface AppBadgeProps {
  label: string;
  variant?: "success" | "warning" | "error" | "info" | "default";
}

export function AppBadge({ label, variant = "default" }: AppBadgeProps) {
  const theme = useTheme();
  const getColors = () => {
    switch (variant) {
      case "success":
        return { bg: "#14532D", text: "#4ADE80" };
      case "warning":
        return { bg: "#78350F", text: "#FBBF24" };
      case "error":
        return { bg: "#7F1D1D", text: "#FCA5A5" };
      case "info":
        return { bg: "#1E3A8A", text: "#93C5FD" };
      default:
        return {
          bg: theme.colors.surfaceVariant,
          text: theme.colors.onSurfaceVariant,
        };
    }
  };
  const colors = getColors();

  return (
    <Chip
      compact
      style={{
        backgroundColor: colors.bg,
        height: 28,
        justifyContent: "center",
      }}
      textStyle={{ color: colors.text, fontSize: 12, fontWeight: "600" }}
    >
      {label}
    </Chip>
  );
}
