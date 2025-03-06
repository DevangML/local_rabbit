import React from 'react';
import App from './App';
import { StaticRouter } from 'react-router-dom/server';

export default function render(props) {
  return (
    <StaticRouter location={props.url}>
      <App />
    </StaticRouter>
  );
} 