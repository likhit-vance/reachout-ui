import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { Loading } from '../common/Loading';
import { ErrorBox } from '../common/ErrorBox';
import { formatTimestamp } from '../../utils/format';

export function UserSummaryView({ userId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    api
      .getUserSummary(userId)
      .then((data) => setSummary(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return <div className="empty-state">Enter a User ID to view summary</div>;
  if (loading) return <Loading text="Loading user summary..." />;
  if (error) return <ErrorBox message={error} />;
  if (!summary) return <div className="empty-state">No summary data available</div>;

  return (
    <div>
      <div className="card">
        <h2>User Summary — {summary.user_id}</h2>
        <div className="summary-text">{summary.total_summary}</div>
      </div>

      <div className="card">
        <h2>Overview</h2>
        <div className="channel-stats">
          <div className="channel-stat">
            <div className="channel-stat-count">{summary.conversation_count}</div>
            <div className="channel-stat-label">Total Conversations</div>
          </div>
          {summary.conversation_count_by_channel &&
            Object.entries(summary.conversation_count_by_channel).map(([ch, count]) => (
              <div className="channel-stat" key={ch}>
                <div className="channel-stat-count">{count}</div>
                <div className="channel-stat-label">{ch}</div>
              </div>
            ))}
        </div>
      </div>

      <div className="card">
        <h2>Metadata</h2>
        <div className="meta-grid">
          <div className="meta-item">
            <div className="meta-label">Last Conversation</div>
            <div className="meta-value">{formatTimestamp(summary.last_conversation_at)}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Summary Created</div>
            <div className="meta-value">{formatTimestamp(summary.created_at)}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Summary Updated</div>
            <div className="meta-value">{formatTimestamp(summary.updated_at)}</div>
          </div>
          {summary.last_summary_metadata && (
            <>
              <div className="meta-item">
                <div className="meta-label">LLM Model</div>
                <div className="meta-value">{summary.last_summary_metadata.llm_model}</div>
              </div>
              <div className="meta-item">
                <div className="meta-label">Tokens (in/out)</div>
                <div className="meta-value">
                  {summary.last_summary_metadata.input_tokens} / {summary.last_summary_metadata.output_tokens}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
