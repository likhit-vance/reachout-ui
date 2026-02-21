# Dimensions vs Categories — Relationship & How They Differ

This doc summarizes the relationship between **Dimensions** and **Categories** using the backend (`service/categorization`), `scripts/test_full_flow.py`, and the request/response log (`ReqRespLogs.txt`).

---

## TL;DR

| | **Dimensions** | **Categories** |
|---|----------------|----------------|
| **What** | Fixed, rule-based taxonomy (5 dimensions, each with sub-categories) | User-defined, LLM-based labels (title + definition) |
| **How assigned** | Rules over user_details + conversations (no LLM) | LLM reads user summary + category definition → yes/no per category |
| **Storage** | `dimensions`, `sub_categories`, `user_dimension_mappings` | `categories`, `user_category_mappings` |
| **In test_full_flow.py** | ✅ **Yes** — Phases 4, 5, 6 | ❌ **No** — not exercised |
| **In ReqRespLogs.txt** | ✅ GET /dimensions, /categorization/dimensions/{userId}, /dimensions/…/subcategories/…/users, POST /categorization/evaluate | ❌ No category APIs |

---

## 1. Dimensions (rule-based, two-level)

- **Definition:** A **dimension** is a top-level axis (e.g. “Behavioral State”, “Trust State”). Each dimension has a fixed set of **sub-categories** (e.g. `active`, `churned`, `kyc_complete`).
- **Seeded on startup:** 5 dimensions and their sub-categories are created by `DimensionDataInitializer` (idempotent). Not created via API.
- **Evaluation:** **Deterministic rules** over `UserMetrics` (from user_details + conversations). Implemented by `DimensionEvaluator` implementations (e.g. `BehavioralStateEvaluator`, `TrustStateEvaluator`). No LLM.
- **Result:** One sub-category per dimension per user → stored in `user_dimension_mappings`.

**APIs (all appear in test + ReqRespLogs):**

- `GET /api/v1/dimensions` — list dimensions + sub-categories (Phase 4.1)
- `GET /api/v1/dimensions/{id}` — single dimension (Phase 4.3)
- `GET /api/v1/categorization/dimensions/{userId}` — user’s dimension mappings (Phase 5.3, 5.5)
- `POST /api/v1/categorization/evaluate`, `.../evaluate/{userId}`, `.../evaluate/batch` — trigger dimension evaluation (Phase 5.1, 5.2, 5.7, 5.9)
- `GET /api/v1/dimensions/{dimId}/subcategories/{subCatId}/users` — users in a sub-category (Phase 6.1–6.6)

**From ReqRespLogs:** User A gets e.g. `behavioral_state → active`, `trust_state → kyc_complete`, `outreach_fatigue → moderate`. User B gets e.g. `trust_state → kyc_pending`, `outreach_fatigue → not_reached`. (One test expectation fails: User B is “activated” not “churned” in that run.)

---

## 2. Categories (LLM-based, flat)

- **Definition:** A **category** is a label defined by **title** + **definition** (e.g. “High Value User”, “Users with TPV > $10k”). Users are assigned by an **LLM** that reads the user summary and the definition.
- **Created via API:** CRUD on `categories` (create/update/delete). No seeding in the test script.
- **Evaluation:** **CategorizationService** loads user summary + active categories, calls LLM, parses which categories apply, saves `UserCategoryMapping`. Can be triggered per user, per batch, or for all.
- **Result:** A user can be in zero, one, or many categories. Stored in `user_category_mappings`.

**APIs (none of these are in test_full_flow.py or ReqRespLogs):**

- `GET /api/v1/categories` — list categories
- `GET /api/v1/categories/{id}` — get one category
- `POST /api/v1/categories` — create category (title + definition)
- `PUT /api/v1/categories/{id}` — update category
- `DELETE /api/v1/categories/{id}` — soft-delete category
- `GET /api/v1/categorization/users/{userId}` — categories for a user
- `GET /api/v1/categorization/categories/{categoryId}/users` — users in a category
- `POST /api/v1/categorization/trigger`, `.../trigger/{userId}`, `.../trigger/batch` — trigger LLM categorization

---

## 3. How they relate (and how they don’t)

- **Same controller namespace:** Both live under “categorization” in the API (`CategorizationController` + `DimensionController`), but they are **separate systems**.
- **Dimensions:** Fixed schema (dimension → sub-categories), rule-based, one sub-category per dimension per user. Good for lifecycle, KYC, fatigue, value, intent.
- **Categories:** Flexible schema (arbitrary title + definition), LLM-based, many-to-many user–category. Good for ad-hoc segments like “At-Risk” or “High Value” defined in natural language.
- **Data flow:**  
  - **Dimensions:** user_details + conversations → `UserMetrics` → evaluators → `user_dimension_mappings`.  
  - **Categories:** user summaries + category definitions → LLM → `user_category_mappings`.
- **test_full_flow.py** only covers the dimension path (Phases 4–6). ReqRespLogs.txt matches that: only dimension and evaluate endpoints, no category or trigger (LLM) endpoints.

---

## 4. Mapping to the test script and log

| Phase / Step | What it does | Dimensions vs Categories |
|--------------|--------------|---------------------------|
| Phase 4 | Verify 5 dimensions and sub-categories are seeded | **Dimensions** only |
| Phase 5 | Trigger evaluate (single + batch + all), then GET dimension mappings for User A/B | **Dimensions** only (evaluate = dimension rules) |
| Phase 6 | Query users in a given dimension + sub-category (e.g. kyc_complete, active, churned) | **Dimensions** only |
| Categories | Create/update/delete categories, trigger LLM categorization, list users in a category | **Not** in the script or in ReqRespLogs |

So in **test_full_flow.py** and **ReqRespLogs.txt**, everything under “categorization” that you see is **dimension** evaluation and dimension/sub-category queries. **Categories** (LLM-based) are a separate feature and are not exercised there.
