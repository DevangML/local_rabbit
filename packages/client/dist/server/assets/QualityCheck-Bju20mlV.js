import { jsxDEV } from "react/jsx-dev-runtime";
import { useState } from "react";
import { Container, Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Alert, Paper, Chip, LinearProgress } from "@mui/material";
import { Code, Error as Error$1, Warning, CheckCircle } from "@mui/icons-material";
const QualityMetric = ({ title, score, maxScore, status }) => {
  const getColor = () => {
    if (status === "error") return "error";
    if (status === "warning") return "warning";
    return "success";
  };
  const getIcon = () => {
    if (status === "error") return /* @__PURE__ */ jsxDEV(Error$1, {}, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
      lineNumber: 32,
      columnNumber: 36
    }, void 0);
    if (status === "warning") return /* @__PURE__ */ jsxDEV(Warning, {}, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
      lineNumber: 33,
      columnNumber: 38
    }, void 0);
    return /* @__PURE__ */ jsxDEV(CheckCircle, {}, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
      lineNumber: 34,
      columnNumber: 12
    }, void 0);
  };
  return /* @__PURE__ */ jsxDEV(Paper, { sx: { p: 3, mb: 2 }, children: [
    /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", children: title }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
        lineNumber: 40,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDEV(
        Chip,
        {
          icon: getIcon(),
          label: `${score}/${maxScore}`,
          color: getColor(),
          variant: "outlined"
        },
        void 0,
        false,
        {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
          lineNumber: 41,
          columnNumber: 9
        },
        void 0
      )
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
      lineNumber: 39,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV(
      LinearProgress,
      {
        variant: "determinate",
        value: score / maxScore * 100,
        color: getColor(),
        sx: { height: 8, borderRadius: 4 }
      },
      void 0,
      false,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
        lineNumber: 48,
        columnNumber: 7
      },
      void 0
    )
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
    lineNumber: 38,
    columnNumber: 5
  }, void 0);
};
const QualityCheck = ({ fromBranch, toBranch, branches }) => {
  var _a, _b;
  const [isChecking, setIsChecking] = useState(false);
  const [quality, setQuality] = useState(null);
  const [error, setError] = useState(null);
  const handleCheckQuality = async () => {
    if (!fromBranch || !toBranch) {
      setError("Please select both branches to check quality");
      return;
    }
    setIsChecking(true);
    setError(null);
    try {
      const response = await fetch("/api/quality", {
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
        throw new Error("Failed to check code quality");
      }
      const data = await response.json();
      setQuality(data);
    } catch (err) {
      console.error("Error checking quality:", err);
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  };
  return /* @__PURE__ */ jsxDEV(Container, { maxWidth: "xl", children: [
    /* @__PURE__ */ jsxDEV(Box, { sx: { mb: 4 }, children: [
      /* @__PURE__ */ jsxDEV(Typography, { variant: "h5", sx: { mb: 3, display: "flex", alignItems: "center", gap: 1 }, children: [
        /* @__PURE__ */ jsxDEV(Code, { color: "primary" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
          lineNumber: 102,
          columnNumber: 11
        }, void 0),
        "Code Quality Check"
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
        lineNumber: 101,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDEV(Box, { sx: { display: "flex", gap: 2, mb: 3 }, children: [
        /* @__PURE__ */ jsxDEV(FormControl, { sx: { minWidth: 200 }, children: [
          /* @__PURE__ */ jsxDEV(InputLabel, { children: "From Branch" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
            lineNumber: 107,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV(
            Select,
            {
              value: fromBranch,
              label: "From Branch",
              onChange: (e) => onFromBranchChange(e.target.value),
              children: branches.map((branch) => /* @__PURE__ */ jsxDEV(MenuItem, { value: branch, children: branch }, branch, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
                lineNumber: 114,
                columnNumber: 17
              }, void 0))
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
              lineNumber: 108,
              columnNumber: 13
            },
            void 0
          )
        ] }, void 0, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
          lineNumber: 106,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV(FormControl, { sx: { minWidth: 200 }, children: [
          /* @__PURE__ */ jsxDEV(InputLabel, { children: "To Branch" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
            lineNumber: 121,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV(
            Select,
            {
              value: toBranch,
              label: "To Branch",
              onChange: (e) => onToBranchChange(e.target.value),
              children: branches.map((branch) => /* @__PURE__ */ jsxDEV(MenuItem, { value: branch, children: branch }, branch, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
                lineNumber: 128,
                columnNumber: 17
              }, void 0))
            },
            void 0,
            false,
            {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
              lineNumber: 122,
              columnNumber: 13
            },
            void 0
          )
        ] }, void 0, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
          lineNumber: 120,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV(
          Button,
          {
            variant: "contained",
            onClick: handleCheckQuality,
            disabled: !fromBranch || !toBranch || isChecking,
            startIcon: /* @__PURE__ */ jsxDEV(Code, {}, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
              lineNumber: 138,
              columnNumber: 24
            }, void 0),
            children: "Check Quality"
          },
          void 0,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
            lineNumber: 134,
            columnNumber: 11
          },
          void 0
        )
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
        lineNumber: 105,
        columnNumber: 9
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
      lineNumber: 100,
      columnNumber: 7
    }, void 0),
    isChecking ? /* @__PURE__ */ jsxDEV(
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
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
            lineNumber: 155,
            columnNumber: 11
          }, void 0),
          /* @__PURE__ */ jsxDEV(Typography, { color: "text.secondary", children: "Analyzing code quality..." }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
            lineNumber: 156,
            columnNumber: 11
          }, void 0)
        ]
      },
      void 0,
      true,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
        lineNumber: 146,
        columnNumber: 9
      },
      void 0
    ) : error ? /* @__PURE__ */ jsxDEV(Alert, { severity: "error", sx: { mb: 3 }, children: error }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
      lineNumber: 161,
      columnNumber: 9
    }, void 0) : !quality ? /* @__PURE__ */ jsxDEV(
      Paper,
      {
        sx: {
          p: 3,
          textAlign: "center",
          color: "text.secondary",
          border: "1px dashed",
          borderColor: "divider"
        },
        children: "Select branches and run quality check to see results"
      },
      void 0,
      false,
      {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
        lineNumber: 165,
        columnNumber: 9
      },
      void 0
    ) : /* @__PURE__ */ jsxDEV(Box, { children: [
      /* @__PURE__ */ jsxDEV(Paper, { sx: { p: 3, mb: 4, textAlign: "center" }, children: [
        /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", gutterBottom: true, children: "Overall Quality Score" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
          lineNumber: 180,
          columnNumber: 13
        }, void 0),
        /* @__PURE__ */ jsxDEV(
          Typography,
          {
            variant: "h2",
            sx: {
              color: quality.score >= 80 ? "success.main" : quality.score >= 60 ? "warning.main" : "error.main"
            },
            children: [
              quality.score,
              "%"
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
            lineNumber: 183,
            columnNumber: 13
          },
          void 0
        )
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
        lineNumber: 179,
        columnNumber: 11
      }, void 0),
      /* @__PURE__ */ jsxDEV(Box, { sx: { mb: 4 }, children: [
        /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", gutterBottom: true, children: "Quality Metrics" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
          lineNumber: 196,
          columnNumber: 13
        }, void 0),
        (_a = quality.metrics) == null ? void 0 : _a.map((metric, index) => /* @__PURE__ */ jsxDEV(
          QualityMetric,
          {
            title: metric.name,
            score: metric.score,
            maxScore: metric.maxScore,
            status: metric.status
          },
          index,
          false,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
            lineNumber: 200,
            columnNumber: 15
          },
          void 0
        ))
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
        lineNumber: 195,
        columnNumber: 11
      }, void 0),
      ((_b = quality.issues) == null ? void 0 : _b.length) > 0 && /* @__PURE__ */ jsxDEV(Paper, { sx: { p: 3 }, children: [
        /* @__PURE__ */ jsxDEV(Typography, { variant: "h6", gutterBottom: true, children: "Issues to Address" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
          lineNumber: 213,
          columnNumber: 15
        }, void 0),
        /* @__PURE__ */ jsxDEV(Box, { component: "ul", sx: { mt: 2, pl: 2 }, children: quality.issues.map((issue, index) => /* @__PURE__ */ jsxDEV(
          Box,
          {
            component: "li",
            sx: {
              mb: 2,
              color: issue.severity === "error" ? "error.main" : issue.severity === "warning" ? "warning.main" : "info.main"
            },
            children: [
              /* @__PURE__ */ jsxDEV(Typography, { variant: "subtitle2", children: issue.title }, void 0, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
                lineNumber: 227,
                columnNumber: 21
              }, void 0),
              /* @__PURE__ */ jsxDEV(Typography, { variant: "body2", color: "text.secondary", children: issue.description }, void 0, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
                lineNumber: 230,
                columnNumber: 21
              }, void 0)
            ]
          },
          index,
          true,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
            lineNumber: 218,
            columnNumber: 19
          },
          void 0
        )) }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
          lineNumber: 216,
          columnNumber: 15
        }, void 0)
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
        lineNumber: 212,
        columnNumber: 13
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
      lineNumber: 177,
      columnNumber: 9
    }, void 0)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/QualityCheck/QualityCheck.jsx",
    lineNumber: 99,
    columnNumber: 5
  }, void 0);
};
export {
  QualityCheck as default
};
