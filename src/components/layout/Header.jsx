export function Header({ searchInput, setSearchInput, onSearch, userId }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="header">
      <h1>Aspora Reachout Platform</h1>
      <div className="header-search">
        <input
          type="text"
          placeholder="Enter User ID (e.g. user_test_001)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={onSearch} disabled={!searchInput.trim()}>
          Load Data
        </button>
      </div>
      {userId && <span style={{ fontSize: 13, opacity: 0.7 }}>Viewing: {userId}</span>}
    </div>
  );
}
