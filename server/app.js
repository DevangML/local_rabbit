const express = require('express');
const cors = require('cors');
const projectsRouter = require('./routes/projects');

const app = express();

app.use(cors());
app.use(express.json());

// Register routes
app.use(projectsRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

module.exports = app;
