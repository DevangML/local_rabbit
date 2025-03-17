import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { CompareArrows as CompareArrowsIcon } from '@mui/icons-material';
import './BranchSelector.css';

const BranchSelector = ({
  branches = [],
  fromBranch,
  toBranch,
  onFromBranchChange,
  onToBranchChange,
  isLoadingBranches,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControl fullWidth size="small" sx={{ flex: 1 }}>
          <InputLabel id="from-branch-label">From Branch</InputLabel>
          <Select
            labelId="from-branch-label"
            id="from-branch-select"
            value={fromBranch}
            label="From Branch"
            onChange={(e) => onFromBranchChange(e.target.value)}
            disabled={branches.length === 0 || isLoadingBranches}
          >
            {branches.map((branch) => (
              <MenuItem key={`from-${branch}`} value={branch}>
                {branch}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mx: 2,
            color: 'text.secondary',
          }}
        >
          <CompareArrowsIcon />
        </Box>

        <FormControl fullWidth size="small" sx={{ flex: 1 }}>
          <InputLabel id="to-branch-label">To Branch</InputLabel>
          <Select
            labelId="to-branch-label"
            id="to-branch-select"
            value={toBranch}
            label="To Branch"
            onChange={(e) => onToBranchChange(e.target.value)}
            disabled={branches.length === 0 || isLoadingBranches}
          >
            {branches.map((branch) => (
              <MenuItem key={`to-${branch}`} value={branch}>
                {branch}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isLoadingBranches && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} />
          </Box>
        )}
      </Box>

      {branches.length === 0 && !isLoadingBranches && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, fontSize: '0.875rem' }}
        >
          Please select a repository to view available branches
        </Typography>
      )}
    </Paper>
  );
};

export default BranchSelector;