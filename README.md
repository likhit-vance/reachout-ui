# Reachout UI

**Frontend for the Aspora Reachout Platform** — a single, living view of every customer interaction across channels (Pulse, MoEngage, Intercom, and more).

## Purpose

This UI lets growth, ops, product research, and support teams:

- **Look up any user** by ID and see all their conversations, summaries, and profile data in one place.
- **Browse conversations** by channel with pagination, full detail, and LLM summaries.
- **View user summary** — the aggregated total summary across all interactions.
- **Run natural-language queries** against the platform data (e.g. “Find all PULSE conversations for user X”).
- **Explore dimensions and categories** for segmentation and filters.
- **View and search user details** (demographics, KYC, activity) ingested via the backend.

## Quick links

| Document | Description |
|----------|-------------|
| [Installation](docs/INSTALLATION.md) | Prerequisites, install, run, and environment |
| [Tech architecture](docs/TECH-ARCHITECTURE.md) | Stack, project structure, and data flow |
| [API integration](docs/API-INTEGRATION.md) | How the UI calls the backend API |

## Tech stack (at a glance)

- **React 18** (JSX)
- **Vite** (dev server and build)
- **CSS** (no UI framework; custom components)
- Backend: **Spring Boot** API at `http://localhost:8080` (see [API integration](docs/API-INTEGRATION.md))

## Quick start

1. **Prerequisites:** Node.js 18+, npm (or compatible). Backend running on port 8080 (see main platform repo).
2. **Install:** `npm install`
3. **Run:** `npm run dev` — app at `http://localhost:5173`
4. Enter a **User ID** in the header and click **Load Data** to load conversations, summary, and user details.

See [Installation](docs/INSTALLATION.md) for full steps, env vars, and troubleshooting.

## Project structure (high level)

```
reachout-ui/
├── README.md                 # This file — project overview
├── docs/
│   ├── INSTALLATION.md       # Setup and run
│   ├── TECH-ARCHITECTURE.md  # Architecture and stack
│   └── API-INTEGRATION.md    # Backend API usage
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/                  # API client
│   ├── components/           # Layout, conversations, summary, NL query, dimensions, user
│   └── utils/
└── public/
```

## Relationship to the main platform

- **UserReachoutPlatform** (parent repo): Spring Boot backend, MongoDB, SQS ingestion, LLM summarization, REST API.
- **reachout-ui** (this repo): Standalone React + Vite frontend; consumed as a **git submodule** in the main repo. In development, the UI runs on port 5173 and talks to the API on port 8080 (CORS is configured on the backend for `localhost:*`).

## License and ownership

Same as the Aspora Reachout Platform. See the main repository for license and contribution guidelines.
