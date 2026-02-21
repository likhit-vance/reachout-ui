export function formatTimestamp(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Short date e.g. "19 Feb 2026" */
export function formatDateShort(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Initials from name or userId (e.g. "Akram Khan" → "AK", "user_123" → "U1") */
export function getInitials(name, userId = '') {
  if (name && typeof name === 'string') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  }
  if (userId && typeof userId === 'string') {
    const match = userId.match(/[a-zA-Z]/g);
    if (match) return (match[0] + (match[1] || match[0])).toUpperCase();
    return userId.slice(0, 2).toUpperCase();
  }
  return '?';
}

/** Format LTV/TPV e.g. 828390 → "828.39K" */
export function formatLtv(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  return n.toLocaleString();
}

export function truncate(str, len = 80) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

/**
 * Engagement score tiers (matches backend EngagementTierEvaluator).
 * Returns tier key for CSS class and display.
 */
export function getEngagementTier(score) {
  if (score == null || Number.isNaN(Number(score))) return null;
  const n = Number(score);
  if (n >= 80) return 'strong_intent';
  if (n >= 60) return 'active';
  if (n >= 40) return 'slipping';
  if (n >= 20) return 'at_risk';
  return 'critical';
}

/** Human-readable tier label for engagement score. */
export function getEngagementTierLabel(score) {
  const tier = getEngagementTier(score);
  const labels = {
    strong_intent: 'Strong intent',
    active: 'Active',
    slipping: 'Slipping',
    at_risk: 'At risk',
    critical: 'Critical',
  };
  return tier ? labels[tier] : null;
}
