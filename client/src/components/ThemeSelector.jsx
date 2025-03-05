import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme, toggleTheme } from '../store/themeSlice';
import { themes } from '../themes';
import './ThemeSelector.css';

const ThemeSelector = () => {
  const dispatch = useDispatch();
  const { currentTheme, isDark, themes: themeList } = useSelector(state => state.theme);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const handleThemeSelect = (themeId) => {
    dispatch(setTheme(themeId));
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
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

      <div className="theme-dropdown">
        <button
          className="theme-dropdown-button"
          onClick={toggleDropdown}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {themes[currentTheme]?.name || 'Select Theme'}
          <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>

        {isOpen && (
          <div className="theme-dropdown-content">
            <div className="theme-group">
              <h4>Dark Themes</h4>
              {themeList
                .filter(theme => theme.id.includes('dark'))
                .map(theme => (
                  <button
                    key={theme.id}
                    className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    {theme.name}
                  </button>
                ))}
            </div>
            <div className="theme-group">
              <h4>Light Themes</h4>
              {themeList
                .filter(theme => !theme.id.includes('dark'))
                .map(theme => (
                  <button
                    key={theme.id}
                    className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    {theme.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSelector; 