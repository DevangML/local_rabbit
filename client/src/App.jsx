import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from './store/themeSlice';
import { themes } from './themes';
import ProjectSelector from './components/ProjectSelector';
import ThemeToggle from './components/ThemeToggle';
import DiffViewer from './components/DiffViewer';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { currentTheme, isDark } = useSelector(state => state.theme);
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

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedBranches({ from: '', to: '' });
  };

  return (
    <div className={`app ${isDark ? 'theme-dark' : 'theme-light'}`}>
      <header className="app-header">
        <div className="header-content"></div>
          <h1>Local CodeRabbit</h1>
          <div className="theme-selector">
            <select 
              value={currentTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              {Object.entries(themes).map(([id, theme]) => (
                <option key={id} value={id}>{theme.name}</option>
              ))}
            </select>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="app-main">
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
      </main>
    </div>
  );
}

export default App;
