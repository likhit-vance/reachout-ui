export function Sidebar({ isOpen, onClose, activeView, setActiveView }) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <div className={`sidebar${isOpen ? ' open' : ''}`}>
        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
        <div className="sidebar-logo">Reachout</div>
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-nav-item${activeView === 'actions' ? ' active' : ''}`}
            onClick={() => {
              setActiveView('actions');
              onClose();
            }}
          >
            Actions
          </button>
          <button
            type="button"
            className={`sidebar-nav-item${activeView === 'dimensions' ? ' active' : ''}`}
            onClick={() => {
              setActiveView('dimensions');
              onClose();
            }}
          >
            Dimensions
          </button>
          <button
            type="button"
            className={`sidebar-nav-item${activeView === 'users' ? ' active' : ''}`}
            onClick={() => {
              setActiveView('users');
              onClose();
            }}
          >
            Users
          </button>
          <button
            type="button"
            className={`sidebar-nav-item${activeView === 'nlquery' ? ' active' : ''}`}
            onClick={() => {
              setActiveView('nlquery');
              onClose();
            }}
          >
            NL Query
          </button>
        </nav>
        <div className="sidebar-content">
          {activeView === 'actions' && (
            <div className="sidebar-help">
              <p>Outreach actions and user counts. Click an action to see users.</p>
            </div>
          )}
          {activeView === 'dimensions' && (
            <div className="sidebar-help">
              <p>Dimensions and sub-categories for user classification.</p>
            </div>
          )}
          {activeView === 'users' && (
            <div className="sidebar-help">
              <p>Search by User ID to view profile, activity and properties.</p>
            </div>
          )}
          {activeView === 'nlquery' && (
            <div className="sidebar-help">
              <p>Ask questions in plain English.</p>
              <ul>
                <li>Find conversations by channel</li>
                <li>Query by user or count</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
