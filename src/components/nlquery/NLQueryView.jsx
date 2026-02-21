import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../../api/api';
import { Loading } from '../common/Loading';
import { ErrorBox } from '../common/ErrorBox';
import { formatTimestamp, truncate } from '../../utils/format';
import { syntaxHighlight } from '../../utils/syntaxHighlight';
import { arrayToCSV, downloadCSV } from '../../utils/csv';
import { NLQueryChart } from './NLQueryChart';

const NL_INPUT_EXPANDED_MIN_HEIGHT = 100;
const NL_INPUT_COLLAPSED_MIN_HEIGHT = 40;

export function NLQueryView() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [showGeneratedQuery, setShowGeneratedQuery] = useState(false);
  const [inputExpanded, setInputExpanded] = useState(true);
  const textareaRef = useRef(null);

  const collapseInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const apply = () => {
      el.style.minHeight = `${NL_INPUT_COLLAPSED_MIN_HEIGHT}px`;
      el.style.height = `${Math.max(NL_INPUT_COLLAPSED_MIN_HEIGHT, el.scrollHeight)}px`;
    };
    requestAnimationFrame(apply);
  }, []);

  const expandInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.minHeight = `${NL_INPUT_EXPANDED_MIN_HEIGHT}px`;
    el.style.height = '';
  }, []);

  useEffect(() => {
    if (!inputExpanded && textareaRef.current) collapseInput();
  }, [inputExpanded, query, collapseInput]);

  const execute = useCallback(() => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    api
      .executeNLQuery(query.trim())
      .then((data) => {
        setResult(data);
        setShowChart(false);
        setShowGeneratedQuery(false);
        setHistory((prev) => [{ query: query.trim(), timestamp: new Date() }, ...prev.slice(0, 9)]);
        setInputExpanded(false);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query, loading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) execute();
  };

  const resultKeys = result && result.results && result.results.length > 0 ? Object.keys(result.results[0]) : [];

  const handleExportCSV = useCallback(() => {
    if (!result?.results?.length || !resultKeys.length) return;
    const columns = resultKeys.map((k) => ({ key: k, label: k }));
    const rows = result.results.map((row) => {
      const obj = {};
      resultKeys.forEach((k) => {
        const v = row[k];
        obj[k] = v == null ? '' : (typeof v === 'object' ? JSON.stringify(v) : String(v));
      });
      return obj;
    });
    const csv = arrayToCSV(rows, columns);
    downloadCSV(csv, `nl-query-results-${Date.now()}.csv`);
  }, [result, resultKeys]);

  return (
    <div>
      <div className="card">
        <h2>Natural Language Query</h2>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
          Ask questions about your data in plain English. The LLM will generate and execute MongoDB queries.
        </p>
        <textarea
          ref={textareaRef}
          className="nl-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setInputExpanded(true);
            expandInput();
          }}
          onBlur={() => {
            setInputExpanded(false);
          }}
          placeholder='e.g. "Find all PULSE conversations for user user_test_001" or "How many conversations per channel?"'
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="nl-execute" onClick={execute} disabled={!query.trim() || loading}>
            {loading ? 'Executing...' : 'Execute Query'}
          </button>
          <span style={{ fontSize: 12, color: '#999' }}>Ctrl+Enter to run</span>
        </div>
      </div>

      <ErrorBox message={error} />

      {loading && <Loading text="LLM is generating and executing your query..." />}

      {result && (
        <>
          {result.visualization && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ margin: 0 }}>Visualization</h2>
                <button
                  type="button"
                  className="nl-execute"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                  onClick={() => setShowChart((v) => !v)}
                >
                  {showChart ? 'Hide chart' : 'View chart'}
                </button>
              </div>
              {showChart && (
                <div style={{ marginTop: 16 }}>
                  <NLQueryChart visualization={result.visualization} />
                </div>
              )}
            </div>
          )}

          <div className="card nl-results-card">
            <div className="nl-results-card-header">
              <h2 className="nl-results-card-title">Results ({result.result_count} items)</h2>
              {result.results && result.results.length > 0 && (
                <button
                  type="button"
                  className="nl-export-csv-btn"
                  onClick={handleExportCSV}
                  aria-label="Export results to CSV"
                >
                  Export to CSV
                </button>
              )}
            </div>
            {result.results && result.results.length > 0 ? (
              <div className="results-table-wrap">
                <table className="results-table">
                  <thead>
                    <tr>
                      {resultKeys.map((k) => (
                        <th key={k}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((row, i) => (
                      <tr key={i}>
                        {resultKeys.map((k) => (
                          <td
                            key={k}
                            title={
                              typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k] ?? '')
                            }
                          >
                            {typeof row[k] === 'object' ? JSON.stringify(row[k]) : String(row[k] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#999', padding: '12px 0' }}>No results returned</p>
            )}
          </div>

          <div className="card">
            <h2>Query Explanation</h2>
            <div className="summary-text">{result.explanation}</div>
            <div className="nl-meta">
              <span>
                Collection: <strong>{result.target_collection}</strong>
              </span>
              <span>
                Type: <strong>{result.is_aggregation ? 'Aggregation' : 'Find'}</strong>
              </span>
              <span>
                Results: <strong>{result.result_count}</strong>
              </span>
              <span>
                Time: <strong>{result.execution_time_ms}ms</strong>
              </span>
              {result.token_usage && (
                <span>
                  Tokens: <strong>{result.token_usage.input_tokens}</strong> in /{' '}
                  <strong>{result.token_usage.output_tokens}</strong> out
                </span>
              )}
              {result.llm_model && (
                <span>
                  Model: <strong>{result.llm_model}</strong>
                </span>
              )}
            </div>
            <div className="nl-generated-query-toggle">
              <button
                type="button"
                className="nl-toggle-query-btn"
                onClick={() => setShowGeneratedQuery((v) => !v)}
                aria-expanded={showGeneratedQuery}
              >
                {showGeneratedQuery ? 'Hide' : 'Show'} generated MongoDB query
              </button>
              {showGeneratedQuery && (
                <div
                  className="json-block nl-generated-query-block"
                  dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(
                      (() => {
                        try {
                          return JSON.stringify(JSON.parse(result.generated_query), null, 2);
                        } catch {
                          return result.generated_query;
                        }
                      })()
                    ),
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      {history.length > 0 && (
        <div className="card">
          <h2>Recent Queries</h2>
          {history.map((h, i) => (
            <div
              key={i}
              style={{
                padding: '6px 0',
                borderBottom: i < history.length - 1 ? '1px solid #f0f0f0' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{ fontSize: 13, cursor: 'pointer', color: '#4361ee' }}
                onClick={() => setQuery(h.query)}
              >
                {truncate(h.query, 60)}
              </span>
              <span style={{ fontSize: 11, color: '#999' }}>{formatTimestamp(h.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
