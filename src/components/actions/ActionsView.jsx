import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';
import { Loading } from '../common/Loading';
import { ErrorBox } from '../common/ErrorBox';
import { formatDateShort, getEngagementTier, getEngagementTierLabel } from '../../utils/format';
import { arrayToCSV, downloadCSV } from '../../utils/csv';

const PAGE_SIZE = 20;

/** Priority 1–4 = High, 5–8 = Medium, 9–12 = Low (max priority in seed is 12) */
const PRIORITY_GROUPS = [
  {
    key: 'high',
    label: 'High',
    min: 1,
    max: 4,
    copy: 'Immediate or stop actions — trust/fatigue severe, high-value dormant.',
  },
  {
    key: 'medium',
    label: 'Medium',
    min: 5,
    max: 8,
    copy: 'Review and monitor — dormant soft trust, at-risk, repeat active.',
  },
  {
    key: 'low',
    label: 'Low',
    min: 9,
    max: 12,
    copy: 'Reactivation and onboarding — first-time, new, fallback monitor.',
  },
];

function getPriorityGroup(priority) {
  if (priority == null) return 'medium';
  const p = Number(priority);
  const g = PRIORITY_GROUPS.find((gr) => p >= gr.min && p <= gr.max);
  return g ? g.key : 'medium';
}

export function ActionsView({ onSelectUser }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [usersPage, setUsersPage] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getActions()
      .then((data) => setActions(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message || 'Unable to load actions. Please try again.'))
      .finally(() => setLoading(false));
  }, [retryTrigger]);

  useEffect(() => {
    if (!selectedAction) {
      setUsersPage(null);
      setUsersError(null);
      setUsersLoading(false);
      setPage(0);
      return;
    }
    setUsersLoading(true);
    setUsersError(null);
    api
      .getActionUsers(selectedAction.action_name, page, PAGE_SIZE)
      .then((data) => {
        setUsersPage({
          content: data.content || [],
          page: data.page ?? 0,
          size: data.size ?? PAGE_SIZE,
          total_elements: data.total_elements ?? 0,
          total_pages: data.total_pages ?? 0,
        });
      })
      .catch((e) => setUsersError(e.message || 'Failed to load users'))
      .finally(() => setUsersLoading(false));
  }, [selectedAction, page]);

  const handleSelectCategory = useCallback((groupKey) => {
    setSelectedCategory((current) => (current === groupKey ? null : groupKey));
    setSelectedAction(null);
  }, []);

  const handleSelectAction = useCallback((action) => {
    setSelectedAction(action);
    setPage(0);
  }, []);

  const totalPages = usersPage?.total_pages ?? 0;
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  const handleExportCSV = useCallback(() => {
    if (!usersPage?.content?.length || !selectedAction) return;
    const columns = [
      { key: 'user_id', label: 'User ID' },
      { key: 'engagement_score', label: 'Engagement' },
      { key: 'reason', label: 'Reason' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'country', label: 'Country' },
      { key: 'trust_state', label: 'Trust state' },
      { key: 'fatigue_state', label: 'Fatigue state' },
      { key: 'lifecycle_state', label: 'Lifecycle state' },
      { key: 'high_value_tag', label: 'High value tag' },
      { key: 'evaluated_at', label: 'Evaluated' },
    ];
    const rows = usersPage.content.map((row) => ({
      user_id: row.user_id ?? '',
      engagement_score: row.engagement_score ?? '',
      reason: row.reason ?? '',
      name: row.name ?? '',
      email: row.email ?? '',
      phone: row.phone ?? '',
      country: row.country ?? '',
      trust_state: row.dimension_snapshot?.trust_state ?? '',
      fatigue_state: row.dimension_snapshot?.fatigue_state ?? '',
      lifecycle_state: row.dimension_snapshot?.lifecycle_state ?? '',
      high_value_tag: row.dimension_snapshot?.high_value_tag ?? '',
      evaluated_at: row.evaluated_at ? formatDateShort(row.evaluated_at) : '',
    }));
    const csv = arrayToCSV(rows, columns);
    const safeName = (selectedAction.action_name || 'action').replace(/[^a-z0-9_-]/gi, '_');
    downloadCSV(csv, `action-${safeName}-users-${Date.now()}.csv`);
  }, [usersPage, selectedAction]);

  if (loading) {
    return (
      <div className="actions-view actions-view--loading">
        <Loading text="Loading actions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="actions-view">
        <div className="actions-error-wrap">
          <ErrorBox message={error} />
          <p className="actions-error-hint">
            The actions endpoint may not be available yet. Ensure the backend is running and
            the actions API is configured.
          </p>
          <button
            type="button"
            className="actions-retry-btn"
            onClick={() => setRetryTrigger((t) => t + 1)}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const groupActionsFor = (groupKey) =>
    (actions || [])
      .filter((a) => (a.user_count ?? 0) > 0 && getPriorityGroup(a.priority) === groupKey)
      .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  return (
    <div className="actions-view">
      <div className="actions-layout-h">
        <header className="actions-header">
          <h2 className="actions-header-title">Outreach actions</h2>
          <p className="actions-header-desc">
            Recommended actions based on dimension evaluation. Pick a category, then an action to see users.
          </p>
        </header>

        <div className="actions-category-row">
          {PRIORITY_GROUPS.map((group) => {
            const groupActions = groupActionsFor(group.key);
            const isEmpty = groupActions.length === 0;
            const isSelected = selectedCategory === group.key;
            return (
              <button
                key={group.key}
                type="button"
                className={`actions-category-card actions-category-card--${group.key} ${isSelected ? 'selected' : ''} ${isEmpty ? 'disabled' : ''}`}
                onClick={() => !isEmpty && handleSelectCategory(group.key)}
                disabled={isEmpty}
              >
                <span className="actions-category-label">{group.label}</span>
                <span className="actions-category-copy">{group.copy}</span>
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <div className={`actions-strip-wrap actions-strip-wrap--${selectedCategory}`}>
            <h3 className="actions-strip-title">{PRIORITY_GROUPS.find((g) => g.key === selectedCategory)?.label ?? selectedCategory}</h3>
            <div className="actions-strip">
              {groupActionsFor(selectedCategory).map((action) => {
                const isSelected = selectedAction && selectedAction.action_name === action.action_name;
                return (
                  <button
                    key={action.action_name}
                    type="button"
                    className={`actions-action-card actions-action-card--strip actions-action-card--${selectedCategory} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectAction(action)}
                  >
                    <span className="actions-action-name">
                      {action.display_name || action.action_name}
                    </span>
                    <span className="actions-action-meta">
                      {action.user_count ?? 0} users
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="actions-main">
          {!selectedAction ? (
            <div className="actions-empty">
              <div className="actions-empty-icon" aria-hidden>
                <span className="actions-empty-icon-inner">◉</span>
              </div>
              <h3 className="actions-empty-title">Choose an action to see users</h3>
              <p className="actions-empty-lead">
                Select an outreach action from the list on the left. Users assigned to that
                action will appear here. Click a User ID to open their dashboard.
              </p>
            </div>
          ) : (
            <>
              <div className="actions-main-header">
                <h2 className="actions-main-title">
                  {selectedAction.display_name || selectedAction.action_name}
                </h2>
                {selectedAction.description && (
                  <p className="actions-main-desc">{selectedAction.description}</p>
                )}
              </div>
              {usersError && <ErrorBox message={usersError} />}
              {usersLoading && <Loading text="Loading users..." />}
              {!usersLoading && !usersError && usersPage && (
                <>
                  {usersPage.content.length === 0 ? (
                    <p className="actions-no-users">No users in this action.</p>
                  ) : (
                    <>
                      <div className="actions-table-header-row">
                        <h2 className="actions-table-title">Users ({usersPage.total_elements})</h2>
                        <button
                          type="button"
                          className="actions-export-btn"
                          onClick={handleExportCSV}
                          disabled={!usersPage?.content?.length}
                          aria-label="Export to CSV"
                        >
                          Export to CSV
                        </button>
                      </div>
                      <div className="actions-users-wrap">
                        <table className="actions-users-table">
                          <thead>
                            <tr>
                              <th>User ID</th>
                              <th title="Engagement score: base 50 ± boosts/penalties; drives engagement tier (strong intent / active / slipping / at-risk / critical)">Engagement</th>
                              <th className="actions-col-reason">Reason</th>
                              <th>Name</th>
                              <th>Contact</th>
                              <th>Country</th>
                              <th>Dimensions</th>
                              <th>Evaluated</th>
                            </tr>
                          </thead>
                          <tbody>
                            {usersPage.content.map((row) => (
                              <tr key={row.user_id}>
                                <td>
                                  {onSelectUser ? (
                                    <button
                                      type="button"
                                      className="actions-user-link"
                                      onClick={() => onSelectUser(row.user_id)}
                                    >
                                      {row.user_id}
                                    </button>
                                  ) : (
                                    <span>{row.user_id}</span>
                                  )}
                                </td>
                                <td>
                                  {row.engagement_score != null ? (() => {
                                    const tier = getEngagementTier(row.engagement_score);
                                    const label = getEngagementTierLabel(row.engagement_score);
                                    return (
                                      <span
                                        className={`engagement-badge ${tier ? `engagement-${tier}` : ''}`}
                                        title="Engagement score tier"
                                      >
                                        {row.engagement_score}
                                        {label && <span className="engagement-tier-label"> · {label}</span>}
                                      </span>
                                    );
                                  })() : '—'}
                                </td>
                                <td className="actions-col-reason" title={row.reason}>
                                  {row.reason ?? '—'}
                                </td>
                                <td>{row.name ?? '—'}</td>
                                <td>
                                  {[row.email, row.phone].filter(Boolean).join(' · ') || '—'}
                                </td>
                                <td>{row.country ?? '—'}</td>
                                <td>
                                  {row.dimension_snapshot ? (
                                    <span className="actions-dims">
                                      {[
                                        row.dimension_snapshot.trust_state,
                                        row.dimension_snapshot.fatigue_state,
                                        row.dimension_snapshot.lifecycle_state,
                                        row.dimension_snapshot.high_value_tag,
                                      ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                    </span>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                                <td>
                                  {row.evaluated_at
                                    ? formatDateShort(row.evaluated_at)
                                    : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {usersPage.total_pages > 1 && (
                        <div className="actions-pagination">
                          <span className="actions-pagination-info">
                            {usersPage.total_elements} total · page {usersPage.page + 1} of{' '}
                            {usersPage.total_pages}
                          </span>
                          <div className="actions-pagination-btns">
                            <button
                              type="button"
                              className="actions-pagination-btn"
                              onClick={() => setPage((p) => Math.max(0, p - 1))}
                              disabled={!hasPrev}
                              aria-label="Previous page"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              className="actions-pagination-btn"
                              onClick={() => setPage((p) => p + 1)}
                              disabled={!hasNext}
                              aria-label="Next page"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
