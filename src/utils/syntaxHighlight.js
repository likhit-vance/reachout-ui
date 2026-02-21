export function syntaxHighlight(json) {
  if (typeof json !== 'string') json = JSON.stringify(json, null, 2);
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
      if (/:$/.test(match)) return `<span style="color:#89b4fa">${match}</span>`;
      return `<span style="color:#a6e3a1">${match}</span>`;
    })
    .replace(/\b(true|false)\b/g, '<span style="color:#fab387">$1</span>')
    .replace(/\b(null)\b/g, '<span style="color:#f38ba8">$1</span>')
    .replace(/\b(-?\d+\.?\d*)\b/g, '<span style="color:#f9e2af">$1</span>');
}
