import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const FeatureDemo: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Feature Demonstration
      </Typography>
      
      <Typography variant="body1" paragraph>
        This page showcases various features available in the application.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          React 19 Features
        </Typography>
        
        <Typography variant="body1" paragraph>
          Explore the new capabilities of React 19 including Concurrent Mode and Streaming Suspense.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/react19')}
        >
          Explore React 19 Features
        </Button>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Features
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Concurrent Mode" 
              secondary="Non-blocking rendering for improved user experience"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Streaming Suspense" 
              secondary="Progressive loading of UI components"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Server-Side Rendering" 
              secondary="Improved initial page load performance"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Optimistic UI Updates" 
              secondary="Immediate UI feedback before server responses"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

// Add default export for lazy loading
export default FeatureDemo; 