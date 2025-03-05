import { describe, it, expect, beforeEach } from 'vitest';
import themeReducer, { setTheme, toggleTheme } from '../../store/themeSlice';

describe('Theme Slice', () => {
  let initialState;

  beforeEach(() => {
    initialState = {
      currentTheme: 'light-default',
      isDark: false,
      themes: [
        { id: 'light-default', name: 'Light' },
        { id: 'dark-default', name: 'Dark' }
      ]
    };
  });

  it('should handle initial state', () => {
    expect(themeReducer(undefined, { type: 'unknown' })).toEqual(expect.objectContaining({
      isDark: expect.any(Boolean),
      themes: expect.any(Array)
    }));
  });

  it('should handle setTheme', () => {
    const actual = themeReducer(initialState, setTheme('dark-default'));
    expect(actual.currentTheme).toBe('dark-default');
    expect(actual.isDark).toBe(true);
  });

  it('should handle toggleTheme', () => {
    const actual = themeReducer(initialState, toggleTheme());
    expect(actual.isDark).toBe(true);
    expect(actual.currentTheme).toBe('dark-default');
  });

  it('should persist theme to localStorage', () => {
    const actual = themeReducer(initialState, setTheme('dark-default'));
    expect(localStorage.getItem('theme')).toBe('dark-default');
  });
});
