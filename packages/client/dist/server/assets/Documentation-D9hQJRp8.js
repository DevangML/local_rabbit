import { jsxDEV } from "react/jsx-dev-runtime";
import { useState, useEffect } from "react";
import { useTheme, Box, Container, Typography, Grid, Paper, List, ListItem, ListItemText, Divider, CircularProgress } from "@mui/material";
import { Article, Code, Build } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";
import "prismjs/components/prism-javascript.js";
import "prismjs/components/prism-jsx.js";
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-python.js";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-json.js";
const Documentation = () => {
  const theme = useTheme();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [markdownContent, setMarkdownContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (markdownContent) {
      Prism.highlightAll();
    }
  }, [markdownContent]);
  const sections = [
    {
      title: "Getting Started",
      icon: /* @__PURE__ */ jsxDEV(Article, { color: "primary" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
        lineNumber: 49,
        columnNumber: 13
      }, void 0),
      items: [
        { title: "Introduction", path: "/docs/README.md" },
        { title: "Installation", path: "/docs/INSTALL.md" },
        { title: "Configuration", path: "/docs/CONFIG.md" }
      ]
    },
    {
      title: "Features",
      icon: /* @__PURE__ */ jsxDEV(Code, { color: "primary" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
        lineNumber: 58,
        columnNumber: 13
      }, void 0),
      items: [
        { title: "Diff Viewer", path: "/docs/features/diff-viewer.md" },
        { title: "AI Analysis", path: "/docs/features/ai-analysis.md" },
        { title: "Impact Analysis", path: "/docs/features/impact-analysis.md" }
      ]
    },
    {
      title: "Advanced",
      icon: /* @__PURE__ */ jsxDEV(Build, { color: "primary" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
        lineNumber: 67,
        columnNumber: 13
      }, void 0),
      items: [
        { title: "API Reference", path: "/docs/api/README.md" },
        { title: "Contributing", path: "/docs/CONTRIBUTING.md" },
        { title: "Architecture", path: "/docs/ARCHITECTURE.md" }
      ]
    }
  ];
  useEffect(() => {
    const fetchMarkdown = async (path) => {
      if (!path) return;
      setIsLoading(true);
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error("Failed to load documentation");
        const text = await response.text();
        setMarkdownContent(text);
      } catch (error) {
        console.error("Error loading documentation:", error);
        setMarkdownContent("# Error\nFailed to load documentation. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedDoc) {
      fetchMarkdown(selectedDoc);
    }
  }, [selectedDoc]);
  return /* @__PURE__ */ jsxDEV(Box, { sx: { py: 6 }, children: /* @__PURE__ */ jsxDEV(Container, { maxWidth: "lg", children: [
    /* @__PURE__ */ jsxDEV(Typography, { variant: "h3", align: "center", gutterBottom: true, children: "Documentation" }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
      lineNumber: 102,
      columnNumber: 9
    }, void 0),
    /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", align: "center", color: "text.secondary", sx: { mb: 6 }, children: "Everything you need to know about Local Rabbit" }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
      lineNumber: 105,
      columnNumber: 9
    }, void 0),
    /* @__PURE__ */ jsxDEV(Grid, { container: true, spacing: 4, children: [
      /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxDEV(
        Paper,
        {
          elevation: 0,
          sx: {
            height: "100%",
            border: 1,
            borderColor: "divider"
          },
          children: sections.map((section) => /* @__PURE__ */ jsxDEV(Box, { children: [
            /* @__PURE__ */ jsxDEV(Box, { sx: { p: 2 }, children: [
              /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", alignItems: "center", gap: 1, mb: 1 }, children: [
                section.icon,
                /* @__PURE__ */ jsxDEV(Typography, { variant: "subtitle1", fontWeight: "medium", children: section.title }, void 0, false, {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
                  lineNumber: 125,
                  columnNumber: 23
                }, void 0)
              ] }, void 0, true, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
                lineNumber: 123,
                columnNumber: 21
              }, void 0),
              /* @__PURE__ */ jsxDEV(List, { dense: true, children: section.items.map((item) => /* @__PURE__ */ jsxDEV(
                ListItem,
                {
                  button: true,
                  selected: selectedDoc === item.path,
                  onClick: () => setSelectedDoc(item.path),
                  sx: {
                    borderRadius: 1,
                    mb: 0.5,
                    "&.Mui-selected": {
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": {
                        backgroundColor: "primary.dark"
                      }
                    }
                  },
                  children: /* @__PURE__ */ jsxDEV(
                    ListItemText,
                    {
                      primary: item.title,
                      primaryTypographyProps: {
                        variant: "body2"
                      }
                    },
                    void 0,
                    false,
                    {
                      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
                      lineNumber: 148,
                      columnNumber: 27
                    },
                    void 0
                  )
                },
                item.path,
                false,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
                  lineNumber: 131,
                  columnNumber: 25
                },
                void 0
              )) }, void 0, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
                lineNumber: 129,
                columnNumber: 21
              }, void 0)
            ] }, void 0, true, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
              lineNumber: 122,
              columnNumber: 19
            }, void 0),
            /* @__PURE__ */ jsxDEV(Divider, {}, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
              lineNumber: 158,
              columnNumber: 19
            }, void 0)
          ] }, section.title, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
            lineNumber: 121,
            columnNumber: 17
          }, void 0))
        },
        void 0,
        false,
        {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
          lineNumber: 112,
          columnNumber: 13
        },
        void 0
      ) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
        lineNumber: 111,
        columnNumber: 11
      }, void 0),
      /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, md: 9, children: /* @__PURE__ */ jsxDEV(
        Paper,
        {
          elevation: 0,
          sx: {
            p: 4,
            minHeight: 600,
            border: 1,
            borderColor: "divider"
          },
          children: isLoading ? /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", justifyContent: "center", pt: 8 }, children: /* @__PURE__ */ jsxDEV(CircularProgress, {}, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
            lineNumber: 177,
            columnNumber: 19
          }, void 0) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
            lineNumber: 176,
            columnNumber: 17
          }, void 0) : selectedDoc ? /* @__PURE__ */ jsxDEV(
            Box,
            {
              sx: {
                "& img": { maxWidth: "100%" },
                "& pre": {
                  margin: "16px 0",
                  padding: "16px",
                  borderRadius: 1,
                  overflow: "auto",
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.04)",
                  border: `1px solid ${theme.palette.divider}`
                },
                "& code": {
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.875rem"
                },
                "& :not(pre) > code": {
                  padding: "2px 6px",
                  borderRadius: 1,
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.04)"
                }
              },
              children: /* @__PURE__ */ jsxDEV(
                ReactMarkdown,
                {
                  remarkPlugins: [remarkGfm],
                  components: {
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";
                      return !inline ? /* @__PURE__ */ jsxDEV("pre", { className: `language-${language}`, children: /* @__PURE__ */ jsxDEV("code", { className: `language-${language}`, ...props, children: String(children).replace(/\n$/, "") }, void 0, false, {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
                        lineNumber: 211,
                        columnNumber: 29
                      }, this) }, void 0, false, {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
                        lineNumber: 210,
                        columnNumber: 27
                      }, this) : /* @__PURE__ */ jsxDEV("code", { className, ...props, children }, void 0, false, {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
                        lineNumber: 216,
                        columnNumber: 27
                      }, this);
                    }
                  },
                  children: markdownContent
                },
                void 0,
                false,
                {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
                  lineNumber: 202,
                  columnNumber: 19
                },
                void 0
              )
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
              lineNumber: 180,
              columnNumber: 17
            },
            void 0
          ) : /* @__PURE__ */ jsxDEV(Box, { sx: { textAlign: "center", color: "text.secondary", pt: 8 }, children: /* @__PURE__ */ jsxDEV(Typography, { children: "Select a document from the navigation to view its contents" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
            lineNumber: 228,
            columnNumber: 19
          }, void 0) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
            lineNumber: 227,
            columnNumber: 17
          }, void 0)
        },
        void 0,
        false,
        {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
          lineNumber: 166,
          columnNumber: 13
        },
        void 0
      ) }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
        lineNumber: 165,
        columnNumber: 11
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
      lineNumber: 109,
      columnNumber: 9
    }, void 0)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
    lineNumber: 101,
    columnNumber: 7
  }, void 0) }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/Documentation/Documentation.jsx",
    lineNumber: 100,
    columnNumber: 5
  }, void 0);
};
export {
  Documentation as default
};
