import { createSlice } from '@reduxjs/toolkit';
import { themes } from '../themes';

const initialState = {
  isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  currentTheme: localStorage.getItem('theme') || 'light-default',
  availableThemes: Object.keys(themes).map(key => ({
    id: key,
    ...themes[key]
  }))
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
      state.currentTheme = state.isDark ? 'dark-default' : 'light-default';
      localStorage.setItem('theme', state.currentTheme);
    },
    setTheme: (state, action) => {
      state.currentTheme = action.payload;
      state.isDark = action.payload.includes('dark');
      localStorage.setItem('theme', action.payload);
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
