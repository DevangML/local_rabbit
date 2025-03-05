import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  UnfoldMore as ExpandIcon,
  UnfoldLess as CollapseIcon,
  Add as AddedIcon,
  Remove as RemovedIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const DiffLine = ({ type, content, lineNumber, oldLineNumber, newLineNumber }) => {
  const theme = useTheme();

  const getLineStyle = () => {
    switch (type) {
      case 'added':
        return {
          backgroundColor: 'rgba(163, 190, 140, 0.2)',
          borderLeft: `4px solid ${theme.palette.success.main}`,
        };
      case 'removed':
        return {
          backgroundColor: 'rgba(247, 118, 142, 0.2)',
          borderLeft: `4px solid ${theme.palette.error.main}`,
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
        {oldLineNumber}
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
        {newLineNumber}
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
        {content}
      </Box>
    </Box>
  );
};

const FileDiff = ({ file }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const theme = useTheme();

  const getFileStats = () => {
    const added = file.changes.filter(change => change.type === 'added').length;
    const removed = file.changes.filter(change => change.type === 'removed').length;
    return { added, removed };
  };

  const stats = getFileStats();

  return (
    <Paper
      elevation={0}
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
            variant="subtitle2"
            sx={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {file.path}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {stats.added > 0 && (
              <Chip
                icon={<AddedIcon />}
                label={`+${stats.added}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(163, 190, 140, 0.2)',
                  color: theme.palette.success.main,
                }}
              />
            )}
            {stats.removed > 0 && (
              <Chip
                icon={<RemovedIcon />}
                label={`-${stats.removed}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(247, 118, 142, 0.2)',
                  color: theme.palette.error.main,
                }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Copy file path">
            <IconButton size="small">
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={isExpanded ? 'Collapse' : 'Expand'}>
            <IconButton
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <CollapseIcon fontSize="small" />
              ) : (
                <ExpandIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              sx={{
                maxHeight: '500px',
                overflowY: 'auto',
                backgroundColor: 'background.default',
              }}
            >
              {file.changes.map((change, index) => (
                <DiffLine
                  key={index}
                  type={change.type}
                  content={change.content}
                  oldLineNumber={change.oldLineNumber}
                  newLineNumber={change.newLineNumber}
                />
              ))}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
};

const DiffViewer = ({ files }) => {
  return (
    <Box sx={{ py: 3 }}>
      {files.map((file, index) => (
        <FileDiff key={index} file={file} />
      ))}
    </Box>
  );
};

export default DiffViewer; 