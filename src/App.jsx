import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ConversationDetail } from './components/conversations/ConversationDetail';
import { UserSummaryView } from './components/summary/UserSummaryView';
import { NLQueryView } from './components/nlquery/NLQueryView';
import { CategoriesView } from './components/categories/CategoriesView';
import './App.css';

function App() {
  const [userId, setUserId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeView, setActiveView] = useState('conversations');
  const [selectedConvId, setSelectedConvId] = useState(null);

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    if (trimmed) {
      setUserId(trimmed);
      setSelectedConvId(null);
      setActiveView('conversations');
    }
  };

  return (
    <div>
      <Header
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
        userId={userId}
      />

      <div className="layout">
        <Sidebar
          userId={userId}
          activeView={activeView}
          setActiveView={setActiveView}
          selectedConvId={selectedConvId}
          onSelectConversation={(cid) => {
            setSelectedConvId(cid);
            setActiveView('conversations');
          }}
        />
        {activeView === 'categories' ? (
          <CategoriesView
            onUserClick={(uid) => {
              setSearchInput(uid);
              setUserId(uid);
              setActiveView('summary');
            }}
          />
        ) : (
          <div className="main">
            {activeView === 'conversations' && !selectedConvId && (
              <div className="empty-state">
                {userId ? 'Select a conversation from the sidebar' : 'Enter a User ID to get started'}
              </div>
            )}
            {activeView === 'conversations' && selectedConvId && (
              <ConversationDetail userId={userId} conversationId={selectedConvId} />
            )}
            {activeView === 'summary' && <UserSummaryView userId={userId} />}
            {activeView === 'nlquery' && <NLQueryView />}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
