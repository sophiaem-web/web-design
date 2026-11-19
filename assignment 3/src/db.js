/**
 * Database setup.
 *
 * SQLite comes from Node.js itself (`node:sqlite`): available since Node 22.5,
 * and usable without a flag since Node 22.13 / 23.4. That means there is no
 * native add-on to compile, so `npm install` never needs a C++ toolchain or a
 * prebuilt binary for your exact Node version.
 *
 * The driver is synchronous, which keeps the data-access code short and
 * readable. The database file lives in ./data and is created (with a few
 * sample rows) the first time the server starts.
 */
const fs = require('node:fs');
const path = require('node:path');

// Fail with a readable message instead of a stack trace on an old Node version.
let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch {
  console.error(
    [
      '',
      'This project uses the SQLite module built into Node.js,',
      `which is not available in Node ${process.version}.`,
      '',
      'You need Node 22.13.0 or newer (Node 24 and 26 work too).',
      '  - Check your version: node -v',
      '  - Download Node:      https://nodejs.org',
      '  - On Node 22.5 - 22.12 only, run: node --experimental-sqlite server.js',
      '',
    ].join('\n')
  );
  process.exit(1);
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'library.db');

// Make sure the folder exists before SQLite tries to open the file.
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_FILE);

// WAL mode is faster for concurrent reads; a good default for web APIs.
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Create the table on first run.
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    author     TEXT    NOT NULL,
    year       INTEGER,
    available  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed a few rows so GET requests return something useful right away.
const { count } = db.prepare('SELECT COUNT(*) AS count FROM books').get();

if (count === 0) {
  const insert = db.prepare(
    'INSERT INTO books (title, author, year, available) VALUES (?, ?, ?, ?)'
  );

  const seedRows = [
    ['The Pragmatic Programmer', 'Andrew Hunt', 1999, 1],
    ['Clean Code', 'Robert C. Martin', 2008, 1],
    ['Designing Data-Intensive Applications', 'Martin Kleppmann', 2017, 0],
  ];

  db.exec('BEGIN');
  try {
    for (const row of seedRows) insert.run(...row);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(`Seeded ${DB_FILE} with ${seedRows.length} sample books.`);
}

console.log(`SQLite database ready: ${DB_FILE}`);

module.exports = db;
