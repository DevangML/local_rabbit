import React, { useEffect, useState, useRef } from 'react';
import { themes } from '../themes';

const ThemeToggle = () => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && themes[savedTheme]) {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-default' : 'light-default';
    }
    return 'light-default';
  });

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? 'dark-default' : 'light-default';
      const savedTheme = localStorage.getItem('theme');
      setCurrentTheme(savedTheme || systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const theme = themes[currentTheme];

    // Remove all theme classes
    Object.keys(themes).forEach(themeName => {
      root.classList.remove(themeName);
    });

    // Add current theme class
    root.classList.add(currentTheme);

    // Apply theme colors to CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(cssVar, value);
    });

    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleThemeChange = (themeName) => {
    setCurrentTheme(themeName);
    setIsOpen(false);
  };

  const handleKeyDown = (event, themeName) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleThemeChange(themeName);
    }
  };

  return (
    <div className="theme-selector">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="theme-toggle"
        aria-label={`Change theme (current: ${themes[currentTheme].name})`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {currentTheme.includes('dark') ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
        <span className="theme-name">{themes[currentTheme].name}</span>
      </button>

      {isOpen && (
        <>
          <div className="theme-backdrop" onClick={() => setIsOpen(false)} />
          <div 
            className="theme-dropdown" 
            role="menu" 
            ref={dropdownRef}
            aria-label="Theme selection"
          >
            <div className="theme-group">
              <div className="theme-group-title" role="presentation">Light Themes</div>
              {Object.entries(themes)
                .filter(([key]) => key.includes('light'))
                .map(([key, theme]) => (
                  <button
                    key={key}
                    className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                    onClick={() => handleThemeChange(key)}
                    onKeyDown={(e) => handleKeyDown(e, key)}
                    role="menuitem"
                    aria-current={currentTheme === key}
                    tabIndex={0}
                  >
                    <div className="theme-preview" style={{ backgroundColor: theme.colors.bgPrimary }}>
                      <div className="theme-preview-accent" style={{ backgroundColor: theme.colors.accent }}></div>
                    </div>
                    <span>{theme.name}</span>
                  </button>
                ))}
            </div>

            <div className="theme-group">
              <div className="theme-group-title" role="presentation">Dark Themes</div>
              {Object.entries(themes)
                .filter(([key]) => key.includes('dark') || (!key.includes('light') && !key.includes('default')))
                .map(([key, theme]) => (
                  <button
                    key={key}
                    className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                    onClick={() => handleThemeChange(key)}
                    onKeyDown={(e) => handleKeyDown(e, key)}
                    role="menuitem"
                    aria-current={currentTheme === key}
                    tabIndex={0}
                  >
                    <div className="theme-preview" style={{ backgroundColor: theme.colors.bgPrimary }}>
                      <div className="theme-preview-accent" style={{ backgroundColor: theme.colors.accent }}></div>
                    </div>
                    <span>{theme.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle; 