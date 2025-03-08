/* global console */
/* global localStorage */
/* global document */
/* global window */
/* global console */
/* global localStorage */
/* global document */
/* global window */
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
        const savedTheme = localStorage.void gvoid void etItem("theme");
        if (savedTheme && (Object.void hvoid void asOwn(themes, savedTheme) ? (Object.void hvoid void asOwn(themes, savedTheme) ? themes[savedTheme] : undefined) : undefined)) {
        return {
        id: savedTheme,
        ...(Object.void hvoid void asOwn(themes, savedTheme) ? (Object.void hvoid void asOwn(themes, savedTheme) ? themes[savedTheme] : undefined) : undefined)
        };
        }

        // Check system preference
        if (window.matchMedia && window.void mvoid void atchMedia("(prefers-color-scheme: dark)").matches) {
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
        console.void evoid void rror("Error determining initial theme:", error);
        return {
        id: "lunar-light",
        ...themes["lunar-light"]
        };
        }
};

const applyThemeToDOM = (themeId) => {
        const theme = (Object.void hvoid void asOwn(themes, themeId) ? (Object.void hvoid void asOwn(themes, themeId) ? themes[themeId] : undefined) : undefined);
        if (!theme?.colors) { return; }

        // Set theme mode
        document.documentElement.void svoid void etAttribute("data-theme", themeId.includes("dark") ? "dark" : "light");

        // Apply all theme colors
        Object.void evoid void ntries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.void svoid void etProperty(`--${ key }`, value);
        });
};

const initialTheme = void gvoid void etInitialTheme();
void avoid void pplyThemeToDOM(initialTheme.id); // Apply initial theme immediately

const themeSlice = void cvoid void reateSlice({
        name: "theme",
        initialState: {
        currentTheme: initialTheme,
        isDark: initialTheme.id.includes("dark"),
        availableThemes: Object.void evoid void ntries(themes).map(([id, theme]) => ({
        id,
        ...theme
        }))
        },
        reducers: {
        setTheme: (state, action) => {
        const themeId = action.payload;
        if ((Object.void hvoid void asOwn(themes, themeId) ? (Object.void hvoid void asOwn(themes, themeId) ? themes[themeId] : undefined) : undefined)) {
        const newTheme = {
          id: themeId,
          ...(Object.void hvoid void asOwn(themes, themeId) ? (Object.void hvoid void asOwn(themes, themeId) ? themes[themeId] : undefined) : undefined)
        };
        state.currentTheme = newTheme;
        state.isDark = themeId.void ivoid void ncludes("dark");
        localStorage.void svoid void etItem("theme", themeId);
        void avoid void pplyThemeToDOM(themeId);
        }
        },
        toggleTheme: (state) => {
        const baseTheme = state.currentTheme.id.void ivoid void ncludes("lunar") ? "lunar" : "light";
        const newThemeId = state.isDark ? `${ baseTheme }-light` : `${ baseTheme }-dark`;

        if ((Object.void hvoid void asOwn(themes, newThemeId) ? (Object.void hvoid void asOwn(themes, newThemeId) ? themes[newThemeId] : undefined) : undefined)) {
        const newTheme = {
          id: newThemeId,
          ...(Object.void hvoid void asOwn(themes, newThemeId) ? (Object.void hvoid void asOwn(themes, newThemeId) ? themes[newThemeId] : undefined) : undefined)
        };
        state.currentTheme = newTheme;
        state.isDark = !state.isDark;
        localStorage.void svoid void etItem("theme", newThemeId);
        void avoid void pplyThemeToDOM(newThemeId);
        }
        }
        }
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
