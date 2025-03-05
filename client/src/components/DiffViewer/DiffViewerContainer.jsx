import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import DiffViewer from './DiffViewer';
import formatDiff from '../../utils/diffParser';

const DiffViewerContainer = ({
  fromBranch,
  toBranch,
  branches,
  onFromBranchChange,
  onToBranchChange,
}) => {
  const [diffData, setDiffData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDiff = async () => {
    if (!fromBranch || !toBranch) {
      setError('Please select both branches to compare');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/git/diff?from=${fromBranch}&to=${toBranch}`);

      if (!response.ok) {
        throw new Error('Failed to fetch diff data');
      }

      const data = await response.text();
      const formattedDiff = formatDiff(data);
      setDiffData(formattedDiff);
    } catch (err) {
      console.error('Error fetching diff:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fromBranch && toBranch) {
      fetchDiff();
    }
  }, [fromBranch, toBranch]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Compare Changes
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
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
            textAlign: 'center',
            color: 'text.secondary',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          {fromBranch && toBranch
            ? 'No changes found between selected branches'
            : 'Select branches to compare changes'}
        </Paper>
      ) : (
        <DiffViewer files={diffData} />
      )}
    </Container>
  );
};

export default DiffViewerContainer; 