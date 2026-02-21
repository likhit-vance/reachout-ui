export function StatusBadge({ status }) {
  return <span className={`conv-item-status status-${status}`}>{status}</span>;
}
