import { PROVIDERS } from '../data/providers';
import { ProviderLogo } from '../components/ProviderLogos';
import { IconHistory } from '../components/NavIcons';

export default function History({ results, onClear }) {
  if (!results.length) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <h1><IconHistory size={28} style={{ verticalAlign: -4, marginRight: 8 }} /> History</h1>
          <p>Full log of every benchmark run</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconHistory size={48} strokeWidth={1} color="var(--text-muted)" /></div>
            <h3>No history yet</h3>
            <p>After running benchmarks, every result will be logged here for review.</p>
          </div>
        </div>
      </div>
    );
  }

  const grouped = {};
  for (const r of [...results].reverse()) {
    const date = new Date(r.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(r);
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1><IconHistory size={28} style={{ verticalAlign: -4, marginRight: 8 }} /> History</h1>
        <p>{results.length} benchmark run{results.length !== 1 ? 's' : ''} recorded</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-danger" onClick={onClear} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          Clear History
        </button>
      </div>

      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 10, paddingLeft: 4,
          }}>
            {date}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((result, i) => {
              const provider = PROVIDERS[result.providerId];
              return (
                <div key={i} className="history-item fade-in">
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                    background: (provider?.color || '#7c3aed') + '20',
                    border: `1px solid ${provider?.color || '#7c3aed'}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0, color: provider?.color || '#7c3aed'
                  }}>
                    {result.providerId ? <ProviderLogo providerId={result.providerId} size={20} /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{result.modelName}</strong>
                      <span className={`provider-tag ${result.providerId}`}>{result.providerName}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(result.timestamp).toLocaleTimeString()} •{' '}
                      {result.tokens.input + result.tokens.output} tokens
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '4px 20px', textAlign: 'right' }}>
                    {[
                      { label: 'Latency', val: `${result.metrics.latency}ms` },
                      { label: 'Tok/s', val: result.metrics.throughput },
                      { label: 'Quality', val: `${result.metrics.quality}/100` },
                      { label: 'Cost/1K', val: `$${result.metrics.cost}` },
                    ].map(m => (
                      <div key={m.label}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {m.label}
                        </div>
                        <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {m.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
