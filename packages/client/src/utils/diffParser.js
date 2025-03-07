const parseDiff = (diffText) => {
  const files = [];
  let currentFile = null;
  let oldLineNumber = 0;
  let newLineNumber = 0;

  const lines = diffText.split('\n');

  for (const line of lines) {
  if (line.startsWith('diff --git')) {
  if (currentFile) {
  files.push(currentFile);
  }

  const path = line.split(' b/')[1];
  currentFile = {
  path,
  changes: [],
  };

  oldLineNumber = 0;
  newLineNumber = 0;
  continue;
  }

  if (!currentFile) { continue; }

  if (line.startsWith('@@')) {
  const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
  if (match) {
  oldLineNumber = parseInt(match[1], 10);
  newLineNumber = parseInt(match[2], 10);
  currentFile.changes.push({
    type: 'header',
    content: line,
    oldLineNumber: '...',
    newLineNumber: '...',
  });
  }
  continue;
  }

  if (line.startsWith('+')) {
  currentFile.changes.push({
  type: 'added',
  content: line.substring(1),
  oldLineNumber: '',
  newLineNumber: newLineNumber++,
  });
  continue;
  }

  if (line.startsWith('-')) {
  currentFile.changes.push({
  type: 'removed',
  content: line.substring(1),
  oldLineNumber: oldLineNumber++,
  newLineNumber: '',
  });
  continue;
  }

  if (line.startsWith(' ')) {
  currentFile.changes.push({
  type: 'unchanged',
  content: line.substring(1),
  oldLineNumber: oldLineNumber++,
  newLineNumber: newLineNumber++,
  });
  }
  }

  if (currentFile) {
  files.push(currentFile);
  }

  return files;
};

export const formatDiff = (diffData) => {
  if (typeof diffData === 'string') {
  return parseDiff(diffData);
  }

  // If diffData is already in the correct format, return it as is
  if (Array.isArray(diffData) && diffData.every(file =>
  file.path && Array.isArray(file.changes)
  )) {
  return diffData;
  }

  // Handle other formats or throw error
  throw new Error('Invalid diff data format');
};

export default formatDiff; 