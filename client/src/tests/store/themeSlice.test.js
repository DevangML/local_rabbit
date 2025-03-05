import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import themeReducer, { setTheme, toggleTheme } from '../../store/themeSlice';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Theme Slice', () => {
  let originalMatchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    localStorage.clear();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
  });

  it('should use the default light theme when no theme is saved', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.currentTheme).toBe('lunar-light');
    expect(initialState.isDark).toBe(false);
  });

  it('should use the default dark theme when dark mode is preferred', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.currentTheme).toBe('lunar-dark');
    expect(initialState.isDark).toBe(true);
  });

  it('should use the saved theme from localStorage if available', () => {
    localStorage.setItem('theme', 'lunar-dark');
    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.currentTheme).toBe('lunar-dark');
    expect(initialState.isDark).toBe(true);
  });

  it('should set a new theme', () => {
    const initialState = {
      currentTheme: 'lunar-light',
      isDark: false,
      themes: [{ id: 'lunar-light', name: 'Light' }, { id: 'lunar-dark', name: 'Dark' }]
    };

    const state = themeReducer(initialState, setTheme('lunar-dark'));

    expect(state.currentTheme).toBe('lunar-dark');
    expect(state.isDark).toBe(true);
    expect(localStorage.getItem('theme')).toBe('lunar-dark');
  });

  it('should not change state for invalid theme', () => {
    const initialState = {
      currentTheme: 'lunar-light',
      isDark: false,
      themes: [{ id: 'lunar-light', name: 'Light' }, { id: 'lunar-dark', name: 'Dark' }]
    };

    const state = themeReducer(initialState, setTheme('invalid-theme'));

    expect(state.currentTheme).toBe('lunar-light');
    expect(state.isDark).toBe(false);
  });

  it('should toggle from light to dark theme', () => {
    const initialState = {
      currentTheme: 'lunar-light',
      isDark: false,
      themes: [{ id: 'lunar-light', name: 'Light' }, { id: 'lunar-dark', name: 'Dark' }]
    };

    const state = themeReducer(initialState, toggleTheme());

    expect(state.currentTheme).toBe('lunar-dark');
    expect(state.isDark).toBe(true);
    expect(localStorage.getItem('theme')).toBe('lunar-dark');
  });

  it('should toggle from dark to light theme', () => {
    const initialState = {
      currentTheme: 'lunar-dark',
      isDark: true,
      themes: [{ id: 'lunar-light', name: 'Light' }, { id: 'lunar-dark', name: 'Dark' }]
    };

    const state = themeReducer(initialState, toggleTheme());

    expect(state.currentTheme).toBe('lunar-light');
    expect(state.isDark).toBe(false);
    expect(localStorage.getItem('theme')).toBe('lunar-light');
  });

  it('should include all available themes in the initial state', () => {
    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.themes).toEqual([
      { id: 'lunar-light', name: 'Light' },
      { id: 'lunar-dark', name: 'Dark' }
    ]);
  });
});
