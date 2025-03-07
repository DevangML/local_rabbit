import themeReducer, { setTheme, toggleTheme } from '../../store/themeSlice';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { themes } from '../../themes';

// Mock themes
vi.mock('../../themes', () => ({
  themes: {
  'lunar-light': {
  name: 'Lunar Light',
  colors: {
  bgPrimary: '#f1f5f9',
  bgSecondary: '#ffffff',
  textPrimary: '#24283b',
  textSecondary: '#545c7e',
  }
  },
  'lunar-dark': {
  name: 'Lunar Dark',
  colors: {
  bgPrimary: '#1a1b26',
  bgSecondary: '#24283b',
  textPrimary: '#c0caf5',
  textSecondary: '#9aa5ce',
  }
  }
  }
}));

describe('Theme Slice', () => {
  let mockLocalStorage;
  let mockMatchMedia;

  beforeEach(() => {
  // Mock localStorage
  mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
  };
  Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
  });

  // Mock matchMedia
  mockMatchMedia = vi.fn();
  Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
  writable: true
  });
  });

  afterEach(() => {
  vi.clearAllMocks();
  });

  it('should use the default light theme when no theme is saved', () => {
  mockLocalStorage.getItem.mockReturnValue(null);
  mockMatchMedia.mockReturnValue({ matches: false });

  const initialState = themeReducer(undefined, { type: 'unknown' });
  expect(initialState.currentTheme).toEqual(themes.find(t => t.name === 'lunar-light'));
  });

  it('should use the default dark theme when dark mode is preferred', () => {
  mockLocalStorage.getItem.mockReturnValue(null);
  mockMatchMedia.mockReturnValue({ matches: true });

  const initialState = themeReducer(undefined, { type: 'unknown' });
  expect(initialState.currentTheme).toEqual(themes.find(t => t.name === 'lunar-dark'));
  });

  it('should use the saved theme from localStorage if available', () => {
  const savedTheme = themes.find(t => t.name === 'synthwave');
  mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedTheme));

  const initialState = themeReducer(undefined, { type: 'unknown' });
  expect(initialState.currentTheme).toEqual(savedTheme);
  });

  it('should set a new theme', () => {
  const newTheme = themes.find(t => t.name === 'synthwave');
  const initialState = {
  currentTheme: themes.find(t => t.name === 'lunar-light'),
  availableThemes: themes
  };

  const nextState = themeReducer(initialState, setTheme(newTheme));
  expect(nextState.currentTheme).toEqual(newTheme);
  expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
  'theme',
  JSON.stringify(newTheme)
  );
  });

  it('should not change state for invalid theme', () => {
  const initialState = {
  currentTheme: themes.find(t => t.name === 'lunar-light'),
  availableThemes: themes
  };

  const invalidTheme = { name: 'invalid', colors: {} };
  const nextState = themeReducer(initialState, setTheme(invalidTheme));
  expect(nextState).toEqual(initialState);
  });

  it('should toggle from light to dark theme', () => {
  const lightTheme = themes.find(t => t.name === 'lunar-light');
  const darkTheme = themes.find(t => t.name === 'lunar-dark');
  const initialState = {
  currentTheme: lightTheme,
  availableThemes: themes
  };

  const nextState = themeReducer(initialState, toggleTheme());
  expect(nextState.currentTheme).toEqual(darkTheme);
  });

  it('should toggle from dark to light theme', () => {
  const lightTheme = themes.find(t => t.name === 'lunar-light');
  const darkTheme = themes.find(t => t.name === 'lunar-dark');
  const initialState = {
  currentTheme: darkTheme,
  availableThemes: themes
  };

  const nextState = themeReducer(initialState, toggleTheme());
  expect(nextState.currentTheme).toEqual(lightTheme);
  });

  it('should include all available themes in the initial state', () => {
  const initialState = themeReducer(undefined, { type: 'unknown' });
  expect(initialState.availableThemes).toEqual(themes);
  });
});
