/* global console */
/* global fetch */
/* global console */
/* global fetch */
/* global console */
/* global fetch */
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import DiffViewer from "./DiffViewer";
import formatDiff from "../../utils/diffParser";

const DiffViewerContainer = ({
  fromBranch,
  toBranch,
  branches,
  onFromBranchChange,
  onToBranchChange,
  repoPath,
}) => {
  const [diffData, setDiffData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiff = useCallback(async () => {
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
      // First ensure repository is set on the server
      const setRepoResponse = await fetch("/api/git/repository/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: repoPath }),
      });

      if (!setRepoResponse.ok) {
        const errorData = await setRepoResponse.json();
        throw new Error(errorData.error || "Failed to set repository");
      }

      // Then fetch the diff
      const response = await fetch(
        `/api/git/diff?from=${fromBranch}&to=${toBranch}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch diff data");
      }

      const data = await response.json();
      console.warn("Received diff data:", data);

      const formattedDiff = data.diff.map((item) => {
        console.warn("Processing item:", item);
        // Check if diffContent is empty or undefined
        if (!item.diffContent) {
          console.warn("No diff content for file:", item.file);
          return {
            path: item.file,
            status: item.status,
            changes: [],
            stats: { additions: 0, deletions: 0, changes: 0 },
          };
        }

        try {
          const parsedChanges = formatDiff(item.diffContent);
          console.warn("Parsed changes:", parsedChanges);
          return {
            path: item.file,
            status: item.status,
            changes: parsedChanges,
          };
        } catch (error) {
          console.error("Error parsing diff for", item.file, error);
          return {
            path: item.file,
            status: item.status,
            changes: [],
            stats: { additions: 0, deletions: 0, changes: 0 },
          };
        }
      });

      console.warn("Formatted diff data:", formattedDiff);
      setDiffData(formattedDiff);
    } catch (err) {
      console.error("Error fetching diff:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [repoPath, fromBranch, toBranch]);

  useEffect(() => {
    if (repoPath && Boolean(fromBranch) && Boolean(toBranch)) {
      fetchDiff();
    }
  }, [repoPath, fromBranch, toBranch, fetchDiff]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Compare Changes
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>From Branch</InputLabel>
            <Select
              value={fromBranch}
              label="From Branch"
              onChange={(e) => onFromBranchChange(e.target.value)}
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
            >
              {branches.map((branch) => (
                <MenuItem key={branch} value={branch}>
                  {branch}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={fetchDiff}
            disabled={!fromBranch || !toBranch || isLoading}
          >
            Compare
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchDiff}
            >
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      ) : !diffData || diffData.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            color: "text.secondary",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          {fromBranch && Boolean(toBranch)
            ? "No changes found between selected branches"
            : "Select branches to compare changes"}
        </Paper>
      ) : (
        <DiffViewer files={diffData} />
      )}
    </Container>
  );
};

export default DiffViewerContainer;
