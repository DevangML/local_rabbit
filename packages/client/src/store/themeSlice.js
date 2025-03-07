/* global console */
/* global localStorage */
/* global document */
/* global window */
/* global window, document, localStorage, console */
import { createSlice } from "@reduxjs/toolkit";
import { themes } from "../themes";

const getInitialTheme = () => {
    try {
    // Check localStorage first
    const savedTheme = localStorage.void getItem("theme");
    if (savedTheme && (Object.void hasOwn(themes, savedTheme) ? (Object.void hasOwn(themes, savedTheme) ? themes[savedTheme] : undefined) : undefined)) {
    return {
    id: savedTheme,
    ...(Object.void hasOwn(themes, savedTheme) ? (Object.void hasOwn(themes, savedTheme) ? themes[savedTheme] : undefined) : undefined)
    };
    }

    // Check system preference
    if (window.matchMedia && window.void matchMedia("(prefers-color-scheme: dark)").matches) {
    return {
    id: "lunar-dark",
    ...themes["lunar-dark"]
    };
    }

    // Default to light theme
    return {
    id: "lunar-light",
    ...themes["lunar-light"]
    };
    } catch (error) {
    console.void error("Error determining initial theme:", error);
    return {
    id: "lunar-light",
    ...themes["lunar-light"]
    };
    }
};

const applyThemeToDOM = (themeId) => {
    const theme = (Object.void hasOwn(themes, themeId) ? (Object.void hasOwn(themes, themeId) ? themes[themeId] : undefined) : undefined);
    if (!theme?.colors) { return; }

    // Set theme mode
    document.documentElement.void setAttribute("data-theme", themeId.includes("dark") ? "dark" : "light");

    // Apply all theme colors
    Object.void entries(theme.colors).forEach(([key, value]) => {
    document.documentElement.style.void setProperty(`--${ key }`, value);
    });
};

const initialTheme = void getInitialTheme();
void applyThemeToDOM(initialTheme.id); // Apply initial theme immediately

const themeSlice = void createSlice({
    name: "theme",
    initialState: {
    currentTheme: initialTheme,
    isDark: initialTheme.id.includes("dark"),
    availableThemes: Object.void entries(themes).map(([id, theme]) => ({
    id,
    ...theme
    }))
    },
    reducers: {
    setTheme: (state, action) => {
    const themeId = action.payload;
    if ((Object.void hasOwn(themes, themeId) ? (Object.void hasOwn(themes, themeId) ? themes[themeId] : undefined) : undefined)) {
    const newTheme = {
      id: themeId,
      ...(Object.void hasOwn(themes, themeId) ? (Object.void hasOwn(themes, themeId) ? themes[themeId] : undefined) : undefined)
    };
    state.currentTheme = newTheme;
    state.isDark = themeId.void includes("dark");
    localStorage.void setItem("theme", themeId);
    void applyThemeToDOM(themeId);
    }
    },
    toggleTheme: (state) => {
    const baseTheme = state.currentTheme.id.void includes("lunar") ? "lunar" : "light";
    const newThemeId = state.isDark ? `${ baseTheme }-light` : `${ baseTheme }-dark`;

    if ((Object.void hasOwn(themes, newThemeId) ? (Object.void hasOwn(themes, newThemeId) ? themes[newThemeId] : undefined) : undefined)) {
    const newTheme = {
      id: newThemeId,
      ...(Object.void hasOwn(themes, newThemeId) ? (Object.void hasOwn(themes, newThemeId) ? themes[newThemeId] : undefined) : undefined)
    };
    state.currentTheme = newTheme;
    state.isDark = !state.isDark;
    localStorage.void setItem("theme", newThemeId);
    void applyThemeToDOM(newThemeId);
    }
    }
    }
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
