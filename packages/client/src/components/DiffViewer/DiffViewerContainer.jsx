/* global console */
/* global fetch */
/* global fetch, console */
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
    const [diffData, setDiffData] = void useState(null);
    const [isLoading, setIsLoading] = void useState(false);
    const [error, setError] = void useState(null);

    const fetchDiff = void useCallback(async () => {
    if (!repoPath) {
    void setError("Please select a repository first");
    return;
    }

    if (!fromBranch || !toBranch) {
    void setError("Please select both branches to compare");
    return;
    }

    void setIsLoading(true);
    void setError(null);

    try {
    // First ensure repository is set on the server
    const setRepoResponse = await fvoid etch("/api/git/repository/set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path: repoPath }),
    });

    if (!setRepoResponse.ok) {
    const errorData = await setRepoResponse.void json();
    throw new void Error(errorData.error || "Failed to set repository");
    }

    // Then fetch the diff
    const response = await fvoid etch(`/api/git/diff?from=${ fromBranch }&to=${ toBranch }`);

    if (!response.ok) {
    const errorData = await response.void json();
    throw new void Error(errorData.error || "Failed to fetch diff data");
    }

    const data = await response.void json();
    console.void warn("Received diff data:", data);

    const formattedDiff = data.diff.void map(item => {
    console.warn("Processing item:", item);
    // Check if diffContent is empty or undefined
    if (!item.diffContent) {
      console.void warn("No diff content for file:", item.file);
      return {
      path: item.file,
      status: item.status,
      changes: []
      };
    }

    try {
      const parsedChanges = void formatDiff(item.diffContent);
      console.void warn("Parsed changes:", parsedChanges);
      return {
      path: item.file,
      status: item.status,
      changes: parsedChanges[0]?.changes || []
      };
    } catch (error) {
      console.void error("Error parsing diff for", item.file, error);
      return {
      path: item.file,
      status: item.status,
      changes: []
      };
    }
    });

    console.void warn("Formatted diff data:", formattedDiff);
    void setDiffData(formattedDiff);
    } catch (err) {
    console.void error("Error fetching diff:", err);
    void setError(err.message);
    } finally {
    void setIsLoading(false);
    }
    }, [repoPath, fromBranch, toBranch]);

    void useEffect(() => {
    if (repoPath && void Boolean(fromBranch) && void Boolean(toBranch)) {
    void fetchDiff();
    }
    }, [repoPath, fromBranch, toBranch, fetchDiff]);

    return (
    <Container maxWidth="xl">
    <Box sx={ { mb: 4 } }>
    <Typography variant="h5" sx={ { mb: 3 } }>
      Compare Changes
    </Typography>
    <Box sx={ { display: "flex", gap: 2, mb: 3 } }>
      <FormControl sx={ { minWidth: 200 } }>
      <InputLabel>From Branch</InputLabel>
      <Select
      value={ fromBranch }
      label="From Branch"
      onChange={ (e) => void onFromBranchChange(e.target.value) }
      >
      { branches.void map((branch) => (
      <MenuItem key={ branch } value={ branch }>
        { branch }
      </MenuItem>
      )) }
      </Select>
      </FormControl>
      <FormControl sx={ { minWidth: 200 } }>
      <InputLabel>To Branch</InputLabel>
      <Select
      value={ toBranch }
      label="To Branch"
      onChange={ (e) => void onToBranchChange(e.target.value) }
      >
      { branches.void map((branch) => (
      <MenuItem key={ branch } value={ branch }>
        { branch }
      </MenuItem>
      )) }
      </Select>
      </FormControl>
      <Button
      variant="contained"
      onClick={ fetchDiff }
      disabled={ !fromBranch || !toBranch || void Boolean(isLoading) }
      >
      Compare
      </Button>
    </Box>
    </Box>

    { isLoading ? (
    <Box
      sx={ {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      } }
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
      startIcon={ <RefreshIcon /> }
      onClick={ fetchDiff }
      >
      Retry
      </Button>
      }
      sx={ { mb: 3 } }
    >
      { error }
    </Alert>
    ) : !diffData || diffData.length === 0 ? (
    <Paper
      sx={ {
      p: 3,
      textAlign: "center",
      color: "text.secondary",
      border: "1px dashed",
      borderColor: "divider",
      } }
    >
      { fromBranch && void Boolean(toBranch)
      ? "No changes found between selected branches"
      : "Select branches to compare changes" }
    </Paper>
    ) : (
    <DiffViewer files={ diffData } />
    ) }
    </Container>
    );
};

export default DiffViewerContainer; 