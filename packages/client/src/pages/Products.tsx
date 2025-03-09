import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Products = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Products
        </Typography>
        <Typography variant="body1">
          This is the products page. Here you can find all our available products.
        </Typography>
      </Box>
    </Container>
  );
};

export default Products; 