import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FeatureDemo } from '../components/FeatureDemo';

function Home() {
        return (
                <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
                        <Typography variant="h4" component="h1" gutterBottom>
                                Welcome to Local Rabbit
                        </Typography>
                        <Typography variant="body1" paragraph>
                                A modern development environment for local projects.
                        </Typography>
                        <FeatureDemo />
                </Box>
        );
}

export default Home;