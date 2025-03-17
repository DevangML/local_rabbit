import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { Box, Typography, Button, TextField, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Card, CardContent } from '@mui/material';

// Polyfill for useOptimistic if not available in React 18
const useOptimistic = (state, updateFn) => {
  const [optimisticState, setOptimisticState] = useState(state);
  
  // Update optimistic state when actual state changes
  useEffect(() => {
    setOptimisticState(state);
  }, [state]);
  
  // Function to apply optimistic update
  const addOptimisticUpdate = (update) => {
    setOptimisticState(current => updateFn(current, update));
  };
  
  return [optimisticState, addOptimisticUpdate];
};

// Safe resource creation pattern for React 18 and below
const createResource = (promise) => {
  let status = 'pending';
  let result;
  let error;
  
  const suspender = promise.then(
    (data) => {
      status = 'success';
      result = data;
    },
    (e) => {
      status = 'error';
      error = e;
    }
  );
  
  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw error;
      } else {
        return result;
      }
    }
  };
};

// Simulate a data fetching resource
// Use immediately invoked function expression to avoid variable hoisting issues
const initialTodosResource = (() => {
  const fetchTodos = () => 
    new Promise(resolve => 
      setTimeout(() => 
        resolve([
          { id: 1, text: 'Learn React 19 Concurrent Mode', completed: false },
          { id: 2, text: 'Implement Suspense for data fetching', completed: false },
          { id: 3, text: 'Use the useOptimistic hook', completed: false },
        ]), 
        // Use a shorter timeout for SSR to prevent long server rendering times
        typeof window !== 'undefined' ? 1500 : 100
      )
    );
  
  return createResource(fetchTodos());
})();

// Empty data resource for SSR fallback
const getEmptyTodosResource = () => {
  return {
    read: () => ([
      { id: 1, text: 'Learn React 19 Concurrent Mode', completed: false },
      { id: 2, text: 'Implement Suspense for data fetching', completed: false },
      { id: 3, text: 'Use the useOptimistic hook', completed: false },
    ])
  };
};

// Lazy-loaded component that demonstrates Suspense
const SuspensefulCounter = () => {
  const [count, setCount] = useState(0);
  
  // Return a simpler version during SSR
  if (typeof window === 'undefined') {
    return (
      <Card sx={{ mt: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Suspense-Ready Counter
          </Typography>
          <Typography variant="body1">Count: 0</Typography>
          <Button 
            variant="contained" 
            disabled={true}
            sx={{ mt: 2 }}
          >
            Increment
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Client-side rendering with full functionality
  return (
    <Card sx={{ mt: 3, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Suspense-Ready Counter
        </Typography>
        <Typography variant="body1">Count: {count}</Typography>
        <Button 
          variant="contained" 
          onClick={() => setCount(c => c + 1)}
          sx={{ mt: 2 }}
        >
          Increment
        </Button>
      </CardContent>
    </Card>
  );
};

// Component that uses Suspense for data fetching
const TodoList = () => {
  // Check if we're in a browser environment to avoid SSR issues
  const isBrowser = typeof window !== 'undefined';
  
  // Use an approach that's safe for SSR
  const resource = isBrowser ? initialTodosResource : getEmptyTodosResource();
  
  // Read data from our resource - this will suspend if data is not ready
  const initialTodos = resource.read();
  
  // State for todos
  const [todos, setTodos] = useState(initialTodos);
  
  // New todo input
  const [newTodo, setNewTodo] = useState('');
  
  // Use our useOptimistic hook (either native or polyfill)
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, newTodo]
  );
  
  // useTransition for non-blocking updates
  const [isPending, startTransition] = useTransition();
  
  // Simulate server delay
  const simulateServerDelay = () => new Promise(resolve => setTimeout(resolve, 1000));
  
  // Add todo with optimistic update
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    // Create new todo
    const todo = {
      id: Date.now(),
      text: newTodo,
      completed: false
    };
    
    // Optimistic update
    addOptimisticTodo(todo);
    
    // Clear input
    setNewTodo('');
    
    // Simulate server request
    await simulateServerDelay();
    
    // Update actual state
    setTodos(prev => [...prev, todo]);
  };
  
  // Toggle todo completion with transition
  const toggleTodo = (id) => {
    startTransition(() => {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    });
  };
  
  // Delete todo with transition
  const deleteTodo = (id) => {
    // Start transition for smoother UI
    startTransition(() => {
      // Simulate server request in a non-async way
      setTimeout(() => {
        // Update state
        setTodos(todos.filter(todo => todo.id !== id));
      }, 500);
    });
  };
  
  return (
    <>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Todo
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            label="New Todo"
            variant="outlined"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={addTodo}
            disabled={!newTodo.trim() || isPending}
          >
            {isPending ? 'Adding...' : 'Add'}
          </Button>
        </Box>
        
        {isPending && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Processing...
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Todo List (Optimistic UI)
        </Typography>
        
        <List>
          {optimisticTodos.map((todo, index) => (
            <React.Fragment key={todo.id}>
              {index > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <Button 
                    color="error" 
                    onClick={() => deleteTodo(todo.id)}
                    size="small"
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                }
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? 'text.secondary' : 'text.primary'
                      }}
                    >
                      {todo.text}
                    </Typography>
                  }
                  onClick={() => toggleTodo(todo.id)}
                  sx={{ cursor: 'pointer' }}
                />
              </ListItem>
            </React.Fragment>
          ))}
          {optimisticTodos.length === 0 && (
            <ListItem>
              <ListItemText primary="No todos yet. Add one above!" />
            </ListItem>
          )}
        </List>
      </Paper>
    </>
  );
};

// Create a simple error boundary for catching Suspense errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'error.light' }}>
          <Typography variant="h6" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1">
            There was an error loading this component.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => this.setState({ hasError: false })}
            sx={{ mt: 2 }}
          >
            Try again
          </Button>
        </Paper>
      );
    }
    
    return this.props.children;
  }
}

// Main React 19 Features component
const React19Features = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        React 19 Features Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This component demonstrates some of the key features in React 19, including Suspense for data fetching and the useOptimistic hook for optimistic UI updates.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Suspense for Data Fetching
        </Typography>
        
        <Typography variant="body1" paragraph>
          Suspense allows components to "wait" for something before rendering. This demo uses Suspense to wait for data to load before rendering the TodoList component.
        </Typography>
        
        <ErrorBoundary>
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          }>
            <TodoList />
          </Suspense>
        </ErrorBoundary>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lazy Loading with Suspense
        </Typography>
        
        <Typography variant="body1" paragraph>
          Suspense can also be used for code-splitting through React.lazy(). This allows you to load components only when they are needed.
        </Typography>
        
        <ErrorBoundary>
          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          }>
            <SuspensefulCounter />
          </Suspense>
        </ErrorBoundary>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          About React 19 Features
        </Typography>
        
        <Typography variant="body1" paragraph>
          React 19 introduces several new features that improve the developer experience and application performance:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Concurrent Mode" 
              secondary="Enables React to work on multiple tasks concurrently, improving responsiveness" 
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Suspense for Data Fetching" 
              secondary="Allows components to wait for data before rendering" 
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="useOptimistic Hook" 
              secondary="Provides a way to update the UI optimistically before an operation completes" 
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Server Components" 
              secondary="Components that run on the server and stream HTML to the client" 
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default React19Features;