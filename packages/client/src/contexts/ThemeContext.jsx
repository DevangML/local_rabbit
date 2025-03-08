/* global localStorage */
/* global document */
/* global window */
/* global localStorage */
/* global document */
/* global window */
/* global localStorage */
/* global document */
/* global window */
/* global window, document, localStorage */
import React, { createContext, useContext, useState, useEffect } from "react";
import { createTheme } from "@mui/material/styles";
import { lightTheme as customLightTheme, darkTheme as customDarkTheme } from "../theme";

// Fallback theme values if imports fail
const defaultLightTheme = {
  bgPrimary: "#ffffff",
  bgSecondary: "#f8f9fa",
  textPrimary: "#1a1a1a",
  textSecondary: "#6c757d",
  border: "#dee2e6",
  accent: "#0366d6",
  accentHover: "#0358c3",
  surface: "#ffffff",
  surfaceHover: "#f8f9fa"
};

const defaultDarkTheme = {
  bgPrimary: "#0d1117",
  bgSecondary: "#161b22",
  textPrimary: "#c9d1d9",
  textSecondary: "#8b949e",
  border: "#30363d",
  accent: "#58a6ff",
  accentHover: "#4d8ee3",
  surface: "#21262d",
  surfaceHover: "#30363d"
};

// Use imported themes or fallbacks if they don't exist
const lightTheme = customLightTheme || defaultLightTheme;
const darkTheme = customDarkTheme || defaultDarkTheme;

// Create Material UI compatible themes
const createMuiTheme = (isLight) => {
  try {
    const baseTheme = isLight ? lightTheme : darkTheme;

    return createTheme({
      palette: {
        mode: isLight ? 'light' : 'dark',
        primary: {
          main: baseTheme?.accent || (isLight ? '#1976d2' : '#90caf9'),
        },
        secondary: {
          main: baseTheme?.accentHover || (isLight ? '#dc004e' : '#f48fb1'),
        },
        background: {
          default: baseTheme?.bgPrimary || (isLight ? '#ffffff' : '#121212'),
          paper: baseTheme?.bgSecondary || (isLight ? '#f5f5f5' : '#1e1e1e'),
        },
        text: {
          primary: baseTheme?.textPrimary || (isLight ? '#000000' : '#ffffff'),
          secondary: baseTheme?.textSecondary || (isLight ? '#00000099' : '#ffffff99'),
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: baseTheme?.bgPrimary || (isLight ? '#ffffff' : '#121212'),
              color: baseTheme?.textPrimary || (isLight ? '#000000' : '#ffffff'),
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating MUI theme in ThemeContext:", error);
    // Return a minimal fallback theme
    return createTheme({
      palette: {
        mode: isLight ? 'light' : 'dark'
      }
    });
  }
};

// Pre-create the themes to avoid recreation on each render
let lightMuiTheme, darkMuiTheme;

try {
  lightMuiTheme = createMuiTheme(true);
  darkMuiTheme = createMuiTheme(false);
} catch (error) {
  console.error("Error initializing themes in ThemeContext:", error);
  // Create minimal fallback themes
  lightMuiTheme = createTheme({ palette: { mode: 'light' } });
  darkMuiTheme = createTheme({ palette: { mode: 'dark' } });
}

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference for theme with safe access
    const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem("theme") : null;
    return savedTheme
      ? savedTheme === "dark"
      : typeof window !== 'undefined' && window.matchMedia ?
        window.matchMedia("(prefers-color-scheme: dark)").matches :
        false;
  });

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute(
        "data-theme",
        isDarkMode ? "dark" : "light",
      );
      document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? darkMuiTheme : lightMuiTheme, // Add the MUI theme to the context
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
