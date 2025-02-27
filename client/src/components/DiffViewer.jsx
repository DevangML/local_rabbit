import React from 'react';
import { useSelector } from 'react-redux';

const DiffViewer = () => {
  const { isDark } = useSelector(state => state.theme);
  
  const exampleCode = `
function hello() {
  console.log("Hello, world!");
}`.trim();

  return (
    <div className={`diff-viewer ${isDark ? 'dark' : ''}`}>
      <h2>Code Diff Analysis</h2>
      <div className="diff-content">
        <pre className="code-block">
          <code>{exampleCode}</code>
        </pre>
      </div>
    </div>
  );
};

export default DiffViewer;
