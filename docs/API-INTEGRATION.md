# API integration — Reachout UI

This document describes how the Reachout UI talks to the Aspora Reachout Platform backend: base URL, endpoints used, and error handling.

## Base URL and CORS

- **API base path:** `/api/v1` (all endpoints below are relative to this).
- **Development:** Prefer Vite proxy: `/api` → `http://localhost:8080`. Then the UI uses base URL `/api/v1` (same origin).
- **Alternative (no proxy):** Set base URL to `http://localhost:8080/api/v1`. Backend `CorsConfig` allows `http://localhost:*` and `http://127.0.0.1:*` for `/api/**`.
- **Production:** Either same-origin (e.g. UI and API behind same host) or set base URL via env (e.g. `VITE_API_BASE`).

The UI should use a single config (e.g. in `src/api/api.js`) for the base URL and build all request URLs from it.

## Endpoints used by the UI

### Query (conversations and summary)

| Method | Path | Used for |
|--------|------|----------|
| GET | `/query/users/{userId}/conversations?page=0&size=20&sort=timestamp,DESC` | Sidebar conversation list, pagination |
| GET | `/query/users/{userId}/conversations/by-channel?channel=PULSE` | Filter conversations by channel |
| GET | `/query/users/{userId}/conversations/{conversationId}` | Conversation detail (metadata, summary, raw data) |
| GET | `/query/users/{userId}/summary` | User summary view (total summary, counts) |

### Natural language query

| Method | Path | Body | Used for |
|--------|------|------|----------|
| POST | `/query/natural-language` | `{ "query": "..." }` | NL Query view: run English query, show results and generated query |

**NL query response** may include an optional `visualization` object (omitted when the query is not plottable). When present, the UI shows a "View chart" option; on click it renders a Chart.js-compatible chart. Structure: `chart_type` (`"bar"` \| `"pie"` \| `"line"` \| `"doughnut"`), `title`, `labels` (string[]), `datasets` (`{ label, data }[]`), `x_label`, `y_label` (nullable). See NL Query view and `NLQueryChart.jsx` for usage.

### User details

| Method | Path | Used for |
|--------|------|----------|
| GET | `/user-details/{userId}` | User details dashboard for a given user |
| GET | `/user-details/by-email?email=...` | Look up user by email (if implemented in UI) |
| POST | `/user-details` | Ingest single user (e.g. from UI form) |
| POST | `/user-details/batch` | Batch ingest (e.g. CSV upload) |

### Actions (outreach recommendations)

| Method | Path | Used for |
|--------|------|----------|
| GET | `/actions` | List all actions with user counts (Actions view) |
| GET | `/actions/{actionName}/users?page=0&size=20` | Paginated users for an action (drill-down) |
| GET | `/users/{userId}/action` | Recommended action for a user (User Dashboard card) |

**Actions list** returns an array of `{ action_name, display_name, description, priority, user_count }`. **Action users** returns `{ content, page, size, total_elements, total_pages }`; each user has `user_id`, `name`, `email`, `phone`, `country`, `action_name`, `action_display_name`, `dimension_snapshot`, `engagement_score`, `reason`, `evaluated_at`. **User action** returns a single object of the same user shape (no `content` wrapper). The backend returns 500 with message "No action mapping found for userId: ..." when the user has not been evaluated.

### Dimensions and categorization

| Method | Path | Used for |
|--------|------|----------|
| GET | `/dimensions` | Dimensions list (Dimensions view) |
| GET | `/dimensions/{id}` | Dimension detail + subcategories |
| GET | `/dimensions/{dimId}/subcategories/{subCatId}/users` | Users in a dimension/subcategory segment |
| GET | `/categorization/dimensions/{userId}` | Dimension mappings for a user (Categories / Dimensions view) |
| GET | `/categories` | Category list |
| GET | `/categories/{id}` | Category detail |
| GET | `/categorization/users/{userId}` | User’s categorization (categories assigned) |
| GET | `/categorization/categories/{categoryId}/users` | Users in a category |
| POST | `/categorization/trigger` | Trigger categorization (admin) |
| POST | `/categorization/trigger/{userId}` | Trigger for one user |
| POST | `/categorization/evaluate` | Evaluate categorization (admin) |
| POST | `/categorization/evaluate/{userId}` | Evaluate for one user |

### Summarization (optional from UI)

| Method | Path | Used for |
|--------|------|----------|
| POST | `/summarization/trigger` | Trigger summarization (admin) |
| POST | `/summarization/trigger/{userId}` | Trigger for one user |
| POST | `/summarization/trigger/batch` | Batch trigger |

### Ingestion (optional from UI)

| Method | Path | Body | Used for |
|--------|------|------|----------|
| POST | `/ingestion/conversation` | Conversation payload | Ingest single conversation (e.g. test form) |
| POST | `/ingestion/batch` | Array of conversation payloads | Batch ingest |

## Request/response conventions

- **JSON:** Request bodies and responses are JSON. Use `Content-Type: application/json` for POST/PUT.
- **Errors:** Backend returns `ApiErrorResponse`: `timestamp`, `status`, `error`, `message`, `path`, optional `details`. UI should show `message` (and optionally `details`) and handle status (e.g. 400 validation, 404 not found, 500 server error).
- **Pagination:** Conversation list returns a page object (e.g. `content`, `totalElements`, `totalPages`, `number`, `size`). UI uses `page` and `size` query params.

## Example: API module (conceptual)

Centralizing in `src/api/api.js` keeps base URL and error handling in one place:

```js
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export async function getConversations(userId, page = 0, size = 20) {
  const res = await fetch(
    `${API_BASE}/api/v1/query/users/${encodeURIComponent(userId)}/conversations?page=${page}&size=${size}&sort=timestamp,DESC`
  );
  if (!res.ok) throw new Error((await res.json())?.message ?? res.statusText);
  return res.json();
}

export async function getConversation(userId, conversationId) {
  const res = await fetch(
    `${API_BASE}/api/v1/query/users/${encodeURIComponent(userId)}/conversations/${encodeURIComponent(conversationId)}`
  );
  if (!res.ok) throw new Error((await res.json())?.message ?? res.statusText);
  return res.json();
}

export async function getSummary(userId) { ... }
export async function postNaturalLanguageQuery(query) { ... }
export async function getUserDetails(userId) { ... }
export async function getDimensions() { ... }
// ... etc.
```

With proxy, `API_BASE` is empty so requests go to same origin and Vite forwards `/api` to the backend.

## Related docs

- [Installation](INSTALLATION.md) — Env and proxy setup.
- [Tech architecture](TECH-ARCHITECTURE.md) — Where the API layer sits in the app structure.
