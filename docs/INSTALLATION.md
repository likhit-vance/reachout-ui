# Installation — Reachout UI

This document covers prerequisites, install, run, and environment for the Reachout UI.

## Prerequisites

- **Node.js** 18 or higher (LTS recommended).
- **npm** (comes with Node) or a compatible package manager (e.g. pnpm, yarn).
- **Backend API** running and reachable (see [Backend](#backend) below). Default: `http://localhost:8080`.

## Install

From the `reachout-ui` directory (root of this repo):

```bash
npm install
```

This installs dependencies from `package.json` (React, Vite, etc.). No global installs are required.

## Run (development)

```bash
npm run dev
```

- Vite dev server starts (default: **http://localhost:5173**).
- Hot Module Replacement (HMR) is enabled; changes in `src/` reload in the browser.
- To avoid CORS issues, configure Vite to proxy API requests to the backend (see [Proxy](#proxy) below).

## Backend

The UI expects the **Aspora Reachout Platform** API to be running. Typical local setup:

1. From the **main platform repo** (UserReachoutPlatform):
   - Start infrastructure: `docker-compose up -d` (MongoDB, LocalStack if needed).
   - Set `ANTHROPIC_API_KEY` if you use LLM summarization.
   - Run: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`
2. Backend listens on **http://localhost:8080**; API base path is `/api/v1`.

If the backend runs on another host/port, set the UI’s API base URL via env or proxy (see below).

## Environment and API base URL

- **Development:** Prefer using a **Vite proxy** so the UI (e.g. 5173) can call `/api` on the same origin; Vite forwards `/api` to `http://localhost:8080`. No CORS issues.
- **Alternative:** Use an env variable (e.g. `VITE_API_BASE` or `VITE_API_URL`) and set it in `.env.development` to `http://localhost:8080`. The API client in `src/api/api.js` should use this for the base URL. Backend must allow CORS from `http://localhost:5173` (the main platform’s `CorsConfig` allows `localhost:*`).
- **Production:** Set the same env (e.g. `VITE_API_BASE`) at build time, or deploy the UI under the same origin as the API so relative `/api` works.

Example `.env.development` (if not using proxy):

```bash
VITE_API_BASE=http://localhost:8080
```

Example `.env.production`:

```bash
VITE_API_BASE=https://your-api.example.com
```

## Proxy (recommended for dev)

In `vite.config.js`, add a proxy so `/api` is forwarded to the backend:

```js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

Then in `src/api/api.js` use a **relative** base URL (e.g. `/api/v1`) so that in dev all requests go to the Vite server and are proxied to the backend.

## Build (production)

```bash
npm run build
```

- Output is in **`dist/`**: `index.html` plus hashed JS/CSS assets.
- Serve `dist/` with any static file server, or copy into the main platform’s `src/main/resources/static/` and serve from Spring Boot at `/`.

## Preview production build

```bash
npm run preview
```

Serves the `dist/` folder locally so you can test the production build. Configure proxy or API base URL as needed for this mode.

## Troubleshooting

| Issue | Check |
|-------|--------|
| Blank page / white screen | Open dev tools (F12) → Console and Network. Look for 404s (e.g. wrong base path) or CORS errors. |
| CORS errors when calling API | Use the Vite proxy for `/api` in dev, or ensure backend allows your UI origin (e.g. `http://localhost:5173`). |
| “Connection refused” or network errors | Ensure the backend is running on the expected host/port (default 8080). Try `curl http://localhost:8080/api/v1/query/users/test_id/summary`. |
| `npm install` fails | Use Node 18+; delete `node_modules` and `package-lock.json` and run `npm install` again. |
| Port 5173 in use | Change port in `vite.config.js` under `server.port`, or set `PORT` if your setup supports it. |

## Summary of commands

| Command | Description |
|--------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (default http://localhost:5173) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | Run ESLint (if configured) |
