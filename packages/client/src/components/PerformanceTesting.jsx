import React, { useState, useTransition, useEffect, useCallback, useMemo, Profiler } from 'react';
import { Box, Typography, Paper, Button, Slider, FormControlLabel, Switch, Grid, Card, CardContent, CircularProgress, Divider } from '@mui/material';
import axios from 'axios';

// Performance metrics interface
interface PerformanceMetrics {
  id: string;
  renderTime: number;
  commitTime: number;
  interactionType: string;
  timestamp: number;
}

// Custom Profiler wrapper component to handle type issues
const CustomProfiler: React.FC<{
  id: string;
  children: React.ReactNode;
  onRender: (
    id: string,
    phase: "mount" | "update" | "nested-update",
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
    interactions: Set<{ name: string; timestamp: number }>
  ) => void;
}> = ({ id, children, onRender }) => {
  return (
    <Profiler id={id} onRender={onRender as any}>
      {children}
    </Profiler>
  );
};

// Component that demonstrates Performance Testing with Concurrent Mode
export const PerformanceTesting: React.FC = () => {
  // State for performance testing
  const [itemCount, setItemCount] = useState(1000);
  const [useConcurrentMode, setUseConcurrentMode] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<number[]>([]);
  const [filter, setFilter] = useState('');
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [showMetrics, setShowMetrics] = useState(false);
  
  // Generate items based on count
  useEffect(() => {
    const newItems = Array.from({ length: itemCount }, (_, i) => i);
    
    if (useConcurrentMode) {
      startTransition(() => {
        setItems(newItems);
      });
    } else {
      setItems(newItems);
    }
  }, [itemCount, useConcurrentMode]);
  
  // Filter items based on filter text
  const filteredItems = useMemo(() => {
    if (!filter) return items;
    
    return items.filter(item => 
      item.toString().includes(filter)
    );
  }, [items, filter]);
  
  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;
    
    if (useConcurrentMode) {
      startTransition(() => {
        setFilter(newFilter);
      });
    } else {
      setFilter(newFilter);
    }
  };
  
  // Handle Profiler onRender callback
  const handleProfilerRender = useCallback(
    (
      id: string,
      phase: "mount" | "update" | "nested-update",
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number,
      interactions: Set<{ name: string; timestamp: number }>
    ) => {
      const interactionType = phase;
      
      const newMetric: PerformanceMetrics = {
        id,
        renderTime: actualDuration,
        commitTime,
        interactionType,
        timestamp: Date.now()
      };
      
      setMetrics(prev => [...prev, newMetric]);
      
      // Send metrics to server
      axios.post('/api/actions/metrics', { metrics: newMetric })
        .catch(error => console.error('Error sending metrics:', error));
    },
    []
  );
  
  // Clear metrics
  const clearMetrics = () => {
    setMetrics([]);
  };
  
  // Format time in ms
  const formatTime = (time: number) => {
    return `${time.toFixed(2)} ms`;
  };
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        React 19 Performance Testing Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This component demonstrates React 19's Performance Testing with Concurrent Mode, which allows for better user experience by prioritizing important updates.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Testing Controls
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography id="item-count-slider" gutterBottom>
              Item Count: {itemCount}
            </Typography>
            <Slider
              value={itemCount}
              onChange={(_, newValue) => setItemCount(newValue as number)}
              aria-labelledby="item-count-slider"
              min={100}
              max={10000}
              step={100}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={useConcurrentMode}
                  onChange={(e) => setUseConcurrentMode(e.target.checked)}
                  color="primary"
                />
              }
              label="Use Concurrent Mode"
            />
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={clearMetrics}
                sx={{ mr: 2 }}
              >
                Clear Metrics
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={() => setShowMetrics(!showMetrics)}
              >
                {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography gutterBottom>
              Filter Items (type to test performance):
            </Typography>
            <input
              type="text"
              value={filter}
              onChange={handleFilterChange}
              placeholder="Filter items..."
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
            
            {isPending && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Updating with Concurrent Mode...
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {showMetrics && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Performance Metrics
          </Typography>
          
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {metrics.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No metrics recorded yet. Interact with the list to generate metrics.
              </Typography>
            ) : (
              <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
                {metrics.slice(-10).reverse().map((metric, index) => (
                  <Box 
                    component="li" 
                    key={index}
                    sx={{ 
                      mb: 1, 
                      p: 1, 
                      border: '1px solid #eee', 
                      borderRadius: 1,
                      backgroundColor: index === 0 ? '#f5f5f5' : 'transparent'
                    }}
                  >
                    <Typography variant="body2">
                      <strong>Component:</strong> {metric.id} | 
                      <strong> Render Time:</strong> {formatTime(metric.renderTime)} | 
                      <strong> Commit Time:</strong> {formatTime(metric.commitTime)} | 
                      <strong> Type:</strong> {metric.interactionType}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      )}
      
      <CustomProfiler id="ItemList" onRender={handleProfilerRender}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Item List ({filteredItems.length} items)
          </Typography>
          
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Grid container spacing={2}>
              {filteredItems.slice(0, 100).map((item) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={item}>
                  <Card>
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="body2">Item {item}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {filteredItems.length > 100 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" align="center">
                    Showing 100 of {filteredItems.length} items
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>
      </CustomProfiler>
      
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Performance Testing with Concurrent Mode
        </Typography>
        
        <Typography variant="body1" paragraph>
          React 19's Concurrent Mode enables better performance testing and optimization by allowing React to:
        </Typography>
        
        <Box component="ul" sx={{ pl: 3 }}>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Interrupt rendering:</strong> Long-running renders can be paused and resumed later
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Prioritize updates:</strong> More important updates can be processed first
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              <strong>Avoid blocking the main thread:</strong> Keep the UI responsive during heavy operations
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>Measure performance:</strong> The Profiler API provides detailed metrics about component rendering
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body1">
          Toggle between Concurrent Mode and regular rendering to see the difference in performance. With Concurrent Mode enabled, the UI remains responsive even when filtering through thousands of items.
        </Typography>
      </Paper>
    </Box>
  );
}; 