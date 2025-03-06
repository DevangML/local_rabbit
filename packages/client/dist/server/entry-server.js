import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { StaticRouter } from "react-router-dom/server.js";
import { createTheme, ThemeProvider } from "@mui/material/styles/index.js";
import Box$1 from "@mui/material/Box/index.js";
import CssBaseline from "@mui/material/CssBaseline/index.js";
import { Routes, Route } from "react-router-dom";
import { Box, Paper, Typography } from "@mui/material";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2"
    },
    secondary: {
      main: "#dc004e"
    }
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif"
    ].join(",")
  }
});
const FeatureDemo = React.memo(function FeatureDemo2() {
  return /* @__PURE__ */ jsxDEV(Box, { sx: { p: 3, maxWidth: 600, mx: "auto" }, children: [
    /* @__PURE__ */ jsxDEV(Paper, { elevation: 3, sx: { p: 3, mb: 3 }, children: [
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h4", gutterBottom: true, children: "Web Worker Demo" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/FeatureDemo.ssr.jsx",
        lineNumber: 9,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Typography, { variant: "body1", paragraph: true, children: "This demo calculates Fibonacci(40) using a web worker to avoid blocking the main thread. (Interactive features available in client-side rendering)" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/FeatureDemo.ssr.jsx",
        lineNumber: 12,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/FeatureDemo.ssr.jsx",
      lineNumber: 8,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Paper, { elevation: 3, sx: { p: 3, mt: 3 }, children: [
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h4", gutterBottom: true, children: "Image Processing Demo" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/FeatureDemo.ssr.jsx",
        lineNumber: 19,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Typography, { variant: "body1", paragraph: true, children: "This demo processes an image using a web worker. (Interactive features available in client-side rendering)" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/FeatureDemo.ssr.jsx",
        lineNumber: 22,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/FeatureDemo.ssr.jsx",
      lineNumber: 18,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/FeatureDemo.ssr.jsx",
    lineNumber: 7,
    columnNumber: 5
  }, this);
});
function SSRApp() {
  return /* @__PURE__ */ jsxDEV(Box$1, { sx: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh"
  }, children: /* @__PURE__ */ jsxDEV(ThemeProvider, { theme, children: [
    /* @__PURE__ */ jsxDEV(CssBaseline, {}, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
      lineNumber: 21,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(Routes, { children: [
      /* @__PURE__ */ jsxDEV(Route, { path: "/", element: /* @__PURE__ */ jsxDEV(FeatureDemo, {}, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
        lineNumber: 23,
        columnNumber: 36
      }, this) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
        lineNumber: 23,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/home", element: /* @__PURE__ */ jsxDEV("div", { children: "Home Page" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
        lineNumber: 24,
        columnNumber: 40
      }, this) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
        lineNumber: 24,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
      lineNumber: 22,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
    lineNumber: 20,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
    lineNumber: 15,
    columnNumber: 5
  }, this);
}
function renderPage(url) {
  return /* @__PURE__ */ jsxDEV(StaticRouter, { location: url, children: /* @__PURE__ */ jsxDEV(SSRApp, {}, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
    lineNumber: 35,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
    lineNumber: 34,
    columnNumber: 5
  }, this);
}
function render(props) {
  const { url } = props;
  return renderPage(url);
}
export {
  render as default,
  renderPage
};
