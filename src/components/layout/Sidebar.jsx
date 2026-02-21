import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';
import { Loading } from '../common/Loading';
import { ErrorBox } from '../common/ErrorBox';
import { ConversationItem } from '../conversations/ConversationItem';

export function Sidebar({ userId, activeView, setActiveView, selectedConvId, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadConversations = useCallback(
    (pg = 0) => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      api
        .getUserConversations(userId, pg)
        .then((data) => {
          setConversations(data.content || []);
          setPage(data.pageable?.pageNumber ?? data.number ?? pg);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [userId]
  );

  useEffect(() => {
    if (userId) {
      setPage(0);
      loadConversations(0);
    } else {
      setConversations([]);
      setTotalPages(0);
      setTotalElements(0);
    }
  }, [userId, loadConversations]);

  return (
    <div className="sidebar">
      <div className="view-tabs">
        <button
          className={`view-tab${activeView === 'conversations' ? ' active' : ''}`}
          onClick={() => setActiveView('conversations')}
        >
          Convos
        </button>
        <button
          className={`view-tab${activeView === 'summary' ? ' active' : ''}`}
          onClick={() => setActiveView('summary')}
        >
          Summary
        </button>
        <button
          className={`view-tab${activeView === 'nlquery' ? ' active' : ''}`}
          onClick={() => setActiveView('nlquery')}
        >
          NL Query
        </button>
        <button
          className={`view-tab${activeView === 'categories' ? ' active' : ''}`}
          onClick={() => setActiveView('categories')}
        >
          Categories
        </button>
      </div>

      {activeView === 'conversations' && (
        <>
          <div className="conv-list">
            {!userId && (
              <div style={{ padding: 20, color: '#999', fontSize: 13, textAlign: 'center' }}>
                Enter a User ID to load conversations
              </div>
            )}
            {loading && <Loading text="Loading..." />}
            <ErrorBox message={error} />
            {!loading && !error && userId && conversations.length === 0 && (
              <div style={{ padding: 20, color: '#999', fontSize: 13, textAlign: 'center' }}>
                No conversations found
              </div>
            )}
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isSelected={selectedConvId === conv.conversation_id}
                onClick={() => onSelectConversation(conv.conversation_id)}
              />
            ))}
          </div>
          {totalPages > 0 && (
            <div className="pagination">
              <button disabled={page <= 0} onClick={() => loadConversations(page - 1)}>
                Prev
              </button>
              <span>
                Page {page + 1} of {totalPages} ({totalElements} total)
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => loadConversations(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {activeView === 'summary' && (
        <div style={{ padding: 16, color: '#666', fontSize: 13 }}>
          <p>
            Viewing the aggregated summary for <strong>{userId || '—'}</strong>.
          </p>
          <p style={{ marginTop: 8 }}>
            This combines LLM summaries of all conversations across all channels.
          </p>
        </div>
      )}

      {activeView === 'nlquery' && (
        <div style={{ padding: 16, color: '#666', fontSize: 13 }}>
          <p style={{ marginBottom: 10 }}>Ask questions in plain English.</p>
          <p>
            <strong>Examples:</strong>
          </p>
          <ul style={{ paddingLeft: 18, marginTop: 6, lineHeight: 2 }}>
            <li style={{ cursor: 'pointer', color: '#4361ee' }} onClick={() => setActiveView('nlquery')}>
              "Find all PULSE conversations"
            </li>
            <li>Show conversations for user_test_001</li>
            <li>Count conversations per channel</li>
            <li>Latest 5 failed conversations</li>
          </ul>
        </div>
      )}

      {activeView === 'categories' && (
        <div style={{ padding: 16, color: '#666', fontSize: 13 }}>
          <p style={{ marginBottom: 10 }}>Manage user categories and view assigned users.</p>
          <p>
            Categories are used by the LLM to automatically classify users based on their
            interaction summaries.
          </p>
          <p style={{ marginTop: 10 }}>
            <strong>How it works:</strong>
          </p>
          <ul style={{ paddingLeft: 18, marginTop: 6, lineHeight: 2 }}>
            <li>Create categories with a definition</li>
            <li>Trigger categorization to classify users</li>
            <li>Click a category to see assigned users</li>
            <li>Click a user to view their data</li>
          </ul>
        </div>
      )}
    </div>
  );
}
