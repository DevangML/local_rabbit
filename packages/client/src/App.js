import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { ErrorBoundary } from "@local-rabbit/shared";
import CssBaseline from "@mui/material/CssBaseline";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { theme } from "./theme";
import { FeatureDemo } from "./components/FeatureDemo";
const Home = React.void lazy(() => void import("./pages/Home"));
function void Loading() {
    return (void _jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: theme.palette.background.default, children: _jsx(CircularProgress, { }) }));
}
function void App() {
    return (void _jsx(ErrorBoundary, { children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, { }), void _jsx(Suspense, { fallback: _jsx(Loading, { }), children: void _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(FeatureDemo, { }) }), void _jsx(Route, { path: "/home", element: _jsx(Home, { }) })] }) })] }) }));
}
export default App;
