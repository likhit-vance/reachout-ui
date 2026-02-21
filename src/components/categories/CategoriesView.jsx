import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';
import { Loading } from '../common/Loading';
import { ErrorBox } from '../common/ErrorBox';
import { formatTimestamp } from '../../utils/format';

export function CategoriesView({ onUserClick }) {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [catUsers, setCatUsers] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDef, setNewDef] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDef, setEditDef] = useState('');

  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState(null);

  const loadCategories = useCallback(() => {
    setLoadingCats(true);
    setError(null);
    api
      .getCategories()
      .then((data) => setCategories(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingCats(false));
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const loadCategoryUsers = useCallback((catId) => {
    setLoadingUsers(true);
    api
      .getUsersInCategory(catId)
      .then((data) => setCatUsers(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingUsers(false));
  }, []);

  const selectCategory = (cat) => {
    setSelectedCatId(cat.id);
    setEditingId(null);
    loadCategoryUsers(cat.id);
  };

  const handleCreate = () => {
    if (!newTitle.trim() || !newDef.trim()) return;
    setCreating(true);
    setError(null);
    api
      .createCategory(newTitle.trim(), newDef.trim())
      .then(() => {
        setNewTitle('');
        setNewDef('');
        setShowCreate(false);
        loadCategories();
      })
      .catch((e) => setError(e.message))
      .finally(() => setCreating(false));
  };

  const handleUpdate = (id) => {
    if (!editTitle.trim() || !editDef.trim()) return;
    api
      .updateCategory(id, editTitle.trim(), editDef.trim())
      .then(() => {
        setEditingId(null);
        loadCategories();
        if (selectedCatId === id) loadCategoryUsers(id);
      })
      .catch((e) => setError(e.message));
  };

  const handleDelete = (id, evt) => {
    evt.stopPropagation();
    if (!confirm('Deactivate this category?')) return;
    api
      .deleteCategory(id)
      .then(() => {
        if (selectedCatId === id) {
          setSelectedCatId(null);
          setCatUsers([]);
        }
        loadCategories();
      })
      .catch((err) => setError(err.message));
  };

  const startEdit = (cat, evt) => {
    evt.stopPropagation();
    setEditingId(cat.id);
    setEditTitle(cat.title);
    setEditDef(cat.definition);
  };

  const handleTriggerAll = () => {
    setTriggering(true);
    setTriggerMsg(null);
    api
      .triggerCategorizationAll()
      .then(() => setTriggerMsg('Categorization triggered for all users. This runs in the background.'))
      .catch((e) => setError(e.message))
      .finally(() => setTriggering(false));
  };

  const confidenceClass = (c) => {
    if (c >= 0.7) return 'confidence-high';
    if (c >= 0.4) return 'confidence-medium';
    return 'confidence-low';
  };

  const selectedCat = categories.find((c) => c.id === selectedCatId);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div
        style={{
          width: 320,
          minWidth: 320,
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>Categories</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className="trigger-btn"
              onClick={handleTriggerAll}
              disabled={triggering}
              title="Re-categorize all users"
              style={{ padding: '4px 10px', fontSize: 11 }}
            >
              {triggering ? '...' : '⟳ Categorize All'}
            </button>
            <button
              className="cat-create-btn"
              onClick={() => setShowCreate(!showCreate)}
              style={{ padding: '4px 12px', fontSize: 18, lineHeight: 1 }}
            >
              +
            </button>
          </div>
        </div>

        {triggerMsg && (
          <div
            style={{
              padding: '8px 16px',
              fontSize: 12,
              color: '#059669',
              background: '#ecfdf5',
              borderBottom: '1px solid #d1fae5',
            }}
          >
            {triggerMsg}
          </div>
        )}
        <ErrorBox message={error} />

        <div style={{ padding: '12px 16px', overflowY: 'auto', flex: 1 }}>
          {showCreate && (
            <div className="cat-create-form">
              <input
                type="text"
                placeholder="Category title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea
                placeholder="Category definition (used by LLM to match users)"
                value={newDef}
                onChange={(e) => setNewDef(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="cat-create-btn"
                  onClick={handleCreate}
                  disabled={creating || !newTitle.trim() || !newDef.trim()}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  className="cat-create-btn"
                  style={{ background: '#666' }}
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loadingCats && <Loading text="Loading categories..." />}

          <div className="cat-list">
            {categories.map((cat) => (
              <div key={cat.id}>
                {editingId === cat.id ? (
                  <div className="cat-edit-form">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea value={editDef} onChange={(e) => setEditDef(e.target.value)} />
                    <div className="cat-edit-actions">
                      <button className="save-btn" onClick={() => handleUpdate(cat.id)}>
                        Save
                      </button>
                      <button className="cancel-btn" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`cat-card${selectedCatId === cat.id ? ' selected' : ''}`}
                    onClick={() => selectCategory(cat)}
                  >
                    <div className="cat-card-title">
                      <span>{cat.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button
                          className="cat-delete-btn"
                          onClick={(e) => startEdit(cat, e)}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          className="cat-delete-btn"
                          onClick={(e) => handleDelete(cat.id, e)}
                          title="Deactivate"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="cat-card-def">{cat.definition}</div>
                  </div>
                )}
              </div>
            ))}
            {!loadingCats && categories.length === 0 && (
              <div style={{ padding: 20, color: '#999', fontSize: 13, textAlign: 'center' }}>
                No categories yet. Click + to create one.
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {!selectedCatId && (
          <div className="empty-state">Select a category to view assigned users</div>
        )}
        {selectedCatId && selectedCat && (
          <div>
            <div className="card">
              <h2>{selectedCat.title}</h2>
              <div className="summary-text" style={{ borderLeftColor: '#7c3aed' }}>
                {selectedCat.definition}
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="cat-count-badge">
                  {catUsers.length} user{catUsers.length !== 1 ? 's' : ''}
                </span>
                <button
                  className="trigger-btn"
                  onClick={() => loadCategoryUsers(selectedCatId)}
                  style={{ padding: '4px 12px', fontSize: 12 }}
                >
                  ⟳ Refresh
                </button>
              </div>
            </div>

            <div className="card">
              <h2>Users in this Category</h2>
              {loadingUsers && <Loading text="Loading users..." />}
              {!loadingUsers && catUsers.length === 0 && (
                <p style={{ color: '#999', fontStyle: 'italic', padding: '12px 0' }}>
                  No users assigned to this category yet. Trigger categorization to assign users.
                </p>
              )}
              {!loadingUsers && catUsers.length > 0 && (
                <div className="results-table-wrap" style={{ maxHeight: 'none' }}>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Confidence</th>
                        <th>Reason</th>
                        <th>Assigned At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catUsers.map((mapping, i) => (
                        <tr
                          key={mapping.id || i}
                          style={{ cursor: 'pointer' }}
                          onClick={() => onUserClick && onUserClick(mapping.user_id)}
                        >
                          <td style={{ fontWeight: 600, color: '#4361ee' }}>{mapping.user_id}</td>
                          <td>
                            <span
                              className={`cat-user-confidence ${confidenceClass(mapping.confidence)}`}
                            >
                              {(mapping.confidence * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'normal', maxWidth: 400 }}>{mapping.reason}</td>
                          <td>{formatTimestamp(mapping.assigned_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
