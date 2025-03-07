import React, { useState } from 'react';
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
  Grid,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  TrendingUp as ImpactIcon,
  BugReport as RiskIcon,
  Architecture as DependencyIcon,
} from '@mui/icons-material';

const MetricCard = ({ title, value, icon: Icon, description, color }) => (
  <Paper sx={{ p: 3, height: '100%' }}>
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
  <Icon sx={{ color: `${ color }.main`, mr: 1 }} />
  <Typography variant='h6'>{ title }</Typography>
  </Box>
  <Typography variant='h4' sx={{ color: `${ color }.main`, mb: 1 }}>
  { value }
  </Typography>
  <Typography variant='body2' color='text.secondary'>
  { description }
  </Typography>
  </Paper>
);

const ImpactView = ({ fromBranch, toBranch, branches }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [impact, setImpact] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyzeImpact = async () => {
  if (!fromBranch || !toBranch) {
  setError('Please select both branches to analyze impact');
  return;
  }

  setIsLoading(true);
  setError(null);

  try {
  const response = await fetch('/api/impact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fromBranch,
    toBranch,
  }),
  });

  if (!response.ok) {
  throw new Error('Failed to analyze impact');
  }

  const data = await response.json();
  setImpact(data);
  } catch (err) {
  console.error('Error analyzing impact:', err);
  setError(err.message);
  } finally {
  setIsLoading(false);
  }
  };

  return (
  <Container maxWidth='xl'>
  <Box sx={{ mb: 4 }}>
  <Typography variant='h5' sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
    <ImpactIcon color='primary' />
    Impact Analysis
  </Typography>
  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
    <FormControl sx={{ minWidth: 200 }}>
    <InputLabel>From Branch</InputLabel>
    <Select
    value={ fromBranch }
    label='From Branch'
    onChange={ (e) => onFromBranchChange(e.target.value) }
    >
    { branches.map((branch) => (
    <MenuItem key={ branch } value={ branch }>
      { branch }
    </MenuItem>
    )) }
    </Select>
    </FormControl>
    <FormControl sx={{ minWidth: 200 }}>
    <InputLabel>To Branch</InputLabel>
    <Select
    value={ toBranch }
    label='To Branch'
    onChange={ (e) => onToBranchChange(e.target.value) }
    >
    { branches.map((branch) => (
    <MenuItem key={ branch } value={ branch }>
      { branch }
    </MenuItem>
    )) }
    </Select>
    </FormControl>
    <Button
    variant='contained'
    onClick={ handleAnalyzeImpact }
    disabled={ !fromBranch || !toBranch || isLoading }
    startIcon={ <SpeedIcon /> }
    >
    Analyze Impact
    </Button>
  </Box>
  </Box>

  { isLoading ? (
  <Box
    sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    py: 8,
    }}
  >
    <CircularProgress />
    <Typography color='text.secondary'>
    Analyzing impact of changes...
    </Typography>
  </Box>
  ) : error ? (
  <Alert severity='error' sx={{ mb: 3 }}>
    { error }
  </Alert>
  ) : !impact ? (
  <Paper
    sx={{
    p: 3,
    textAlign: 'center',
    color: 'text.secondary',
    border: '1px dashed',
    borderColor: 'divider',
    }}
  >
    Select branches and analyze to see the impact of changes
  </Paper>
  ) : (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Grid container spacing={ 3 }>
    <Grid item xs={ 12 } md={ 6 } lg={ 3 }>
    <MetricCard
    title='Change Impact'
    value={ impact.changeImpact }
    icon={ ImpactIcon }
    description='Overall impact score of the changes'
    color='primary'
    />
    </Grid>
    <Grid item xs={ 12 } md={ 6 } lg={ 3 }>
    <MetricCard
    title='Risk Level'
    value={ impact.riskLevel }
    icon={ RiskIcon }
    description='Potential risk assessment'
    color='error'
    />
    </Grid>
    <Grid item xs={ 12 } md={ 6 } lg={ 3 }>
    <MetricCard
    title='Performance Impact'
    value={ impact.performanceImpact }
    icon={ SpeedIcon }
    description='Impact on system performance'
    color='warning'
    />
    </Grid>
    <Grid item xs={ 12 } md={ 6 } lg={ 3 }>
    <MetricCard
    title='Dependencies'
    value={ impact.dependencies }
    icon={ DependencyIcon }
    description='Number of affected dependencies'
    color='info'
    />
    </Grid>
    </Grid>

    { /* Detailed Analysis */ }
    { impact.details && (
    <Paper sx={{ p: 3, mt: 3 }}>
    <Typography variant='h6' gutterBottom>
    Detailed Analysis
    </Typography>
    <Box component='ul' sx={{ mt: 2, pl: 2 }}>
    { impact.details.map((detail, index) => (
      <Typography
      key={ index }
      component='li'
      color='text.secondary'
      sx={{ mb: 1 }}
      >
      { detail }
      </Typography>
    )) }
    </Box>
    </Paper>
    ) }
  </Box>
  ) }
  </Container>
  );
};

export default ImpactView; 