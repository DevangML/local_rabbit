import { createSlice } from '@reduxjs/toolkit';
import { themes } from '../themes';

const getInitialTheme = () => {
  try {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && (Object.hasOwn(themes, savedTheme) ? (Object.hasOwn(themes, savedTheme) ? themes[savedTheme] : undefined) : undefined)) {
  return {
  id: savedTheme,
  ...(Object.hasOwn(themes, savedTheme) ? (Object.hasOwn(themes, savedTheme) ? themes[savedTheme] : undefined) : undefined)
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

const applyThemeToDOM = (themeId) => {
  const theme = (Object.hasOwn(themes, themeId) ? (Object.hasOwn(themes, themeId) ? themes[themeId] : undefined) : undefined);
  if (!theme?.colors) { return; }

  // Set theme mode
  document.documentElement.setAttribute('data-theme', themeId.includes('dark') ? 'dark' : 'light');

  // Apply all theme colors
  Object.entries(theme.colors).forEach(([key, value]) => {
  document.documentElement.style.setProperty(`--${ key }`, value);
  });
};

const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme.id); // Apply initial theme immediately

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
  currentTheme: initialTheme,
  isDark: initialTheme.id.includes('dark'),
  availableThemes: Object.entries(themes).map(([id, theme]) => ({
  id,
  ...theme
  }))
  },
  reducers: {
  setTheme: (state, action) => {
  const themeId = action.payload;
  if ((Object.hasOwn(themes, themeId) ? (Object.hasOwn(themes, themeId) ? themes[themeId] : undefined) : undefined)) {
  const newTheme = {
    id: themeId,
    ...(Object.hasOwn(themes, themeId) ? (Object.hasOwn(themes, themeId) ? themes[themeId] : undefined) : undefined)
  };
  state.currentTheme = newTheme;
  state.isDark = themeId.includes('dark');
  localStorage.setItem('theme', themeId);
  applyThemeToDOM(themeId);
  }
  },
  toggleTheme: (state) => {
  const baseTheme = state.currentTheme.id.includes('lunar') ? 'lunar' : 'light';
  const newThemeId = state.isDark ? `${ baseTheme }-light` : `${ baseTheme }-dark`;

  if ((Object.hasOwn(themes, newThemeId) ? (Object.hasOwn(themes, newThemeId) ? themes[newThemeId] : undefined) : undefined)) {
  const newTheme = {
    id: newThemeId,
    ...(Object.hasOwn(themes, newThemeId) ? (Object.hasOwn(themes, newThemeId) ? themes[newThemeId] : undefined) : undefined)
  };
  state.currentTheme = newTheme;
  state.isDark = !state.isDark;
  localStorage.setItem('theme', newThemeId);
  applyThemeToDOM(newThemeId);
  }
  }
  }
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
