import { createSlice } from '@reduxjs/toolkit';
import { themes } from '../themes';

const getInitialTheme = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && themes[savedTheme]) return savedTheme;
    }

    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'lunar-dark' : 'lunar-light';
    }

    // Default fallback
    return 'lunar-light';
  } catch (error) {
    console.error('Error determining initial theme:', error);
    return 'lunar-light';
  }
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    currentTheme: getInitialTheme(),
    isDark: getInitialTheme().includes('dark'),
    themes: Object.keys(themes).map(key => ({
      id: key,
      name: themes[key].name
    }))
  },
  reducers: {
    setTheme: (state, action) => {
      const themeId = action.payload;
      if (themes[themeId]) {
        state.currentTheme = themeId;
        state.isDark = themeId.includes('dark');
        localStorage.setItem('theme', themeId);
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.isDark ? 'lunar-light' : 'lunar-dark';
      state.currentTheme = newTheme;
      state.isDark = !state.isDark;
      localStorage.setItem('theme', newTheme);
    }
  }
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
