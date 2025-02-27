import React, { Suspense, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import ThemeToggle from "./components/ThemeToggle";
import ProjectSelector from "./components/ProjectSelector";
import { themes } from './themes';  // Update import path

const DiffViewer = React.lazy(() => import("./components/DiffViewer"));
const ImpactView = React.lazy(() => import("./components/ImpactView"));
const QualityView = React.lazy(() => import("./components/QualityView"));

function App() {
  const dispatch = useDispatch();
  const { isDark, currentTheme } = useSelector(state => state.theme);
  const { activeView } = useSelector(state => state.diffView);
  const [selectedProject, setSelectedProject] = useState(null);

  const theme = themes[currentTheme || (isDark ? 'dark-default' : 'light-default')];

  // Apply theme variables to document root
  React.useEffect(() => {
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, [theme]);

  const toggleTheme = () => {
    dispatch({ type: 'theme/toggleTheme' });
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    // Optional: Save to localStorage or redux store
    localStorage.setItem('lastProject', JSON.stringify(project));
  };

  const handleViewChange = (view) => {
    dispatch({ type: 'diffView/setActiveView', payload: view });
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <header className="app-header">
        <div className="header-content">
          <h1>Local CodeRabbit</h1>
          <nav className="main-nav">
            <button 
              className={`nav-btn ${activeView === 'diff' ? 'active' : ''}`}
              onClick={() => handleViewChange('diff')}
            >
              Diff View
            </button>
            <button 
              className={`nav-btn ${activeView === 'impact' ? 'active' : ''}`}
              onClick={() => handleViewChange('impact')}
            >
              Impact Analysis
            </button>
            <button 
              className={`nav-btn ${activeView === 'quality' ? 'active' : ''}`}
              onClick={() => handleViewChange('quality')}
            >
              Quality Metrics
            </button>
          </nav>
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </header>

      <main className="app-main">
        <Suspense fallback={<div className="loading">Loading view...</div>}>
          {activeView === 'diff' && <DiffViewer repository={selectedRepo} />}
          {activeView === 'impact' && <ImpactView repository={selectedRepo} />}
          {activeView === 'quality' && <QualityView repository={selectedRepo} />}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
