import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import { useState } from "react";
import axios from "axios";
const __vite_import_meta_env__ = { "BASE_URL": "/", "DEV": true, "MODE": "production", "PROD": false, "SSR": true, "VITE_API_BASE_URL": "http://127.0.0.1:3001", "VITE_API_URL": "http://localhost:3000", "VITE_NODE_ENV": "development", "VITE_USER_NODE_ENV": "development" };
var define_process_env_default = {};
const getEnvVar = (key, defaultValue) => {
  if (typeof import.meta !== "undefined" && __vite_import_meta_env__) {
    return __vite_import_meta_env__[key] || defaultValue;
  }
  return define_process_env_default[key] || defaultValue;
};
const detectServerUrl = () => {
  const configuredUrl = getEnvVar("VITE_API_URL", "");
  if (configuredUrl) return configuredUrl;
  const apiPort = getEnvVar("VITE_API_PORT", "3001");
  const hostname = window.location.hostname || "localhost";
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return `http://127.0.0.1:${apiPort}`;
  }
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}`;
};
const config = {
  // API configuration
  API_BASE_URL: detectServerUrl(),
  // Environment
  NODE_ENV: getEnvVar("VITE_NODE_ENV", "development"),
  // Environment flags
  isDevelopment: getEnvVar("VITE_NODE_ENV", "development") === "development",
  // Gemini API
  // To get a valid API key, visit https://ai.google.dev/, sign in,
  // and create an API key in the Google AI Studio.
  // Then set it in your .env file as VITE_GEMINI_API_KEY
  GEMINI_API_KEY: getEnvVar("VITE_GEMINI_API_KEY", "")
};
console.log("[CLIENT] Config initialized:", {
  apiBaseUrl: config.API_BASE_URL,
  nodeEnv: config.NODE_ENV,
  isDevelopment: config.isDevelopment
});
const debugKey = config.GEMINI_API_KEY;
if (debugKey) {
  const keyLength = debugKey.length;
  const firstChars = debugKey.substring(0, 4);
  const lastChars = keyLength > 4 ? debugKey.substring(keyLength - 4) : "";
  console.log(`[CLIENT] Gemini API key loaded with length ${keyLength}. Key starts with ${firstChars}... and ends with ...${lastChars}`);
} else {
  console.warn("[CLIENT] No Gemini API key found in client environment variables");
}
const discoverServer = async () => {
  let baseUrl = config.API_BASE_URL;
  console.log(`[API] Starting server discovery with base URL: ${baseUrl}`);
  if (config.isDevelopment) {
    if (!baseUrl) {
      console.log("[API] Using relative paths with Vite proxy");
      return "";
    }
    try {
      const originalResponse = await fetch(`${baseUrl}/api/server-info`);
      if (originalResponse.ok) {
        console.log(`[API] Server found at initial URL: ${baseUrl}`);
        return baseUrl;
      }
    } catch (e) {
      console.log(`[API] Initial URL not available: ${baseUrl}`);
    }
    if (baseUrl.includes("://::1:")) {
      const ipv4Url = baseUrl.replace("://::1:", "://127.0.0.1:");
      try {
        console.log(`[API] Trying IPv4 alternative: ${ipv4Url}`);
        const ipv4Response = await fetch(`${ipv4Url}/api/server-info`);
        if (ipv4Response.ok) {
          console.log(`[API] Server found at IPv4 URL: ${ipv4Url}`);
          return ipv4Url;
        }
      } catch (e) {
        console.log(`[API] IPv4 alternative not available: ${ipv4Url}`);
      }
    }
    if (baseUrl.includes("://127.0.0.1:")) {
      const ipv6Url = baseUrl.replace("://127.0.0.1:", "://[::1]:");
      try {
        console.log(`[API] Trying IPv6 alternative: ${ipv6Url}`);
        const ipv6Response = await fetch(`${ipv6Url}/api/server-info`);
        if (ipv6Response.ok) {
          console.log(`[API] Server found at IPv6 URL: ${ipv6Url}`);
          return ipv6Url;
        }
      } catch (e) {
        console.log(`[API] IPv6 alternative not available: ${ipv6Url}`);
      }
    }
    try {
      console.log("[API] Trying server via proxy");
      const response = await fetch("/api/server-info");
      if (response.ok) {
        console.log("[API] Server found via proxy");
        return "";
      }
    } catch (e) {
      console.log("[API] Proxy not available", e);
    }
  }
  console.log(`[API] Using default base URL: ${baseUrl}`);
  return baseUrl;
};
let currentBaseUrl = config.API_BASE_URL;
discoverServer().then((discoveredUrl) => {
  currentBaseUrl = discoveredUrl;
  console.log(`[API] Using server at: ${currentBaseUrl}`);
}).catch((err) => {
  console.warn(`[API] Server discovery failed, using default: ${currentBaseUrl}`, err);
});
const apiClient = axios.create({
  // The baseURL will be updated dynamically if needed
  baseURL: config.API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
apiClient.interceptors.request.use(
  (config2) => {
    config2.baseURL = currentBaseUrl;
    return config2;
  },
  (error) => {
    return Promise.reject(error);
  }
);
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    var _a, _b;
    const errorMessage = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.error) || error.message || "Unknown error";
    if ((error.code === "ECONNREFUSED" || error.message.includes("Network Error")) && config.isDevelopment) {
      console.log("[API] Connection issue detected, trying to rediscover server...");
      try {
        await new Promise((resolve) => setTimeout(resolve, 1e3));
        currentBaseUrl = await discoverServer();
        const originalRequest = error.config;
        originalRequest.baseURL = currentBaseUrl;
        return axios(originalRequest);
      } catch (rediscoveryError) {
        console.error("[API] Failed to rediscover server:", rediscoveryError);
      }
    }
    console.error("API Error:", errorMessage);
    return Promise.reject(errorMessage);
  }
);
class CodeReviewApiService {
  /**
   * Get all repositories
   * @returns {Promise<Array>} - Array of repositories
   */
  async getRepositories() {
    try {
      const response = await apiClient.get("/api/code-review/repositories");
      return response.data;
    } catch (error) {
      console.error("Error fetching repositories:", error);
      throw error;
    }
  }
  /**
   * Select a repository
   * @param {string} path - Repository path
   * @returns {Promise<Object>} - Selection result
   */
  async selectRepository(path) {
    try {
      console.log(`[CLIENT] Selecting repository at path: ${path}`);
      if (!path) {
        throw new Error("Repository path is required");
      }
      try {
        const response = await apiClient.post(
          "/api/code-review/select-repository",
          { path },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 5e3
            // 5 second timeout
          }
        );
        console.log("[CLIENT] Repository selection successful");
        return response;
      } catch (error) {
        console.warn("[CLIENT] Post request failed, trying alternative method:", error);
        const response = await apiClient.get(
          `/api/code-review/select-repository?path=${encodeURIComponent(path)}`,
          { timeout: 5e3 }
        );
        console.log("[CLIENT] Repository selection successful (fallback)");
        return response;
      }
    } catch (error) {
      console.error("[CLIENT] Error selecting repository:", error);
      console.error("[CLIENT] Request details:", { path });
      throw error;
    }
  }
  /**
   * Get branches for the selected repository
   * @param {string} [path] - Optional repository path to use directly
   * @returns {Promise<Object>} - Branches object with all and current properties
   */
  async getBranches(path) {
    try {
      let url = "/api/code-review/branches";
      if (path) {
        url += `?path=${encodeURIComponent(path)}`;
      }
      console.log(`[CLIENT] Fetching branches using URL: ${url}`);
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error("[CLIENT] Error fetching branches:", error);
      throw error;
    }
  }
  /**
   * Analyze code differences between branches
   * @param {string} baseBranch - Base branch (e.g., main)
   * @param {string} headBranch - Head branch (feature branch)
   * @param {string} prompt - Custom prompt for analysis
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeDiff(baseBranch, headBranch, prompt = "") {
    try {
      const response = await apiClient.post("/api/code-review/analyze", {
        baseBranch,
        headBranch,
        prompt
      });
      return response.data;
    } catch (error) {
      console.error("Error analyzing diff:", error);
      throw error;
    }
  }
  /**
   * Get raw diff between branches
   * @param {string} baseBranch - Base branch
   * @param {string} headBranch - Head branch
   * @returns {Promise<Object>} - Diff data
   */
  async getDiff(baseBranch, headBranch) {
    try {
      const response = await apiClient.get("/api/code-review/diff", {
        params: { baseBranch, headBranch }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching diff:", error);
      throw error;
    }
  }
  /**
   * Check the status of the analyzer
   * @returns {Promise<Object>} - Status object
   */
  async getStatus() {
    try {
      const response = await apiClient.get("/api/code-review/status");
      return response.data;
    } catch (error) {
      console.error("Error fetching analyzer status:", error);
      throw error;
    }
  }
}
const codeReviewApiService = new CodeReviewApiService();
const AIAnalyzer = ({
  fromBranch,
  toBranch,
  branches,
  onFromBranchChange,
  onToBranchChange,
  isLoadingBranches,
  repoPath
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [analysisPrompt, setAnalysisPrompt] = useState(
    "Analyze code changes for potential bugs, performance issues, and best practices"
  );
  const runAnalysis = async () => {
    if (!repoPath || !fromBranch || !toBranch) {
      setError("Please select a repository and both branches");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await codeReviewApiService.selectRepository(repoPath);
      const results = await codeReviewApiService.analyzeDiff(
        fromBranch,
        toBranch,
        analysisPrompt
      );
      setAnalysisResults(results);
    } catch (error2) {
      console.error("Error analyzing code:", error2);
      if (error2.includes("API key") || error2.includes("Gemini API")) {
        setError(
          "Gemini API key is missing or invalid. Please add a valid API key in the server .env file. You can get a key from https://ai.google.dev/"
        );
      } else {
        setError(error2 || "Failed to analyze code");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const renderSeverityBadge = (severity) => {
    const classes = `severity-badge severity-${severity}`;
    return /* @__PURE__ */ jsxDEV("span", { className: classes, children: severity }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
      lineNumber: 66,
      columnNumber: 12
    }, void 0);
  };
  const renderBranchSelector = () => /* @__PURE__ */ jsxDEV("div", { className: "branch-selector", children: [
    /* @__PURE__ */ jsxDEV("h4", { children: "Select Branches to Compare" }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
      lineNumber: 72,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("div", { className: "branch-selectors", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "branch-select", children: [
        /* @__PURE__ */ jsxDEV("label", { children: "Base (main) branch:" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
          lineNumber: 75,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV(
          "select",
          {
            value: fromBranch,
            onChange: (e) => onFromBranchChange(e.target.value),
            disabled: isLoadingBranches,
            children: [
              /* @__PURE__ */ jsxDEV("option", { value: "", children: "-- Select Base Branch --" }, void 0, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
                lineNumber: 81,
                columnNumber: 13
              }, void 0),
              branches.map((branch) => /* @__PURE__ */ jsxDEV("option", { value: branch, children: branch }, `base-${branch}`, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
                lineNumber: 83,
                columnNumber: 15
              }, void 0))
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 76,
            columnNumber: 11
          },
          void 0
        )
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
        lineNumber: 74,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDEV("div", { className: "branch-select", children: [
        /* @__PURE__ */ jsxDEV("label", { children: "Head (feature) branch:" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
          lineNumber: 89,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV(
          "select",
          {
            value: toBranch,
            onChange: (e) => onToBranchChange(e.target.value),
            disabled: isLoadingBranches,
            children: [
              /* @__PURE__ */ jsxDEV("option", { value: "", children: "-- Select Head Branch --" }, void 0, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
                lineNumber: 95,
                columnNumber: 13
              }, void 0),
              branches.map((branch) => /* @__PURE__ */ jsxDEV("option", { value: branch, children: branch }, `head-${branch}`, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
                lineNumber: 97,
                columnNumber: 15
              }, void 0))
            ]
          },
          void 0,
          true,
          {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 90,
            columnNumber: 11
          },
          void 0
        )
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
        lineNumber: 88,
        columnNumber: 9
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
      lineNumber: 73,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
    lineNumber: 71,
    columnNumber: 5
  }, void 0);
  const renderAnalysisResults = () => {
    if (!analysisResults) return null;
    const { summary, files } = analysisResults;
    return /* @__PURE__ */ jsxDEV("div", { className: "analysis-results", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "results-summary", children: [
        /* @__PURE__ */ jsxDEV("h4", { children: "Summary" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
          lineNumber: 114,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV("div", { className: "summary-info", children: [
          /* @__PURE__ */ jsxDEV("p", { children: [
            /* @__PURE__ */ jsxDEV("strong", { children: "Quality:" }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 116,
              columnNumber: 16
            }, void 0),
            " ",
            summary.overallQuality
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 116,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV("p", { children: [
            /* @__PURE__ */ jsxDEV("strong", { children: "Files Analyzed:" }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 117,
              columnNumber: 16
            }, void 0),
            " ",
            summary.filesAnalyzed
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 117,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV("p", { children: [
            /* @__PURE__ */ jsxDEV("strong", { children: "Total Issues:" }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 118,
              columnNumber: 16
            }, void 0),
            " ",
            summary.issueCount.total
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 118,
            columnNumber: 13
          }, void 0)
        ] }, void 0, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
          lineNumber: 115,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV("div", { className: "summary-stats", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "stat-item", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "stat-value", children: summary.issueCount.high || 0 }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 123,
              columnNumber: 15
            }, void 0),
            /* @__PURE__ */ jsxDEV("span", { className: "stat-label", children: renderSeverityBadge("high") }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 124,
              columnNumber: 15
            }, void 0)
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 122,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV("div", { className: "stat-item", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "stat-value", children: summary.issueCount.medium || 0 }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 127,
              columnNumber: 15
            }, void 0),
            /* @__PURE__ */ jsxDEV("span", { className: "stat-label", children: renderSeverityBadge("medium") }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 128,
              columnNumber: 15
            }, void 0)
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 126,
            columnNumber: 13
          }, void 0),
          /* @__PURE__ */ jsxDEV("div", { className: "stat-item", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "stat-value", children: summary.issueCount.low || 0 }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 131,
              columnNumber: 15
            }, void 0),
            /* @__PURE__ */ jsxDEV("span", { className: "stat-label", children: renderSeverityBadge("low") }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 132,
              columnNumber: 15
            }, void 0)
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 130,
            columnNumber: 13
          }, void 0)
        ] }, void 0, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
          lineNumber: 121,
          columnNumber: 11
        }, void 0),
        summary.topIssues && summary.topIssues.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "top-issues", children: [
          /* @__PURE__ */ jsxDEV("h5", { children: "Top Issues" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 138,
            columnNumber: 15
          }, void 0),
          /* @__PURE__ */ jsxDEV("ul", { className: "issues-list", children: summary.topIssues.map((issue, index) => /* @__PURE__ */ jsxDEV("li", { className: "issue-item", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "issue-file", children: issue.file }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 142,
              columnNumber: 21
            }, void 0),
            /* @__PURE__ */ jsxDEV("span", { className: "issue-title", children: issue.title }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 143,
              columnNumber: 21
            }, void 0)
          ] }, index, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 141,
            columnNumber: 19
          }, void 0)) }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 139,
            columnNumber: 15
          }, void 0)
        ] }, void 0, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
          lineNumber: 137,
          columnNumber: 13
        }, void 0)
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
        lineNumber: 113,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDEV("div", { className: "files-analysis", children: [
        /* @__PURE__ */ jsxDEV("h4", { children: "Files Analysis" }, void 0, false, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
          lineNumber: 152,
          columnNumber: 11
        }, void 0),
        files.map((file, index) => /* @__PURE__ */ jsxDEV("div", { className: "file-analysis", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "file-header", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "file-path", children: file.path }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 156,
              columnNumber: 17
            }, void 0),
            /* @__PURE__ */ jsxDEV("span", { className: "file-type", children: file.type }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 157,
              columnNumber: 17
            }, void 0)
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 155,
            columnNumber: 15
          }, void 0),
          file.issues && file.issues.length > 0 ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
            /* @__PURE__ */ jsxDEV("h5", { children: "Issues" }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 162,
              columnNumber: 19
            }, void 0),
            /* @__PURE__ */ jsxDEV("ul", { className: "file-issues", children: file.issues.map((issue, idx) => /* @__PURE__ */ jsxDEV("li", { className: `issue-item severity-border-${issue.severity}`, children: [
              /* @__PURE__ */ jsxDEV("div", { className: "issue-header", children: [
                /* @__PURE__ */ jsxDEV("span", { className: "issue-title", children: issue.title }, void 0, false, {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
                  lineNumber: 167,
                  columnNumber: 27
                }, void 0),
                renderSeverityBadge(issue.severity),
                issue.line && /* @__PURE__ */ jsxDEV("span", { className: "issue-line", children: [
                  "Line: ",
                  issue.line
                ] }, void 0, true, {
                  fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
                  lineNumber: 169,
                  columnNumber: 42
                }, void 0)
              ] }, void 0, true, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
                lineNumber: 166,
                columnNumber: 25
              }, void 0),
              /* @__PURE__ */ jsxDEV("p", { className: "issue-description", children: issue.description }, void 0, false, {
                fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
                lineNumber: 171,
                columnNumber: 25
              }, void 0)
            ] }, idx, true, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 165,
              columnNumber: 23
            }, void 0)) }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 163,
              columnNumber: 19
            }, void 0)
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 161,
            columnNumber: 17
          }, void 0) : /* @__PURE__ */ jsxDEV("p", { className: "no-issues", children: "No issues found" }, void 0, false, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 177,
            columnNumber: 17
          }, void 0),
          file.suggestions && file.suggestions.length > 0 && /* @__PURE__ */ jsxDEV(Fragment, { children: [
            /* @__PURE__ */ jsxDEV("h5", { children: "Suggestions" }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 182,
              columnNumber: 19
            }, void 0),
            /* @__PURE__ */ jsxDEV("ul", { className: "file-suggestions", children: file.suggestions.map((suggestion, idx) => /* @__PURE__ */ jsxDEV("li", { className: "suggestion-item", children: suggestion }, idx, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 185,
              columnNumber: 23
            }, void 0)) }, void 0, false, {
              fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
              lineNumber: 183,
              columnNumber: 19
            }, void 0)
          ] }, void 0, true, {
            fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
            lineNumber: 181,
            columnNumber: 17
          }, void 0)
        ] }, index, true, {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
          lineNumber: 154,
          columnNumber: 13
        }, void 0))
      ] }, void 0, true, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
        lineNumber: 151,
        columnNumber: 9
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
      lineNumber: 112,
      columnNumber: 7
    }, void 0);
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "ai-analyzer", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "analyzer-header", children: [
      /* @__PURE__ */ jsxDEV("h3", { children: "AI Code Review" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
        lineNumber: 202,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDEV("p", { className: "analyzer-subtitle", children: "Intelligent code analysis powered by Gemini AI" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
        lineNumber: 203,
        columnNumber: 9
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
      lineNumber: 201,
      columnNumber: 7
    }, void 0),
    renderBranchSelector(),
    /* @__PURE__ */ jsxDEV("div", { className: "prompt-section", children: [
      /* @__PURE__ */ jsxDEV("label", { htmlFor: "analysis-prompt", children: "Analysis Prompt:" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
        lineNumber: 211,
        columnNumber: 9
      }, void 0),
      /* @__PURE__ */ jsxDEV(
        "textarea",
        {
          id: "analysis-prompt",
          className: "prompt-input",
          value: analysisPrompt,
          onChange: (e) => setAnalysisPrompt(e.target.value),
          rows: 2,
          placeholder: "What would you like the AI to focus on in this review?"
        },
        void 0,
        false,
        {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
          lineNumber: 212,
          columnNumber: 9
        },
        void 0
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          className: "analyze-button",
          onClick: runAnalysis,
          disabled: isLoading || !repoPath || !fromBranch || !toBranch,
          children: isLoading ? "Analyzing..." : "Run Analysis"
        },
        void 0,
        false,
        {
          fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
          lineNumber: 220,
          columnNumber: 9
        },
        void 0
      )
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
      lineNumber: 210,
      columnNumber: 7
    }, void 0),
    error && /* @__PURE__ */ jsxDEV("div", { className: "error-message", children: error }, void 0, false, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
      lineNumber: 230,
      columnNumber: 9
    }, void 0),
    isLoading && /* @__PURE__ */ jsxDEV("div", { className: "loading-animation", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "spinner" }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
        lineNumber: 237,
        columnNumber: 11
      }, void 0),
      /* @__PURE__ */ jsxDEV("p", { children: "Analyzing code changes using AI. This may take a few moments..." }, void 0, false, {
        fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
        lineNumber: 238,
        columnNumber: 11
      }, void 0)
    ] }, void 0, true, {
      fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
      lineNumber: 236,
      columnNumber: 9
    }, void 0),
    renderAnalysisResults()
  ] }, void 0, true, {
    fileName: "/Users/devang/Documents/local_rabbit/packages/client/src/components/AIAnalyzer.jsx",
    lineNumber: 200,
    columnNumber: 5
  }, void 0);
};
export {
  AIAnalyzer as default
};
