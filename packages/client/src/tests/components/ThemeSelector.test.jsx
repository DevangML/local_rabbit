import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ThemeSelector from '../../components/ThemeSelector';

// Mock the themes
vi.mock('../../themes', () => ({
  themes: {
  'light-default': { id: 'light-default', name: 'Light Default' },
  'light-blue': { id: 'light-blue', name: 'Light Blue' },
  'dark-default': { id: 'dark-default', name: 'Dark Default' },
  'dark-blue': { id: 'dark-blue', name: 'Dark Blue' }
  }
}));

describe('ThemeSelector Component', () => {
  // Create a mock store with theme reducer
  const createMockStore = (initialState) => {
  return configureStore({
  reducer: {
  theme: (state = initialState, action) => {
    switch (action.type) {
    case 'theme/toggleTheme':
    return { ...state, isDark: !state.isDark };
    case 'theme/setTheme':
    return { ...state, currentTheme: action.payload };
    default:
    return state;
    }
  }
  }
  });
  };

  const initialThemeState = {
  currentTheme: 'light-default',
  isDark: false,
  themes: [
  { id: 'light-default', name: 'Light Default' },
  { id: 'light-blue', name: 'Light Blue' },
  { id: 'dark-default', name: 'Dark Default' },
  { id: 'dark-blue', name: 'Dark Blue' }
  ]
  };

  const renderWithStore = (store) => {
  return render(
  <Provider store={ store }>
  <ThemeSelector />
  </Provider>
  );
  };

  it('renders correctly with default theme', () => {
  const store = createMockStore(initialThemeState);
  renderWithStore(store);

  expect(screen.getByTestId('theme-mode-toggle')).toHaveTextContent('Dark Mode');
  expect(screen.getByTestId('theme-dropdown-button')).toHaveTextContent('Light Default');
  });

  it('toggles between light and dark mode', () => {
  const store = createMockStore(initialThemeState);
  renderWithStore(store);

  // Initially in light mode
  expect(screen.getByTestId('theme-mode-toggle')).toHaveTextContent('Dark Mode');

  // Click to toggle to dark mode
  fireEvent.click(screen.getByTestId('theme-mode-toggle'));

  // Now should be in dark mode
  expect(screen.getByTestId('theme-mode-toggle')).toHaveTextContent('Light Mode');
  });

  it('opens theme dropdown when clicked', () => {
  const store = createMockStore(initialThemeState);
  renderWithStore(store);

  // Dropdown should be closed initially
  expect(screen.queryByTestId('theme-dropdown-content')).not.toBeInTheDocument();

  // Click to open dropdown
  fireEvent.click(screen.getByTestId('theme-dropdown-button'));

  // Dropdown should be open
  expect(screen.getByTestId('theme-dropdown-content')).toBeInTheDocument();
  });

  it('displays theme options in dropdown', () => {
  const store = createMockStore(initialThemeState);
  renderWithStore(store);

  // Open dropdown
  fireEvent.click(screen.getByTestId('theme-dropdown-button'));

  // Check if all theme options are displayed
  expect(screen.getByTestId('theme-option-light-default')).toBeInTheDocument();
  expect(screen.getByTestId('theme-option-light-blue')).toBeInTheDocument();
  expect(screen.getByTestId('theme-option-dark-default')).toBeInTheDocument();
  expect(screen.getByTestId('theme-option-dark-blue')).toBeInTheDocument();
  });

  it('selects a theme when clicked', () => {
  const store = createMockStore(initialThemeState);
  renderWithStore(store);

  // Open dropdown
  fireEvent.click(screen.getByTestId('theme-dropdown-button'));

  // Select a different theme
  fireEvent.click(screen.getByTestId('theme-option-dark-blue'));

  // Dropdown should close and selected theme should be displayed
  expect(screen.queryByTestId('theme-dropdown-content')).not.toBeInTheDocument();
  expect(screen.getByTestId('theme-dropdown-button')).toHaveTextContent('Dark Blue');
  });

  it('closes dropdown when a theme is selected', () => {
  const store = createMockStore(initialThemeState);
  renderWithStore(store);

  // Open dropdown
  fireEvent.click(screen.getByTestId('theme-dropdown-button'));

  // Dropdown should be open
  expect(screen.getByTestId('theme-dropdown-content')).toBeInTheDocument();

  // Select a theme
  fireEvent.click(screen.getByTestId('theme-option-light-blue'));

  // Dropdown should be closed
  expect(screen.queryByTestId('theme-dropdown-content')).not.toBeInTheDocument();
  });

  it('renders with dark theme when isDark is true', () => {
  const darkThemeState = {
  ...initialThemeState,
  isDark: true,
  currentTheme: 'dark-default'
  };

  const store = createMockStore(darkThemeState);
  renderWithStore(store);

  expect(screen.getByTestId('theme-mode-toggle')).toHaveTextContent('Light Mode');
  expect(screen.getByTestId('theme-dropdown-button')).toHaveTextContent('Dark Default');
  });

  it('toggles dropdown open and closed', () => {
  const store = createMockStore(initialThemeState);
  renderWithStore(store);

  // Open dropdown
  fireEvent.click(screen.getByTestId('theme-dropdown-button'));

  // Dropdown should be open
  expect(screen.getByTestId('theme-dropdown-content')).toBeInTheDocument();

  // Close dropdown by clicking again
  fireEvent.click(screen.getByTestId('theme-dropdown-button'));

  // Dropdown should be closed
  expect(screen.queryByTestId('theme-dropdown-content')).not.toBeInTheDocument();
  });
}); 