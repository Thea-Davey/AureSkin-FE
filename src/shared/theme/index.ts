export const theme = {
  colors: {
    primary:    "#6B7B4C",
    secondary:  "#D4A574",
    accent:     "#4CAF50",
    background: "#F5F0EB",
    card:       "#FFFFFF",
    text:       "#2D2D2D",
    muted:      "#8A8A8A",
    border:     "#E8E0D8",
    error:      "#E53935",
    white:      "#FFFFFF",
  },
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;

