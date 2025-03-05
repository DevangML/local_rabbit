import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme, toggleTheme } from './store/themeSlice';
import { MdDarkMode, MdLightMode, MdBrightness6 } from 'react-icons/md';
import ProjectSelector from './components/ProjectSelector';
import DiffViewer from './components/DiffViewer';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { currentTheme, isDark, themes } = useSelector(state => state.theme);
  const [selectedBranches, setSelectedBranches] = useState({ from: '', to: '' });
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Apply theme
  useEffect(() => {
    const theme = themes[currentTheme];
    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
    }
  }, [currentTheme]);

  const handleThemeChange = (themeId) => {
    dispatch(setTheme(themeId));
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedBranches({ from: '', to: '' });
  };

  return (
    <div className={`app ${isDark ? 'theme-dark' : 'theme-light'}`}>
      <header className="app-header">
        <div className="header-content">
          <h1>Local CodeRabbit</h1>
          <div className="theme-controls">
            <div className="theme-selector">
              <select 
                value={currentTheme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="theme-select"
              >
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>{theme.name}</option>
                ))}
              </select>
            </div>
            <button 
              className="theme-toggle-btn" 
              onClick={handleThemeToggle}
              aria-label="Toggle theme"
            >
              {isDark ? <MdLightMode /> : <MdDarkMode />}
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <ProjectSelector
            onProjectSelect={handleProjectSelect}
            selectedBranches={selectedBranches}
            onBranchesChange={setSelectedBranches}
            isLoading={isLoading}
          />

          {selectedProject && selectedBranches.from && selectedBranches.to && (
            <DiffViewer
              projectId={selectedProject.id}
              fromBranch={selectedBranches.from}
              toBranch={selectedBranches.to}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>Local CodeRabbit © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
