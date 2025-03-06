import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Article as ArticleIcon,
  Code as CodeIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

const Documentation = () => {
  const theme = useTheme();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Highlight code blocks after render
  useEffect(() => {
    if (markdownContent) {
      Prism.highlightAll();
    }
  }, [markdownContent]);

  const sections = [
    {
      title: 'Getting Started',
      icon: <ArticleIcon color="primary" />,
      items: [
        { title: 'Introduction', path: '/docs/README.md' },
        { title: 'Installation', path: '/docs/INSTALL.md' },
        { title: 'Configuration', path: '/docs/CONFIG.md' },
      ],
    },
    {
      title: 'Features',
      icon: <CodeIcon color="primary" />,
      items: [
        { title: 'Diff Viewer', path: '/docs/features/diff-viewer.md' },
        { title: 'AI Analysis', path: '/docs/features/ai-analysis.md' },
        { title: 'Impact Analysis', path: '/docs/features/impact-analysis.md' },
      ],
    },
    {
      title: 'Advanced',
      icon: <BuildIcon color="primary" />,
      items: [
        { title: 'API Reference', path: '/docs/api/README.md' },
        { title: 'Contributing', path: '/docs/CONTRIBUTING.md' },
        { title: 'Architecture', path: '/docs/ARCHITECTURE.md' },
      ],
    },
  ];

  useEffect(() => {
    const fetchMarkdown = async (path) => {
      if (!path) {return;}

      setIsLoading(true);
      try {
        const response = await fetch(path);
        if (!response.ok) {throw new Error('Failed to load documentation');}
        const text = await response.text();
        setMarkdownContent(text);
      } catch (error) {
        console.error('Error loading documentation:', error);
        setMarkdownContent('# Error\nFailed to load documentation. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedDoc) {
      fetchMarkdown(selectedDoc);
    }
  }, [selectedDoc]);

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom>
          Documentation
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Everything you need to know about Local Rabbit
        </Typography>

        <Grid container spacing={4}>
          {/* Documentation Navigation */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                border: 1,
                borderColor: 'divider',
              }}
            >
              {sections.map((section) => (
                <Box key={section.title}>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {section.icon}
                      <Typography variant="subtitle1" fontWeight="medium">
                        {section.title}
                      </Typography>
                    </Box>
                    <List dense>
                      {section.items.map((item) => (
                        <ListItem
                          key={item.path}
                          button
                          selected={selectedDoc === item.path}
                          onClick={() => setSelectedDoc(item.path)}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            '&.Mui-selected': {
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText',
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              },
                            },
                          }}
                        >
                          <ListItemText
                            primary={item.title}
                            primaryTypographyProps={{
                              variant: 'body2',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  <Divider />
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Documentation Content */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                minHeight: 600,
                border: 1,
                borderColor: 'divider',
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
                  <CircularProgress />
                </Box>
              ) : selectedDoc ? (
                <Box
                  sx={{
                    '& img': { maxWidth: '100%' },
                    '& pre': {
                      margin: '16px 0',
                      padding: '16px',
                      borderRadius: 1,
                      overflow: 'auto',
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                      border: `1px solid ${theme.palette.divider}`,
                    },
                    '& code': {
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.875rem',
                    },
                    '& :not(pre) > code': {
                      padding: '2px 6px',
                      borderRadius: 1,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';

                        return !inline ? (
                          <pre className={`language-${language}`}>
                            <code className={`language-${language}`} {...props}>
                              {String(children).replace(/\n$/, '')}
                            </code>
                          </pre>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {markdownContent}
                  </ReactMarkdown>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', color: 'text.secondary', pt: 8 }}>
                  <Typography>
                    Select a document from the navigation to view its contents
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Documentation; 