import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';
import { Loading } from '../common/Loading';
import { ErrorBox } from '../common/ErrorBox';
import { formatDateShort } from '../../utils/format';

/**
 * One sub-category per dimension. selectedFilters is an array of
 * { dimension, subCategory }. Users shown are the intersection of
 * all selected segments (users who appear in every segment).
 */
export function DimensionsView({ onSelectUser }) {
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Array of { dimension, subCategory } — at most one sub-category per dimension */
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [responsesByFilter, setResponsesByFilter] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const [expandedDimId, setExpandedDimId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getDimensions()
      .then((data) => setDimensions(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message || 'Failed to load dimensions'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectSubCategory = useCallback((dim, subCat) => {
    setSelectedFilters((prev) => {
      const existingIndex = prev.findIndex((f) => f.dimension.id === dim.id);
      const isSame = existingIndex >= 0 && prev[existingIndex].subCategory.id === subCat.id;
      if (isSame) {
        return prev.filter((_, i) => i !== existingIndex);
      }
      const next = existingIndex >= 0
        ? prev.map((f, i) => (i === existingIndex ? { dimension: dim, subCategory: subCat } : f))
        : [...prev, { dimension: dim, subCategory: subCat }];
      return next;
    });
    setExpandedDimId(dim.id);
  }, []);

  useEffect(() => {
    if (selectedFilters.length === 0) {
      setResponsesByFilter([]);
      setUsersError(null);
      setUsersLoading(false);
      return;
    }
    setUsersLoading(true);
    setUsersError(null);
    Promise.all(
      selectedFilters.map(({ dimension, subCategory }) =>
        api.getUsersInSubCategory(dimension.id, subCategory.id)
      )
    )
      .then((responses) => {
        const lists = responses.map((r) => Array.isArray(r) ? r : []);
        setResponsesByFilter(
          selectedFilters.map((filter, i) => ({ filter, mappings: lists[i] }))
        );
      })
      .catch((e) => setUsersError(e.message || 'Failed to load users'))
      .finally(() => setUsersLoading(false));
  }, [selectedFilters]);

  /** Intersection of user_ids across all segments (set of users) + merged row data */
  const mergedUsers = (() => {
    if (
      selectedFilters.length === 0 ||
      responsesByFilter.length === 0 ||
      responsesByFilter.length !== selectedFilters.length
    ) {
      return [];
    }
    // Dedupe within each segment: user may appear multiple times in a single response
    const userSets = responsesByFilter.map(({ mappings }) =>
      new Set((mappings || []).map((m) => m.user_id).filter(Boolean))
    );
    const intersectionSet = new Set(
      Array.from(userSets[0]).filter((uid) => userSets.every((s) => s.has(uid)))
    );
    // One row per user: use first mapping per user_id when a segment has duplicates
    const mapsByFilter = responsesByFilter.map(({ mappings }) => {
      const byUser = {};
      for (const m of mappings || []) {
        if (m.user_id && !(m.user_id in byUser)) byUser[m.user_id] = m;
      }
      return byUser;
    });
    return Array.from(intersectionSet).map((user_id) => {
      const perDim = selectedFilters.map((f, i) => ({
        dimension: f.dimension,
        subCategory: f.subCategory,
        mapping: mapsByFilter[i]?.[user_id],
      }));
      const firstMapping = perDim[0]?.mapping;
      return {
        user_id,
        perDimension: perDim,
        evaluated_at: firstMapping?.evaluated_at,
      };
    });
  })();

  const removeFilter = useCallback((dimensionId) => {
    setSelectedFilters((prev) => prev.filter((f) => f.dimension.id !== dimensionId));
  }, []);

  const toggleExpand = (dimId) => {
    setExpandedDimId((prev) => (prev === dimId ? null : dimId));
  };

  const isSubCategorySelected = (dim, subCat) =>
    selectedFilters.some(
      (f) => f.dimension.id === dim.id && f.subCategory.id === subCat.id
    );

  if (loading) {
    return (
      <div className="dimensions-view dimensions-view--loading">
        <Loading text="Loading dimensions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dimensions-view">
        <ErrorBox message={error} />
      </div>
    );
  }

  return (
    <div className="dimensions-view">
      <div className="dimensions-layout">
        <aside className="dimensions-sidebar">
          <h2 className="dimensions-sidebar-title">Dimensions</h2>
          <p className="dimensions-sidebar-desc">
            Select one sub-category per dimension. Users matching all segments are shown.
          </p>
          <div className="dimensions-list">
            {dimensions.map((dim) => {
              const isExpanded = expandedDimId === dim.id;
              const subCats = dim.sub_categories || [];
              return (
                <div key={dim.id} className="dimensions-dim-card">
                  <button
                    type="button"
                    className="dimensions-dim-header"
                    onClick={() => toggleExpand(dim.id)}
                    aria-expanded={isExpanded}
                  >
                    <span className="dimensions-dim-name">
                      {dim.display_name || dim.name}
                    </span>
                    <span className="dimensions-dim-chevron" aria-hidden>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </button>
                  {isExpanded && (
                    <>
                      {dim.description && (
                        <p className="dimensions-dim-desc" title={dim.description}>
                          {dim.description}
                        </p>
                      )}
                      <div className="dimensions-subcats">
                        {subCats.map((sc) => {
                          const selected = isSubCategorySelected(dim, sc);
                          return (
                            <button
                              key={sc.id}
                              type="button"
                              className={`dimensions-subcat ${selected ? 'selected' : ''}`}
                              onClick={() => handleSelectSubCategory(dim, sc)}
                            >
                              <span className="dimensions-subcat-name">
                                {sc.display_name || sc.name}
                              </span>
                              {sc.description && (
                                <span className="dimensions-subcat-desc" title={sc.description}>
                                  {sc.description}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <div className="dimensions-main">
          {selectedFilters.length === 0 ? (
            <div className="dimensions-empty">
              <div className="dimensions-empty-icon" aria-hidden>
                <span className="dimensions-empty-icon-inner">◉</span>
              </div>
              <h3 className="dimensions-empty-title">Choose segments to see users</h3>
              <p className="dimensions-empty-lead">
                You can select one sub-category per dimension. Users who appear in
                all selected segments will be listed.
              </p>
              <ol className="dimensions-empty-steps">
                <li><strong>Expand a dimension</strong> in the left panel.</li>
                <li><strong>Click a sub-category</strong> (e.g. Active, KYC Complete).</li>
                <li><strong>Optionally add more</strong> from other dimensions (one per dimension).</li>
                <li><strong>View the user list</strong> and click a User ID to open their dashboard.</li>
              </ol>
              <p className="dimensions-empty-hint">
                Start by expanding any dimension on the left →
              </p>
            </div>
          ) : (
            <>
              <div className="dimensions-main-header">
                <div className="dimensions-filters-row">
                  <h2 className="dimensions-main-title">Users in all segments</h2>
                  <div className="dimensions-chips">
                    {selectedFilters.map(({ dimension, subCategory }) => (
                      <span key={dimension.id} className="dimensions-chip">
                        <span className="dimensions-chip-label">
                          {dimension.display_name || dimension.name} → {subCategory.display_name || subCategory.name}
                        </span>
                        <button
                          type="button"
                          className="dimensions-chip-remove"
                          onClick={() => removeFilter(dimension.id)}
                          aria-label={`Remove ${dimension.display_name} ${subCategory.display_name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {usersError && <ErrorBox message={usersError} />}
              {usersLoading && <Loading text="Loading users..." />}
              {!usersLoading && !usersError && (
                <>
                  {mergedUsers.length === 0 ? (
                    <p className="dimensions-no-users">
                      No users match all {selectedFilters.length} selected segment(s).
                    </p>
                  ) : (
                    <div className="dimensions-users-wrap">
                      <table className="dimensions-users-table">
                        <thead>
                          <tr>
                            <th>User ID</th>
                            {selectedFilters.map(({ dimension }) => (
                              <th key={dimension.id}>
                                {dimension.display_name || dimension.name}
                              </th>
                            ))}
                            <th>Evaluated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mergedUsers.map((row) => (
                            <tr key={row.user_id}>
                              <td>
                                {onSelectUser ? (
                                  <button
                                    type="button"
                                    className="dimensions-user-link"
                                    onClick={() => onSelectUser(row.user_id)}
                                  >
                                    {row.user_id}
                                  </button>
                                ) : (
                                  <span>{row.user_id}</span>
                                )}
                              </td>
                              {row.perDimension.map(({ dimension, mapping }) => (
                                <td key={dimension.id} title={mapping?.reason}>
                                  {mapping?.reason
                                    ? mapping.reason.length > 50
                                      ? mapping.reason.slice(0, 50) + '…'
                                      : mapping.reason
                                    : '—'}
                                </td>
                              ))}
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
