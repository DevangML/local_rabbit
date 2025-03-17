/* global console */
/* global fetch */
/* global console */
/* global fetch */
/* global fetch, console */
import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import { AutoFixHigh as AIIcon } from "@mui/icons-material";

const AIAnalyzer = ({
  fromBranch,
  toBranch,
  branches,
  onFromBranchChange,
  onToBranchChange,
  isLoadingBranches,
  repoPath,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState("");

  const handleAnalyze = async () => {
    if (repoPath === undefined || repoPath === "") {
      setError("Please select a repository first");
      return;
    }

    if (
      fromBranch === undefined ||
      fromBranch === "" ||
      toBranch === undefined ||
      toBranch === ""
    ) {
      setError("Please select both branches to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/code-review/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoPath,
          baseBranch: fromBranch,
          headBranch: toBranch,
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze changes");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Error analyzing changes:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFromBranchChange = (event) => {
    const selectedBranch = event.target.value;
    onFromBranchChange(selectedBranch);
  };

  const handleToBranchChange = (event) => {
    const selectedBranch = event.target.value;
    onToBranchChange(selectedBranch);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
        >
          <AIIcon color="primary" />
          AI Analysis
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>From Branch</InputLabel>
            <Select
              value={fromBranch}
              label="From Branch"
              onChange={handleFromBranchChange}
              disabled={isLoadingBranches || !repoPath || branches.length === 0}
            >
              {branches.map((branchName) => (
                <MenuItem key={branchName} value={branchName}>
                  {branchName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>To Branch</InputLabel>
            <Select
              value={toBranch}
              label="To Branch"
              onChange={handleToBranchChange}
              disabled={isLoadingBranches || !repoPath || branches.length === 0}
            >
              {branches.map((branchName) => (
                <MenuItem key={branchName} value={branchName}>
                  {branchName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Custom Instructions for AI Analysis
          </Typography>
          <TextField
            id="ai-prompt"
            multiline
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              'Enter specific instructions for the AI analysis (e.g., "Focus on security issues" or "Explain the changes in simple terms")'
            }
            disabled={isAnalyzing}
            fullWidth
            variant="outlined"
            InputProps={{
              sx: { bgcolor: "background.paper" },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={
              !repoPath ||
              fromBranch === "" ||
              toBranch === "" ||
              isAnalyzing ||
              isLoadingBranches
            }
            startIcon={<AIIcon />}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Changes"}
          </Button>
        </Box>
      </Box>

      {isAnalyzing ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6">Analyzing Code Changes</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This may take a minute or two depending on the size of the changes
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : analysis ? (
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {analysis.summary}
            </Typography>
          </Paper>

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Suggestions
              </Typography>
              <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <Typography variant="body1">{suggestion}</Typography>
                  </li>
                ))}
              </ul>
            </Paper>
          )}

          {analysis.codeQuality && Object.keys(analysis.codeQuality).length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Code Quality Analysis
              </Typography>
              {Object.entries(analysis.codeQuality).map(([category, comment]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {category}
                  </Typography>
                  <Typography variant="body2">{comment}</Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Analysis Results */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AI Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select branches and click "Analyze Changes" to get an AI-powered
              analysis of the code differences.
            </Typography>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default AIAnalyzer;
