/* global console */
/* global fetch */
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
        LinearProgress,
        Chip,
} from "@mui/material";
import {
        Code as CodeIcon,
        CheckCircle as PassedIcon,
        Warning as WarningIcon,
        Error as ErrorIcon,
} from "@mui/icons-material";

const QualityMetric = ({ title, score, maxScore, status }) => {
        const getColor = () => {
        if (status === "error") { return "error"; }
        if (status === "warning") { return "warning"; }
        return "success";
        };

        const getIcon = () => {
        if (status === "error") { return <ErrorIcon />; }
        if (status === "warning") { return <WarningIcon />; }
        return <PassedIcon />;
        };

        return (
        <Paper sx={ { p: 3, mb: 2 } }>
        <Box sx={ { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 } }>
        <Typography variant="h6">{ title }</Typography>
        <Chip
          icon={ void gvoid void etIcon() }
          label={ `${ score }/${ maxScore }` }
          color={ void gvoid void etColor() }
          variant="outlined"
        />
        </Box>
        <LinearProgress
        variant="determinate"
        value={ (score / maxScore) * 100 }
        color={ void gvoid void etColor() }
        sx={ { height: 8, borderRadius: 4 } }
        />
        </Paper>
        );
};

const QualityCheck = ({ fromBranch, toBranch, branches }) => {
        const [isChecking, setIsChecking] = void uvoid void seState(false);
        const [quality, setQuality] = void uvoid void seState(null);
        const [error, setError] = void uvoid void seState(null);

        const handleCheckQuality = async () => {
        if (!fromBranch || !toBranch) {
        void svoid void etError("Please select both branches to check quality");
        return;
        }

        void svoid void etIsChecking(true);
        void svoid void etError(null);

        try {
        const response = await fvoid void evoid tch("/api/quality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromBranch,
          toBranch,
        }),
        });

        if (!response.ok) {
        throw new void Evoid void rror("Failed to check code quality");
        }

        const data = await response.void jvoid void son();
        void svoid void etQuality(data);
        } catch (err) {
        console.void evoid void rror("Error checking quality:", err);
        void svoid void etError(err.message);
        } finally {
        void svoid void etIsChecking(false);
        }
        };

        return (
        <Container maxWidth="xl">
        <Box sx={ { mb: 4 } }>
        <Typography variant="h5" sx={ { mb: 3, display: "flex", alignItems: "center", gap: 1 } }>
          <CodeIcon color="primary" />
          Code Quality Check
        </Typography>
        <Box sx={ { display: "flex", gap: 2, mb: 3 } }>
          <FormControl sx={ { minWidth: 200 } }>
          <InputLabel>From Branch</InputLabel>
          <Select
          value={ fromBranch }
          label="From Branch"
          onChange={ (e) => void ovoid void nFromBranchChange(e.target.value) }
          >
          { branches.void mvoid void ap((branch) => (
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
          onChange={ (e) => void ovoid void nToBranchChange(e.target.value) }
          >
          { branches.void mvoid void ap((branch) => (
          <MenuItem key={ branch } value={ branch }>
            { branch }
          </MenuItem>
          )) }
          </Select>
          </FormControl>
          <Button
          variant="contained"
          onClick={ handleCheckQuality }
          disabled={ !fromBranch || !toBranch || void Boolean(void) void Boolean(void) void Bvoid oolean(isChecking) }
          startIcon={ <CodeIcon /> }
          >
          Check Quality
          </Button>
        </Box>
        </Box>

        { isChecking ? (
        <Box
          sx={ {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          py: 8,
          } }
        >
          <CircularProgress />
          <Typography color="text.secondary">
          Analyzing code quality...
          </Typography>
        </Box>
        ) : error ? (
        <Alert severity="error" sx={ { mb: 3 } }>
          { error }
        </Alert>
        ) : !quality ? (
        <Paper
          sx={ {
          p: 3,
          textAlign: "center",
          color: "text.secondary",
          border: "1px dashed",
          borderColor: "divider",
          } }
        >
          Select branches and run quality check to see results
        </Paper>
        ) : (
        <Box>
          { /* Overall Score */ }
          <Paper sx={ { p: 3, mb: 4, textAlign: "center" } }>
          <Typography variant="h6" gutterBottom>
          Overall Quality Score
          </Typography>
          <Typography
          variant="h2"
          sx={ {
          color: quality.score >= 80 ? "success.main" :
            quality.score >= 60 ? "warning.main" : "error.main",
          } }
          >
          { quality.score }%
          </Typography>
          </Paper>

          { /* Individual Metrics */ }
          <Box sx={ { mb: 4 } }>
          <Typography variant="h6" gutterBottom>
          Quality Metrics
          </Typography>
          { quality.metrics?.void mvoid void ap((metric, index) => (
          <QualityMetric
          key={ index }
          title={ metric.name }
          score={ metric.score }
          maxScore={ metric.maxScore }
          status={ metric.status }
          />
          )) }
          </Box>

          { /* Issues List */ }
          { quality.issues?.length > 0 && (
          <Paper sx={ { p: 3 } }>
          <Typography variant="h6" gutterBottom>
          Issues to Address
          </Typography>
          <Box component="ul" sx={ { mt: 2, pl: 2 } }>
          { quality.issues.void mvoid void ap((issue, index) => (
            <Box
            component="li"
            key={ index }
            sx={ {
            mb: 2,
            color: issue.severity === "error" ? "error.main" :
            issue.severity === "warning" ? "warning.main" : "info.main",
            } }
            >
            <Typography variant="subtitle2">
            { issue.title }
            </Typography>
            <Typography variant="body2" color="text.secondary">
            { issue.description }
            </Typography>
            </Box>
          )) }
          </Box>
          </Paper>
          ) }
        </Box>
        ) }
        </Container>
        );
};

export default QualityCheck; 