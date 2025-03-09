const express = require('express');
const router = express.Router();

// Todo actions
router.post('/todos/add', express.json(), (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Invalid todo text' });
  }

  // In a real app, this would save to a database
  // For demo purposes, we'll just return a success response with the new todo
  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  res.status(201).json({ success: true, todo: newTodo });
});

router.put('/todos/:id/toggle', express.json(), (req, res) => {
  const { id } = req.params;

  // In a real app, this would update a database record
  // For demo purposes, we'll just return a success response
  res.json({
    success: true,
    id: Number(id),
    completed: req.body.completed
  });
});

router.delete('/todos/:id', (req, res) => {
  const { id } = req.params;

  // In a real app, this would delete from a database
  // For demo purposes, we'll just return a success response
  res.json({ success: true, id: Number(id) });
});

// Asset metadata actions
router.get('/assets/:id/metadata', (req, res) => {
  const { id } = req.params;

  // Simulate fetching asset metadata
  setTimeout(() => {
    res.json({
      id,
      name: `Asset ${id}`,
      type: 'image',
      size: 1024 * 1024 * Math.random() * 10, // Random size between 0-10MB
      dimensions: {
        width: 1920,
        height: 1080
      },
      createdAt: new Date().toISOString()
    });
  }, 500); // Add artificial delay to demonstrate suspense
});

// Performance metrics endpoint
router.post('/metrics', express.json(), (req, res) => {
  const { metrics } = req.body;

  // In a real app, this would save metrics to a database or analytics service
  console.log('Received performance metrics:', metrics);

  res.json({ success: true });
});

module.exports = router; 