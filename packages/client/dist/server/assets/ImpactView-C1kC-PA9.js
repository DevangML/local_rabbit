import { jsxDEV } from "react/jsx-dev-runtime";
import { useState } from "react";
import { Container, Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Alert, Paper, Grid } from "@mui/material";
import { TrendingUp, Speed, BugReport, Architecture } from "@mui/icons-material";
const MetricCard = ({ title, value, icon: Icon, description, color }) => /* @__PURE__ */ jsxDEV(Paper, { sx: { p: 3, height: "100%" }, children: [
  /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
    /* @__PURE__ */ jsxDEV(Icon, { sx: { color: `${color}.main`, mr: 1 } }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
      lineNumber: 26,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", children: title }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
      lineNumber: 27,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
    lineNumber: 25,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(Typography, { variant: "h4", sx: { color: `${color}.main`, mb: 1 }, children: value }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
    lineNumber: 29,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(Typography, { variant: "body2", color: "text.secondary", children: description }, void 0, false, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
    lineNumber: 32,
    columnNumber: 5
  }, void 0)
] }, void 0, true, {
  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
  lineNumber: 24,
  columnNumber: 3
}, void 0);
const ImpactView = ({ fromBranch, toBranch, branches }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [impact, setImpact] = useState(null);
  const [error, setError] = useState(null);
  const handleAnalyzeImpact = async () => {
    if (!fromBranch || !toBranch) {
      setError("Please select both branches to analyze impact");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/impact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fromBranch,
          toBranch
        })
      });
      if (!response.ok) {
        throw new Error("Failed to analyze impact");
      }
      const data = await response.json();
      setImpact(data);
    } catch (err) {
      console.error("Error analyzing impact:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxDEV(Container, { maxWidth: "xl", children: [
    /* @__PURE__ */ jsxDEV(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h5", sx: { mb: 3, display: "flex", alignItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsxDEV(TrendingUp, { color: "primary" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
          lineNumber: 82,
          columnNumber: 11
        }, void 0),
        "Impact Analysis"
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
        lineNumber: 81,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", gap: 2, mb: 3 }, children: [
        /* @__PURE__ */ jsxDEV(FormControl, { sx: { minWidth: 200 }, children: [
          /* @__PURE__ */ jsxDEV(InputLabel, { children: "From Branch" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
            lineNumber: 87,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV(
            Select,
            {
              value: fromBranch,
              label: "From Branch",
              onChange: (e) => onFromBranchChange(e.target.value),
              children: branches.map((branch) => /* @__PURE__ */ jsxDEV(MenuItem, { value: branch, children: branch }, branch, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
                lineNumber: 94,
                columnNumber: 17
              }, void 0))
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
              lineNumber: 88,
              columnNumber: 13
            },
            void 0
          )
        ] }, void 0, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
          lineNumber: 86,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV(FormControl, { sx: { minWidth: 200 }, children: [
          /* @__PURE__ */ jsxDEV(InputLabel, { children: "To Branch" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
            lineNumber: 101,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV(
            Select,
            {
              value: toBranch,
              label: "To Branch",
              onChange: (e) => onToBranchChange(e.target.value),
              children: branches.map((branch) => /* @__PURE__ */ jsxDEV(MenuItem, { value: branch, children: branch }, branch, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
                lineNumber: 108,
                columnNumber: 17
              }, void 0))
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
              lineNumber: 102,
              columnNumber: 13
            },
            void 0
          )
        ] }, void 0, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
          lineNumber: 100,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: "contained",
            onClick: handleAnalyzeImpact,
            disabled: !fromBranch || !toBranch || isLoading,
            startIcon: /* @__PURE__ */ jsxDEV(Speed, {}, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
              lineNumber: 118,
              columnNumber: 24
            }, void 0),
            children: "Analyze Impact"
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
            lineNumber: 114,
            columnNumber: 11
          },
          void 0
        )
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
        lineNumber: 85,
        columnNumber: 9
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
      lineNumber: 80,
      columnNumber: 7
    }, void 0),
    isLoading ? /* @__PURE__ */ jsxDEV(
      Box,
      {
        sx: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          py: 8
        },
        children: [
          /* @__PURE__ */ jsxDEV(CircularProgress, {}, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
            lineNumber: 135,
            columnNumber: 11
          }, void 0),
          /* @__PURE__ */ jsxDEV(Typography, { color: "text.secondary", children: "Analyzing impact of changes..." }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
            lineNumber: 136,
            columnNumber: 11
          }, void 0)
        ]
      },
      void 0,
      true,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
        lineNumber: 126,
        columnNumber: 9
      },
      void 0
    ) : error ? /* @__PURE__ */ jsxDEV(Alert, { severity: "error", sx: { mb: 3 }, children: error }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
      lineNumber: 141,
      columnNumber: 9
    }, void 0) : !impact ? /* @__PURE__ */ jsxDEV(
      Paper,
      {
        sx: {
          p: 3,
          textAlign: "center",
          color: "text.secondary",
          border: "1px dashed",
          borderColor: "divider"
        },
        children: "Select branches and analyze to see the impact of changes"
      },
      void 0,
      false,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
        lineNumber: 145,
        columnNumber: 9
      },
      void 0
    ) : /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", flexDirection: "column", gap: 3 }, children: [
      /* @__PURE__ */ jsxDEV(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, md: 6, lg: 3, children: /* @__PURE__ */ jsxDEV(
          MetricCard,
          {
            title: "Change Impact",
            value: impact.changeImpact,
            icon: TrendingUp,
            description: "Overall impact score of the changes",
            color: "primary"
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
            lineNumber: 160,
            columnNumber: 15
          },
          void 0
        ) }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
          lineNumber: 159,
          columnNumber: 13
        }, void 0),
        /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, md: 6, lg: 3, children: /* @__PURE__ */ jsxDEV(
          MetricCard,
          {
            title: "Risk Level",
            value: impact.riskLevel,
            icon: BugReport,
            description: "Potential risk assessment",
            color: "error"
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
            lineNumber: 169,
            columnNumber: 15
          },
          void 0
        ) }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
          lineNumber: 168,
          columnNumber: 13
        }, void 0),
        /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, md: 6, lg: 3, children: /* @__PURE__ */ jsxDEV(
          MetricCard,
          {
            title: "Performance Impact",
            value: impact.performanceImpact,
            icon: Speed,
            description: "Impact on system performance",
            color: "warning"
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
            lineNumber: 178,
            columnNumber: 15
          },
          void 0
        ) }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
          lineNumber: 177,
          columnNumber: 13
        }, void 0),
        /* @__PURE__ */ jsxDEV(Grid, { item: true, xs: 12, md: 6, lg: 3, children: /* @__PURE__ */ jsxDEV(
          MetricCard,
          {
            title: "Dependencies",
            value: impact.dependencies,
            icon: Architecture,
            description: "Number of affected dependencies",
            color: "info"
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
            lineNumber: 187,
            columnNumber: 15
          },
          void 0
        ) }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
          lineNumber: 186,
          columnNumber: 13
        }, void 0)
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
        lineNumber: 158,
        columnNumber: 11
      }, void 0),
      impact.details && /* @__PURE__ */ jsxDEV(Paper, { sx: { p: 3, mt: 3 }, children: [
        /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", gutterBottom: true, children: "Detailed Analysis" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
          lineNumber: 200,
          columnNumber: 15
        }, void 0),
        /* @__PURE__ */ jsxDEV(Box, { component: "ul", sx: { mt: 2, pl: 2 }, children: impact.details.map((detail, index) => /* @__PURE__ */ jsxDEV(
          Typography,
          {
            component: "li",
            color: "text.secondary",
            sx: { mb: 1 },
            children: detail
          },
          index,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
            lineNumber: 205,
            columnNumber: 19
          },
          void 0
        )) }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
          lineNumber: 203,
          columnNumber: 15
        }, void 0)
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
        lineNumber: 199,
        columnNumber: 13
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
      lineNumber: 157,
      columnNumber: 9
    }, void 0)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/ImpactView/ImpactView.jsx",
    lineNumber: 79,
    columnNumber: 5
  }, void 0);
};
export {
  ImpactView as default
};
