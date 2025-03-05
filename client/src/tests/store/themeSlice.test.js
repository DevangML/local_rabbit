import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import themeReducer, { setTheme, toggleTheme } from '../../store/themeSlice';

describe('Theme Slice', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn()
  };

  const mockMatchMedia = vi.fn();

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true
    });

    // Clear mocks
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
    mockLocalStorage.clear.mockReset();
    mockMatchMedia.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should use the default light theme when no theme is saved', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: false });

    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.currentTheme).toBe('lunar-light');
    expect(initialState.isDark).toBe(false);
  });

  it('should use the default dark theme when dark mode is preferred', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: true });

    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.currentTheme).toBe('lunar-dark');
    expect(initialState.isDark).toBe(true);
  });

  it('should use the saved theme from localStorage if available', () => {
    mockLocalStorage.getItem.mockReturnValue('lunar-dark');
    mockMatchMedia.mockReturnValue({ matches: false });

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
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'lunar-dark');
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
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'lunar-dark');
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
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'lunar-light');
  });

  it('should include all available themes in the initial state', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockReturnValue({ matches: false });

    const initialState = themeReducer(undefined, { type: 'unknown' });

    expect(initialState.themes).toEqual([
      { id: 'light-default', name: 'Light Default' },
      { id: 'glance-light', name: 'Glance Light' },
      { id: 'dark-default', name: 'Dark Default' },
      { id: 'synthwave', name: 'Synthwave' },
      { id: 'tomorrow-night-blue', name: 'Tomorrow Night Blue' },
      { id: 'tinacious', name: 'Tinacious Design' },
      { id: 'gloom', name: 'Gloom Dark' },
      { id: 'azure', name: 'Azure Dark' },
      { id: 'halflife', name: 'Half Life' },
      { id: 'carbon', name: 'Carbon' },
      { id: 'lunar-dark', name: 'Lunar Vim Dark' },
      { id: 'lunar-light', name: 'Lunar Vim Light' }
    ]);
  });
});
