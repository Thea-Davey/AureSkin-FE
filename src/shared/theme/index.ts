export const theme = {
  colors: {
    // Primary palette
    primary: "#6B7B4C",
    primaryLight: "#8A9A6D",
    primaryDark: "#4F5C38",

    // Secondary palette
    secondary: "#D4A574",
    secondaryLight: "#E2BFA0",
    secondaryDark: "#B8895A",

    // Accent palette
    accent: "#4CAF50",
    accentLight: "#A5D6A7",
    background: "#F5F0EB",
    card: "#FFFFFF",
    text: "#2D2D2D",
    muted: "#8A8A8A",
    border: "#E8E0D8",
    error: "#E53935",
    concern: "#fa8b89ff",
    white: "#FFFFFF",
    beige: "#f8f0e7ff",

    // Status colors (matching tailwind.config.js)
    status: {
      error: "#E53935",
      warning: "#FFA726",
      success: "#4CAF50",
      info: "#42A5F5",
    },

    // Note / Callout tokens (positive, warning, negative)
    note: {
      positive: {
        bg: "#EBF5EA",
        border: "#C8E6C9",
        icon: "#2E7D32",
        text: "#1B5E20",
      },
      warning: {
        bg: "#FFF8E7",
        border: "#FFE0B2",
        icon: "#F57C00",
        text: "#B76E00",
      },
      negative: {
        bg: "#FDECEA",
        border: "#FFCDD2",
        icon: "#D32F2F",
        text: "#C62828",
      },
    },
  },
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;

