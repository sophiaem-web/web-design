/**
 * Express application wiring: middleware, routes, and error handling.
 * Kept separate from server.js so the app can be imported in tests later.
 */
const express = require('express');
const cors = require('cors');
const booksRouter = require('./routes/books');

const app = express();

// Allow browser front-ends on any origin to call this API.
app.use(cors());

// Parse JSON request bodies (Thunder Client sends "Content-Type: application/json").
app.use(express.json());

// Tiny request log so you can watch requests arrive in the terminal.
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});

// Health check - handy as a "is the server up?" request.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) });
});

// Small landing response so hitting the root URL is not a 404.
app.get('/', (req, res) => {
  res.json({
    name: 'Express + SQLite CRUD API',
    endpoints: [
      'GET    /health',
      'GET    /api/books',
      'GET    /api/books/:id',
      'POST   /api/books',
      'PUT    /api/books/:id',
      'PATCH  /api/books/:id',
      'DELETE /api/books/:id',
    ],
  });
});

app.use('/api/books', booksRouter);

// 404 for anything that did not match a route above.
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// Central error handler. Must keep all four arguments for Express to treat it
// as error-handling middleware.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Malformed JSON from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
