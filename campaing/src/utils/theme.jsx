// src/utils/theme.js
export const KENYA_THEME = {
  primary: "#e11d48", // Modern Rose Red
  secondary: "#10b981", // Emerald Green
  text: "#f8fafc", // Off-White Text
  textDim: "#94a3b8", // Muted Blue-Gray
  muted: "#475569", // Dark Slate
  bg: "#000000ff", // Deep Oceanic Dark Background
  card: "#0f172a", // Slate-900 Card
  success: "#10b981",
  dark: "#000000ff",
  white: "#ffffff",
  border: "rgba(255, 255, 255, 0.1)",
  glass: "rgba(15, 23, 42, 0.7)",
};

export const COLORS = KENYA_THEME;

export const GRADIENTS = {
  dark: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
  primary: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
  success: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  glass: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
  blackToTransparent: "linear-gradient(to bottom, rgba(2, 6, 23, 1), rgba(2, 6, 23, 0))",
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
