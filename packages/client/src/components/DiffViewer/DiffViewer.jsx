import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  UnfoldMore as ExpandIcon,
  UnfoldLess as CollapseIcon,
  Add as AddedIcon,
  Remove as RemovedIcon,
  Compare as CompareIcon,
} from '@mui/icons-material';
import './DiffViewer.css';

// Side-by-side diff line component
const SideBySideDiffLine = ({ type, content, oldLineNumber, newLineNumber }) => {
  const theme = useTheme();
  const isAdded = type === 'added';
  const isRemoved = type === 'removed';
  const isHeader = type === 'header';

  const getLineStyle = (side) => {
  if (isHeader) {
  return {
  backgroundColor: 'rgba(122, 162, 247, 0.1)',
  borderLeft: '4px solid #7aa2f7',
  };
  }

  if (side === 'left') {
  if (isRemoved) {
  return {
    backgroundColor: 'rgba(247, 118, 142, 0.2)',
    borderLeft: `4px solid ${ theme.palette.error.main }`,
  };
  }
  return {
  borderLeft: '4px solid transparent',
  };
  } else { // right side
  if (isAdded) {
  return {
    backgroundColor: 'rgba(163, 190, 140, 0.2)',
    borderLeft: `4px solid ${ theme.palette.success.main }`,
  };
  }
  return {
  borderLeft: '4px solid transparent',
  };
  }
  };

  // For header lines, span both columns
  if (isHeader) {
  return (
  <Box sx={{ display: 'flex', width: '100%' }}>
  <Box
    sx={{
    flex: 1,
    padding: 1,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.875rem',
    ...getLineStyle(),
    }}
  >
    { content }
  </Box>
  </Box>
  );
  }

  return (
  <Box sx={{ display: 'flex', width: '100%' }}>
  { /* Left side (old content) */ }
  <Box
  sx={{
    flex: 1,
    display: 'flex',
    borderRight: '1px solid',
    borderColor: 'divider',
    ...(!isAdded && { ...getLineStyle('left') }),
    ...(isAdded && { opacity: 0.5 }),
  }}
  >
  <Box
    sx={{
    width: '40px',
    color: 'text.secondary',
    textAlign: 'right',
    userSelect: 'none',
    pr: 1,
    borderRight: '1px solid',
    borderColor: 'divider',
    fontSize: '0.8rem',
    fontFamily: 'JetBrains Mono, monospace',
    }}
  >
    { isAdded ? '' : oldLineNumber }
  </Box>
  <Box
    sx={{
    flex: 1,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.875rem',
    pl: 1,
    pr: 1,
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    ...(isAdded && { opacity: 0.5, backgroundColor: 'rgba(0, 0, 0, 0.05)' }),
    }}
  >
    { isAdded ? '' : content }
  </Box>
  </Box>

  { /* Right side (new content) */ }
  <Box
  sx={{
    flex: 1,
    display: 'flex',
    ...(!isRemoved && { ...getLineStyle('right') }),
    ...(isRemoved && { opacity: 0.5 }),
  }}
  >
  <Box
    sx={{
    width: '40px',
    color: 'text.secondary',
    textAlign: 'right',
    userSelect: 'none',
    pr: 1,
    borderRight: '1px solid',
    borderColor: 'divider',
    fontSize: '0.8rem',
    fontFamily: 'JetBrains Mono, monospace',
    }}
  >
    { isRemoved ? '' : newLineNumber }
  </Box>
  <Box
    sx={{
    flex: 1,
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.875rem',
    pl: 1,
    pr: 1,
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    ...(isRemoved && { opacity: 0.5, backgroundColor: 'rgba(0, 0, 0, 0.05)' }),
    }}
  >
    { isRemoved ? '' : content }
  </Box>
  </Box>
  </Box>
  );
};

// Unified diff line component (from the original implementation)
const UnifiedDiffLine = ({ type, content, oldLineNumber, newLineNumber }) => {
  const theme = useTheme();

  const getLineStyle = () => {
  switch (type) {
  case 'added':
  return {
    backgroundColor: 'rgba(163, 190, 140, 0.2)',
    borderLeft: `4px solid ${ theme.palette.success.main }`,
  };
  case 'removed':
  return {
    backgroundColor: 'rgba(247, 118, 142, 0.2)',
    borderLeft: `4px solid ${ theme.palette.error.main }`,
  };
  case 'header':
  return {
    backgroundColor: 'rgba(122, 162, 247, 0.1)',
    borderLeft: '4px solid #7aa2f7',
  };
  default:
  return {
    borderLeft: '4px solid transparent',
  };
  }
  };

  return (
  <Box
  sx={{
  display: 'flex',
  fontSize: '0.875rem',
  fontFamily: 'JetBrains Mono, monospace',
  lineHeight: '1.5',
  ...getLineStyle(),
  }}
  >
  <Box
  sx={{
    width: '50px',
    color: 'text.secondary',
    textAlign: 'right',
    userSelect: 'none',
    pr: 2,
    borderRight: '1px solid',
    borderColor: 'divider',
  }}
  >
  { oldLineNumber }
  </Box>
  <Box
  sx={{
    width: '50px',
    color: 'text.secondary',
    textAlign: 'right',
    userSelect: 'none',
    px: 2,
    borderRight: '1px solid',
    borderColor: 'divider',
  }}
  >
  { newLineNumber }
  </Box>
  <Box
  sx={{
    flex: 1,
    pl: 2,
    pr: 1,
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
  }}
  >
  { content }
  </Box>
  </Box>
  );
};

const FileDiff = ({ file }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState('split');
  const theme = useTheme();

  const getFileStats = () => {
  const added = file.changes.filter(change => change.type === 'added').length;
  const removed = file.changes.filter(change => change.type === 'removed').length;
  return { added, removed };
  };

  const stats = getFileStats();

  // Add debug logging
  console.warn('File:', file.path, 'Changes:', file.changes.length, 'Expanded:', isExpanded);

  return (
  <Paper
  elevation={ 0 }
  sx={{
  mb: 3,
  border: '1px solid',
  borderColor: 'divider',
  overflow: 'hidden',
  }}
  >
  <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 2,
    py: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
  }}
  >
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Typography
    variant='subtitle2'
    sx={{ fontFamily: 'JetBrains Mono, monospace' }}
    >
    { file.path }
    </Typography>
    <Box sx={{ display: 'flex', gap: 1 }}>
    { stats.added > 0 && (
    <Chip
    icon={ <AddedIcon /> }
    label={ `+${ stats.added }` }
    size='small'
    sx={{
      backgroundColor: 'rgba(163, 190, 140, 0.2)',
      color: theme.palette.success.main,
    }}
    />
    ) }
    { stats.removed > 0 && (
    <Chip
    icon={ <RemovedIcon /> }
    label={ `-${ stats.removed }` }
    size='small'
    sx={{
      backgroundColor: 'rgba(247, 118, 142, 0.2)',
      color: theme.palette.error.main,
    }}
    />
    ) }
    </Box>
  </Box>
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <FormControlLabel
    control={
    <Switch
    size='small'
    checked={ viewMode === 'split' }
    onChange={ () => setViewMode(viewMode === 'split' ? 'unified' : 'split') }
    />
    }
    label={
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <CompareIcon fontSize='small' />
    <Typography variant='caption'>Side-by-side</Typography>
    </Box>
    }
    />
    <Tooltip title='Copy file path'>
    <IconButton size='small'>
    <CopyIcon fontSize='small' />
    </IconButton>
    </Tooltip>
    <Tooltip title={ isExpanded ? 'Collapse' : 'Expand' }>
    <IconButton
    size='small'
    onClick={ () => {
    console.warn('Toggling expanded state', !isExpanded);
    setIsExpanded(!isExpanded);
    }}
    >
    { isExpanded ? (
    <CollapseIcon fontSize='small' />
    ) : (
    <ExpandIcon fontSize='small' />
    ) }
    </IconButton>
    </Tooltip>
  </Box>
  </Box>

  { /* Replace AnimatePresence with simple conditional rendering for now */ }
  { isExpanded && (
  <Box
    sx={{
    maxHeight: '500px',
    overflowY: 'auto',
    backgroundColor: 'background.default',
    }}
  >
    { file.changes && file.changes.length > 0 ? (
    file.changes.map((change, index) => (
    viewMode === 'split' ? (
    <SideBySideDiffLine
      key={ index }
      type={ change.type }
      content={ change.content }
      oldLineNumber={ change.oldLineNumber }
      newLineNumber={ change.newLineNumber }
    />
    ) : (
    <UnifiedDiffLine
      key={ index }
      type={ change.type }
      content={ change.content }
      oldLineNumber={ change.oldLineNumber }
      newLineNumber={ change.newLineNumber }
    />
    )
    ))
    ) : (
    <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
    No diff content available for this file
    </Box>
    ) }
  </Box>
  ) }
  </Paper>
  );
};

const DiffViewer = ({ files }) => {
  return (
  <Box sx={{ py: 3 }}>
  { files.map((file, index) => (
  <FileDiff key={ index } file={ file } />
  )) }
  </Box>
  );
};

export default DiffViewer;