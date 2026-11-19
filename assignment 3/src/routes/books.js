/**
 * Book routes  ->  mounted at /api/books
 *
 * GET    /api/books       list (with optional ?search= & ?available= filters)
 * GET    /api/books/:id   read one
 * POST   /api/books       create        -> 201 + Location header
 * PUT    /api/books/:id   full replace
 * PATCH  /api/books/:id   partial update
 * DELETE /api/books/:id   delete        -> 204 no content
 */
const express = require('express');
const db = require('../db');
const { validateBook } = require('../validate');

const router = express.Router();

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

// Convert a database row (snake_case, 0/1) into the JSON shape the API returns.
function toBook(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    year: row.year,
    available: Boolean(row.available),
    createdAt: row.created_at,
  };
}

// Only accept plain positive integers such as "7"; anything else is a bad request.
function parseId(raw) {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const findById = db.prepare('SELECT * FROM books WHERE id = ?');

/* ------------------------------------------------------------------ *
 * GET /api/books  ->  { count, data: [...] }
 * ------------------------------------------------------------------ */
router.get('/', (req, res) => {
  const { search, author, available } = req.query;

  const clauses = [];
  const params = [];

  // Values always travel as bound parameters (?) - never string-concatenated.
  if (search) {
    clauses.push('(title LIKE ? OR author LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (author) {
    clauses.push('author = ?');
    params.push(author);
  }

  if (available !== undefined) {
    if (available !== 'true' && available !== 'false') {
      return res.status(400).json({ error: 'available filter must be "true" or "false"' });
    }
    clauses.push('available = ?');
    params.push(available === 'true' ? 1 : 0);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM books ${where} ORDER BY id`).all(...params);

  res.json({ count: rows.length, data: rows.map(toBook) });
});

/* ------------------------------------------------------------------ *
 * GET /api/books/:id
 * ------------------------------------------------------------------ */
router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  const row = findById.get(id);
  if (!row) {
    return res.status(404).json({ error: `Book ${id} not found` });
  }

  res.json(toBook(row));
});

/* ------------------------------------------------------------------ *
 * POST /api/books
 * ------------------------------------------------------------------ */
router.post('/', (req, res) => {
  const { data, errors } = validateBook(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const info = db
    .prepare('INSERT INTO books (title, author, year, available) VALUES (?, ?, ?, ?)')
    .run(data.title, data.author, data.year ?? null, data.available === false ? 0 : 1);

  const created = toBook(findById.get(info.lastInsertRowid));

  res.status(201).location(`/api/books/${created.id}`).json(created);
});

/* ------------------------------------------------------------------ *
 * PUT /api/books/:id  ->  full replace; omitted optional fields are reset
 * ------------------------------------------------------------------ */
router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  if (!findById.get(id)) {
    return res.status(404).json({ error: `Book ${id} not found` });
  }

  const { data, errors } = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  db.prepare('UPDATE books SET title = ?, author = ?, year = ?, available = ? WHERE id = ?').run(
    data.title,
    data.author,
    data.year ?? null,
    data.available === false ? 0 : 1,
    id
  );

  res.json(toBook(findById.get(id)));
});

/* ------------------------------------------------------------------ *
 * PATCH /api/books/:id  ->  update only the fields you send
 * ------------------------------------------------------------------ */
router.patch('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  if (!findById.get(id)) {
    return res.status(404).json({ error: `Book ${id} not found` });
  }

  const { data, errors } = validateBook(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const columns = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    columns.push(`${key} = ?`);
    values.push(typeof value === 'boolean' ? Number(value) : value);
  }

  db.prepare(`UPDATE books SET ${columns.join(', ')} WHERE id = ?`).run(...values, id);

  res.json(toBook(findById.get(id)));
});

/* ------------------------------------------------------------------ *
 * DELETE /api/books/:id
 * ------------------------------------------------------------------ */
router.delete('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  const info = db.prepare('DELETE FROM books WHERE id = ?').run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: `Book ${id} not found` });
  }

  res.status(204).end();
});

module.exports = router;
