import React from 'react';
import { Box, Typography, Container, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

const Documentation = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Documentation
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Find all the resources and documentation you need to get started.
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Getting Started
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Installation Guide" 
                secondary="Learn how to install and set up the application"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Quick Start" 
                secondary="Get up and running in minutes"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Configuration" 
                secondary="Configure the application to your needs"
              />
            </ListItem>
          </List>
        </Paper>
        
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Reference
          </Typography>
          <List>
            <ListItem>
              <ListItemText 
                primary="Endpoints" 
                secondary="Complete list of API endpoints"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Authentication" 
                secondary="Learn about authentication methods"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText 
                primary="Error Handling" 
                secondary="How to handle API errors"
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default Documentation; 