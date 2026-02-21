import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { Loading } from '../common/Loading';
import { ErrorBox } from '../common/ErrorBox';
import { ChannelBadge } from '../common/ChannelBadge';
import { StatusBadge } from '../common/StatusBadge';
import { formatTimestamp } from '../../utils/format';
import { syntaxHighlight } from '../../utils/syntaxHighlight';

export function ConversationDetail({ userId, conversationId, hideSummary = false }) {
  const [conv, setConv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !conversationId) return;
    setLoading(true);
    setError(null);
    api
      .getConversationDetail(userId, conversationId)
      .then((data) => setConv(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId, conversationId]);

  if (loading) return <Loading text="Loading conversation details..." />;
  if (error) return <ErrorBox message={error} />;
  if (!conv) return null;

  return (
    <div>
      <div className="card">
        <h2>Conversation Details</h2>
        <div className="meta-grid">
          <div className="meta-item">
            <div className="meta-label">Conversation ID</div>
            <div className="meta-value">{conv.conversation_id}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Channel</div>
            <div className="meta-value">
              <ChannelBadge channel={conv.channel} />
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Timestamp</div>
            <div className="meta-value">{formatTimestamp(conv.timestamp)}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Status</div>
            <div className="meta-value">
              <StatusBadge status={conv.processing_status} />
            </div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Created</div>
            <div className="meta-value">{formatTimestamp(conv.created_at)}</div>
          </div>
          <div className="meta-item">
            <div className="meta-label">Updated</div>
            <div className="meta-value">{formatTimestamp(conv.updated_at)}</div>
          </div>
        </div>
      </div>

      {!hideSummary && (
        <div className="card">
          <h2>LLM Summary</h2>
          {conv.summarised_data ? (
            <div className="summary-text">{conv.summarised_data}</div>
          ) : (
            <p style={{ color: '#999', fontStyle: 'italic' }}>
              Summary not yet available (status: {conv.processing_status})
            </p>
          )}
          {conv.summarization_metadata && (
            <div style={{ marginTop: 14 }}>
              <div className="meta-grid">
                <div className="meta-item">
                  <div className="meta-label">Model</div>
                  <div className="meta-value">{conv.summarization_metadata.llm_model}</div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Tokens (in/out)</div>
                  <div className="meta-value">
                    {conv.summarization_metadata.input_tokens} / {conv.summarization_metadata.output_tokens}
                  </div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">Summarized At</div>
                  <div className="meta-value">{formatTimestamp(conv.summarization_metadata.summarized_at)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>Raw Conversation Data</h2>
        <div
          className="json-block"
          dangerouslySetInnerHTML={{ __html: syntaxHighlight(JSON.stringify(conv.actual_data, null, 2)) }}
        />
      </div>

      {conv.processing_error && (
        <div className="card">
          <h2 style={{ color: '#dc2626' }}>Processing Error</h2>
          <ErrorBox message={conv.processing_error} />
        </div>
      )}
    </div>
  );
}
