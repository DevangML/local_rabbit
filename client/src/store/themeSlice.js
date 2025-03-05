import { createSlice } from '@reduxjs/toolkit';
import { themes } from '../themes';

const getInitialTheme = () => {
  try {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      return {
        id: savedTheme,
        ...themes[savedTheme]
      };
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return {
        id: 'lunar-dark',
        ...themes['lunar-dark']
      };
    }

    // Default to light theme
    return {
      id: 'lunar-light',
      ...themes['lunar-light']
    };
  } catch (error) {
    console.error('Error determining initial theme:', error);
    return {
      id: 'lunar-light',
      ...themes['lunar-light']
    };
  }
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    currentTheme: getInitialTheme(),
    isDark: getInitialTheme().id.includes('dark'),
    availableThemes: Object.entries(themes).map(([id, theme]) => ({
      id,
      ...theme
    }))
  },
  reducers: {
    setTheme: (state, action) => {
      const themeId = action.payload;
      if (themes[themeId]) {
        state.currentTheme = {
          id: themeId,
          ...themes[themeId]
        };
        state.isDark = themeId.includes('dark');
        localStorage.setItem('theme', themeId);

        // Apply theme variables to root
        Object.entries(themes[themeId].colors).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--${key}`, value);
        });
      }
    },
    toggleTheme: (state) => {
      const baseTheme = state.currentTheme.id.includes('lunar') ? 'lunar' : 'light';
      const newThemeId = state.isDark ? `${baseTheme}-light` : `${baseTheme}-dark`;

      if (themes[newThemeId]) {
        state.currentTheme = {
          id: newThemeId,
          ...themes[newThemeId]
        };
        state.isDark = !state.isDark;
        localStorage.setItem('theme', newThemeId);

        // Apply theme variables to root
        Object.entries(themes[newThemeId].colors).forEach(([key, value]) => {
          document.documentElement.style.setProperty(`--${key}`, value);
        });
      }
    }
  }
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
