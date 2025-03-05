import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import App from '../App';

describe('App', () => {
  const renderApp = () => {
    return render(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    );
  };

  it('should render main app layout', () => {
    renderApp();
    expect(screen.getByText(/Local CodeRabbit/i)).toBeInTheDocument();
  });

  it('should handle theme toggle', () => {
    renderApp();
    const themeToggle = screen.getByLabelText(/toggle theme/i);
    fireEvent.click(themeToggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should handle navigation', () => {
    renderApp();
    fireEvent.click(screen.getByText(/impact analysis/i));
    expect(screen.getByText(/impact/i)).toBeInTheDocument();
  });

  it('should handle project selection', async () => {
    renderApp();
    const selectButton = screen.getByText(/select project/i);
    fireEvent.click(selectButton);
    expect(await screen.findByText(/loading repository/i)).toBeInTheDocument();
  });
});
