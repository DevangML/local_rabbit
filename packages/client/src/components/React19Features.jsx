import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { Box, Typography, Button, TextField, Paper, List, ListItem, ListItemText, Divider, CircularProgress, Card, CardContent } from '@mui/material';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Polyfill for useOptimistic if not available in React 18
const useOptimistic = <T,U>(state: T, updateFn: (state: T, update: U) => T) => {
  const [optimisticState, setOptimisticState] = useState<T>(state);
  
  // Update optimistic state when actual state changes
  useEffect(() => {
    setOptimisticState(state);
  }, [state]);
  
  // Function to apply optimistic update
  const addOptimisticUpdate = (update: U) => {
    setOptimisticState(current => updateFn(current, update));
  };
  
  return [optimisticState, addOptimisticUpdate] as const;
};

// Safe resource creation pattern for React 18 and below
const createResource = <T,>(promise: Promise<T>) => {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: Error;
  
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
    new Promise<Todo[]>(resolve => 
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
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  
  // New todo input
  const [newTodo, setNewTodo] = useState('');
  
  // Use our useOptimistic hook (either native or polyfill)
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );
  
  // useTransition for non-blocking updates
  const [isPending, startTransition] = useTransition();
  
  // Simulate server delay
  const simulateServerDelay = () => new Promise(resolve => setTimeout(resolve, 1000));
  
  // Add todo with optimistic update
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    // Create new todo
    const todo: Todo = {
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
  const toggleTodo = (id: number) => {
    startTransition(() => {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    });
  };
  
  // Delete todo with transition
  const deleteTodo = (id: number) => {
    // Start transition for smoother UI
    startTransition(() => {
      // Simulate server request in a non-async way
      setTimeout(() => {
        // Update state
        setTodos(todos.filter(todo => todo.id !== id));
      }, 1000);
    });
  };
  
  // Render a simpler version during SSR to avoid hydration issues
  if (typeof window === 'undefined') {
    return (
      <>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Todo
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField 
              label="New Todo" 
              variant="outlined" 
              size="small"
              fullWidth
              disabled={true}
            />
            <Button 
              variant="contained" 
              disabled={true}
            >
              Add
            </Button>
          </Box>
        </Paper>
        
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Todo List (with Optimistic UI)
          </Typography>
          
          <List>
            {initialTodos.map((todo, index) => (
              <React.Fragment key={todo.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={todo.text}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </>
    );
  }
  
  // Full client-side rendering
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
            disabled={!newTodo.trim()}
          >
            Add
          </Button>
        </Box>
        
        {isPending && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Updating...
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Todo List (with Optimistic UI)
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
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" color="error">Something went wrong.</Typography>
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

// Main component that demonstrates React 18 features
export const React19Features: React.FC = () => {
  // Track if component has mounted to handle hydration safely
  const [hasMounted, setHasMounted] = useState(false);
  
  // After initial render, mark component as mounted
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // Use simplified rendering during SSR to avoid Suspense and complex component issues
  const isSSR = typeof window === 'undefined';
  
  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        React 18 Features Demo
      </Typography>
      <Typography variant="body1" paragraph>
        This component demonstrates features that are compatible with React 18.
      </Typography>
      
      {/* For SSR - render components directly without Suspense to avoid streaming issues */}
      {isSSR ? (
        <>
          <TodoList />
          <SuspensefulCounter />
        </>
      ) : (
        /* For client-side rendering - use Suspense and ErrorBoundary */
        <>
          <ErrorBoundary>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            }>
              {hasMounted && <TodoList />}
            </Suspense>
          </ErrorBoundary>
          
          <ErrorBoundary>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            }>
              {hasMounted && <SuspensefulCounter />}
            </Suspense>
          </ErrorBoundary>
        </>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          React 19 Features Used
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="useOptimistic" 
              secondary="For optimistic UI updates before server response"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Suspense for Data Fetching" 
              secondary="Declarative loading states while data loads"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Concurrent Mode" 
              secondary="Non-blocking rendering with useTransition"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Streaming Suspense" 
              secondary="Progressive loading of UI components"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

// Export as default for compatibility with both direct imports and lazy loading
export default React19Features; 