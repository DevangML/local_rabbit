// Browser-compatible version without JSX syntax
// This file is loaded directly by the browser without transpilation

// Using globals from CDN scripts
const React = window.React;
const ReactDOM = window.ReactDOM;
const ReactRouterDOM = window.ReactRouterDOM;

// Create a simple loading component using React.createElement
const Loading = () => {
  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '20px'
      }
    },
    'Loading...'
  );
};

// Create a simple App using React.createElement
const App = () => {
  return React.createElement(
    'div',
    {
      className: 'app-container',
      style: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px'
      }
    },
    [
      React.createElement('h1', { key: 'title' }, 'Welcome to Local Rabbit'),
      React.createElement('p', { key: 'description' },
        'This page is rendered using a browser-compatible JavaScript file.'
      ),
      React.createElement('div', {
        key: 'content',
        style: {
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          marginTop: '20px'
        }
      }, 'Application content will appear here')
    ]
  );
};

// Root element
const rootElement = document.getElementById('root');

// Render the App component to the root element
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    React.createElement(App)
  );
} else {
  console.error('Root element not found!');
  document.body.appendChild(
    document.createTextNode('Error: Root element not found!')
  );
} 