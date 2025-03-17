import { createTheme } from "@mui/material/styles";

export const lightTheme = {
  bgPrimary: "#ffffff",
  bgSecondary: "#f8f9fa",
  textPrimary: "#1a1a1a",
  textSecondary: "#6c757d",
  primary: {
    main: "#1976d2",
  },
  secondary: {
    main: "#dc004e",
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
  },
};

export const darkTheme = {
  bgPrimary: "#0d1117",
  bgSecondary: "#161b22",
  textPrimary: "#c9d1d9",
  primary: {
    main: "#90caf9",
  },
  secondary: {
    main: "#f48fb1",
  },
  background: {
    default: "#121212",
    paper: "#1e1e1e",
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
  },
};

export const createAppTheme = (mode = 'light') => {
  const themeColors = mode === 'light' ? lightTheme : darkTheme;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: themeColors.primary.main
      },
      secondary: {
        main: themeColors.secondary.main
      },
      background: themeColors.background,
    },
    typography: {
      fontFamily: themeColors.typography.fontFamily,
    },
  });
};

// Create a default theme to export
export const theme = createAppTheme('light');
