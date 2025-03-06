import { jsxDEV } from "react/jsx-dev-runtime";
import "react";
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Paper } from "@mui/material";
import { Timeline, Analytics, Speed, Code } from "@mui/icons-material";
const Products = () => {
  const analysisCards = [
    {
      title: "Diff Viewer",
      description: "Compare changes between branches with an interactive diff viewer",
      icon: /* @__PURE__ */ jsxDEV(Timeline, { fontSize: "large", color: "primary" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
        lineNumber: 24,
        columnNumber: 13
      }, void 0),
      path: "/diff"
    },
    {
      title: "AI Analyzer",
      description: "Get AI-powered insights about your code changes",
      icon: /* @__PURE__ */ jsxDEV(Analytics, { fontSize: "large", color: "primary" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
        lineNumber: 30,
        columnNumber: 13
      }, void 0),
      path: "/analyze"
    },
    {
      title: "Impact Analysis",
      description: "Understand the impact of changes across your codebase",
      icon: /* @__PURE__ */ jsxDEV(Speed, { fontSize: "large", color: "primary" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
        lineNumber: 36,
        columnNumber: 13
      }, void 0),
      path: "/impact"
    },
    {
      title: "Quality Check",
      description: "Analyze code quality and identify potential issues",
      icon: /* @__PURE__ */ jsxDEV(Code, { fontSize: "large", color: "primary" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
        lineNumber: 42,
        columnNumber: 13
      }, void 0),
      path: "/quality"
    }
  ];
  return /* @__PURE__ */ jsxDEV(Box, { children: [
    /* @__PURE__ */ jsxDEV(Typography, { variant: "h4", sx: { mb: 4 }, children: "Repository Analysis" }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
      lineNumber: 49,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV(Grid, { container: true, spacing: 3, children: analysisCards.map((card) => /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxDEV(
      Card,
      {
        elevation: 0,
        sx: {
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: "1px solid",
          borderColor: "divider",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: (theme) => theme.shadows[4]
          }
        },
        children: [
          /* @__PURE__ */ jsxDEV(CardContent, { sx: { flexGrow: 1 }, children: [
            /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: card.icon }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
              lineNumber: 72,
              columnNumber: 17
            }, void 0),
            /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", gutterBottom: true, children: card.title }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
              lineNumber: 75,
              columnNumber: 17
            }, void 0),
            /* @__PURE__ */ jsxDEV(Typography, { variant: "body2", color: "text.secondary", children: card.description }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
              lineNumber: 78,
              columnNumber: 17
            }, void 0)
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
            lineNumber: 71,
            columnNumber: 15
          }, void 0),
          /* @__PURE__ */ jsxDEV(CardActions, { children: /* @__PURE__ */ jsxDEV(Button, { size: "small", color: "primary", children: "Learn More" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
            lineNumber: 83,
            columnNumber: 17
          }, void 0) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
            lineNumber: 82,
            columnNumber: 15
          }, void 0)
        ]
      },
      void 0,
      true,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
        lineNumber: 56,
        columnNumber: 13
      },
      void 0
    ) }, card.title, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
      lineNumber: 55,
      columnNumber: 11
    }, void 0)) }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
      lineNumber: 53,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV(Box, { sx: { mt: 4 }, children: [
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h5", gutterBottom: true, children: "Recent Activity" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
        lineNumber: 93,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDEV(
        Paper,
        {
          elevation: 0,
          sx: {
            p: 2,
            border: "1px solid",
            borderColor: "divider"
          },
          children: /* @__PURE__ */ jsxDEV(Typography, { color: "text.secondary", children: "No recent activity to display" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
            lineNumber: 104,
            columnNumber: 11
          }, void 0)
        },
        void 0,
        false,
        {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
          lineNumber: 96,
          columnNumber: 9
        },
        void 0
      )
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
      lineNumber: 92,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Products/Products.jsx",
    lineNumber: 48,
    columnNumber: 5
  }, void 0);
};
export {
  Products as default
};
