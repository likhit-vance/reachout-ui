const API_BASE = (import.meta.env.VITE_API_BASE || '') + '/api/v1/query';
const API_ORIGIN = (import.meta.env.VITE_API_BASE || '');

export const api = {
  async request(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `HTTP ${res.status}: ${body.error || 'Request failed'}`);
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
