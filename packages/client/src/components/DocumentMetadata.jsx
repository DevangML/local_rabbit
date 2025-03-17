import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, List, ListItem, ListItemText, Divider, Switch, FormControlLabel } from '@mui/material';
import { Helmet } from 'react-helmet-async';

// Document metadata component
export const DocumentMetadata = () => {
  // State for document metadata
  const [title, setTitle] = useState('React 19 Document Metadata Demo');
  const [description, setDescription] = useState('Learn how to use React 19 Document Metadata features');
  const [keywords, setKeywords] = useState('React 19, Document Metadata, SEO, React Helmet');
  const [ogTitle, setOgTitle] = useState('React 19 Document Metadata');
  const [ogDescription, setOgDescription] = useState('Explore React 19 Document Metadata features');
  const [ogImage, setOgImage] = useState('https://react.dev/images/og-home.png');
  const [canonicalUrl, setCanonicalUrl] = useState('https://example.com/react19-metadata');
  const [themeColor, setThemeColor] = useState('#61dafb');
  
  // State for dynamic metadata
  const [isDynamicMetadata, setIsDynamicMetadata] = useState(false);
  const [counter, setCounter] = useState(0);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you might save this to a database or context
    console.log('Metadata updated');
  };
  
  // Increment counter for dynamic metadata demo
  const incrementCounter = () => {
    setCounter(prev => prev + 1);
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* React Helmet for document metadata */}
      <Helmet>
        {/* Basic metadata */}
        <title>{isDynamicMetadata ? `(${counter}) ${title}` : title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph metadata */}
        <meta property="og:title" content={isDynamicMetadata ? `(${counter}) ${ogTitle}` : ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card metadata */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={isDynamicMetadata ? `(${counter}) ${title}` : title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        
        {/* Other metadata */}
        <link rel="canonical" href={canonicalUrl} />
        <meta name="theme-color" content={themeColor} />
      </Helmet>
      
      <Typography variant="h4" gutterBottom>
        React 19 Document Metadata Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This component demonstrates how to manage document metadata in React 19 applications using React Helmet.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Document Metadata
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText primary="Page Title" secondary={isDynamicMetadata ? `(${counter}) ${title}` : title} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Meta Description" secondary={description} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Meta Keywords" secondary={keywords} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Open Graph Title" secondary={isDynamicMetadata ? `(${counter}) ${ogTitle}` : ogTitle} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Open Graph Description" secondary={ogDescription} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Open Graph Image" secondary={ogImage} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Canonical URL" secondary={canonicalUrl} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Theme Color" secondary={themeColor} />
          </ListItem>
        </List>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dynamic Metadata Demo
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isDynamicMetadata}
                onChange={(e) => setIsDynamicMetadata(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Dynamic Metadata"
          />
        </Box>
        
        <Typography variant="body2" paragraph>
          When enabled, the counter value will be added to the page title and Open Graph title.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Counter: {counter}
          </Typography>
          <Button variant="contained" onClick={incrementCounter}>
            Increment
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Check your browser tab title to see the dynamic update.
        </Typography>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Edit Document Metadata
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Page Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Meta Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
          
          <TextField
            fullWidth
            label="Meta Keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            margin="normal"
            helperText="Separate keywords with commas"
          />
          
          <TextField
            fullWidth
            label="Open Graph Title"
            value={ogTitle}
            onChange={(e) => setOgTitle(e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Open Graph Description"
            value={ogDescription}
            onChange={(e) => setOgDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
          
          <TextField
            fullWidth
            label="Open Graph Image URL"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Canonical URL"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Theme Color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            margin="normal"
            helperText="Hex color code (e.g., #61dafb)"
          />
          
          <Button 
            variant="contained" 
            type="submit" 
            sx={{ mt: 2 }}
          >
            Update Metadata
          </Button>
        </Box>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Document Metadata in React 19
        </Typography>
        
        <Typography variant="body1" paragraph>
          React 19 improves document metadata management through better integration with libraries like React Helmet and enhanced server-side rendering support.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Key benefits:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="SEO Optimization" 
              secondary="Better search engine visibility with proper metadata"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Social Media Sharing" 
              secondary="Enhanced appearance when shared on social platforms"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Dynamic Updates" 
              secondary="Metadata can change based on application state"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Server-Side Rendering" 
              secondary="Metadata is included in the initial HTML for better performance"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};