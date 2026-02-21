export function Header({
  isHome,
  onGoHome,
  userId,
}) {
  return (
    <header className="header">
      <div className="header-left">
        {!isHome && (
          <button
            type="button"
            className="header-home-btn"
            onClick={onGoHome}
            aria-label="Go to home"
          >
            <span className="header-home-icon" aria-hidden="true">⌂</span>
            <span className="header-home-label">Home</span>
          </button>
        )}
      </div>
      <div className="header-center">
        <h1 className="header-title">Aspora Reachout Platform</h1>
      </div>
      <div className="header-right">
        {userId && <span className="header-viewing">Viewing: {userId}</span>}
      </div>
    </header>
  );
}
