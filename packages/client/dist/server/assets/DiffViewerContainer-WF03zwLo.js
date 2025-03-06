import { jsxDEV } from "react/jsx-dev-runtime";
import { useState, useEffect } from "react";
import { Box, useTheme, Paper, Typography, Chip, FormControlLabel, Switch, Tooltip, IconButton, Container, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Alert } from "@mui/material";
import { Add, Remove, Compare, ContentCopy, UnfoldLess, UnfoldMore, Refresh } from "@mui/icons-material";
const SideBySideDiffLine = ({ type, content, oldLineNumber, newLineNumber }) => {
  const theme = useTheme();
  const isAdded = type === "added";
  const isRemoved = type === "removed";
  const isHeader = type === "header";
  const getLineStyle = (side) => {
    if (isHeader) {
      return {
        backgroundColor: "rgba(122, 162, 247, 0.1)",
        borderLeft: "4px solid #7aa2f7"
      };
    }
    if (side === "left") {
      if (isRemoved) {
        return {
          backgroundColor: "rgba(247, 118, 142, 0.2)",
          borderLeft: `4px solid ${theme.palette.error.main}`
        };
      }
      return {
        borderLeft: "4px solid transparent"
      };
    } else {
      if (isAdded) {
        return {
          backgroundColor: "rgba(163, 190, 140, 0.2)",
          borderLeft: `4px solid ${theme.palette.success.main}`
        };
      }
      return {
        borderLeft: "4px solid transparent"
      };
    }
  };
  if (isHeader) {
    return /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", width: "100%" }, children: /* @__PURE__ */ jsxDEV(
      Box,
      {
        sx: {
          flex: 1,
          padding: 1,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.875rem",
          ...getLineStyle()
        },
        children: content
      },
      void 0,
      false,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
        lineNumber: 65,
        columnNumber: 9
      },
      void 0
    ) }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
      lineNumber: 64,
      columnNumber: 7
    }, void 0);
  }
  return /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", width: "100%" }, children: [
    /* @__PURE__ */ jsxDEV(
      Box,
      {
        sx: {
          flex: 1,
          display: "flex",
          borderRight: "1px solid",
          borderColor: "divider",
          ...!isAdded && { ...getLineStyle("left") },
          ...isAdded && { opacity: 0.5 }
        },
        children: [
          /* @__PURE__ */ jsxDEV(
            Box,
            {
              sx: {
                width: "40px",
                color: "text.secondary",
                textAlign: "right",
                userSelect: "none",
                pr: 1,
                borderRight: "1px solid",
                borderColor: "divider",
                fontSize: "0.8rem",
                fontFamily: "JetBrains Mono, monospace"
              },
              children: isAdded ? "" : oldLineNumber
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
              lineNumber: 93,
              columnNumber: 9
            },
            void 0
          ),
          /* @__PURE__ */ jsxDEV(
            Box,
            {
              sx: {
                flex: 1,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.875rem",
                pl: 1,
                pr: 1,
                whiteSpace: "pre-wrap",
                overflowX: "auto",
                ...isAdded && { opacity: 0.5, backgroundColor: "rgba(0, 0, 0, 0.05)" }
              },
              children: isAdded ? "" : content
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
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
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
        lineNumber: 83,
        columnNumber: 7
      },
      void 0
    ),
    /* @__PURE__ */ jsxDEV(
      Box,
      {
        sx: {
          flex: 1,
          display: "flex",
          ...!isRemoved && { ...getLineStyle("right") },
          ...isRemoved && { opacity: 0.5 }
        },
        children: [
          /* @__PURE__ */ jsxDEV(
            Box,
            {
              sx: {
                width: "40px",
                color: "text.secondary",
                textAlign: "right",
                userSelect: "none",
                pr: 1,
                borderRight: "1px solid",
                borderColor: "divider",
                fontSize: "0.8rem",
                fontFamily: "JetBrains Mono, monospace"
              },
              children: isRemoved ? "" : newLineNumber
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
              lineNumber: 133,
              columnNumber: 9
            },
            void 0
          ),
          /* @__PURE__ */ jsxDEV(
            Box,
            {
              sx: {
                flex: 1,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.875rem",
                pl: 1,
                pr: 1,
                whiteSpace: "pre-wrap",
                overflowX: "auto",
                ...isRemoved && { opacity: 0.5, backgroundColor: "rgba(0, 0, 0, 0.05)" }
              },
              children: isRemoved ? "" : content
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
              lineNumber: 148,
              columnNumber: 9
            },
            void 0
          )
        ]
      },
      void 0,
      true,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
        lineNumber: 125,
        columnNumber: 7
      },
      void 0
    )
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
    lineNumber: 81,
    columnNumber: 5
  }, void 0);
};
const UnifiedDiffLine = ({ type, content, oldLineNumber, newLineNumber }) => {
  const theme = useTheme();
  const getLineStyle = () => {
    switch (type) {
      case "added":
        return {
          backgroundColor: "rgba(163, 190, 140, 0.2)",
          borderLeft: `4px solid ${theme.palette.success.main}`
        };
      case "removed":
        return {
          backgroundColor: "rgba(247, 118, 142, 0.2)",
          borderLeft: `4px solid ${theme.palette.error.main}`
        };
      case "header":
        return {
          backgroundColor: "rgba(122, 162, 247, 0.1)",
          borderLeft: "4px solid #7aa2f7"
        };
      default:
        return {
          borderLeft: "4px solid transparent"
        };
    }
  };
  return /* @__PURE__ */ jsxDEV(
    Box,
    {
      sx: {
        display: "flex",
        fontSize: "0.875rem",
        fontFamily: "JetBrains Mono, monospace",
        lineHeight: "1.5",
        ...getLineStyle()
      },
      children: [
        /* @__PURE__ */ jsxDEV(
          Box,
          {
            sx: {
              width: "50px",
              color: "text.secondary",
              textAlign: "right",
              userSelect: "none",
              pr: 2,
              borderRight: "1px solid",
              borderColor: "divider"
            },
            children: oldLineNumber
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
            lineNumber: 205,
            columnNumber: 7
          },
          void 0
        ),
        /* @__PURE__ */ jsxDEV(
          Box,
          {
            sx: {
              width: "50px",
              color: "text.secondary",
              textAlign: "right",
              userSelect: "none",
              px: 2,
              borderRight: "1px solid",
              borderColor: "divider"
            },
            children: newLineNumber
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
            lineNumber: 218,
            columnNumber: 7
          },
          void 0
        ),
        /* @__PURE__ */ jsxDEV(
          Box,
          {
            sx: {
              flex: 1,
              pl: 2,
              pr: 1,
              whiteSpace: "pre-wrap",
              overflowX: "auto"
            },
            children: content
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
            lineNumber: 231,
            columnNumber: 7
          },
          void 0
        )
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
      lineNumber: 196,
      columnNumber: 5
    },
    void 0
  );
};
const FileDiff = ({ file }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState("split");
  const theme = useTheme();
  const getFileStats = () => {
    const added = file.changes.filter((change) => change.type === "added").length;
    const removed = file.changes.filter((change) => change.type === "removed").length;
    return { added, removed };
  };
  const stats = getFileStats();
  console.log("File:", file.path, "Changes:", file.changes.length, "Expanded:", isExpanded);
  return /* @__PURE__ */ jsxDEV(
    Paper,
    {
      elevation: 0,
      sx: {
        mb: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ jsxDEV(
          Box,
          {
            sx: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper"
            },
            children: [
              /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", alignItems: "center", gap: 2 }, children: [
                /* @__PURE__ */ jsxDEV(
                  Typography,
                  {
                    variant: "subtitle2",
                    sx: { fontFamily: "JetBrains Mono, monospace" },
                    children: file.path
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                    lineNumber: 285,
                    columnNumber: 11
                  },
                  void 0
                ),
                /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", gap: 1 }, children: [
                  stats.added > 0 && /* @__PURE__ */ jsxDEV(
                    Chip,
                    {
                      icon: /* @__PURE__ */ jsxDEV(Add, {}, void 0, false, {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                        lineNumber: 294,
                        columnNumber: 23
                      }, void 0),
                      label: `+${stats.added}`,
                      size: "small",
                      sx: {
                        backgroundColor: "rgba(163, 190, 140, 0.2)",
                        color: theme.palette.success.main
                      }
                    },
                    void 0,
                    false,
                    {
                      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                      lineNumber: 293,
                      columnNumber: 15
                    },
                    void 0
                  ),
                  stats.removed > 0 && /* @__PURE__ */ jsxDEV(
                    Chip,
                    {
                      icon: /* @__PURE__ */ jsxDEV(Remove, {}, void 0, false, {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                        lineNumber: 305,
                        columnNumber: 23
                      }, void 0),
                      label: `-${stats.removed}`,
                      size: "small",
                      sx: {
                        backgroundColor: "rgba(247, 118, 142, 0.2)",
                        color: theme.palette.error.main
                      }
                    },
                    void 0,
                    false,
                    {
                      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                      lineNumber: 304,
                      columnNumber: 15
                    },
                    void 0
                  )
                ] }, void 0, true, {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                  lineNumber: 291,
                  columnNumber: 11
                }, void 0)
              ] }, void 0, true, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                lineNumber: 284,
                columnNumber: 9
              }, void 0),
              /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", gap: 1, alignItems: "center" }, children: [
                /* @__PURE__ */ jsxDEV(
                  FormControlLabel,
                  {
                    control: /* @__PURE__ */ jsxDEV(
                      Switch,
                      {
                        size: "small",
                        checked: viewMode === "split",
                        onChange: () => setViewMode(viewMode === "split" ? "unified" : "split")
                      },
                      void 0,
                      false,
                      {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                        lineNumber: 319,
                        columnNumber: 15
                      },
                      void 0
                    ),
                    label: /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", alignItems: "center", gap: 0.5 }, children: [
                      /* @__PURE__ */ jsxDEV(Compare, { fontSize: "small" }, void 0, false, {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                        lineNumber: 327,
                        columnNumber: 17
                      }, void 0),
                      /* @__PURE__ */ jsxDEV(Typography, { variant: "caption", children: "Side-by-side" }, void 0, false, {
                        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                        lineNumber: 328,
                        columnNumber: 17
                      }, void 0)
                    ] }, void 0, true, {
                      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                      lineNumber: 326,
                      columnNumber: 15
                    }, void 0)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                    lineNumber: 317,
                    columnNumber: 11
                  },
                  void 0
                ),
                /* @__PURE__ */ jsxDEV(Tooltip, { title: "Copy file path", children: /* @__PURE__ */ jsxDEV(IconButton, { size: "small", children: /* @__PURE__ */ jsxDEV(ContentCopy, { fontSize: "small" }, void 0, false, {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                  lineNumber: 334,
                  columnNumber: 15
                }, void 0) }, void 0, false, {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                  lineNumber: 333,
                  columnNumber: 13
                }, void 0) }, void 0, false, {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                  lineNumber: 332,
                  columnNumber: 11
                }, void 0),
                /* @__PURE__ */ jsxDEV(Tooltip, { title: isExpanded ? "Collapse" : "Expand", children: /* @__PURE__ */ jsxDEV(
                  IconButton,
                  {
                    size: "small",
                    onClick: () => {
                      console.log("Toggling expanded state", !isExpanded);
                      setIsExpanded(!isExpanded);
                    },
                    children: isExpanded ? /* @__PURE__ */ jsxDEV(UnfoldLess, { fontSize: "small" }, void 0, false, {
                      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                      lineNumber: 346,
                      columnNumber: 17
                    }, void 0) : /* @__PURE__ */ jsxDEV(UnfoldMore, { fontSize: "small" }, void 0, false, {
                      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                      lineNumber: 348,
                      columnNumber: 17
                    }, void 0)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                    lineNumber: 338,
                    columnNumber: 13
                  },
                  void 0
                ) }, void 0, false, {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                  lineNumber: 337,
                  columnNumber: 11
                }, void 0)
              ] }, void 0, true, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                lineNumber: 316,
                columnNumber: 9
              }, void 0)
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
            lineNumber: 272,
            columnNumber: 7
          },
          void 0
        ),
        isExpanded && /* @__PURE__ */ jsxDEV(
          Box,
          {
            sx: {
              maxHeight: "500px",
              overflowY: "auto",
              backgroundColor: "background.default"
            },
            children: file.changes && file.changes.length > 0 ? file.changes.map((change, index) => viewMode === "split" ? /* @__PURE__ */ jsxDEV(
              SideBySideDiffLine,
              {
                type: change.type,
                content: change.content,
                oldLineNumber: change.oldLineNumber,
                newLineNumber: change.newLineNumber
              },
              index,
              false,
              {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                lineNumber: 367,
                columnNumber: 17
              },
              void 0
            ) : /* @__PURE__ */ jsxDEV(
              UnifiedDiffLine,
              {
                type: change.type,
                content: change.content,
                oldLineNumber: change.oldLineNumber,
                newLineNumber: change.newLineNumber
              },
              index,
              false,
              {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
                lineNumber: 375,
                columnNumber: 17
              },
              void 0
            )) : /* @__PURE__ */ jsxDEV(Box, { sx: { p: 2, textAlign: "center", color: "text.secondary" }, children: "No diff content available for this file" }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
              lineNumber: 385,
              columnNumber: 13
            }, void 0)
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
            lineNumber: 357,
            columnNumber: 9
          },
          void 0
        )
      ]
    },
    void 0,
    true,
    {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
      lineNumber: 263,
      columnNumber: 5
    },
    void 0
  );
};
const DiffViewer = ({ files }) => {
  return /* @__PURE__ */ jsxDEV(Box, { sx: { py: 3 }, children: files.map((file, index) => /* @__PURE__ */ jsxDEV(FileDiff, { file }, index, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
    lineNumber: 399,
    columnNumber: 9
  }, void 0)) }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewer.jsx",
    lineNumber: 397,
    columnNumber: 5
  }, void 0);
};
const parseDiff = (diffText) => {
  const files = [];
  let currentFile = null;
  let oldLineNumber = 0;
  let newLineNumber = 0;
  const lines = diffText.split("\n");
  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      if (currentFile) {
        files.push(currentFile);
      }
      const path = line.split(" b/")[1];
      currentFile = {
        path,
        changes: []
      };
      oldLineNumber = 0;
      newLineNumber = 0;
      continue;
    }
    if (!currentFile) continue;
    if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (match) {
        oldLineNumber = parseInt(match[1], 10);
        newLineNumber = parseInt(match[2], 10);
        currentFile.changes.push({
          type: "header",
          content: line,
          oldLineNumber: "...",
          newLineNumber: "..."
        });
      }
      continue;
    }
    if (line.startsWith("+")) {
      currentFile.changes.push({
        type: "added",
        content: line.substring(1),
        oldLineNumber: "",
        newLineNumber: newLineNumber++
      });
      continue;
    }
    if (line.startsWith("-")) {
      currentFile.changes.push({
        type: "removed",
        content: line.substring(1),
        oldLineNumber: oldLineNumber++,
        newLineNumber: ""
      });
      continue;
    }
    if (line.startsWith(" ")) {
      currentFile.changes.push({
        type: "unchanged",
        content: line.substring(1),
        oldLineNumber: oldLineNumber++,
        newLineNumber: newLineNumber++
      });
    }
  }
  if (currentFile) {
    files.push(currentFile);
  }
  return files;
};
const formatDiff = (diffData) => {
  if (typeof diffData === "string") {
    return parseDiff(diffData);
  }
  if (Array.isArray(diffData) && diffData.every(
    (file) => file.path && Array.isArray(file.changes)
  )) {
    return diffData;
  }
  throw new Error("Invalid diff data format");
};
const DiffViewerContainer = ({
  fromBranch,
  toBranch,
  branches,
  onFromBranchChange,
  onToBranchChange,
  repoPath
}) => {
  const [diffData, setDiffData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchDiff = async () => {
    if (!repoPath) {
      setError("Please select a repository first");
      return;
    }
    if (!fromBranch || !toBranch) {
      setError("Please select both branches to compare");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const setRepoResponse = await fetch("/api/git/repository/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ path: repoPath })
      });
      if (!setRepoResponse.ok) {
        const errorData = await setRepoResponse.json();
        throw new Error(errorData.error || "Failed to set repository");
      }
      const response = await fetch(`/api/git/diff?from=${fromBranch}&to=${toBranch}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch diff data");
      }
      const data = await response.json();
      console.log("Received diff data:", data);
      const formattedDiff = data.diff.map((item) => {
        var _a;
        console.log("Processing item:", item);
        if (!item.diffContent) {
          console.warn("No diff content for file:", item.file);
          return {
            path: item.file,
            status: item.status,
            changes: []
          };
        }
        try {
          const parsedChanges = formatDiff(item.diffContent);
          console.log("Parsed changes:", parsedChanges);
          return {
            path: item.file,
            status: item.status,
            changes: ((_a = parsedChanges[0]) == null ? void 0 : _a.changes) || []
          };
        } catch (error2) {
          console.error("Error parsing diff for", item.file, error2);
          return {
            path: item.file,
            status: item.status,
            changes: []
          };
        }
      });
      console.log("Formatted diff data:", formattedDiff);
      setDiffData(formattedDiff);
    } catch (err) {
      console.error("Error fetching diff:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (repoPath && fromBranch && toBranch) {
      fetchDiff();
    }
  }, [repoPath, fromBranch, toBranch]);
  return /* @__PURE__ */ jsxDEV(Container, { maxWidth: "xl", children: [
    /* @__PURE__ */ jsxDEV(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h5", sx: { mb: 3 }, children: "Compare Changes" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
        lineNumber: 120,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", gap: 2, mb: 3 }, children: [
        /* @__PURE__ */ jsxDEV(FormControl, { sx: { minWidth: 200 }, children: [
          /* @__PURE__ */ jsxDEV(InputLabel, { children: "From Branch" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
            lineNumber: 125,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV(
            Select,
            {
              value: fromBranch,
              label: "From Branch",
              onChange: (e) => onFromBranchChange(e.target.value),
              children: branches.map((branch) => /* @__PURE__ */ jsxDEV(MenuItem, { value: branch, children: branch }, branch, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
                lineNumber: 132,
                columnNumber: 17
              }, void 0))
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
              lineNumber: 126,
              columnNumber: 13
            },
            void 0
          )
        ] }, void 0, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
          lineNumber: 124,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV(FormControl, { sx: { minWidth: 200 }, children: [
          /* @__PURE__ */ jsxDEV(InputLabel, { children: "To Branch" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
            lineNumber: 139,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV(
            Select,
            {
              value: toBranch,
              label: "To Branch",
              onChange: (e) => onToBranchChange(e.target.value),
              children: branches.map((branch) => /* @__PURE__ */ jsxDEV(MenuItem, { value: branch, children: branch }, branch, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
                lineNumber: 146,
                columnNumber: 17
              }, void 0))
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
              lineNumber: 140,
              columnNumber: 13
            },
            void 0
          )
        ] }, void 0, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
          lineNumber: 138,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: "contained",
            onClick: fetchDiff,
            disabled: !fromBranch || !toBranch || isLoading,
            children: "Compare"
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
            lineNumber: 152,
            columnNumber: 11
          },
          void 0
        )
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
        lineNumber: 123,
        columnNumber: 9
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
      lineNumber: 119,
      columnNumber: 7
    }, void 0),
    isLoading ? /* @__PURE__ */ jsxDEV(
      Box,
      {
        sx: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px"
        },
        children: /* @__PURE__ */ jsxDEV(CircularProgress, {}, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
          lineNumber: 171,
          columnNumber: 11
        }, void 0)
      },
      void 0,
      false,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
        lineNumber: 163,
        columnNumber: 9
      },
      void 0
    ) : error ? /* @__PURE__ */ jsxDEV(
      Alert,
      {
        severity: "error",
        action: /* @__PURE__ */ jsxDEV(
          Button,
          {
            color: "inherit",
            size: "small",
            startIcon: /* @__PURE__ */ jsxDEV(Refresh, {}, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
              lineNumber: 180,
              columnNumber: 26
            }, void 0),
            onClick: fetchDiff,
            children: "Retry"
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
            lineNumber: 177,
            columnNumber: 13
          },
          void 0
        ),
        sx: { mb: 3 },
        children: error
      },
      void 0,
      false,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
        lineNumber: 174,
        columnNumber: 9
      },
      void 0
    ) : !diffData || diffData.length === 0 ? /* @__PURE__ */ jsxDEV(
      Paper,
      {
        sx: {
          p: 3,
          textAlign: "center",
          color: "text.secondary",
          border: "1px dashed",
          borderColor: "divider"
        },
        children: fromBranch && toBranch ? "No changes found between selected branches" : "Select branches to compare changes"
      },
      void 0,
      false,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
        lineNumber: 191,
        columnNumber: 9
      },
      void 0
    ) : /* @__PURE__ */ jsxDEV(DiffViewer, { files: diffData }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
      lineNumber: 205,
      columnNumber: 9
    }, void 0)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/DiffViewer/DiffViewerContainer.jsx",
    lineNumber: 118,
    columnNumber: 5
  }, void 0);
};
export {
  DiffViewerContainer as default
};
