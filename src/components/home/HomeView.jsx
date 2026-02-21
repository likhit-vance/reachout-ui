const HOME_CARDS = [
  {
    id: 'actions',
    title: 'Actions',
    description:
      'Outreach actions and user counts. View recommended actions and click an action to see associated users.',
    accent: 'actions',
  },
  {
    id: 'dimensions',
    title: 'Dimensions',
    description:
      'Dimensions and sub-categories for user classification. Explore segments and drill into users by dimension.',
    accent: 'dimensions',
  },
  {
    id: 'users',
    title: 'Users',
    description:
      'Search by User ID to view profile, activity, and properties. Load a user to see their dashboard and timeline.',
    accent: 'users',
  },
  {
    id: 'nlquery',
    title: 'NL Query',
    description:
      'Ask questions in plain English. Find conversations by channel, query by user or count, and explore data with natural language.',
    accent: 'nlquery',
  },
];

export function HomeView({ onNavigate }) {
  return (
    <div className="home-view">
      <div className="home-cards">
        {HOME_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`home-card home-card--${card.accent}`}
            onClick={() => onNavigate(card.id)}
          >
            <h3 className="home-card-title">{card.title}</h3>
            <p className="home-card-desc">{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
