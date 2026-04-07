// src/utils/theme.js
export const KENYA_THEME = {
  primary: "#BB0000", // Rich Kenyan Red
  text: "#1e293b", // Dark Slate
  muted: "#94a3b8", // Muted Gray
  bg: "#f1f5f9", // Light Background
  success: "#22c55e", // Sleek Green
  dark: "#000000", // Deep Black/Blue
  white: "#ffffff",
  border: "#e2e8f0",
};

export const COLORS = KENYA_THEME; // Alias for backward compatibility

export const GRADIENTS = {
  dark: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
  primary: "linear-gradient(135deg, #BB0000 0%, #8B0000 100%)",
  success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
  blackToTransparent: "linear-gradient(to bottom, black, transparent)",
};

export const SPACING = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "20px",
  xl: "24px",
  xxl: "40px",
};

export const BORDER_RADIUS = {
  xs: "4px",
  sm: "8px",
  md: "10px",
  lg: "12px",
  xl: "16px",
  full: "50%",
  squircle: "14px", // For avatar
};

export const FONT_SIZE = {
  xs: "0.6rem",
  sm: "0.7rem",
  base: "0.75rem",
  md: "0.85rem",
  lg: "1rem",
  xl: "1.3rem",
  xxl: "1.8rem",
  xxxl: "2.4rem",
};

export const FONT_WEIGHT = {
  normal: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
};

export const SHADOWS = {
  sm: "0 2px 4px rgba(0, 0, 0, 0.1)",
  md: "0 4px 6px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px rgba(0, 0, 0, 0.15)",
  dark: "0 4px 20px rgba(0, 0, 0, 0.2)",
  red: "0 8px 20px rgba(187, 0, 0, 0.08)",
};

export const TRANSITIONS = {
  default: "0.2s ease",
  smooth: "0.3s ease",
  slow: "0.5s ease",
  cubic: "0.4s cubic-bezier(0.4, 0, 0.2, 1)",
};

const theme = {
  colors: KENYA_THEME,
  gradients: GRADIENTS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  fontSize: FONT_SIZE,
  fontWeight: FONT_WEIGHT,
  shadows: SHADOWS,
  transitions: TRANSITIONS,
};

export default theme;
