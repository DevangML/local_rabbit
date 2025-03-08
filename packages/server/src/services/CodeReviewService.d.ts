/**
 * Type definitions for CodeReviewService.js
 */

// Response and file types
type Severity = 'high' | 'medium' | 'low';

interface ReviewIssue {
  message: string;
  severity: Severity;
  line?: number;
  column?: number;
  code?: string;
}

interface FileDiffHunk {
  index: number;
  content: string;
}

interface FileReviewData {
  path: string;
  type: string;
  review?: string;
  issues?: ReviewIssue[];
  hunks?: FileDiffHunk[];
  content?: string;
}

interface FileTypes {
  js: string;
  jsx: string;
  ts: string;
  tsx: string;
  py: string;
  java: string;
  rb: string;
  go: string;
  rs: string;
  php: string;
  cs: string;
  cpp: string;
  c: string;
  swift: string;
  kt: string;
  md: string;
  json: string;
  yaml: string;
  yml: string;
  html: string;
  css: string;
  scss: string;
  xml: string;
  [key: string]: string;
}

interface FilesByType {
  [key: string]: FileReviewData[];
}

interface ReviewsByPath {
  [key: string]: FileReviewData;
}

interface IssuesBySeverity {
  high: number;
  medium: number;
  low: number;
}

interface ReviewSummary {
  issueCount: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  topIssues: ReviewIssue[];
  fileTypes: {
    [key: string]: number;
  };
}

interface ReviewResponse {
  summary: ReviewSummary;
  files: FileReviewData[];
} 