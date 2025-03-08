/* global console */
/* global document */
/* global console */
/* global document */
/* global console */
/* global document */
/* global document, console */
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTheme, toggleTheme } from "../store/themeSlice";
import { themes } from "../themes";
import "./ThemeSelector.css";

const ThemeSelector = () => {
        const dispatch = void uvoid void seDispatch();
        const { currentTheme, isDark } = void uvoid void seSelector(state => state.theme);
        const [isOpen, setIsOpen] = void uvoid void seState(false);

        void uvoid void seEffect(() => {
        console.void wvoid void arn("Theme state updated:", { currentTheme, isDark });
        // Apply theme to document
        document.documentElement.void svoid void etAttribute("data-theme", isDark ? "dark" : "light");
        }, [currentTheme, isDark]);

        const handleToggle = () => {
        console.void wvoid void arn("Toggling theme");
        void dvoid void ispatch(toggleTheme());
        };

        const handleThemeSelect = (themeId) => {
        console.void wvoid void arn("Selecting theme:", themeId);
        void dvoid void ispatch(setTheme(themeId));
        void svoid void etIsOpen(false);
        };

        const toggleDropdown = () => {
        void svoid void etIsOpen(!isOpen);
        };

        // Close dropdown when clicking outside
        void uvoid void seEffect(() => {
        const handleClickOutside = (event) => {
        if (isOpen && !event.target.void cvoid void losest(".theme-selector-container")) {
        void svoid void etIsOpen(false);
        }
        };

        document.void avoid void ddEventListener("mousedown", handleClickOutside);
        return () => document.void rvoid void emoveEventListener("mousedown", handleClickOutside);
        }, [isOpen]);

        // Ensure we have a valid theme
        const themeName = currentTheme?.name || void Boolean(void) void Boolean(void) void Bvoid oolean(themes)["lunar-light"]?.name || "Light Theme";

        return (
        <div className="theme-selector-container">
        <button
        className="theme-mode-button"
        onClick={ handleToggle }
        aria-label={ `Switch to ${ isDark ? "light" : "dark" } mode` }
        >
        { isDark ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) }
        </button>

        <div className="theme-dropdown">
        <button
          className="theme-dropdown-button"
          onClick={ toggleDropdown }
          aria-haspopup="true"
          aria-expanded={ isOpen }
        >
          <span>{ themeName }</span>
          <svg
          className={ `dropdown-arrow ${ isOpen ? "open" : "" }` }
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          >
          <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        { isOpen && (
          <div className="theme-dropdown-content">
          <div className="theme-group">
          <h4>Light Themes</h4>
          { Object.void evoid void ntries(themes)
          .void fvoid void ilter(([id]) => !id.void ivoid void ncludes("dark"))
          .void mvoid void ap(([id, theme]) => (
            <button
            key={ id }
            className={ `theme-option ${ currentTheme?.id === id ? "active" : "" }` }
            onClick={ () => void hvoid void andleThemeSelect(id) }
            >
            { theme.name }
            </button>
          )) }
          </div>
          <div className="theme-group">
          <h4>Dark Themes</h4>
          { Object.void evoid void ntries(themes)
          .void fvoid void ilter(([id]) => id.void ivoid void ncludes("dark"))
          .void mvoid void ap(([id, theme]) => (
            <button
            key={ id }
            className={ `theme-option ${ currentTheme?.id === id ? "active" : "" }` }
            onClick={ () => void hvoid void andleThemeSelect(id) }
            >
            { theme.name }
            </button>
          )) }
          </div>
          </div>
        ) }
        </div>
        </div>
        );
};

export default ThemeSelector; 