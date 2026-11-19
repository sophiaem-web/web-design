/**
 * Input validation helpers.
 *
 * Validation lives in one place so the route handlers stay short and every
 * endpoint returns errors in the same shape.
 */

const MIN_YEAR = 1000;
const MAX_YEAR = 2100;

/**
 * Validate a request body against the `books` schema.
 *
 * @param {unknown} body         Raw request body.
 * @param {boolean} partial      true for PATCH (only validate supplied fields).
 * @returns {{ data: object, errors: string[] }}
 */
function validateBook(body, partial = false) {
  const errors = [];
  const data = {};

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { data, errors: ['Request body must be a JSON object'] };
  }

  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  // --- title: required, non-empty string ---
  if (!partial || has('title')) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      errors.push('title is required and must be a non-empty string');
    } else {
      data.title = body.title.trim();
    }
  }

  // --- author: required, non-empty string ---
  if (!partial || has('author')) {
    if (typeof body.author !== 'string' || body.author.trim() === '') {
      errors.push('author is required and must be a non-empty string');
    } else {
      data.author = body.author.trim();
    }
  }

  // --- year: optional integer (explicit null clears it) ---
  if (has('year')) {
    if (body.year === null) {
      data.year = null;
    } else if (!Number.isInteger(body.year) || body.year < MIN_YEAR || body.year > MAX_YEAR) {
      errors.push(`year must be an integer between ${MIN_YEAR} and ${MAX_YEAR}`);
    } else {
      data.year = body.year;
    }
  }

  // --- available: optional boolean ---
  if (has('available')) {
    if (typeof body.available !== 'boolean') {
      errors.push('available must be true or false');
    } else {
      data.available = body.available;
    }
  }

  if (partial && Object.keys(data).length === 0 && errors.length === 0) {
    errors.push('Provide at least one field to update: title, author, year, available');
  }

  return { data, errors };
}

module.exports = { validateBook, MIN_YEAR, MAX_YEAR };
