const API_BASE = (import.meta.env.VITE_API_BASE || '') + '/api/v1/query';
const API_ORIGIN = (import.meta.env.VITE_API_BASE || '');

export const api = {
  async request(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const errMsg = body.message || body.error || `HTTP ${res.status}: Request failed`;
      throw new Error(errMsg);
    }
    return res.json();
  },

  getUserConversations(userId, page = 0, size = 20) {
    return this.request(`${API_BASE}/users/${encodeURIComponent(userId)}/conversations?page=${page}&size=${size}&sort=timestamp,DESC`);
  },

  getConversationDetail(userId, conversationId) {
    return this.request(`${API_BASE}/users/${encodeURIComponent(userId)}/conversations/${encodeURIComponent(conversationId)}`);
  },

  getUserSummary(userId) {
    return this.request(`${API_BASE}/users/${encodeURIComponent(userId)}/summary`);
  },

  // ── User Details (1.3, 1.4) ──────────────────────────────────────────────

  getUserDetails(userId) {
    return this.request(`${API_ORIGIN}/api/v1/user-details/${encodeURIComponent(userId)}`);
  },

  // ── Dimensions (4.1, 4.3, 6.1–6.3) ───────────────────────────────────────

  getDimensions() {
    return this.request(`${API_ORIGIN}/api/v1/dimensions`);
  },

  getDimensionById(dimensionId) {
    return this.request(`${API_ORIGIN}/api/v1/dimensions/${encodeURIComponent(dimensionId)}`);
  },

  getUsersInSubCategory(dimensionId, subCategoryId) {
    return this.request(
      `${API_ORIGIN}/api/v1/dimensions/${encodeURIComponent(dimensionId)}/subcategories/${encodeURIComponent(subCategoryId)}/users`
    );
  },

  // ── Dimension mappings for a user (5.3) ───────────────────────────────────

  getDimensionMappingsForUser(userId) {
    return this.request(`${API_ORIGIN}/api/v1/categorization/dimensions/${encodeURIComponent(userId)}`);
  },

  // ── Natural Language Query ────────────────────────────────────────────────

  executeNLQuery(query) {
    return this.request(`${API_BASE}/natural-language`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
  },

  getCategories() {
    return this.request(`${API_ORIGIN}/api/v1/categories`);
  },

  createCategory(title, definition) {
    return this.request(`${API_ORIGIN}/api/v1/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, definition }),
    });
  },

  updateCategory(id, title, definition) {
    return this.request(`${API_ORIGIN}/api/v1/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, definition }),
    });
  },

  deleteCategory(id) {
    return this.request(`${API_ORIGIN}/api/v1/categories/${id}`, { method: 'DELETE' });
  },

  getUsersInCategory(categoryId) {
    return this.request(`${API_ORIGIN}/api/v1/categorization/categories/${encodeURIComponent(categoryId)}/users`);
  },

  getCategoriesForUser(userId) {
    return this.request(`${API_ORIGIN}/api/v1/categorization/users/${encodeURIComponent(userId)}`);
  },

  triggerCategorizationAll() {
    return this.request(`${API_ORIGIN}/api/v1/categorization/trigger`, { method: 'POST' });
  },

  triggerCategorizationUser(userId) {
    return this.request(`${API_ORIGIN}/api/v1/categorization/trigger/${encodeURIComponent(userId)}`, { method: 'POST' });
  },
};
