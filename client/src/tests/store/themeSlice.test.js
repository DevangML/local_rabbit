import { describe, it, expect, vi, beforeEach } from 'vitest';
import themeReducer, { setTheme, toggleTheme } from '../../store/themeSlice';

// Mock the themes
vi.mock('../../themes', () => ({
  themes: {
    'lunar-light': { name: 'Lunar Vim Light' },
    'lunar-dark': { name: 'Lunar Vim Dark' },
    'light-default': { name: 'Light Default' },
    'dark-default': { name: 'Dark Default' }
  }
}));

describe('Theme Slice', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('should use the default light theme when no theme is saved', () => {
    // Mock matchMedia to return false (light mode preference)
    window.matchMedia.mockImplementationOnce(() => ({ matches: false }));
    localStorage.getItem.mockReturnValueOnce(null);

    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.currentTheme).toBe('lunar-light');
    expect(initialState.isDark).toBe(false);
  });

  it('should use the default dark theme when dark mode is preferred', () => {
    // Mock matchMedia to return true (dark mode preference)
    window.matchMedia.mockImplementationOnce(() => ({ matches: true }));
    localStorage.getItem.mockReturnValueOnce(null);

    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.currentTheme).toBe('lunar-dark');
    expect(initialState.isDark).toBe(true);
  });

  it('should use the saved theme from localStorage if available', () => {
    localStorage.getItem.mockReturnValueOnce('light-default');

    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.currentTheme).toBe('light-default');
    expect(initialState.isDark).toBe(false);
  });

  it('should set a new theme', () => {
    const initialState = {
      currentTheme: 'lunar-light',
      isDark: false,
      themes: [
        { id: 'lunar-light', name: 'Lunar Vim Light' },
        { id: 'lunar-dark', name: 'Lunar Vim Dark' }
      ]
    };

    const newState = themeReducer(initialState, setTheme('lunar-dark'));

    expect(newState.currentTheme).toBe('lunar-dark');
    expect(newState.isDark).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'lunar-dark');
  });

  it('should not change state for invalid theme', () => {
    const initialState = {
      currentTheme: 'lunar-light',
      isDark: false,
      themes: [
        { id: 'lunar-light', name: 'Lunar Vim Light' },
        { id: 'lunar-dark', name: 'Lunar Vim Dark' }
      ]
    };

    const newState = themeReducer(initialState, setTheme('invalid-theme'));

    // State should remain unchanged
    expect(newState).toEqual(initialState);
  });

  it('should toggle from light to dark theme', () => {
    const initialState = {
      currentTheme: 'lunar-light',
      isDark: false,
      themes: [
        { id: 'lunar-light', name: 'Lunar Vim Light' },
        { id: 'lunar-dark', name: 'Lunar Vim Dark' }
      ]
    };

    const newState = themeReducer(initialState, toggleTheme());

    expect(newState.currentTheme).toBe('lunar-dark');
    expect(newState.isDark).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'lunar-dark');
  });

  it('should toggle from dark to light theme', () => {
    const initialState = {
      currentTheme: 'lunar-dark',
      isDark: true,
      themes: [
        { id: 'lunar-light', name: 'Lunar Vim Light' },
        { id: 'lunar-dark', name: 'Lunar Vim Dark' }
      ]
    };

    const newState = themeReducer(initialState, toggleTheme());

    expect(newState.currentTheme).toBe('lunar-light');
    expect(newState.isDark).toBe(false);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'lunar-light');
  });

  it('should include all available themes in the initial state', () => {
    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.themes).toHaveLength(4);
    expect(initialState.themes).toEqual(expect.arrayContaining([
      { id: 'lunar-light', name: 'Lunar Vim Light' },
      { id: 'lunar-dark', name: 'Lunar Vim Dark' },
      { id: 'light-default', name: 'Light Default' },
      { id: 'dark-default', name: 'Dark Default' }
    ]));
  });
});
