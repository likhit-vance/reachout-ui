import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { api } from '../../api/api';
import { Loading } from '../common/Loading';
import { ErrorBox } from '../common/ErrorBox';
import { ChannelBadge } from '../common/ChannelBadge';
import { StatusBadge } from '../common/StatusBadge';
import { ConversationDetail } from '../conversations/ConversationDetail';
import { StructuredActualData } from '../conversations/StructuredActualData';
import {
  formatTimestamp,
  formatDateShort,
  formatLtv,
  getInitials,
  truncate,
  getEngagementTier,
  getEngagementTierLabel,
} from '../../utils/format';

const ACTIVITY_PAGE_SIZE = 20;

function MetricItem({ icon, label, value }) {
  return (
    <div className="ud-metric-item">
      <span className="ud-metric-icon" aria-hidden>{icon}</span>
      <div>
        <div className="ud-metric-value">{value}</div>
        <div className="ud-metric-label">{label}</div>
      </div>
    </div>
  );
}

export function UserDetailsDashboard({ userId, onSelectConversation }) {
  const [details, setDetails] = useState(null);
  const [conversations, setConversations] = useState(null);
  const [summary, setSummary] = useState(null);
  const [dimensionMappings, setDimensionMappings] = useState([]);
  const [userAction, setUserAction] = useState(null);
  const [userActionError, setUserActionError] = useState(null);
  const [userActionRetrying, setUserActionRetrying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [conversationsError, setConversationsError] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [dimensionsError, setDimensionsError] = useState(null);
  const [activeTab, setActiveTab] = useState('user-info');
  const [propertySearch, setPropertySearch] = useState('');
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const propertiesWrapRef = useRef(null);
  const [openBadgeKey, setOpenBadgeKey] = useState(null);
  const badgeAreaRef = useRef(null);
  const [activityList, setActivityList] = useState([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityLoadingMore, setActivityLoadingMore] = useState(false);
  const [modalConversationId, setModalConversationId] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    setDetailsError(null);
    setConversationsError(null);
    setSummaryError(null);
    setDimensionsError(null);
    setDetails(null);
    setConversations(null);
    setSummary(null);
    setDimensionMappings([]);
    setUserAction(null);
    setUserActionError(null);
    setActivityList([]);
    setActivityTotal(0);
    setModalConversationId(null);
    setPropertiesOpen(false);

    const load = async () => {
      const [detailsRes, convsRes, summaryRes, dimRes, actionRes] = await Promise.allSettled([
        api.getUserDetails(userId),
        api.getUserConversations(userId, 0, ACTIVITY_PAGE_SIZE),
        api.getUserSummary(userId),
        api.getDimensionMappingsForUser(userId),
        api.getUserAction(userId),
      ]);

      if (detailsRes.status === 'fulfilled') setDetails(detailsRes.value);
      else setDetailsError(detailsRes.reason?.message || 'Failed to load user details');

      if (convsRes.status === 'fulfilled') {
        const data = convsRes.value;
        setConversations(data);
        setActivityList(data.content || []);
        setActivityTotal(data.totalElements ?? 0);
      } else setConversationsError(convsRes.reason?.message || 'Failed to load conversations');

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      else setSummaryError(summaryRes.reason?.message || 'Failed to load summary');

      if (dimRes.status === 'fulfilled') setDimensionMappings(dimRes.value || []);
      else setDimensionsError(dimRes.reason?.message); // optional, don't block UI

      if (actionRes.status === 'fulfilled') {
        setUserAction(actionRes.value);
        setUserActionError(null);
      } else {
        setUserAction(null);
        const raw = actionRes.reason?.message || 'No action mapping. Run dimension evaluation first.';
        const friendly =
          /unexpected error|internal server error|server error|500/i.test(raw)
            ? 'Recommended action is unavailable. Run dimension evaluation or try again later.'
            : raw;
        setUserActionError(friendly);
      }

      setLoading(false);
    };

    load();
  }, [userId]);

  const convList = conversations?.content || [];
  const totalConvs = conversations?.totalElements ?? 0;
  const hasMoreActivity = activityList.length < activityTotal;

  useEffect(() => {
    if (!openBadgeKey) return;
    const onPointerDown = (e) => {
      if (badgeAreaRef.current && !badgeAreaRef.current.contains(e.target)) {
        setOpenBadgeKey(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [openBadgeKey]);

  useEffect(() => {
    if (!propertiesOpen) return;
    const onPointerDown = (e) => {
      if (propertiesWrapRef.current && !propertiesWrapRef.current.contains(e.target)) {
        setPropertiesOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [propertiesOpen]);

  const loadMoreActivity = async () => {
    if (activityLoadingMore || !hasMoreActivity || !userId) return;
    const nextPage = Math.floor(activityList.length / ACTIVITY_PAGE_SIZE);
    setActivityLoadingMore(true);
    try {
      const data = await api.getUserConversations(userId, nextPage, ACTIVITY_PAGE_SIZE);
      const newContent = data.content || [];
      setActivityList((prev) => [...prev, ...newContent]);
    } catch (e) {
      setConversationsError(e.message || 'Failed to load more');
    } finally {
      setActivityLoadingMore(false);
    }
  };

  const displayName = details?.name || userId || '—';
  const initials = getInitials(details?.name, userId);
  const country = details?.country || '—';
  const statusBadge = details?.kyc_status || (details ? 'Registered' : null);

  const userProperties = useMemo(() => {
    if (!details) return [];
    const labels = {
      user_id: 'User ID',
      name: 'Name',
      country: 'Country',
      email: 'Email',
      phone: 'Phone',
      kyc_status: 'KYC Status',
      signup_date: 'First seen',
      last_login_at: 'Last login',
      last_transaction_date: 'Last transaction',
      total_completed_transfers: 'Transfers',
      total_tpv_usd: 'Total TPV (USD)',
      user_type: 'User type',
      gender: 'Gender',
      age: 'Age',
      beneficiaries: 'Beneficiaries',
      referee_count: 'Referee count',
      created_at: 'Created',
      updated_at: 'Updated',
    };
    const raw = { ...details, signup_date: details.signup_date };
    return Object.entries(raw)
      .filter(([k, v]) => v != null && v !== '' && k !== 'id')
      .map(([key, value]) => ({
        key,
        label: labels[key] || key.replace(/_/g, ' '),
        value: typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)
          ? formatTimestamp(value)
          : String(value),
      }));
  }, [details]);

  const filteredProperties = useMemo(() => {
    if (!propertySearch.trim()) return userProperties;
    const q = propertySearch.trim().toLowerCase();
    return userProperties.filter(
      (p) => p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q)
    );
  }, [userProperties, propertySearch]);

  const displayBadges = useMemo(() => {
    return (dimensionMappings || []).filter((m) => {
      const label = m.sub_category_name || m.dimension_name || m.sub_category_id || '';
      return label && String(label).toLowerCase() !== 'no_data';
    });
  }, [dimensionMappings]);

  const handleRetryAction = useCallback(() => {
    if (!userId || userActionRetrying) return;
    setUserActionRetrying(true);
    setUserActionError(null);
    api
      .getUserAction(userId)
      .then((data) => {
        setUserAction(data);
        setUserActionError(null);
      })
      .catch((e) => {
        setUserAction(null);
        const raw = e?.message || 'Recommended action unavailable.';
        const friendly =
          /unexpected error|internal server error|server error|500/i.test(raw)
            ? 'Recommended action is unavailable. Run dimension evaluation or try again later.'
            : raw;
        setUserActionError(friendly);
      })
      .finally(() => setUserActionRetrying(false));
  }, [userId, userActionRetrying]);

  if (!userId) {
    return (
      <div className="ud-empty">
        Enter a User ID in the header and click Load to view the dashboard.
      </div>
    );
  }

  if (loading) {
    return <Loading text="Loading user dashboard..." />;
  }

  return (
    <div className="ud-dashboard">
      {/* Profile header — ref: User Profile / Customer Intelligence */}
      <header className="ud-header">
        <div className="ud-header-top">
          <div className="ud-header-left">
            <div className="ud-avatar-wrap">
              <div className="ud-avatar" aria-hidden>
                {initials}
              </div>
              {statusBadge && (
                <span className="ud-status-badge">{statusBadge}</span>
              )}
            </div>
            <div className="ud-profile-meta">
              <h1 className="ud-display-name">{displayName}</h1>
              <p className="ud-context">
                {country !== '—' ? country : `ID: ${userId}`}
              </p>
              {details?.email && (
                <p className="ud-email">{details.email}</p>
              )}
              {details?.phone && (
                <p className="ud-phone">{details.phone}</p>
              )}
              <p className="ud-id" title={userId}>ID: {truncate(userId, 28)}</p>
            </div>
          </div>
          <div className="ud-header-properties-wrap" ref={propertiesWrapRef}>
            <button
              type="button"
              className={`ud-props-toggle ${propertiesOpen ? 'open' : ''}`}
              onClick={() => setPropertiesOpen((o) => !o)}
              aria-label={propertiesOpen ? 'Close user properties' : 'Open user properties'}
              aria-expanded={propertiesOpen}
            >
              <span className="ud-props-toggle-icon" aria-hidden>☰</span>
              <span className="ud-props-toggle-label">Properties</span>
            </button>
            {propertiesOpen && (
              <div className="ud-header-properties">
                <div className="ud-props-panel-header">
                  <h2 className="ud-props-panel-title">User properties</h2>
                  <button
                    type="button"
                    className="ud-props-panel-close"
                    onClick={() => setPropertiesOpen(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="ud-props-panel-search">
                  <input
                    type="search"
                    className="ud-property-search"
                    placeholder="Search properties"
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    aria-label="Search properties"
                  />
                </div>
                <div className="ud-props-panel-body">
                  {detailsError && <ErrorBox message={detailsError} />}
                  {!detailsError && filteredProperties.length > 0 ? (
                    <div className="ud-properties-list">
                      {filteredProperties.map(({ key, label, value }) => (
                        <div key={key} className="ud-property-item">
                          <span className="ud-property-label">{label}</span>
                          <span className="ud-property-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : !detailsError && (
                    <p className="ud-muted">No user details found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {displayBadges.length > 0 && (
          <div className="ud-badges" ref={badgeAreaRef}>
            {displayBadges.map((m) => {
              const badgeKey = m.id || `${m.dimension_id}-${m.sub_category_id}`;
              const label = m.sub_category_name || m.dimension_name || m.sub_category_id;
              const isOpen = openBadgeKey === badgeKey;
              return (
                <div key={badgeKey} className="ud-badge-wrap">
                  <button
                    type="button"
                    className={`ud-dimension-badge ${isOpen ? 'open' : ''}`}
                    onClick={() => setOpenBadgeKey((k) => (k === badgeKey ? null : badgeKey))}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    {label}
                  </button>
                  {isOpen && m.reason && (
                    <div
                      className="ud-badge-popover"
                      role="tooltip"
                    >
                      {m.reason}
                      <button
                        type="button"
                        className="ud-badge-popover-close"
                        onClick={(e) => { e.stopPropagation(); setOpenBadgeKey(null); }}
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* Recommended action (if evaluated) */}
      {(userAction || userActionError) && (
        <section className="ud-action-card-wrap">
          <h2 className="ud-summary-top-title">Recommended action</h2>
          {userActionError && !userAction && (
            <div className="ud-action-error-wrap">
              <p className="ud-muted ud-action-error">{userActionError}</p>
              <button
                type="button"
                className="ud-action-retry-btn"
                onClick={handleRetryAction}
                disabled={userActionRetrying}
                aria-label="Try again"
              >
                {userActionRetrying ? 'Loading…' : 'Try again'}
              </button>
            </div>
          )}
          {userAction && (
            <div className="ud-action-card">
              <div className="ud-action-header">
                <span className="ud-action-name">{userAction.action_display_name || userAction.action_name}</span>
                {userAction.engagement_score != null && (() => {
                  const tier = getEngagementTier(userAction.engagement_score);
                  const label = getEngagementTierLabel(userAction.engagement_score);
                  return (
                    <span
                      className={`engagement-badge ${tier ? `engagement-${tier}` : ''}`}
                      title="Engagement score: base 50, boosted by recent activity (orders, logins, clicks), reduced by failures and fatigue. Range ~-50 to 100. Tiers: ≥80 Strong intent, 60-79 Active, 40-59 Slipping, 20-39 At-risk, <20 Critical."
                    >
                      {userAction.engagement_score}
                      {label && <span className="engagement-tier-label"> · {label}</span>}
                    </span>
                  );
                })()}
              </div>
              {userAction.dimension_snapshot && (
                <div className="ud-action-dims">
                  {['trust_state', 'fatigue_state', 'lifecycle_state', 'high_value_tag'].map((key) => (
                    <span key={key} className="ud-action-dim-pill">
                      {key.replace(/_/g, ' ')}: {userAction.dimension_snapshot[key] ?? '—'}
                    </span>
                  ))}
                </div>
              )}
              {userAction.reason && (
                <p className="ud-action-reason">{userAction.reason}</p>
              )}
              {userAction.evaluated_at && (
                <p className="ud-action-meta">
                  Evaluated {formatTimestamp(userAction.evaluated_at)}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Behavior summary at top — always visible */}
      <section className="ud-summary-top">
        <h2 className="ud-summary-top-title">Behavior summary</h2>
        {summaryError && <ErrorBox message={summaryError} />}
        {!summaryError && summary?.total_summary ? (
          <div className="ud-summary-top-text">{summary.total_summary}</div>
        ) : (
          <p className="ud-muted">No summary yet.</p>
        )}
        {summary?.conversation_count_by_channel && Object.keys(summary.conversation_count_by_channel).length > 0 && (
          <div className="ud-channel-pills">
            {Object.entries(summary.conversation_count_by_channel).map(([ch, count]) => (
              <span key={ch} className={`ud-channel-pill channel-${ch}`}>
                {ch}: {count}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Tabs */}
      <div className="ud-tabs-row">
        <div className="ud-tabs">
          <button
            type="button"
            className={`ud-tab ${activeTab === 'user-info' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-info')}
          >
            User info
          </button>
          <button
            type="button"
            className={`ud-tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>
      </div>

      <div className="ud-main">
          {activeTab === 'user-info' && (
            <div className="ud-cards">
              <section className="ud-card">
                <h2 className="ud-card-title">Lifecycle</h2>
                <div className="ud-metrics-row">
                  <MetricItem
                    icon="🕐"
                    label="Last Active"
                    value={summary?.last_conversation_at ? formatDateShort(summary.last_conversation_at) : '—'}
                  />
                  <MetricItem
                    icon="📊"
                    label="Sessions"
                    value={summary?.conversation_count ?? totalConvs ?? '—'}
                  />
                </div>
              </section>

              <section className="ud-card">
                <h2 className="ud-card-title">Key metrics</h2>
                <div className="ud-metrics-row">
                  <MetricItem
                    icon="💰"
                    label="Total LTV"
                    value={details?.total_tpv_usd != null ? `$${formatLtv(details.total_tpv_usd)}` : '—'}
                  />
                  <MetricItem
                    icon="📤"
                    label="Transfers"
                    value={details?.total_completed_transfers ?? '—'}
                  />
                  <MetricItem
                    icon="🕐"
                    label="Last transaction"
                    value={details?.last_transaction_date ? formatDateShort(details.last_transaction_date) : '—'}
                  />
                </div>
              </section>

              <section className="ud-card">
                <h2 className="ud-card-title">Acquisition</h2>
                <div className="ud-metrics-row">
                  <MetricItem
                    icon="👁"
                    label="First seen"
                    value={details?.signup_date ? formatDateShort(details.signup_date) : '—'}
                  />
                  <MetricItem icon="📢" label="Publisher / Campaign" value="N/A" />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="ud-activity">
              <h2 className="ud-section-title">Activity timeline</h2>
              {conversationsError && <ErrorBox message={conversationsError} />}
              {!conversationsError && activityList.length === 0 && !activityLoadingMore && (
                <p className="ud-muted">No conversations yet.</p>
              )}
              {!conversationsError && activityList.length > 0 && (
                <>
                  <p className="ud-muted ud-activity-count">
                    {activityTotal} total · showing {activityList.length}
                  </p>
                  <ul className="ud-timeline">
                    {activityList.map((conv) => (
                      <li key={conv.id || conv.conversation_id} className="ud-timeline-item">
                        <div className="ud-timeline-marker" />
                        <div className="ud-timeline-content">
                          <div className="ud-timeline-header">
                            <ChannelBadge channel={conv.channel} />
                            <span className="ud-timeline-date">
                              {formatDateShort(conv.timestamp)}
                            </span>
                            <StatusBadge status={conv.processing_status} />
                          </div>
                          <p className="ud-timeline-preview">
                            {conv.summarised_data ? truncate(conv.summarised_data, 140) : '—'}
                          </p>
                          {conv.actual_data && (
                            <div className="ud-timeline-actual-wrap">
                              {conv.actual_data.audio_file_url && (
                                <div className="ud-timeline-audio-row">
                                  <audio
                                    className="conv-audio-player"
                                    controls
                                    preload="metadata"
                                    src={conv.actual_data.audio_file_url}
                                    aria-label="Play conversation audio"
                                    style={{ maxWidth: 280, height: 36 }}
                                  />
                                </div>
                              )}
                              <div className="ud-timeline-actual-data">
                                <StructuredActualData
                                  data={conv.actual_data}
                                  excludeKeys={['audio_file_url']}
                                  compact
                                  maxPreviewKeys={6}
                                />
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            className="ud-timeline-action"
                            onClick={() => setModalConversationId(conv.conversation_id)}
                          >
                            View details
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {hasMoreActivity && (
                    <div className="ud-activity-load-more">
                      <button
                        type="button"
                        className="ud-load-more-btn"
                        onClick={loadMoreActivity}
                        disabled={activityLoadingMore}
                        aria-busy={activityLoadingMore}
                      >
                        {activityLoadingMore ? (
                          <>
                            <span className="ud-load-more-spinner" aria-hidden />
                            Loading…
                          </>
                        ) : (
                          `Load more (${activityList.length} of ${activityTotal})`
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
      </div>

      {/* Conversation detail modal */}
      {modalConversationId && (
        <div
          className="ud-conv-modal-overlay"
          onClick={() => setModalConversationId(null)}
          onKeyDown={(e) => e.key === 'Escape' && setModalConversationId(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ud-conv-modal-title"
        >
          <div
            className="ud-conv-modal"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="ud-conv-modal-header">
              <h2 id="ud-conv-modal-title" className="ud-conv-modal-title">Conversation details</h2>
              <button
                type="button"
                className="ud-conv-modal-close"
                onClick={() => setModalConversationId(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="ud-conv-modal-body">
              <ConversationDetail
                userId={userId}
                conversationId={modalConversationId}
                hideSummary
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
