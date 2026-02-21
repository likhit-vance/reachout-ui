export function SearchUsersView({ searchInput, setSearchInput, onSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="search-users-view">
      <div className="search-users-card-wrap">
        <div className="search-users-card">
          <form className="search-users-form" onSubmit={handleSubmit}>
            <div className="search-users-input-wrap">
              <input
                type="text"
                className="search-users-input"
                placeholder="Search user by ID, Email, Mobile number, Name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="submit"
                className="search-users-submit"
                aria-label="Search"
                disabled={!searchInput.trim()}
              >
                <svg className="search-users-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
