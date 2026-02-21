# Reachout UI — API Integration Documentation

This document describes all APIs integrated in reachout-ui, mapped to the test flow steps (1.3/1.4, 2.8/2.9, 3.1, 4.1, 4.3, 5.3, 6.1–6.3) and the corresponding `api.js` methods.

---

## Base Configuration

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | API origin (e.g. `http://localhost:8080`). Empty = same origin. |

All endpoints are prefixed with `{VITE_API_BASE}/api/v1` (or `/api/v1` when same-origin).

---

## API Summary

| Step | API Method | HTTP | Endpoint | Description |
|------|------------|------|----------|-------------|
| 1.3/1.4 | `getUserDetails(userId)` | GET | `/user-details/{userId}` | Get user profile (KYC, TPV, country, etc.) |
| 2.8/2.9 | `getUserConversations(userId, page, size)` | GET | `/query/users/{userId}/conversations` | Paginated list of conversations |
| 3.1 | `getUserSummary(userId)` | GET | `/query/users/{userId}/summary` | User's aggregated summary |
| 4.1 | `getDimensions()` | GET | `/dimensions` | List all dimensions with sub-categories |
| 4.3 | `getDimensionById(dimensionId)` | GET | `/dimensions/{id}` | Get single dimension with sub-categories |
| 5.3 | `getDimensionMappingsForUser(userId)` | GET | `/categorization/dimensions/{userId}` | Dimension mappings for a user |
| 6.1–6.3 | `getUsersInSubCategory(dimensionId, subCategoryId)` | GET | `/dimensions/{dimId}/subcategories/{subCatId}/users` | Users in a sub-category |

---

## 1. User Details (1.3, 1.4)

**Method:** `api.getUserDetails(userId)`

**Request:**
```
GET /api/v1/user-details/{userId}
```

**Response:** `UserDetailsResponseDto`

```json
{
  "id": "69995b19feb5d471311a2d7f",
  "user_id": "test_user_alpha_001",
  "country": "US",
  "name": "Alpha Tester",
  "signup_date": "2024-06-15T00:00:00Z",
  "last_login_at": "2026-02-20T07:13:29Z",
  "gender": "M",
  "age": 32,
  "email": "alpha@test.com",
  "beneficiaries": 3,
  "kyc_status": "COMPLETED",
  "last_transaction_date": "2026-02-18T07:13:29Z",
  "total_completed_transfers": 15,
  "total_tpv_usd": 25000.0,
  "user_type": "REGULAR",
  "referee_count": 2,
  "created_at": "2026-02-21T07:13:29.395Z",
  "updated_at": "2026-02-21T07:13:29.395Z"
}
```

**Notes:**
- Returns 404 if user not found.
- Use for user profile card, KYC status, TPV, corridor (country), etc.

---

## 2. User Conversations (2.8, 2.9)

**Method:** `api.getUserConversations(userId, page = 0, size = 20)`

**Request:**
```
GET /api/v1/query/users/{userId}/conversations?page=0&size=20&sort=timestamp,DESC
```

**Response:** Spring `Page<ConversationResponseDto>`

```json
{
  "content": [
    {
      "id": "...",
      "user_id": "test_user_alpha_001",
      "conversation_id": "pulse_alpha_001",
      "channel": "PULSE",
      "timestamp": "2026-02-20T07:13:29Z",
      "actual_data": { ... },
      "summarised_data": "...",
      "processing_status": "PROCESSED",
      "processing_error": null
    }
  ],
  "totalElements": 10,
  "totalPages": 1,
  "first": true,
  "last": true,
  "numberOfElements": 10,
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "size": 20,
  "number": 0
}
```

**Notes:**
- Already integrated in Sidebar (conversations list).

---

## 3. User Summary (3.1)

**Method:** `api.getUserSummary(userId)`

**Request:**
```
GET /api/v1/query/users/{userId}/summary
```

**Response:** `UserSummaryResponseDto`

```json
{
  "user_id": "test_user_alpha_001",
  "total_summary": "Customer completed their first transaction...",
  "conversation_count": 10,
  "conversation_count_by_channel": {
    "INTERCOM": 1,
    "MOENGAGE": 6,
    "PULSE": 1,
    "USER_ACTION": 2
  },
  "last_conversation_at": "2026-02-20T07:13:35Z",
  "last_summary_metadata": {
    "llm_model": "claude-sonnet-4-20250514",
    "summarized_at": "2026-02-21T07:13:42.719Z",
    "input_tokens": 278,
    "output_tokens": 121,
    "summarization_version": "1.0"
  },
  "created_at": "2026-02-21T07:13:32.511Z",
  "updated_at": "2026-02-21T07:13:42.770Z"
}
```

**Note:** Use `last_summary_metadata.llm_model` (not `model`) for the LLM model name.

**Notes:**
- Already integrated in UserSummaryView.

---

## 4. Dimensions (4.1, 4.3)

### 4.1 List all dimensions

**Method:** `api.getDimensions()`

**Request:**
```
GET /api/v1/dimensions
```

**Response:** `Array<DimensionResponseDto>`

```json
[
  {
    "id": "69995b06feb5d471311a2d63",
    "name": "behavioral_state",
    "display_name": "Behavioral State",
    "description": "Lifecycle stage based on order history and signup recency",
    "evaluation_order": 1,
    "is_active": true,
    "sub_categories": [
      {
        "id": "69995b06feb5d471311a2d65",
        "dimension_id": "69995b06feb5d471311a2d63",
        "name": "friction_impacted",
        "display_name": "Friction-Impacted",
        "description": "Has ≥1 failed/cancelled order in last 14 days",
        "priority": 1,
        "is_active": true,
        "created_at": "2026-02-21T07:13:10.698Z",
        "updated_at": "2026-02-21T07:13:10.698Z"
      },
      {
        "id": "69995b06feb5d471311a2d69",
        "name": "active",
        "display_name": "Active"
      }
    ],
    "created_at": "...",
    "updated_at": "..."
  }
]
```

**Dimensions and sub-categories (as seeded):**
- `behavioral_state`: friction_impacted, new_user, activated, active, dormant, churned, ghost
- `economic_value`: above_median, below_median, no_data
- `trust_state`: kyc_complete, kyc_pending, kyc_failed, kyc_not_started
- `outreach_fatigue`: over_messaged, moderate, under_messaged, not_reached
- `intent_strength`: high_intent, medium_intent, low_intent

### 4.3 Get single dimension

**Method:** `api.getDimensionById(dimensionId)`

**Request:**
```
GET /api/v1/dimensions/{dimensionId}
```

**Response:** Same shape as a single element in the array above (`DimensionResponseDto`).

---

## 5. Dimension Mappings for a User (5.3)

**Method:** `api.getDimensionMappingsForUser(userId)`

**Request:**
```
GET /api/v1/categorization/dimensions/{userId}
```

**Response:** `Array<UserDimensionMappingResponseDto>`

```json
[
  {
    "id": "69995b36feb5d471311a2d93",
    "user_id": "test_user_alpha_001",
    "dimension_id": "69995b06feb5d471311a2d63",
    "dimension_name": "behavioral_state",
    "sub_category_id": "69995b06feb5d471311a2d69",
    "sub_category_name": "active",
    "reason": "2 successful orders, last 3 days ago",
    "evaluated_at": "2026-02-21T07:13:58.096Z"
  },
  {
    "user_id": "test_user_alpha_001",
    "dimension_name": "trust_state",
    "sub_category_name": "kyc_complete",
    "reason": "KYC status: COMPLETED",
    "evaluated_at": "2026-02-21T07:13:58.118Z"
  }
]
```

**Notes:**
- One mapping per dimension (e.g. 5 dimensions → 5 mappings).
- Use in Summary or profile view to show badges (active, kyc_complete, moderate fatigue, etc.).

---

## 6. Users in Sub-Category (6.1, 6.2, 6.3)

**Method:** `api.getUsersInSubCategory(dimensionId, subCategoryId)`

**Request:**
```
GET /api/v1/dimensions/{dimensionId}/subcategories/{subCategoryId}/users
```

**Response:** `Array<UserDimensionMappingResponseDto>`

```json
[
  {
    "id": "69995b3bfeb5d471311a2da5",
    "user_id": "test_user_alpha_001",
    "dimension_id": "69995b06feb5d471311a2d71",
    "dimension_name": "trust_state",
    "sub_category_id": "69995b06feb5d471311a2d72",
    "sub_category_name": "kyc_complete",
    "reason": "KYC status: COMPLETED",
    "evaluated_at": "2026-02-21T07:14:03.180Z"
  }
]
```

**Typical usage:**
- 6.1: Users in `trust_state` → `kyc_complete`
- 6.2: Users in `behavioral_state` → `churned`
- 6.3: Users in `behavioral_state` → `active`

**Notes:**
- Use in a Dimensions view: pick dimension → sub-category → list users.
- Clicking a user_id can navigate to Summary or Conversations.

---

## Additional APIs (already integrated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getConversationDetail(userId, conversationId)` | `GET /query/users/{userId}/conversations/{conversationId}` | Single conversation detail |
| `executeNLQuery(query)` | `POST /query/natural-language` | Natural language → MongoDB query → results |
| `getCategories()` | `GET /categories` | List LLM-based categories |
| `createCategory(title, definition)` | `POST /categories` | Create category |
| `updateCategory(id, title, definition)` | `PUT /categories/{id}` | Update category |
| `deleteCategory(id)` | `DELETE /categories/{id}` | Soft-delete category |
| `getUsersInCategory(categoryId)` | `GET /categorization/categories/{categoryId}/users` | Users in LLM category |
| `getCategoriesForUser(userId)` | `GET /categorization/users/{userId}` | Categories for a user |
| `triggerCategorizationAll()` | `POST /categorization/trigger` | Trigger LLM categorization for all users |
| `triggerCategorizationUser(userId)` | `POST /categorization/trigger/{userId}` | Trigger for single user |

---

## Error Handling

All API methods use `api.request()`, which:
- Throws `Error` when `res.ok` is false
- Extracts message from `body.message` or `body.error` (APIs may return either)
- Expects JSON error body: `{ "message": "...", "error": "...", "status": 400 }`

Example:
```javascript
try {
  const details = await api.getUserDetails(userId);
  // ...
} catch (e) {
  console.error(e.message);  // e.g. "User not found"
}
```

---

## Suggested UI Integration Points

| API | Suggested UI |
|-----|--------------|
| `getUserDetails` | User profile card in Summary view, Header, or user detail page |
| `getDimensions` | Dimensions view sidebar (list dimensions + sub-categories) |
| `getDimensionById` | Dimensions view (optional; list response often enough) |
| `getDimensionMappingsForUser` | Summary view or user profile (badges: active, kyc_complete, etc.) |
| `getUsersInSubCategory` | Dimensions view main panel (users in selected sub-category) |
