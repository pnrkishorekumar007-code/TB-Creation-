// Express (qs) parses repeated params into arrays and bracket params into
// objects. Every query value a controller consumes must be a plain string;
// anything else is a malformed request (400), not a server error (500).
const asString = (value, field) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    const err = new Error(`Invalid "${field}" query parameter`);
    err.status = 400;
    throw err;
  }
  return value;
};

// Parse a 1-based page number; returns `fallback` for missing/invalid input and
// clamps to `max` when provided.
const asPage = (value, fallback, max) => {
  const str = asString(value, 'page');
  const n = parseInt(str, 10);
  if (Number.isNaN(n) || n < 1) return fallback;
  return max ? Math.min(n, max) : n;
};

module.exports = { asString, asPage };
