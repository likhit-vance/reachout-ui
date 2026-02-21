# Aspora Reachout Platform — UI

Standalone Vite + React frontend for the Aspora Reachout Platform. Consumes the same API as the original single-file UI (conversations, user summary, natural language query, categories).

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs at **http://localhost:5173**. Set the API base URL in `.env.development` (default: `http://localhost:8080`). Ensure the backend is running and CORS allows `http://localhost:5173`.

## Build

```bash
npm run build
```

Output in `dist/`. For production, set `VITE_API_BASE` in `.env.production` to your API origin (or leave empty for same-origin).

## Environment

| Variable         | Description |
|------------------|-------------|
| `VITE_API_BASE` | API origin (e.g. `http://localhost:8080`). Empty = same origin. |

## Project structure

- `src/api/api.js` — API client (configurable base URL)
- `src/components/` — common, conversations, summary, nlquery, categories, layout
- `src/utils/` — formatTimestamp, truncate, syntaxHighlight

This repo was migrated from the single-file React UI in the backend’s `static/index.html`.
