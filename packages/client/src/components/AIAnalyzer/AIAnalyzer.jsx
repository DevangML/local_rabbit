/* global console */
/* global fetch */
/* global console */
/* global fetch */
/* global console */
/* global fetch */
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
    if (!repoPath) {
      setError("Please select a repository first");
      return;
    }

    if (!fromBranch || !toBranch) {
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
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <AIIcon color="primary" />
          AI Analysis
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>From Branch</InputLabel>
            <Select
              value={fromBranch}
              label="From Branch"
              onChange={(e) => onFromBranchChange(e.target.value)}
              disabled={isLoadingBranches || !repoPath || branches.length === 0}
            >
              {branches.map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>To Branch</InputLabel>
            <Select
              value={toBranch}
              label="To Branch"
              onChange={(e) => onToBranchChange(e.target.value)}
              disabled={isLoadingBranches || !repoPath || branches.length === 0}
            >
              {branches.map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
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
            placeholder="Enter specific instructions for the AI analysis (e.g., 'Focus on security issues' or 'Explain the changes in simple terms')"
            disabled={isAnalyzing}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: "background.paper" }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={!repoPath || !fromBranch || !toBranch || Boolean(Boolean(isAnalyzing)) || Boolean(Boolean(isLoadingBranches))}
            startIcon={<AIIcon />}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Changes"}
          </Button>
        </Box>
      </Box>

      {isLoadingBranches ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 8,
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">
            Loading branches...
          </Typography>
        </Box>
      ) : !repoPath ? (
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            color: "text.secondary",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          Please select a repository to begin
        </Paper>
      ) : isAnalyzing ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 8,
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">
            Analyzing changes using AI...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : !analysis ? (
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            color: "text.secondary",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          Select branches and click Analyze to get AI-powered insights
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          { /* Analysis Results */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Typography color="text.secondary">
              {analysis.summary}
            </Typography>
          </Paper>

          { /* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Suggestions
              </Typography>
              <Box component="ul" sx={{ mt: 2, pl: 2 }}>
                {analysis.suggestions.map((suggestion, index) => (
                  <Typography
                    key={index}
                    component="li"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {suggestion}
                  </Typography>
                ))}
              </Box>
            </Paper>
          )}

          { /* Code Quality Insights */}
          {analysis.codeQuality && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Code Quality Insights
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.entries(analysis.codeQuality).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {key}
                    </Typography>
                    <Typography color="text.secondary">
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Container>
  );
};

export default AIAnalyzer;