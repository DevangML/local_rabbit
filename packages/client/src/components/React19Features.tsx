import React, { useState, useEffect, useTransition } from 'react';
import { Box, Typography, Button, TextField, Paper, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Polyfill for useOptimistic if not available
const useOptimisticPolyfill = <T,U>(state: T, updateFn: (state: T, update: U) => T) => {
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

export const React19Features: React.FC = () => {
  // Initial todos
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React 19', completed: false },
    { id: 2, text: 'Try useOptimistic', completed: false },
    { id: 3, text: 'Implement Actions', completed: false },
  ]);
  
  // New todo input
  const [newTodo, setNewTodo] = useState('');
  
  // Use our polyfill for useOptimistic
  const [optimisticTodos, addOptimisticTodo] = useOptimisticPolyfill(
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
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        React 19 Features Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This component demonstrates React 19 features like useOptimistic (polyfilled) and improved useTransition.
      </Typography>
      
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
      
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          React 19 Features Used
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="useOptimistic (polyfilled)" 
              secondary="For optimistic UI updates before server response"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Improved useTransition" 
              secondary="For smoother UI during state updates"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="React Actions (concept)" 
              secondary="Simulated async operations with optimistic updates"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}; 