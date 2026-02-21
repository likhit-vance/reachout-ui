import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DimensionsView } from './components/dimensions/DimensionsView';
import { NLQueryView } from './components/nlquery/NLQueryView';
import { SearchUsersView } from './components/user/SearchUsersView';
import { UserDetailsDashboard } from './components/user/UserDetailsDashboard';
import './App.css';

const DIMENSIONS_BACK_STATE = { fromDimensions: true };

function App() {
  const [userId, setUserId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeView, setActiveView] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const cameFromDimensionsRef = useRef(false);

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    if (trimmed) {
      setUserId(trimmed);
      setSearchInput(trimmed);
      setActiveView('users');
      cameFromDimensionsRef.current = false;
    }
  };

  const goToDimensions = useCallback(() => {
    setActiveView('dimensions');
    setUserId('');
    setSearchInput('');
    cameFromDimensionsRef.current = false;
  }, []);

  const handleSelectUserFromDimensions = useCallback((selectedUserId) => {
    if (selectedUserId) {
      setUserId(selectedUserId);
      setSearchInput(selectedUserId);
      setActiveView('users');
      cameFromDimensionsRef.current = true;
      const url = window.location.pathname + window.location.search || '/';
      history.pushState(DIMENSIONS_BACK_STATE, '', url);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'dimensions') cameFromDimensionsRef.current = false;
  }, [activeView]);

  useEffect(() => {
    const onPopState = () => {
      if (cameFromDimensionsRef.current) {
        goToDimensions();
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [goToDimensions]);

  const pageTitle =
    activeView === 'dimensions'
      ? 'Dimensions'
      : activeView === 'users'
        ? userId
          ? 'User Dashboard'
          : 'Users'
        : 'NL Query';

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <div className="right-panel">
        <Header
          onMenuClick={() => setSidebarOpen((o) => !o)}
          sidebarOpen={sidebarOpen}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          userId={userId}
        />
        <div className="main-wrap">
          <div className="main-breadcrumb">{pageTitle}</div>
          <div className="main">
            {activeView === 'dimensions' && (
              <DimensionsView onSelectUser={handleSelectUserFromDimensions} />
            )}
            {activeView === 'users' && !userId && (
              <SearchUsersView
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                onSearch={handleSearch}
              />
            )}
            {activeView === 'users' && userId && (
              <UserDetailsDashboard userId={userId} />
            )}
            {activeView === 'nlquery' && <NLQueryView />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
