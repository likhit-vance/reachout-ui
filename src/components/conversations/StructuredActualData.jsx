import { syntaxHighlight } from '../../utils/syntaxHighlight';

/**
 * Renders a value for display in the structured view.
 */
function formatValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object' && Array.isArray(value)) {
    return value.length === 0 ? '—' : value.map((v) => formatValue(v)).join(', ');
  }
  if (typeof value === 'object') return null; // render as nested block
  return String(value);
}

/**
 * Single level key-value grid. Nested objects are rendered as subsections.
 */
export function StructuredActualData({ data, excludeKeys = [], compact = false, maxPreviewKeys = 8 }) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }

  const entries = Object.entries(data).filter(([k]) => !excludeKeys.includes(k));
  if (entries.length === 0) return null;

  const simple = [];
  const nested = [];
  for (const [key, value] of entries) {
    const display = formatValue(value);
    if (display === null) nested.push([key, value]);
    else simple.push([key, display]);
  }

  const label = (k) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className={`structured-actual-data ${compact ? 'structured-actual-data--compact' : ''}`}>
      {simple.length > 0 && (
        <div className="structured-actual-data-grid">
          {(compact ? simple.slice(0, maxPreviewKeys) : simple).map(([key, display]) => (
            <div key={key} className="structured-actual-data-item">
              <span className="structured-actual-data-label">{label(key)}</span>
              <span className="structured-actual-data-value" title={display}>
                {display}
              </span>
            </div>
          ))}
          {compact && simple.length > maxPreviewKeys && (
            <div className="structured-actual-data-item structured-actual-data-more">
              +{simple.length - maxPreviewKeys} more
            </div>
          )}
        </div>
      )}
      {!compact && nested.length > 0 && (
        <div className="structured-actual-data-nested">
          {nested.map(([key, value]) => (
            <div key={key} className="structured-actual-data-section">
              <h4 className="structured-actual-data-section-title">{label(key)}</h4>
              <StructuredActualData data={value} excludeKeys={excludeKeys} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders raw JSON in a collapsible block (for ConversationDetail).
 */
export function RawActualDataJson({ data }) {
  if (!data) return null;
  const json = JSON.stringify(data, null, 2);
  const html = syntaxHighlight(json);
  return (
    <details className="structured-actual-data-raw">
      <summary className="structured-actual-data-raw-summary">View raw JSON</summary>
      <div
        className="json-block structured-actual-data-raw-block"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </details>
  );
}
