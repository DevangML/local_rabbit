import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ErrorBoundary } from '@local-rabbit/shared';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { theme } from './theme';
import { FeatureDemo } from './components/FeatureDemo';
const Home = React.lazy(() => import('./pages/Home'));
function Loading() {
    return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: theme.palette.background.default, children: _jsx(CircularProgress, {}) }));
}
function App() {
    return (_jsx(ErrorBoundary, { children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsx(Suspense, { fallback: _jsx(Loading, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(FeatureDemo, {}) }), _jsx(Route, { path: "/home", element: _jsx(Home, {}) })] }) })] }) }));
}
export default App;
