import React, { useState } from "react";
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
      Theme,
      SxProps,
} from "@mui/material";
import {
      ContentCopy as CopyIcon,
      UnfoldMore as ExpandIcon,
      UnfoldLess as CollapseIcon,
      Add as AddedIcon,
      Remove as RemovedIcon,
      Compare as CompareIcon,
} from "@mui/icons-material";
import "./DiffViewer.css";

export type DiffLine = {
      type: "added" | "removed" | "unchanged" | "header";
      content: string;
      oldLineNumber?: number | undefined;
      newLineNumber?: number | undefined;
}

type DiffFile = {
      path: string;
      changes: DiffLine[];
      stats: {
        additions: number;
        deletions: number;
        changes: number;
      };
}

type DiffViewerProps = {
      files: DiffFile[];
}

type DiffLineProps = {
      type: DiffLine["type"];
      content: string;
      oldLineNumber?: number | undefined;
      newLineNumber?: number | undefined;
}

type FileDiffProps = {
      file: DiffFile;
}

type ViewMode = "split" | "unified";

// Side-by-side diff line component
const SideBySideDiffLine: React.FC<DiffLineProps> = ({ type, content, oldLineNumber, newLineNumber }) => {
      const theme = useTheme();
      const isAdded = type === "added";
      const isRemoved = type === "removed";
      const isHeader = type === "header";

      const getLineStyle = (side?: "left" | "right"): SxProps<Theme> => {
        if (isHeader) {
          return {
            backgroundColor: "rgba(122, 162, 247, 0.1)",
            borderLeft: "4px solid #7aa2f7",
          };
        }

        if (side === "left") {
          if (isRemoved) {
            return {
              backgroundColor: "rgba(247, 118, 142, 0.2)",
              borderLeft: `4px solid ${theme.palette.error.main}`,
            };
          }
          return {
            borderLeft: "4px solid transparent",
          };
        } else { // right side
          if (isAdded) {
            return {
              backgroundColor: "rgba(163, 190, 140, 0.2)",
              borderLeft: `4px solid ${theme.palette.success.main}`,
            };
          }
          return {
            borderLeft: "4px solid transparent",
          };
        }
      };

      // For header lines, span both columns
      if (isHeader) {
        return (
          <Box sx={{ display: "flex", width: "100%" }}>
            <Box
              sx={{
                p: 1,
                width: "100%",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.875rem",
                ...getLineStyle(),
              }}
            >
              {content}
            </Box>
          </Box>
        );
      }

      return (
        <Box sx={ { display: "flex", width: "100%" } }>
          { /* Left side (old content) */ }
          <Box
            sx={ {
              flex: 1,
              display: "flex",
              borderRight: "1px solid",
              borderColor: "divider",
              ...(!isAdded ? getLineStyle("left") : { }),
              ...(isAdded ? { opacity: 0.5 } : { }),
            } }
          >
            <Box
              sx={ {
                width: "40px",
                color: "text.secondary",
                textAlign: "right",
                userSelect: "none",
                pr: 1,
                borderRight: "1px solid",
                borderColor: "divider",
                fontSize: "0.8rem",
                fontFamily: "JetBrains Mono, monospace",
              } }
            >
              { isAdded ? "" : oldLineNumber }
            </Box>
            <Box
              sx={ {
                flex: 1,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.875rem",
                pl: 1,
                pr: 1,
                whiteSpace: "pre-wrap",
                overflowX: "auto",
                ...(isAdded ? { opacity: 0.5, backgroundColor: "rgba(0, 0, 0, 0.05)" } : { }),
              } }
            >
              { isAdded ? "" : content }
            </Box>
          </Box>

          { /* Right side (new content) */ }
          <Box
            sx={ {
              flex: 1,
              display: "flex",
              ...(!isRemoved ? getLineStyle("right") : { }),
              ...(isRemoved ? { opacity: 0.5 } : { }),
            } }
          >
            <Box
              sx={ {
                width: "40px",
                color: "text.secondary",
                textAlign: "right",
                userSelect: "none",
                pr: 1,
                borderRight: "1px solid",
                borderColor: "divider",
                fontSize: "0.8rem",
                fontFamily: "JetBrains Mono, monospace",
              } }
            >
              { isRemoved ? "" : newLineNumber }
            </Box>
            <Box
              sx={ {
                flex: 1,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.875rem",
                pl: 1,
                pr: 1,
                whiteSpace: "pre-wrap",
                overflowX: "auto",
                ...(isRemoved ? { opacity: 0.5, backgroundColor: "rgba(0, 0, 0, 0.05)" } : { }),
              } }
            >
              { isRemoved ? "" : content }
            </Box>
          </Box>
        </Box>
      );
};

// Unified diff line component
const UnifiedDiffLine: React.FC<DiffLineProps> = ({ type, content, oldLineNumber, newLineNumber }) => {
      const theme = useTheme();

      const getLineStyle = (): SxProps<Theme> => {
        switch (type) {
          case "added":
            return {
              backgroundColor: "rgba(163, 190, 140, 0.2)",
              borderLeft: `4px solid ${ theme.palette.success.main }`,
            };
          case "removed":
            return {
              backgroundColor: "rgba(247, 118, 142, 0.2)",
              borderLeft: `4px solid ${ theme.palette.error.main }`,
            };
          case "header":
            return {
              backgroundColor: "rgba(122, 162, 247, 0.1)",
              borderLeft: "4px solid #7aa2f7",
            };
          case "unchanged":
            return {
              borderLeft: "4px solid transparent",
            };
          default:
            return {
              borderLeft: "4px solid transparent",
            };
        }
      };

      return (
        <Box
          sx={ {
            display: "flex",
            fontSize: "0.875rem",
            fontFamily: "JetBrains Mono, monospace",
            lineHeight: "1.5",
            ...getLineStyle(),
          } }
        >
          <Box
            sx={ {
              width: "50px",
              color: "text.secondary",
              textAlign: "right",
              userSelect: "none",
              pr: 2,
              borderRight: "1px solid",
              borderColor: "divider",
            } }
          >
            { oldLineNumber }
          </Box>
          <Box
            sx={ {
              width: "50px",
              color: "text.secondary",
              textAlign: "right",
              userSelect: "none",
              px: 2,
              borderRight: "1px solid",
              borderColor: "divider",
            } }
          >
            { newLineNumber }
          </Box>
          <Box
            sx={ {
              flex: 1,
              pl: 2,
              pr: 1,
              whiteSpace: "pre-wrap",
              overflowX: "auto",
            } }
          >
            { content }
          </Box>
        </Box>
      );
};

const FileDiff: React.FC<FileDiffProps> = ({ file }) => {
      const [isExpanded, setIsExpanded] = useState(true);
      const [viewMode, setViewMode] = useState<ViewMode>("split");
      const theme = useTheme();

      const getFileStats = (): { additions: number; deletions: number; changes: number } => {
        const additions = file.changes.filter(change => change.type === "added").length;
        const deletions = file.changes.filter(change => change.type === "removed").length;
        return {
          additions,
          deletions,
          changes: additions + deletions,
        };
      };

      const stats = getFileStats();

      return (
        <Paper sx={ { mb: 2, overflow: "hidden" } }>
          { /* File header */ }
          <Box
            sx={ {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
              backgroundColor: theme.palette.background.default,
            } }
          >
            <Box sx={ { display: "flex", alignItems: "center", gap: 1 } }>
              <IconButton
                size="small"
                onClick={ () => setIsExpanded(!isExpanded) }
                aria-label={ isExpanded ? "Collapse" : "Expand" }
              >
                { isExpanded ? <CollapseIcon /> : <ExpandIcon /> }
              </IconButton>
              <Typography variant="subtitle2" sx={ { fontFamily: "JetBrains Mono, monospace" } }>
                { file.path }
              </Typography>
            </Box>

            <Box sx={ { display: "flex", alignItems: "center", gap: 2 } }>
              <Box sx={ { display: "flex", gap: 1 } }>
                <Tooltip title="Added lines">
                  <Chip
                    size="small"
                    icon={ <AddedIcon /> }
                    label={ stats.additions }
                    color="success"
                    variant="outlined"
                  />
                </Tooltip>
                <Tooltip title="Removed lines">
                  <Chip
                    size="small"
                    icon={ <RemovedIcon /> }
                    label={ stats.deletions }
                    color="error"
                    variant="outlined"
                  />
                </Tooltip>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={ viewMode === "split" }
                    onChange={ () => setViewMode(viewMode === "split" ? "unified" : "split") }
                  />
                }
                label={
                  <Box sx={ { display: "flex", alignItems: "center", gap: 0.5 } }>
                    <CompareIcon fontSize="small" />
                    <Typography variant="body2">Split View</Typography>
                  </Box>
                }
              />

              <Tooltip title="Copy file path">
                <IconButton
                  size="small"
                  onClick={ () => navigator.clipboard.writeText(file.path) }
                  aria-label="Copy file path"
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          { /* Diff content */ }
          { isExpanded && (
            <Box sx={ { maxHeight: "500px", overflow: "auto" } }>
              { file.changes.map((change, index) => (
                viewMode === "split" ? (
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
              )) }
            </Box>
          ) }
        </Paper>
      );
};

const DiffViewer: React.FC<DiffViewerProps> = ({ files }) => {
      return (
        <Box>
          { files.map((file, index) => (
            <FileDiff key={ index } file={ file } />
          )) }
        </Box>
      );
};

export default DiffViewer;