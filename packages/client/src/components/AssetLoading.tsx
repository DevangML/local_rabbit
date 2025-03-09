import React, { Suspense, use } from 'react';
import { Box, Typography, Paper, Card, CardMedia, CardContent, Grid, Skeleton, Chip, Stack } from '@mui/material';
import axios from 'axios';

// Asset metadata interface
interface AssetMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  createdAt: string;
}

// Create a resource for asset metadata
const createAssetResource = (id: string) => {
  const promise = axios.get<AssetMetadata>(`/api/actions/assets/${id}/metadata`)
    .then(response => response.data);
  
  return {
    read: () => use(promise)
  };
};

// Sample image URLs for demo
const sampleImages = [
  'https://images.unsplash.com/photo-1682687220063-4742bd7fd538',
  'https://images.unsplash.com/photo-1682687220208-22d7a2543e88', 
  'https://images.unsplash.com/photo-1682687220067-dced9a881b56',
  'https://images.unsplash.com/photo-1682687220063-4742bd7fd538'
];

// Asset component that uses the use hook for data fetching
const Asset: React.FC<{ id: string; imageUrl: string }> = ({ id, imageUrl }) => {
  // Use the use hook to fetch asset metadata
  const metadata = createAssetResource(id).read();
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={`${imageUrl}?w=400&h=200&fit=crop&auto=format`}
        alt={metadata.name}
      />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {metadata.name}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={metadata.type} color="primary" size="small" />
          <Chip label={formatFileSize(metadata.size)} size="small" />
        </Stack>
        
        <Typography variant="body2" color="text.secondary">
          Dimensions: {metadata.dimensions.width} x {metadata.dimensions.height}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Created: {new Date(metadata.createdAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Fallback loading component
const AssetSkeleton: React.FC = () => (
  <Card sx={{ height: '100%' }}>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={24} width="60%" sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="40%" />
      <Skeleton variant="text" height={20} width="70%" />
    </CardContent>
  </Card>
);

// Main component that demonstrates Asset Loading with use hook
export const AssetLoading: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        React 19 Asset Loading Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This component demonstrates React 19's Asset Loading with the use hook, which allows for declarative data fetching and suspense-based loading states.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Asset Gallery with use Hook
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Each asset below uses the use hook to fetch its metadata from the server. The components suspend while loading, and Suspense provides the fallback UI.
        </Typography>
        
        <Grid container spacing={3}>
          {sampleImages.map((imageUrl, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Suspense fallback={<AssetSkeleton />}>
                <Asset id={`asset-${index + 1}`} imageUrl={imageUrl} />
              </Suspense>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Asset Loading with use Hook
        </Typography>
        
        <Typography variant="body1" paragraph>
          The use hook is a new React 19 feature that allows you to use resources (like data fetching promises) directly in your components. It works with Suspense to provide a more declarative way to handle asynchronous operations.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Key benefits:
        </Typography>
        
        <Box component="ul" sx={{ pl: 3 }}>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Declarative Data Fetching:</strong> Fetch data directly in your components without useEffect or useState
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Progressive Loading:</strong> Components can load independently at their own pace
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Improved UX:</strong> Show loading states for specific parts of the UI instead of the entire page
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>Simplified Code:</strong> No need for complex loading state management
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}; 