import {
  MD3DarkTheme,
  MD3LightTheme,
  configureFonts,
} from "react-native-paper";

// Mapping warna dari "Ningrat Purple / Matte Black" (web theme.css)
export const colors = {
  // Brand / Accent Primary (Purple Ningrat)
  purplePrimary: "#6B21A8", // Purple 800 (Utama)
  purpleLight: "#8B5CF6", // Purple 500 (Vibrant / Highlight)
  purpleDark: "#3B0764", // Purple 950 (Deep Background Accent)

  // Neutral Matte Black & Dark Surfaces
  matteBlack: "#0D0D0D", // Background Utama (True Matte Black)
  surfaceDark: "#171717", // Surface / Card Dark (Neutral 900)
  surfaceElevated: "#262626", // Surface Elevated / Modal / Input (Neutral 800)
  borderDark: "#404040", // Border Neutral 700

  // Text & Content
  textPrimary: "#FAFAFA", // High Emphasis Text (Neutral 50)
  textSecondary: "#A3A3A3", // Medium Emphasis Text (Neutral 400)
  textDisabled: "#525252", // Disabled Text (Neutral 600)

  // Status & Utility Colors
  error: "#EF4444",
  success: "#22C55E",
  warning: "#F59E0B",
  info: "#3B82F6",
};

// ----------------------------------------------------
// Dark Theme (Utama / Default untuk Matte Black Ningrat)
// ----------------------------------------------------
export const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,

    // Primary & Accent
    primary: colors.purpleLight,
    onPrimary: "#FFFFFF",
    primaryContainer: colors.purpleDark,
    onPrimaryContainer: "#E9D5FF",

    // Secondary & Tertiary
    secondary: colors.purplePrimary,
    onSecondary: "#FFFFFF",
    secondaryContainer: "#4C1D95",
    onSecondaryContainer: "#DDD6FE",

    // Background & Surfaces (Matte Black Scheme)
    background: colors.matteBlack,
    onBackground: colors.textPrimary,
    surface: colors.surfaceDark,
    onSurface: colors.textPrimary,
    surfaceVariant: colors.surfaceElevated,
    onSurfaceVariant: colors.textSecondary,
    surfaceDisabled: colors.surfaceElevated,
    onSurfaceDisabled: colors.textDisabled,

    // Borders, Dividers & Outlines
    outline: colors.borderDark,
    outlineVariant: "#262626",

    // Error & Status
    error: colors.error,
    onError: "#FFFFFF",
    errorContainer: "#7F1D1D",
    onErrorContainer: "#FCA5A5",

    // Backdrop & Overlays
    backdrop: "rgba(0, 0, 0, 0.75)",
  },
};

// ----------------------------------------------------
// Light Theme (Optional Fallback / Variant)
// ----------------------------------------------------
export const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.purplePrimary,
    onPrimary: "#FFFFFF",
    primaryContainer: "#F3E8FF",
    onPrimaryContainer: colors.purpleDark,
    secondary: colors.purpleLight,
    onSecondary: "#FFFFFF",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    onSurface: "#111827",
    surfaceVariant: "#F3F4F6",
    onSurfaceVariant: "#4B5563",
    outline: "#E5E7EB",
  },
};
