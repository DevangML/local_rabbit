import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BranchSelector from '../../components/BranchSelector';

describe('BranchSelector', () => {
  const mockBranches = ['main', 'develop', 'feature/test'];
  const mockOnSelect = vi.fn();

  it('should render branch options', () => {
  render(
  <BranchSelector
  branches={ mockBranches }
  selectedBranch={ null }
  onSelect={ mockOnSelect }
  label='Select Branch'
  />
  );

  expect(screen.getByText('Select Branch')).toBeInTheDocument();
  expect(screen.getByText('main')).toBeInTheDocument();
  expect(screen.getByText('develop')).toBeInTheDocument();
  expect(screen.getByText('feature/test')).toBeInTheDocument();
  });

  it('should show selected branch', () => {
  render(
  <BranchSelector
  branches={ mockBranches }
  selectedBranch='develop'
  onSelect={ mockOnSelect }
  label='Select Branch'
  />
  );

  const select = screen.getByRole('combobox');
  expect(select.value).toBe('develop');
  });

  it('should call onSelect when a branch is selected', () => {
  render(
  <BranchSelector
  branches={ mockBranches }
  selectedBranch={ null }
  onSelect={ mockOnSelect }
  label='Select Branch'
  />
  );

  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'develop' } });
  expect(mockOnSelect).toHaveBeenCalledWith('develop');
  });

  it('should render empty state when no branches are provided', () => {
  render(
  <BranchSelector
  branches={ [] }
  selectedBranch={ null }
  onSelect={ mockOnSelect }
  label='Select Branch'
  />
  );

  expect(screen.getByText('No branches available')).toBeInTheDocument();
  });

  it('should be disabled when loading', () => {
  render(
  <BranchSelector
  branches={ mockBranches }
  selectedBranch={ null }
  onSelect={ mockOnSelect }
  label='Select Branch'
  isLoading={ true }
  />
  );

  expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
