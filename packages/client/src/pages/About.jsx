import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1">
          This is the about page. Here you can learn more about our company and mission.
        </Typography>
      </Box>
    </Container>
  );
};

export default About;