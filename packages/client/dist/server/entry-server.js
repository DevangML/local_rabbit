import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import React, { useState, createContext, useEffect, useContext, Suspense } from "react";
import { Paper, Typography, Box, FormControl, InputLabel, Select, MenuItem, CircularProgress, useTheme as useTheme$1, useMediaQuery, AppBar, Toolbar, Tabs, Tab, IconButton, Container, TextField, Button, ThemeProvider as ThemeProvider$1, CssBaseline } from "@mui/material";
import { useLocation, Link, BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CompareArrows, GitHub, Brightness7, DarkMode, Folder, Analytics, Speed, Code } from "@mui/icons-material";
import { motion } from "framer-motion";
import { createTheme } from "@mui/material/styles/index.js";
import { StaticRouter } from "react-router-dom/server.js";
const BranchSelector = ({
  branches = [],
  fromBranch,
  toBranch,
  onFromBranchChange,
  onToBranchChange,
  isLoadingBranches
}) => {
  return /* @__PURE__ */ jsxDEV(
    Paper,
    {
      elevation: 0,
      sx: {
        p: 2,
        mb: 3,
        border: "1px solid",
        borderColor: "divider"
      },
      children: [
        /* @__PURE__ */ jsxDEV(Typography, { variant: "subtitle2", sx: { mb: 2, color: "text.secondary" }, children: "Branch Selection" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
          lineNumber: 32,
          columnNumber: 7
        }, void 0),
        /* @__PURE__ */ jsxDEV(
          Box,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: { xs: "wrap", md: "nowrap" }
            },
            children: [
              /* @__PURE__ */ jsxDEV(
                FormControl,
                {
                  size: "small",
                  fullWidth: true,
                  disabled: isLoadingBranches || branches.length === 0,
                  children: [
                    /* @__PURE__ */ jsxDEV(InputLabel, { children: "Source Branch" }, void 0, false, {
                      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                      lineNumber: 49,
                      columnNumber: 11
                    }, void 0),
                    /* @__PURE__ */ jsxDEV(
                      Select,
                      {
                        value: fromBranch,
                        label: "Source Branch",
                        onChange: (e) => onFromBranchChange(e.target.value),
                        children: branches.map((branch) => /* @__PURE__ */ jsxDEV(
                          MenuItem,
                          {
                            value: branch,
                            disabled: branch === toBranch,
                            children: branch
                          },
                          branch,
                          false,
                          {
                            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                            lineNumber: 56,
                            columnNumber: 15
                          },
                          void 0
                        ))
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                        lineNumber: 50,
                        columnNumber: 11
                      },
                      void 0
                    )
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                  lineNumber: 44,
                  columnNumber: 9
                },
                void 0
              ),
              /* @__PURE__ */ jsxDEV(
                Box,
                {
                  sx: {
                    display: "flex",
                    alignItems: "center",
                    color: "text.secondary"
                  },
                  children: /* @__PURE__ */ jsxDEV(CompareArrows, {}, void 0, false, {
                    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                    lineNumber: 74,
                    columnNumber: 11
                  }, void 0)
                },
                void 0,
                false,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                  lineNumber: 67,
                  columnNumber: 9
                },
                void 0
              ),
              /* @__PURE__ */ jsxDEV(
                FormControl,
                {
                  size: "small",
                  fullWidth: true,
                  disabled: isLoadingBranches || branches.length === 0,
                  children: [
                    /* @__PURE__ */ jsxDEV(InputLabel, { children: "Target Branch" }, void 0, false, {
                      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                      lineNumber: 82,
                      columnNumber: 11
                    }, void 0),
                    /* @__PURE__ */ jsxDEV(
                      Select,
                      {
                        value: toBranch,
                        label: "Target Branch",
                        onChange: (e) => onToBranchChange(e.target.value),
                        children: branches.map((branch) => /* @__PURE__ */ jsxDEV(
                          MenuItem,
                          {
                            value: branch,
                            disabled: branch === fromBranch,
                            children: branch
                          },
                          branch,
                          false,
                          {
                            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                            lineNumber: 89,
                            columnNumber: 15
                          },
                          void 0
                        ))
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                        lineNumber: 83,
                        columnNumber: 11
                      },
                      void 0
                    )
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                  lineNumber: 77,
                  columnNumber: 9
                },
                void 0
              ),
              isLoadingBranches && /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", alignItems: "center" }, children: /* @__PURE__ */ jsxDEV(CircularProgress, { size: 20 }, void 0, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                lineNumber: 102,
                columnNumber: 13
              }, void 0) }, void 0, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
                lineNumber: 101,
                columnNumber: 11
              }, void 0)
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
            lineNumber: 36,
            columnNumber: 7
          },
          void 0
        ),
        branches.length === 0 && !isLoadingBranches && /* @__PURE__ */ jsxDEV(
          Typography,
          {
            variant: "body2",
            color: "text.secondary",
            sx: { mt: 1, fontSize: "0.875rem" },
            children: "Please select a repository to view available branches"
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
            lineNumber: 108,
            columnNumber: 9
          },
          void 0
        )
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/BranchSelector/BranchSelector.jsx",
      lineNumber: 23,
      columnNumber: 5
    },
    void 0
  );
};
const MainLayout = ({
  children,
  onRepoPathChange,
  branches,
  fromBranch,
  toBranch,
  onFromBranchChange,
  onToBranchChange,
  isLoadingBranches,
  onToggleTheme,
  isDarkMode
}) => {
  const theme = useTheme$1();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [repoPath, setRepoPath] = useState("");
  const tabs = [
    { label: "Products", path: "/products" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
    { label: "Documentation", path: "/docs" }
  ];
  const secondaryTabs = [
    { label: "Diff Viewer", icon: /* @__PURE__ */ jsxDEV(CompareArrows, {}, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
      lineNumber: 56,
      columnNumber: 35
    }, void 0), path: "/diff" },
    { label: "AI Analyzer", icon: /* @__PURE__ */ jsxDEV(Analytics, {}, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
      lineNumber: 57,
      columnNumber: 35
    }, void 0), path: "/analyze" },
    { label: "Impact View", icon: /* @__PURE__ */ jsxDEV(Speed, {}, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
      lineNumber: 58,
      columnNumber: 35
    }, void 0), path: "/impact" },
    { label: "Quality Check", icon: /* @__PURE__ */ jsxDEV(Code, {}, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
      lineNumber: 59,
      columnNumber: 37
    }, void 0), path: "/quality" }
  ];
  const handleRepoSubmit = (e) => {
    e.preventDefault();
    onRepoPathChange == null ? void 0 : onRepoPathChange(repoPath);
  };
  const isToolPage = ["/diff", "/analyze", "/impact", "/quality"].includes(location.pathname);
  const isProductsPage = location.pathname === "/products";
  return /* @__PURE__ */ jsxDEV(Box, { sx: {
    minHeight: "100vh",
    background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
    color: theme.palette.text.primary
  }, children: [
    /* @__PURE__ */ jsxDEV(AppBar, { position: "fixed", elevation: 0, children: /* @__PURE__ */ jsxDEV(Toolbar, { sx: { justifyContent: "space-between" }, children: [
      /* @__PURE__ */ jsxDEV(
        motion.div,
        {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.5 },
          children: /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", alignItems: "center" }, children: /* @__PURE__ */ jsxDEV(
            Typography,
            {
              variant: "h6",
              component: Link,
              to: "/",
              sx: {
                display: "flex",
                alignItems: "center",
                fontFamily: theme.typography.fontFamily,
                fontWeight: 600,
                textDecoration: "none",
                color: "inherit"
              },
              children: [
                /* @__PURE__ */ jsxDEV(Box, { component: "img", src: "/logo.svg", sx: { height: 32, mr: 2 } }, void 0, false, {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                  lineNumber: 97,
                  columnNumber: 17
                }, void 0),
                !isMobile && "Local Rabbit"
              ]
            },
            void 0,
            true,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
              lineNumber: 84,
              columnNumber: 15
            },
            void 0
          ) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
            lineNumber: 83,
            columnNumber: 13
          }, void 0)
        },
        void 0,
        false,
        {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
          lineNumber: 78,
          columnNumber: 11
        },
        void 0
      ),
      /* @__PURE__ */ jsxDEV(
        Tabs,
        {
          value: tabs.find((tab) => tab.path === location.pathname) ? location.pathname : false,
          sx: {
            "& .MuiTab-root": {
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main"
              }
            }
          },
          children: tabs.map((tab) => /* @__PURE__ */ jsxDEV(
            Tab,
            {
              label: tab.label,
              value: tab.path,
              component: Link,
              to: tab.path,
              sx: { minWidth: 100 }
            },
            tab.path,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
              lineNumber: 115,
              columnNumber: 15
            },
            void 0
          ))
        },
        void 0,
        false,
        {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
          lineNumber: 103,
          columnNumber: 11
        },
        void 0
      ),
      /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", gap: 2 }, children: [
        /* @__PURE__ */ jsxDEV(
          IconButton,
          {
            color: "inherit",
            "aria-label": "github repository",
            component: "a",
            href: "https://github.com/yourusername/local_rabbit",
            target: "_blank",
            rel: "noopener noreferrer",
            children: /* @__PURE__ */ jsxDEV(GitHub, {}, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
              lineNumber: 135,
              columnNumber: 15
            }, void 0)
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
            lineNumber: 127,
            columnNumber: 13
          },
          void 0
        ),
        /* @__PURE__ */ jsxDEV(
          IconButton,
          {
            color: "inherit",
            "aria-label": "toggle theme",
            onClick: onToggleTheme,
            children: isDarkMode ? /* @__PURE__ */ jsxDEV(Brightness7, {}, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
              lineNumber: 142,
              columnNumber: 29
            }, void 0) : /* @__PURE__ */ jsxDEV(DarkMode, {}, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
              lineNumber: 142,
              columnNumber: 51
            }, void 0)
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
            lineNumber: 137,
            columnNumber: 13
          },
          void 0
        )
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
        lineNumber: 126,
        columnNumber: 11
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
      lineNumber: 77,
      columnNumber: 9
    }, void 0) }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
      lineNumber: 76,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV(
      Box,
      {
        component: "main",
        sx: {
          flexGrow: 1,
          pt: "64px"
          // Height of AppBar
        },
        children: [
          /* @__PURE__ */ jsxDEV(Container, { maxWidth: "xl", sx: { py: 3 }, children: [
            isProductsPage && /* @__PURE__ */ jsxDEV(Fragment, { children: [
              /* @__PURE__ */ jsxDEV(
                Paper,
                {
                  elevation: 0,
                  sx: {
                    p: 2,
                    mb: 3,
                    border: "1px solid",
                    borderColor: "divider"
                  },
                  children: /* @__PURE__ */ jsxDEV("form", { onSubmit: handleRepoSubmit, children: [
                    /* @__PURE__ */ jsxDEV(Typography, { variant: "subtitle2", sx: { mb: 1, color: "text.secondary" }, children: "Repository Path" }, void 0, false, {
                      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                      lineNumber: 168,
                      columnNumber: 19
                    }, void 0),
                    /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", gap: 1 }, children: [
                      /* @__PURE__ */ jsxDEV(
                        TextField,
                        {
                          size: "small",
                          fullWidth: true,
                          placeholder: "/path/to/repo",
                          value: repoPath,
                          onChange: (e) => setRepoPath(e.target.value),
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "background.paper"
                            }
                          }
                        },
                        void 0,
                        false,
                        {
                          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                          lineNumber: 172,
                          columnNumber: 21
                        },
                        void 0
                      ),
                      /* @__PURE__ */ jsxDEV(IconButton, { size: "small", onClick: () => {
                      }, children: /* @__PURE__ */ jsxDEV(Folder, {}, void 0, false, {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                        lineNumber: 185,
                        columnNumber: 23
                      }, void 0) }, void 0, false, {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                        lineNumber: 184,
                        columnNumber: 21
                      }, void 0),
                      /* @__PURE__ */ jsxDEV(
                        Button,
                        {
                          variant: "contained",
                          type: "submit",
                          sx: { minWidth: 100 },
                          children: "Set Repo"
                        },
                        void 0,
                        false,
                        {
                          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                          lineNumber: 187,
                          columnNumber: 21
                        },
                        void 0
                      )
                    ] }, void 0, true, {
                      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                      lineNumber: 171,
                      columnNumber: 19
                    }, void 0)
                  ] }, void 0, true, {
                    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                    lineNumber: 167,
                    columnNumber: 17
                  }, void 0)
                },
                void 0,
                false,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                  lineNumber: 158,
                  columnNumber: 15
                },
                void 0
              ),
              repoPath && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                /* @__PURE__ */ jsxDEV(
                  BranchSelector,
                  {
                    branches,
                    fromBranch,
                    toBranch,
                    onFromBranchChange,
                    onToBranchChange,
                    isLoadingBranches
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                    lineNumber: 200,
                    columnNumber: 19
                  },
                  void 0
                ),
                /* @__PURE__ */ jsxDEV(
                  Paper,
                  {
                    elevation: 0,
                    sx: {
                      mb: 3,
                      border: "1px solid",
                      borderColor: "divider"
                    },
                    children: /* @__PURE__ */ jsxDEV(
                      Tabs,
                      {
                        value: isToolPage ? location.pathname : false,
                        variant: "scrollable",
                        scrollButtons: "auto",
                        sx: {
                          borderBottom: 1,
                          borderColor: "divider",
                          "& .MuiTab-root": {
                            minHeight: 48
                          }
                        },
                        children: secondaryTabs.map((tab) => /* @__PURE__ */ jsxDEV(
                          Tab,
                          {
                            label: tab.label,
                            icon: tab.icon,
                            iconPosition: "start",
                            value: tab.path,
                            component: Link,
                            to: tab.path,
                            sx: {
                              minHeight: 48,
                              textTransform: "none"
                            }
                          },
                          tab.path,
                          false,
                          {
                            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                            lineNumber: 230,
                            columnNumber: 25
                          },
                          void 0
                        ))
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                        lineNumber: 217,
                        columnNumber: 21
                      },
                      void 0
                    )
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                    lineNumber: 209,
                    columnNumber: 19
                  },
                  void 0
                )
              ] }, void 0, true, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                lineNumber: 199,
                columnNumber: 17
              }, void 0)
            ] }, void 0, true, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
              lineNumber: 157,
              columnNumber: 13
            }, void 0),
            /* @__PURE__ */ jsxDEV(
              motion.div,
              {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5, delay: 0.2 },
                children
              },
              void 0,
              false,
              {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                lineNumber: 251,
                columnNumber: 11
              },
              void 0
            )
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
            lineNumber: 155,
            columnNumber: 9
          }, void 0),
          /* @__PURE__ */ jsxDEV(
            Box,
            {
              component: "footer",
              sx: {
                py: 3,
                px: 2,
                mt: "auto",
                backgroundColor: theme.palette.background.paper,
                borderTop: `1px solid ${theme.palette.divider}`
              },
              children: /* @__PURE__ */ jsxDEV(Container, { maxWidth: "xl", children: /* @__PURE__ */ jsxDEV(Typography, { variant: "body2", color: "text.secondary", align: "center", children: [
                "© ",
                (/* @__PURE__ */ new Date()).getFullYear(),
                " Local Rabbit. All rights reserved."
              ] }, void 0, true, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                lineNumber: 271,
                columnNumber: 13
              }, void 0) }, void 0, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
                lineNumber: 270,
                columnNumber: 11
              }, void 0)
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
              lineNumber: 260,
              columnNumber: 9
            },
            void 0
          )
        ]
      },
      void 0,
      true,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
        lineNumber: 148,
        columnNumber: 7
      },
      void 0
    )
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Layout/MainLayout.jsx",
    lineNumber: 71,
    columnNumber: 5
  }, void 0);
};
const ThemeContext = createContext();
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };
  const value = {
    isDarkMode,
    toggleTheme
  };
  return /* @__PURE__ */ jsxDEV(ThemeContext.Provider, { value, children }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/contexts/ThemeContext.jsx",
    lineNumber: 27,
    columnNumber: 5
  }, void 0);
};
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...mode === "light" ? {
      // Light mode
      primary: {
        main: "#9d7cd8",
        light: "#bb9af7",
        dark: "#7aa2f7"
      },
      secondary: {
        main: "#7dcfff",
        light: "#89ddff",
        dark: "#565f89"
      },
      background: {
        default: "#f7f9fc",
        paper: "#ffffff"
      },
      text: {
        primary: "#1a1b26",
        secondary: "#4e5969"
      }
    } : {
      // Dark mode
      primary: {
        main: "#9d7cd8",
        light: "#bb9af7",
        dark: "#7aa2f7"
      },
      secondary: {
        main: "#7dcfff",
        light: "#89ddff",
        dark: "#565f89"
      },
      background: {
        default: "#1a1b26",
        paper: "#24283b"
      },
      text: {
        primary: "#c0caf5",
        secondary: "#a9b1d6"
      }
    },
    error: {
      main: "#f7768e"
    },
    warning: {
      main: "#e0af68"
    },
    success: {
      main: "#9ece6a"
    },
    info: {
      main: "#7aa2f7"
    }
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
      letterSpacing: "-0.02em"
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      letterSpacing: "-0.01em"
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.7
    },
    code: {
      fontFamily: '"JetBrains Mono", "Roboto Mono", monospace',
      fontSize: "0.875rem"
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "8px 16px"
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "transparent",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(192, 202, 245, 0.1)"
        }
      }
    }
  }
});
const Products = React.lazy(() => import("./assets/Products-Ds6CWp4m.js"));
const About = React.lazy(() => import("./assets/About-DqJK9KVW.js"));
const Contact = React.lazy(() => import("./assets/Contact-D13QyAQs.js"));
const Documentation = React.lazy(() => import("./assets/Documentation-D9hQJRp8.js"));
const DiffViewer = React.lazy(() => import("./assets/DiffViewerContainer-WF03zwLo.js"));
const ImpactView = React.lazy(() => import("./assets/ImpactView-C1kC-PA9.js"));
const QualityCheck = React.lazy(() => import("./assets/QualityCheck-Bju20mlV.js"));
const AIAnalyzer = React.lazy(() => import("./assets/AIAnalyzer-Cc9BCU8x.js"));
const LoadingFallback = () => /* @__PURE__ */ jsxDEV(
  Box,
  {
    sx: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px"
    },
    children: /* @__PURE__ */ jsxDEV(CircularProgress, {}, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
      lineNumber: 30,
      columnNumber: 5
    }, void 0)
  },
  void 0,
  false,
  {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
    lineNumber: 22,
    columnNumber: 3
  },
  void 0
);
const AppContent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [repoPath, setRepoPath] = useState("");
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const handleRepoPathChange = async (path) => {
    setRepoPath(path);
    setFromBranch("");
    setToBranch("");
    if (!path) {
      setBranches([]);
      return;
    }
    setIsLoadingBranches(true);
    try {
      console.log(`Fetching branches for path: ${path}`);
      try {
        const response = await fetch("/api/git/branches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ path })
        });
        console.log("Response status:", response.status);
        const responseData = await response.json();
        if (!response.ok) {
          const errorDetails = {
            status: response.status,
            statusText: response.statusText,
            message: responseData.message || responseData.error || "Unknown error",
            line: responseData.line || "N/A",
            details: responseData.details || "",
            path: responseData.path || ""
          };
          console.error("Error details:", errorDetails);
          throw new Error(`Failed to fetch branches: ${response.status} ${response.statusText}${errorDetails.message ? ` - ${errorDetails.message}` : ""}${errorDetails.line ? ` (Line: ${errorDetails.line})` : ""}`);
        }
        console.log("Branches received:", responseData);
        setBranches(responseData.branches || []);
      } catch (apiError) {
        console.error("API error, using mock data:", apiError);
        const mockBranches = ["main", "dev", "feature/new-ui", "bugfix/123"];
        setBranches(mockBranches);
        console.warn(`Could not fetch branches from the repository. Using mock data instead. Error: ${apiError.message}`);
      }
    } finally {
      setIsLoadingBranches(false);
    }
  };
  const commonProps = {
    fromBranch,
    toBranch,
    branches,
    onFromBranchChange: setFromBranch,
    onToBranchChange: setToBranch,
    isLoadingBranches
  };
  return /* @__PURE__ */ jsxDEV(ThemeProvider$1, { theme: getTheme(isDarkMode ? "dark" : "light"), children: [
    /* @__PURE__ */ jsxDEV(CssBaseline, {}, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
      lineNumber: 114,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV(
      MainLayout,
      {
        onRepoPathChange: handleRepoPathChange,
        onToggleTheme: toggleTheme,
        isDarkMode,
        ...commonProps,
        children: /* @__PURE__ */ jsxDEV(Suspense, { fallback: /* @__PURE__ */ jsxDEV(LoadingFallback, {}, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
          lineNumber: 121,
          columnNumber: 29
        }, void 0), children: /* @__PURE__ */ jsxDEV(Routes, { children: [
          /* @__PURE__ */ jsxDEV(Route, { path: "/", element: /* @__PURE__ */ jsxDEV(Navigate, { to: "/products", replace: true }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
            lineNumber: 123,
            columnNumber: 38
          }, void 0) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
            lineNumber: 123,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV(
            Route,
            {
              path: "/products",
              element: /* @__PURE__ */ jsxDEV(
                Products,
                {
                  ...commonProps,
                  repoPath
                },
                void 0,
                false,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
                  lineNumber: 127,
                  columnNumber: 17
                },
                void 0
              )
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
              lineNumber: 124,
              columnNumber: 13
            },
            void 0
          ),
          /* @__PURE__ */ jsxDEV(Route, { path: "/about", element: /* @__PURE__ */ jsxDEV(About, {}, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
            lineNumber: 133,
            columnNumber: 43
          }, void 0) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
            lineNumber: 133,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV(Route, { path: "/contact", element: /* @__PURE__ */ jsxDEV(Contact, {}, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
            lineNumber: 134,
            columnNumber: 45
          }, void 0) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
            lineNumber: 134,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV(Route, { path: "/docs", element: /* @__PURE__ */ jsxDEV(Documentation, {}, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
            lineNumber: 135,
            columnNumber: 42
          }, void 0) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
            lineNumber: 135,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV(
            Route,
            {
              path: "/diff",
              element: /* @__PURE__ */ jsxDEV(
                DiffViewer,
                {
                  ...commonProps,
                  repoPath
                },
                void 0,
                false,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
                  lineNumber: 139,
                  columnNumber: 17
                },
                void 0
              )
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
              lineNumber: 136,
              columnNumber: 13
            },
            void 0
          ),
          /* @__PURE__ */ jsxDEV(
            Route,
            {
              path: "/analyze",
              element: /* @__PURE__ */ jsxDEV(
                AIAnalyzer,
                {
                  ...commonProps,
                  repoPath
                },
                void 0,
                false,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
                  lineNumber: 148,
                  columnNumber: 17
                },
                void 0
              )
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
              lineNumber: 145,
              columnNumber: 13
            },
            void 0
          ),
          /* @__PURE__ */ jsxDEV(
            Route,
            {
              path: "/impact",
              element: /* @__PURE__ */ jsxDEV(
                ImpactView,
                {
                  ...commonProps,
                  repoPath
                },
                void 0,
                false,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
                  lineNumber: 157,
                  columnNumber: 17
                },
                void 0
              )
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
              lineNumber: 154,
              columnNumber: 13
            },
            void 0
          ),
          /* @__PURE__ */ jsxDEV(
            Route,
            {
              path: "/quality",
              element: /* @__PURE__ */ jsxDEV(
                QualityCheck,
                {
                  ...commonProps,
                  repoPath
                },
                void 0,
                false,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
                  lineNumber: 166,
                  columnNumber: 17
                },
                void 0
              )
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
              lineNumber: 163,
              columnNumber: 13
            },
            void 0
          ),
          /* @__PURE__ */ jsxDEV(Route, { path: "*", element: /* @__PURE__ */ jsxDEV(Navigate, { to: "/products", replace: true }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
            lineNumber: 172,
            columnNumber: 38
          }, void 0) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
            lineNumber: 172,
            columnNumber: 13
          }, void 0)
        ] }, void 0, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
          lineNumber: 122,
          columnNumber: 11
        }, void 0) }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
          lineNumber: 121,
          columnNumber: 9
        }, void 0)
      },
      void 0,
      false,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
        lineNumber: 115,
        columnNumber: 7
      },
      void 0
    )
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
    lineNumber: 113,
    columnNumber: 5
  }, void 0);
};
const App = () => {
  return /* @__PURE__ */ jsxDEV(BrowserRouter, { children: /* @__PURE__ */ jsxDEV(ThemeProvider, { children: /* @__PURE__ */ jsxDEV(AppContent, {}, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
    lineNumber: 184,
    columnNumber: 9
  }, void 0) }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
    lineNumber: 183,
    columnNumber: 7
  }, void 0) }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/App.jsx",
    lineNumber: 182,
    columnNumber: 5
  }, void 0);
};
function render(props) {
  return /* @__PURE__ */ jsxDEV(StaticRouter, { location: props.url, children: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
    lineNumber: 8,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/entry-server.tsx",
    lineNumber: 7,
    columnNumber: 5
  }, this);
}
export {
  render as default
};
