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
  elevation={ 0 }
  sx={{
  p: 2,
  mb: 3,
  border: '1px solid',
  borderColor: 'divider',
  }}
  >
  <Typography variant='subtitle2' sx={{ mb: 2, color: 'text.secondary' }}>
  Branch Selection
  </Typography>

  <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexWrap: { xs: 'wrap', md: 'nowrap' },
  }}
  >
  <FormControl
    size='small'
    fullWidth
    disabled={ isLoadingBranches || branches.length === 0 }
  >
    <InputLabel>Source Branch</InputLabel>
    <Select
    value={ fromBranch }
    label='Source Branch'
    onChange={ (e) => onFromBranchChange(e.target.value) }
    >
    { branches.map((branch) => (
    <MenuItem
    key={ branch }
    value={ branch }
    disabled={ branch === toBranch }
    >
    { branch }
    </MenuItem>
    )) }
    </Select>
  </FormControl>

  <Box
    sx={{
    display: 'flex',
    alignItems: 'center',
    color: 'text.secondary',
    }}
  >
    <CompareArrowsIcon />
  </Box>

  <FormControl
    size='small'
    fullWidth
    disabled={ isLoadingBranches || branches.length === 0 }
  >
    <InputLabel>Target Branch</InputLabel>
    <Select
    value={ toBranch }
    label='Target Branch'
    onChange={ (e) => onToBranchChange(e.target.value) }
    >
    { branches.map((branch) => (
    <MenuItem
    key={ branch }
    value={ branch }
    disabled={ branch === fromBranch }
    >
    { branch }
    </MenuItem>
    )) }
    </Select>
  </FormControl>

  { isLoadingBranches && (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <CircularProgress size={ 20 } />
    </Box>
  ) }
  </Box>

  { branches.length === 0 && !isLoadingBranches && (
  <Typography
    variant='body2'
    color='text.secondary'
    sx={{ mt: 1, fontSize: '0.875rem' }}
  >
    Please select a repository to view available branches
  </Typography>
  ) }
  </Paper>
  );
};

export default BranchSelector; 