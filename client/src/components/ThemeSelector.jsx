import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/reducers/themeReducer';
import './ThemeSelector.css';

const ThemeSelector = () => {
  const dispatch = useDispatch();
  const { isDark } = useSelector(state => state.theme);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div className="theme-selector-container">
      <button
        className="theme-mode-button"
        onClick={handleToggle}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
};

export default ThemeSelector; 