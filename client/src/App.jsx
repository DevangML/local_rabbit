import React, { Suspense } from "react";
import { useSelector, useDispatch } from 'react-redux';
import ThemeToggle from "./components/ThemeToggle.jsx";
const DiffViewer = React.lazy(() => import("./components/DiffViewer.jsx"));
const ImpactView = React.lazy(() => import("./components/ImpactView.jsx"));
const QualityView = React.lazy(() => import("./components/QualityView.jsx"));

function App() {
  const dispatch = useDispatch();
  const { isDark } = useSelector(state => state.theme);
  const { activeView } = useSelector(state => state.diffView);

  const toggleTheme = () => {
    dispatch({ type: 'theme/toggleTheme' });
    document.body.classList.toggle('dark-theme');
  };

  const handleViewChange = (view) => {
    dispatch({ type: 'diffView/setActiveView', payload: view });
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <header>
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        <nav>
          <button onClick={() => handleViewChange('diff')}>Diff View</button>
          <button onClick={() => handleViewChange('impact')}>Impact Analysis</button>
          <button onClick={() => handleViewChange('quality')}>Quality Metrics</button>
        </nav>
      </header>
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          {activeView === 'diff' && <DiffViewer />}
          {activeView === 'impact' && <ImpactView />}
          {activeView === 'quality' && <QualityView />}
        </Suspense>
      </main>
    </div>
  );
}

export default App;
