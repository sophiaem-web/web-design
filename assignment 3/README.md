# Express + SQLite CRUD API

A small REST API built with **Express (Node.js)** and **SQLite**, designed as a playground for testing
CRUD operations with **Thunder Client** in VS Code.

The resource is a list of `books`. Everything is plain JavaScript (CommonJS) with no build step,
so you can read the whole project in a few minutes.

---

## Contents

1. [Requirements](#requirements)
2. [Quick start](#quick-start)
3. [Project structure](#project-structure)
4. [API overview](#api-overview)
5. [Endpoint reference](#endpoint-reference)
6. [Data model](#data-model)
7. [Testing with Thunder Client](#testing-with-thunder-client)
8. [Resetting the data](#resetting-the-data)
9. [Troubleshooting](#troubleshooting)

---

## Requirements

- **Node.js 22.13 or newer** (`node -v` to check). Tested on Node 22.22 and Node 26.13.
- **npm** (installed with Node).
- **VS Code** with the [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) extension.

**No compiler needed.** This project uses `node:sqlite`, the SQLite driver built into Node.js itself,
so the only dependencies are Express and CORS — both pure JavaScript. There is no native add-on to
compile, which means `npm install` never asks for Visual Studio / Xcode build tools and never breaks
when you upgrade Node. (Projects using the `better-sqlite3` or `sqlite3` packages do need a C++
toolchain or a prebuilt binary matching your exact Node version.)


---

## Quick start

```bash
npm install      # install dependencies
npm start        # start the server on http://localhost:3000
```

You should see:

```
SQLite database ready: .../data/library.db
API listening on http://localhost:3000
Try:            http://localhost:3000/api/books
```

Open `http://localhost:3000/api/books` in a browser and you will get three seeded books back.
The database file is created automatically on first run — there is no migration step.

> On Node 22–24 you may also see `ExperimentalWarning: SQLite is an experimental feature`.
> That is Node's own notice about `node:sqlite`, not an error — the server runs normally.
> The notice disappears on Node 25.7+.

For development, `npm run dev` starts the server with `node --watch`, so it restarts whenever you
save a file.

> If port 3000 is already taken, start on another port:
> Windows (PowerShell): `$env:PORT=4000; npm start` · macOS/Linux: `PORT=4000 npm start`

---

## Project structure

```
.
├── server.js              # entry point: starts the HTTP server
├── package.json
├── .gitignore
├── src/
│   ├── app.js             # Express app: middleware, routes, 404 + error handlers
│   ├── db.js              # opens SQLite via node:sqlite, creates table, seeds rows
│   ├── validate.js        # request-body validation helpers
│   └── routes/
│       └── books.js       # all /api/books route handlers
└── data/
    └── library.db         # SQLite file, created at runtime (git-ignored)
```

Note the split between `app.js` and `server.js`: `app.js` exports the configured Express app,
`server.js` only calls `listen()`. That makes the app easy to import in automated tests later.

---

## API overview

Base URL: `http://localhost:3000`

| Method | Path             | Purpose                          | Success status |
| ------ | ---------------- | -------------------------------- | -------------- |
| GET    | `/health`        | Check the server is running      | 200            |
| GET    | `/api/books`     | List all books (with filters)    | 200            |
| GET    | `/api/books/:id` | Get one book                     | 200            |
| POST   | `/api/books`     | Create a book                    | 201            |
| PUT    | `/api/books/:id` | Replace a book (full update)     | 200            |
| PATCH  | `/api/books/:id` | Update some fields of a book     | 200            |
| DELETE | `/api/books/:id` | Delete a book                    | 204            |

Supported query parameters on `GET /api/books`:

| Parameter   | Example                    | Meaning                                  |
| ----------- | -------------------------- | ---------------------------------------- |
| `search`    | `?search=clean`            | Case-insensitive match on title or author |
| `author`    | `?author=Martin%20Fowler`  | Exact author match                       |
| `available` | `?available=true`          | Filter by availability (`true`/`false`)  |

---

## Endpoint reference

### GET /health

```json
{ "status": "ok", "uptimeSeconds": 42 }
```

### GET /api/books

Response `200` — the list is wrapped with a `count`:

```json
{
  "count": 2,
  "data": [
    {
      "id": 1,
      "title": "The Pragmatic Programmer",
      "author": "Andrew Hunt",
      "year": 1999,
      "available": true,
      "createdAt": "2024-05-01 09:12:44"
    },
    {
      "id": 2,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "year": 2008,
      "available": true,
      "createdAt": "2024-05-01 09:12:44"
    }
  ]
}
```

### GET /api/books/:id

Returns a single book object (not wrapped). `404` if it does not exist, `400` if `:id` is not a number.

### POST /api/books

Request body — `title` and `author` are required:

```json
{
  "title": "Refactoring",
  "author": "Martin Fowler",
  "year": 1999,
  "available": true
}
```

Response `201` with a `Location: /api/books/4` header and the created book:

```json
{
  "id": 4,
  "title": "Refactoring",
  "author": "Martin Fowler",
  "year": 1999,
  "available": true,
  "createdAt": "2024-05-01 09:15:02"
}
```

### PUT /api/books/:id

Full replacement. Send the complete object — any omitted optional field is reset
(`year` becomes `null`, `available` becomes `true`).

```json
{
  "title": "Refactoring (2nd Edition)",
  "author": "Martin Fowler",
  "year": 2018,
  "available": false
}
```

### PATCH /api/books/:id

Partial update — send only what you want to change:

```json
{ "available": false }
```

Sending `{}` returns `400` ("Provide at least one field to update"). Sending `{ "year": null }`
clears the year.

### DELETE /api/books/:id

Response `204 No Content` with an empty body. Deleting the same id twice returns `404`.

### Error format

Every error uses one consistent shape:

```json
{ "error": "Book 999 not found" }
```

Validation failures add a `details` array:

```json
{
  "error": "Validation failed",
  "details": [
    "title is required and must be a non-empty string",
    "year must be an integer between 1000 and 2100"
  ]
}
```

| Status | When it happens                                        |
| ------ | ------------------------------------------------------ |
| 400    | Invalid JSON, bad `:id`, or failed validation          |
| 404    | Book id does not exist, or the route does not exist    |
| 500    | Unexpected server error (details printed in terminal)  |

---

## Data model

Table `books`:

| Column       | Type    | Rules                                          |
| ------------ | ------- | ---------------------------------------------- |
| `id`         | INTEGER | Primary key, auto-increment                    |
| `title`      | TEXT    | Required, must be a non-empty string           |
| `author`     | TEXT    | Required, must be a non-empty string           |
| `year`       | INTEGER | Optional, integer between 1000 and 2100         |
| `available`  | INTEGER | Stored as `0`/`1`, exposed in JSON as boolean |
| `created_at` | TEXT    | Set automatically by SQLite on insert          |

---

## Testing with Thunder Client

1. **Install the extension** in VS Code (Extensions panel → search "Thunder Client").
2. Open the Thunder Client panel from the sidebar icon, then click **New Request**.
3. Set the method and URL, for example `GET` → `http://localhost:3000/api/books`, and click **Send**.
4. For requests with a body, open the **Body** tab, choose **JSON**, and paste the JSON object.
   Thunder Client sends `Content-Type: application/json` for you.
5. Click **Save** (or `Ctrl+S`) to keep the request in a collection, so you can re-run the whole
   CRUD flow later.

**Tip — use an environment variable for the base URL.** In Thunder Client, open **Env** → create a
new environment containing `baseUrl` = `http://localhost:3000`, select it in the top-right dropdown,
then write URLs as `{{baseUrl}}/api/books`. Switching ports or hosts then takes one edit.

A suggested order to exercise every operation:

| # | Method | URL                              | Body / notes                                    |
| - | ------ | -------------------------------- | ----------------------------------------------- |
| 1 | GET    | `{{baseUrl}}/health`             | Confirms the server is up                       |
| 2 | GET    | `{{baseUrl}}/api/books`          | See the three seeded books                      |
| 3 | POST   | `{{baseUrl}}/api/books`          | `{"title":"Refactoring","author":"Martin Fowler","year":1999}` → note the new `id` |
| 4 | GET    | `{{baseUrl}}/api/books/4`        | Read the book you just created                  |
| 5 | PUT    | `{{baseUrl}}/api/books/4`        | Replace it, e.g. change title and `available`   |
| 6 | PATCH  | `{{baseUrl}}/api/books/4`        | `{"available":true}` — only that field changes   |
| 7 | DELETE | `{{baseUrl}}/api/books/4`        | Expect `204`, empty body                        |
| 8 | GET    | `{{baseUrl}}/api/books/4`        | Now expect `404`                                |

Then try the error cases on purpose: `POST` with `{"title":""}`, `GET /api/books/abc`,
and `GET /api/books?available=maybe`. All three should return `400`.

### Same requests with cURL

If you prefer the terminal:

```bash
curl http://localhost:3000/api/books
curl http://localhost:3000/api/books/1
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Refactoring\",\"author\":\"Martin Fowler\",\"year\":1999}"
curl -X PATCH http://localhost:3000/api/books/4 \
  -H "Content-Type: application/json" -d "{\"available\":false}"
curl -i -X DELETE http://localhost:3000/api/books/4
```

---

## Resetting the data

The SQLite file is `data/library.db`. To start from a clean seeded database:

1. Stop the server (`Ctrl+C`).
2. Delete the `data` folder (or just `data/library.db`).
3. Run `npm start` again — the table is recreated and reseeded.

`data/` is listed in `.gitignore`, so the database file and its `-wal` / `-shm` companions never
get committed.

---

## Troubleshooting

| Symptom | Cause / fix |
| ------- | ----------- |
| `Error: listen EADDRINUSE :::3000` | Port 3000 is in use. Stop the other process or `PORT=4000 npm start`. |
| `Cannot find module 'express'` | Dependencies are missing — run `npm install` in the project folder. |
| `This project uses the SQLite module built into Node.js...` | Your Node is older than 22.13. Check with `node -v`, then install Node 22.13+ (24 or 26 recommended) from nodejs.org. |
| `ExperimentalWarning: SQLite is an experimental feature` | Harmless notice from Node 22–24. Ignore it, or move to Node 25.7+ where `node:sqlite` is a release candidate. |
| `npm error EPERM ... rmdir ... node_modules\node_modules\...` | A file in `node_modules` is locked (editor, OneDrive sync, antivirus). Close VS Code, then delete the folder and reinstall: `Remove-Item -Recurse -Force node_modules; npm install` (PowerShell). |
| `npm install` is very slow or fails while building a package | Not possible with this project — it has no native dependencies. If you see a compile step, you edited `package.json` and re-added a native package. |
| Request hangs, then the API says the body is empty | `Content-Type: application/json` is missing. In Thunder Client, use the **Body → JSON** tab rather than raw text. |
| `{"error":"Route GET /api/book not found"}` | The path is `/api/books` (plural). |
| Changes to code have no effect | You are running `npm start`. Use `npm run dev` for auto-restart, or restart manually. |

---

## License

MIT — free to use for coursework and practice.
