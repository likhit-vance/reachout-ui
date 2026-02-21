import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/layout/Header';
import { HomeView } from './components/home/HomeView';
import { DimensionsView } from './components/dimensions/DimensionsView';
import { ActionsView } from './components/actions/ActionsView';
import { NLQueryView } from './components/nlquery/NLQueryView';
import { SearchUsersView } from './components/user/SearchUsersView';
import { UserDetailsDashboard } from './components/user/UserDetailsDashboard';
import './App.css';

const DIMENSIONS_BACK_STATE = { fromDimensions: true };

function App() {
  const [userId, setUserId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeView, setActiveView] = useState('home');
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

  const handleSelectUserFromList = useCallback((selectedUserId) => {
    if (selectedUserId) {
      setUserId(selectedUserId);
      setSearchInput(selectedUserId);
      setActiveView('users');
      cameFromDimensionsRef.current = true;
      const url = window.location.pathname + window.location.search || '/';
      history.pushState(DIMENSIONS_BACK_STATE, '', url);
    }
  }, []);

  const handleNavigateFromHome = useCallback((view) => {
    if (view !== 'home') {
      history.pushState({ fromHome: true }, '', window.location.pathname || '/');
    }
    setActiveView(view);
  }, []);

  useEffect(() => {
    if (activeView === 'dimensions') cameFromDimensionsRef.current = false;
  }, [activeView]);

  useEffect(() => {
    const onPopState = () => {
      if (cameFromDimensionsRef.current) {
        goToDimensions();
      } else {
        setActiveView('home');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [goToDimensions]);

  const pageTitle =
    activeView === 'home'
      ? 'Home'
      : activeView === 'dimensions'
        ? ''
        : activeView === 'actions'
          ? ''
          : activeView === 'users'
            ? userId
              ? 'User Dashboard'
              : ''
            : 'NL Query';

  return (
    <div className="app-container">
      <div className="right-panel">
        <Header
          isHome={activeView === 'home'}
          onGoHome={() => setActiveView('home')}
          userId={userId}
        />
        <div className="main-wrap">
          {activeView !== 'home' && pageTitle && (
            <div className="main-breadcrumb">{pageTitle}</div>
          )}
          <div className={`main${activeView === 'home' ? ' main--home' : ''}`}>
            {activeView === 'home' && (
              <HomeView onNavigate={handleNavigateFromHome} />
            )}
            {activeView === 'dimensions' && (
              <DimensionsView onSelectUser={handleSelectUserFromList} />
            )}
            {activeView === 'actions' && (
              <ActionsView onSelectUser={handleSelectUserFromList} />
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
