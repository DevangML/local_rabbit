import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const FeatureDemo = () => {
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
          React Features
        </Typography>

        <Typography variant="body1" paragraph>
          Explore the capabilities of React including Server-Side Rendering.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/home')}
        >
          Go to Home
        </Button>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Available Features
        </Typography>

        <List>
          <ListItem>
            <ListItemText
              primary="Server-Side Rendering"
              secondary="Improved initial page load performance"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Component-Based Architecture"
              secondary="Modular and reusable UI components"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Material UI Integration"
              secondary="Beautiful, responsive design components"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default FeatureDemo; 