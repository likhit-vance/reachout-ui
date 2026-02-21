/**
 * Escape a value for CSV (quotes and commas).
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Build CSV string from array of objects.
 * @param {Array<Object>} rows - Array of row objects
 * @param {Array<{ key: string, label: string }>} columns - Column definitions (key = object key, label = header)
 * @returns {string} CSV string with BOM for Excel UTF-8
 */
export function arrayToCSV(rows, columns) {
  if (!rows.length) return '';
  const header = columns.map((c) => escapeCSVValue(c.label)).join(',');
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCSVValue(row[c.key])).join(',')
    )
    .join('\n');
  const csv = header + '\n' + body;
  return '\uFEFF' + csv; // BOM for Excel UTF-8
}

/**
 * Trigger download of a CSV string as a file.
 * @param {string} csvString - Full CSV content (including optional BOM)
 * @param {string} filename - e.g. "export.csv"
 */
export function downloadCSV(csvString, filename) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'export.csv';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
