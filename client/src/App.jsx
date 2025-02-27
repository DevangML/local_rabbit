import React, { useState, useEffect, Suspense } from "react";
import ThemeToggle from "./components/ThemeToggle.jsx";
const DiffViewer = React.lazy(() => import("./components/DiffViewer.jsx"));
const ImpactView = React.lazy(() => import("./components/ImpactView.jsx"));
const QualityView = React.lazy(() => import("./components/QualityView.jsx"));

function App() {
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState('diff');

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark-theme');
  };

  return (
    <div className={`app ${isDark ? 'dark' : 'light'}`}>
      <header>
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        <nav>
          <button onClick={() => setActiveView('diff')}>Diff View</button>
          <button onClick={() => setActiveView('impact')}>Impact Analysis</button>
          <button onClick={() => setActiveView('quality')}>Quality Metrics</button>
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
