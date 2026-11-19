/**
 * Entry point: start the HTTP server.
 *
 *   npm start   -> node server.js
 *   npm run dev -> node --watch server.js (auto-restart on file changes)
 */
const app = require('./src/app');

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`\nAPI listening on http://localhost:${PORT}`);
  console.log(`Try:            http://localhost:${PORT}/api/books\n`);
});

// Close the server cleanly on Ctrl+C.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log('\nShutting down...');
    server.close(() => process.exit(0));
  });
}
