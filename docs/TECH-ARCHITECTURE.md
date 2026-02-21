# Tech architecture — Reachout UI

This document describes the technology choices, project structure, and data flow for the Reachout UI frontend.

## Tech stack

| Layer | Technology | Notes |
|-------|------------|--------|
| **Runtime** | Node.js 18+ | Required for Vite and npm scripts |
| **Framework** | React 18 | JSX, function components, hooks |
| **Build / dev** | Vite | Fast HMR, ESM, production build |
| **Language** | JavaScript (JSX) | No TypeScript in current codebase |
| **Styling** | Plain CSS | No Tailwind/CSS-in-JS; shared `index.css`, component-level CSS where needed |
| **HTTP** | `fetch()` | No axios; API layer in `src/api/` |
| **State** | React state + props | No Redux/Zustand; local state and lift-up where needed |

## Project structure

```
reachout-ui/
├── index.html              # Entry HTML; root div and script to main.jsx
├── package.json
├── vite.config.js          # Vite config; proxy to backend (see INSTALLATION.md)
├── eslint.config.js
├── public/                 # Static assets (e.g. vite.svg)
├── src/
│   ├── main.jsx            # React root; StrictMode, App
│   ├── App.jsx              # Top-level layout: Header, Sidebar, main content area
│   ├── App.css
│   ├── index.css           # Global styles, variables, resets
│   ├── api/
│   │   └── api.js          # Base URL, fetch wrappers for backend API
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx   # User ID input, Load Data
│   │   │   └── Sidebar.jsx  # View tabs, conversation list, pagination
│   │   ├── common/
│   │   │   ├── ChannelBadge.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── ErrorBox.jsx
│   │   │   └── Loading.jsx
│   │   ├── conversations/
│   │   │   ├── ConversationItem.jsx
│   │   │   └── ConversationDetail.jsx
│   │   ├── summary/
│   │   │   └── UserSummaryView.jsx
│   │   ├── nlquery/
│   │   │   └── NLQueryView.jsx
│   │   ├── dimensions/
│   │   │   └── DimensionsView.jsx
│   │   ├── categories/
│   │   │   └── CategoriesView.jsx
│   │   └── user/
│   │       ├── SearchUsersView.jsx
│   │       └── UserDetailsDashboard.jsx
│   └── utils/
│       ├── format.js       # Date/display formatting
│       └── syntaxHighlight.js
└── docs/
    ├── INSTALLATION.md
    ├── TECH-ARCHITECTURE.md  # This file
    └── API-INTEGRATION.md
```

## High-level data flow

1. **User enters User ID** in the header and clicks **Load Data**.
2. **App** (or a shared handler) triggers API calls for that user:
   - Conversations list (paginated)
   - User summary
   - User details (if supported)
   - Categorization/dimensions for that user (if applicable)
3. **Sidebar** shows conversation list; user can change page or filter by channel.
4. **Main content** switches by view:
   - **Conversations:** List in sidebar; click → load conversation detail (metadata, summary, raw JSON).
   - **Summary:** Single card with total summary and conversation counts.
   - **NL Query:** Text input → POST natural-language → show generated query, explanation, results table.
   - **Dimensions:** List dimensions; filters/segments; optionally list users by dimension/subcategory.
   - **Categories:** Category tree or list; link to categorization and users.
   - **User details:** Search/list users; show user details dashboard for a selected user.
5. **API layer** (`src/api/api.js`) centralizes base URL and request logic; all backend calls go through it (see [API integration](API-INTEGRATION.md)).

## Design decisions

- **No global store:** State is component-local or lifted to the nearest common parent to keep the app simple and avoid extra dependencies.
- **Single API module:** All backend calls go through `src/api/api.js` so base URL and error handling are in one place.
- **Vite proxy in dev:** In development, the UI runs on port 5173 and proxies `/api` to the backend (e.g. 8080), avoiding CORS issues when both are on localhost. Production may serve the UI from the same origin as the API or use env-based API URL.
- **Channel-agnostic UI:** Conversation list and detail are channel-agnostic; channel is shown as a badge (PULSE, MOENGAGE, INTERCOM, etc.) and raw payload is displayed for power users.
- **Responsive sidebar:** Sidebar can collapse or adapt on smaller screens (exact behavior is implementation-dependent).

## Build and deploy

- **Development:** `npm run dev` — Vite dev server with HMR; proxy to backend.
- **Production build:** `npm run build` — Output to `dist/` (static assets + `index.html`). Can be served by any static host or by the Spring Boot app (e.g. copying `dist/` into `src/main/resources/static/`).
- **Preview build:** `npm run preview` — Serves `dist/` locally to test production bundle.

## Related docs

- [Installation](INSTALLATION.md) — Prerequisites, install, run, env.
- [API integration](API-INTEGRATION.md) — Endpoints used by the UI and how they are called.
