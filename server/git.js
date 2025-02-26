const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const diff = require('diff');

class GitService {
  constructor(repoPath) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  async getBranches() {
    const result = await this.git.branch();
    return result.all;
  }

  async getCurrentBranch() {
    const result = await this.git.branch();
    return result.current;
  }

  async getDiff(fromBranch, toBranch) {
    try {
      const diffResult = await this.git.diff([fromBranch, toBranch]);
      return this.parseDiff(diffResult);
    } catch (error) {
      console.error('Error getting diff:', error);
      throw error;
    }
  }

  async getCommits(branch, count = 10) {
    const logs = await this.git.log({ maxCount: count, branch });
    return logs.all;
  }

  async getFileContent(branch, filePath) {
    try {
      const content = await this.git.show([`${branch}:${filePath}`]);
      return content;
    } catch (error) {
      console.error(`Error getting file content for ${filePath} on ${branch}:`, error);
      return null;
    }
  }

  parseDiff(diffText) {
    // Parse the raw diff text into structured objects
    const files = [];
    const fileRegex = /^diff --git a\/(.*) b\/(.*)$/gm;
    const chunkRegex = /^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/gm;
    const lines = diffText.split('\n');

    let currentFile = null;
    let currentChunk = null;

    for (const line of lines) {
      const fileMatch = fileRegex.exec(line);
      if (fileMatch) {
        if (currentFile) {
          files.push(currentFile);
        }
        currentFile = {
          oldPath: fileMatch[1],
          newPath: fileMatch[2],
          chunks: [],
          additions: 0,
          deletions: 0
        };
        fileRegex.lastIndex = 0; // Reset regex state
        continue;
      }

      const chunkMatch = chunkRegex.exec(line);
      if (chunkMatch && currentFile) {
        currentChunk = {
          oldStart: parseInt(chunkMatch[1], 10),
          oldLines: parseInt(chunkMatch[2], 10),
          newStart: parseInt(chunkMatch[3], 10),
          newLines: parseInt(chunkMatch[4], 10),
          lines: []
        };
        currentFile.chunks.push(currentChunk);
        chunkRegex.lastIndex = 0; // Reset regex state
        continue;
      }

      if (currentChunk && line.startsWith('+')) {
        currentChunk.lines.push({ type: 'addition', content: line.substring(1) });
        currentFile.additions++;
      } else if (currentChunk && line.startsWith('-')) {
        currentChunk.lines.push({ type: 'deletion', content: line.substring(1) });
        currentFile.deletions++;
      } else if (currentChunk && line.startsWith(' ')) {
        currentChunk.lines.push({ type: 'context', content: line.substring(1) });
      }
    }

    if (currentFile) {
      files.push(currentFile);
    }

    return files;
  }
}

module.exports = GitService;