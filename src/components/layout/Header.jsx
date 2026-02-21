export function Header({
  onMenuClick,
  sidebarOpen,
  searchInput,
  setSearchInput,
  onSearch,
  userId,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <header className="header">
      <button
        type="button"
        className="header-menu-btn"
        onClick={onMenuClick}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={sidebarOpen}
      >
        <span className="header-menu-icon" />
        <span className="header-menu-icon" />
        <span className="header-menu-icon" />
      </button>
      <h1 className="header-title">Aspora Reachout Platform</h1>
      <div className="header-right">
        <div className="header-search">
          <input
            type="text"
            placeholder="Search user by ID (e.g. user_test_001)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="header-load-btn" onClick={onSearch} disabled={!searchInput.trim()}>
            Load Data
          </button>
        </div>
        {userId && <span className="header-viewing">Viewing: {userId}</span>}
      </div>
    </header>
  );
}
