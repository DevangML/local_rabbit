import { describe, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DiffViewer from '../../../components/DiffViewer';

const mockStore = configureStore([]);

describe('DiffViewer', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      theme: { isDark: false }
    });
  });

  it('should render empty state when no branches selected', () => {
    render(
      <Provider store={store}>
        <DiffViewer fromBranch="" toBranch="" />
      </Provider>
    );

    expect(screen.getByText(/select both branches/i)).toBeInTheDocument();
  });

  // Add more test cases...
});
