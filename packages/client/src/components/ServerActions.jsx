import React, { useState, useTransition, use } from 'react';
import { Box, Typography, Button, TextField, Paper, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import axios from 'axios';

// Create a resource for server actions
const createServerAction = (action) => {
  return (params) => {
    const promise = action(params);
    return {
      use: () => use(promise)
    };
  };
};

// Server actions
const addTodoAction = createServerAction(async (text) => {
  const response = await axios.post('/api/actions/todos/add', { text });
  return response.data.todo;
});

const toggleTodoAction = createServerAction(async ({ id, completed }) => {
  const response = await axios.put(`/api/actions/todos/${id}/toggle`, { completed });
  return response.data;
});

const deleteTodoAction = createServerAction(async (id) => {
  const response = await axios.delete(`/api/actions/todos/${id}`);
  return response.data;
});

// Component that demonstrates Server Actions
export const ServerActions = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [isPending, startTransition] = useTransition();
  
  // Add todo with server action
  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    
    startTransition(async () => {
      try {
        // Call the server action
        const action = addTodoAction(newTodo);
        const newTodoItem = action.use();
        
        // Update state with the result from the server
        setTodos(prev => [...prev, newTodoItem]);
        setNewTodo('');
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    });
  };
  
  // Toggle todo with server action
  const handleToggleTodo = (id, completed) => {
    startTransition(async () => {
      try {
        // Call the server action
        const action = toggleTodoAction({ id, completed: !completed });
        const result = action.use();
        
        // Update state with the result from the server
        setTodos(todos.map(todo => 
          todo.id === id ? { ...todo, completed: !completed } : todo
        ));
      } catch (error) {
        console.error('Error toggling todo:', error);
      }
    });
  };
  
  // Delete todo with server action
  const handleDeleteTodo = (id) => {
    startTransition(async () => {
      try {
        // Call the server action
        const action = deleteTodoAction(id);
        const result = action.use();
        
        // Update state with the result from the server
        setTodos(todos.filter(todo => todo.id !== id));
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    });
  };
  
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        React 19 Server Actions Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This component demonstrates React 19's Server Actions feature, which allows you to define server-side functions that can be called directly from your components.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Todo (Server Action)
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
            onClick={handleAddTodo}
            disabled={!newTodo.trim() || isPending}
          >
            {isPending ? 'Adding...' : 'Add'}
          </Button>
        </Box>
        
        {isPending && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Processing server action...
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Todo List (Server Actions)
        </Typography>
        
        <List>
          {todos.map((todo, index) => (
            <React.Fragment key={todo.id}>
              {index > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <Button 
                    color="error" 
                    onClick={() => handleDeleteTodo(todo.id)}
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
                  secondary={todo.createdAt ? `Created: ${new Date(todo.createdAt).toLocaleString()}` : undefined}
                  onClick={() => handleToggleTodo(todo.id, todo.completed)}
                  sx={{ cursor: 'pointer' }}
                />
              </ListItem>
            </React.Fragment>
          ))}
          {todos.length === 0 && (
            <ListItem>
              <ListItemText primary="No todos yet. Add one above!" />
            </ListItem>
          )}
        </List>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Server Actions
        </Typography>
        
        <Typography variant="body1" paragraph>
          Server Actions are a new React 19 feature that allows you to define server-side functions that can be called directly from your components. This enables a more seamless integration between client and server code.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Key benefits:
        </Typography>
        
        <List>
          <ListItem>
            <ListItemText 
              primary="Simplified Data Mutations" 
              secondary="No need to create separate API endpoints for each mutation" 
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Progressive Enhancement" 
              secondary="Works with or without JavaScript enabled on the client" 
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Reduced Client-Server Code" 
              secondary="Define your data mutation logic once, on the server" 
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText 
              primary="Type Safety" 
              secondary="End-to-end type safety between client and server" 
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};