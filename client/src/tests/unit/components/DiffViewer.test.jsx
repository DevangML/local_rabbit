import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DiffViewer from '../../../components/DiffViewer';
import themeReducer from '../../../store/themeSlice';

describe('DiffViewer', () => {
  const renderWithRedux = (component) => {
    const store = configureStore({
      reducer: {
        theme: themeReducer
      }
    });

    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  it('should render empty state when no branches selected', () => {
    renderWithRedux(<DiffViewer fromBranch={null} toBranch={null} diffData={null} />);
    expect(screen.getByText(/Both 'from' and 'to' branches must be selected/i)).toBeInTheDocument();
  });

  it('should render loading state', () => {
    renderWithRedux(
      <DiffViewer
        fromBranch="main"
        toBranch="develop"
        diffData={null}
        isLoading={true}
      />
    );
    expect(screen.getByText(/Analyzing changes/i)).toBeInTheDocument();
  });

  it('should render diff data', () => {
    const mockDiffData = {
      files: [
        {
          path: 'test.js',
          changes: [
            { type: 'add', content: 'new line', lineNumber: 1 }
          ]
        }
      ]
    };

    renderWithRedux(
      <DiffViewer
        fromBranch="main"
        toBranch="develop"
        diffData={mockDiffData}
      />
    );

    expect(screen.getByText(/Select a file to view differences/i)).toBeInTheDocument();
  });
});
