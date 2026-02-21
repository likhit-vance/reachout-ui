# API Integration Status — Reachout UI

All backend APIs are listed below. For each we indicate:
- **In api.js** — method exists in `src/api/api.js`
- **Used in UI** — at least one component calls it (and that view is reachable)
- **Not used** — either not in api.js, or in api.js but never called, or only used in a view that is not in the app navigation

---

## Summary table

| Backend API | Method (api.js) | In api.js | Used in UI | Notes |
|-------------|-----------------|-----------|------------|--------|
| **User Details** |
| GET /api/v1/user-details/{userId} | `getUserDetails(userId)` | ✅ | ✅ | UserDetailsDashboard |
| GET /api/v1/user-details/by-email?email= | — | ❌ | ❌ | Not in api.js |
| POST /api/v1/user-details | — | ❌ | ❌ | Ingestion; not in api.js |
| POST /api/v1/user-details/batch | — | ❌ | ❌ | Ingestion; not in api.js |
| **Query (conversations & summary)** |
| GET /api/v1/query/users/{userId}/conversations | `getUserConversations(userId, page, size)` | ✅ | ✅ | UserDetailsDashboard |
| GET /api/v1/query/users/{userId}/conversations/by-channel | — | ❌ | ❌ | Not in api.js |
| GET /api/v1/query/users/{userId}/conversations/{conversationId} | `getConversationDetail(userId, conversationId)` | ✅ | ✅ | ConversationDetail (from dashboard) |
| GET /api/v1/query/users/{userId}/summary | `getUserSummary(userId)` | ✅ | ✅ | UserDetailsDashboard |
| POST /api/v1/query/natural-language | `executeNLQuery(query)` | ✅ | ✅ | NLQueryView |
| **Dimensions** |
| GET /api/v1/dimensions | `getDimensions()` | ✅ | ❌ | **Not used** — no Dimensions UI yet |
| GET /api/v1/dimensions/{id} | `getDimensionById(dimensionId)` | ✅ | ❌ | **Not used** |
| GET /api/v1/dimensions/{dimId}/subcategories/{subCatId}/users | `getUsersInSubCategory(dimensionId, subCategoryId)` | ✅ | ❌ | **Not used** |
| **Categorization (dimension mappings)** |
| GET /api/v1/categorization/dimensions/{userId} | `getDimensionMappingsForUser(userId)` | ✅ | ✅ | UserDetailsDashboard (badges) |
| **Categories (LLM categories)** |
| GET /api/v1/categories | `getCategories()` | ✅ | ⚠️ | In CategoriesView only — **Categories view not in app nav** |
| GET /api/v1/categories/{id} | — | ❌ | ❌ | Not in api.js |
| POST /api/v1/categories | `createCategory(title, definition)` | ✅ | ⚠️ | CategoriesView — **view not in nav** |
| PUT /api/v1/categories/{id} | `updateCategory(id, title, definition)` | ✅ | ⚠️ | CategoriesView — **view not in nav** |
| DELETE /api/v1/categories/{id} | `deleteCategory(id)` | ✅ | ⚠️ | CategoriesView — **view not in nav** |
| GET /api/v1/categorization/categories/{categoryId}/users | `getUsersInCategory(categoryId)` | ✅ | ⚠️ | CategoriesView — **view not in nav** |
| GET /api/v1/categorization/users/{userId} | `getCategoriesForUser(userId)` | ✅ | ❌ | **Not used** in any component |
| POST /api/v1/categorization/trigger | `triggerCategorizationAll()` | ✅ | ⚠️ | CategoriesView — **view not in nav** |
| POST /api/v1/categorization/trigger/{userId} | `triggerCategorizationUser(userId)` | ✅ | ❌ | **Not used** in any component |
| POST /api/v1/categorization/trigger/batch | — | ❌ | ❌ | Not in api.js |
| POST /api/v1/categorization/evaluate | — | ❌ | ❌ | Not in api.js |
| POST /api/v1/categorization/evaluate/{userId} | — | ❌ | ❌ | Not in api.js |
| POST /api/v1/categorization/evaluate/batch | — | ❌ | ❌ | Not in api.js |
| **Summarization** |
| POST /api/v1/summarization/trigger | — | ❌ | ❌ | Not in api.js |
| POST /api/v1/summarization/trigger/{userId} | — | ❌ | ❌ | Not in api.js |
| POST /api/v1/summarization/trigger/batch | — | ❌ | ❌ | Not in api.js |
| **Ingestion** |
| POST /api/v1/ingestion/conversation | — | ❌ | ❌ | Not in api.js |
| POST /api/v1/ingestion/batch | — | ❌ | ❌ | Not in api.js |

---

## Legend

- **✅ Used in UI** — Method exists in api.js and is called from a view that is reachable (Users dashboard, NL Query, or conversation detail).
- **❌ Not used** — Either not in api.js, or in api.js but no component calls it, or only used in a view that is not mounted (e.g. Dimensions “coming soon”, Categories not in nav).
- **⚠️ In code but view not in nav** — Method is in api.js and used in a component (e.g. CategoriesView), but that component is never rendered in `App.jsx` (no sidebar item or route for “Categories”).

---

## Where each API is used (when used)

| api.js method | Used in |
|---------------|--------|
| `getUserDetails` | UserDetailsDashboard |
| `getUserConversations` | UserDetailsDashboard (list + load more) |
| `getConversationDetail` | ConversationDetail (modal from dashboard) |
| `getUserSummary` | UserDetailsDashboard |
| `getDimensionMappingsForUser` | UserDetailsDashboard (dimension badges) |
| `executeNLQuery` | NLQueryView |
| `getCategories` | CategoriesView (view not in nav) |
| `createCategory` | CategoriesView (view not in nav) |
| `updateCategory` | CategoriesView (view not in nav) |
| `deleteCategory` | CategoriesView (view not in nav) |
| `getUsersInCategory` | CategoriesView (view not in nav) |
| `triggerCategorizationAll` | CategoriesView (view not in nav) |

---

## APIs in api.js but not used anywhere in the UI

- `getDimensions()` — no Dimensions view yet (sidebar shows “Dimensions — coming soon”).
- `getDimensionById(dimensionId)` — no caller.
- `getUsersInSubCategory(dimensionId, subCategoryId)` — no caller.
- `getCategoriesForUser(userId)` — no caller.
- `triggerCategorizationUser(userId)` — no caller.

---

## Backend APIs not in api.js

- GET /api/v1/user-details/by-email?email=
- GET /api/v1/categories/{id}
- POST /api/v1/user-details
- POST /api/v1/user-details/batch
- GET /api/v1/query/users/{userId}/conversations/by-channel?channel=
- POST /api/v1/categorization/trigger/batch
- POST /api/v1/categorization/evaluate
- POST /api/v1/categorization/evaluate/{userId}
- POST /api/v1/categorization/evaluate/batch
- POST /api/v1/summarization/trigger
- POST /api/v1/summarization/trigger/{userId}
- POST /api/v1/summarization/trigger/batch
- POST /api/v1/ingestion/conversation
- POST /api/v1/ingestion/batch

---

## Suggested next steps

1. **Dimensions** — Wire “Dimensions” sidebar to a view that uses `getDimensions()`, `getDimensionById()`, and `getUsersInSubCategory()` (e.g. list dimensions → sub-categories → users in sub-category).
2. **Categories** — Either add a “Categories” item to the sidebar and render `CategoriesView` in `App.jsx`, or remove/unify with another view.
3. **Optional** — Add `getCategoriesForUser(userId)` and `triggerCategorizationUser(userId)` to the user dashboard if you want per-user category triggers and category list.
4. **Optional** — Add to api.js: user-details by-email, getCategoryById, conversations by-channel, categorization trigger/batch and evaluate endpoints, summarization trigger endpoints, ingestion endpoints, if the UI will use them.
