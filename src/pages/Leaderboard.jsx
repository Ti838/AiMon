import { useState } from 'react';
import { PROVIDERS, METRICS } from '../data/providers';
import { IconTrophy, IconBenchmark, IconSpeed, IconTarget, IconMoney, IconBook } from '../components/NavIcons';

const METRIC_ICONS = {
  latency: <IconBenchmark size={14} />,
  throughput: <IconSpeed size={14} />,
  cost: <IconMoney size={14} />,
  quality: <IconTarget size={14} />,
  context: <IconBook size={14} />
};

function getRankBadgeClass(i) {
  if (i === 0) return 'gold';
  if (i === 1) return 'silver';
  if (i === 2) return 'bronze';
  return 'default';
}

export default function Leaderboard({ results }) {
  const [sortMetric, setSortMetric] = useState('quality');
  const [providerFilter, setProviderFilter] = useState('all');

  if (!results.length) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <h1><IconTrophy size={28} style={{ verticalAlign: -4, marginRight: 8 }} /> Leaderboard</h1>
          <p>Rankings update live as you run benchmarks</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconTrophy size={48} strokeWidth={1} color="var(--text-muted)" /></div>
            <h3>No data yet</h3>
            <p>Run some benchmarks first to populate the leaderboard.</p>
          </div>
        </div>
      </div>
    );
  }

  // Aggregate by model: average across all runs
  const aggregated = {};
  for (const r of results) {
    if (!aggregated[r.modelId]) {
      aggregated[r.modelId] = {
        modelId: r.modelId,
        modelName: r.modelName,
        providerId: r.providerId,
        providerName: r.providerName,
        runs: 0,
        totals: { latency: 0, throughput: 0, quality: 0, context: 0, cost: 0 },
      };
    }
    const agg = aggregated[r.modelId];
    agg.runs++;
    for (const m of Object.keys(agg.totals)) {
      agg.totals[m] += r.metrics[m] || 0;
    }
  }

  let rows = Object.values(aggregated).map(a => ({
    ...a,
    avg: Object.fromEntries(
      Object.entries(a.totals).map(([k, v]) => [k, k === 'cost' ? parseFloat((v / a.runs).toFixed(4)) : Math.round(v / a.runs)])
    ),
  }));

  if (providerFilter !== 'all') rows = rows.filter(r => r.providerId === providerFilter);

  const metric = METRICS[sortMetric];
  rows.sort((a, b) =>
    metric.lowerIsBetter ? a.avg[sortMetric] - b.avg[sortMetric] : b.avg[sortMetric] - a.avg[sortMetric]
  );

  const providers = [...new Set(results.map(r => r.providerId))];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1><IconTrophy size={28} style={{ verticalAlign: -4, marginRight: 8 }} /> Leaderboard</h1>
        <p>Ranked by {metric.label} — aggregated across all runs</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Sort By</label>
          <select className="form-select" style={{ width: 200 }} value={sortMetric} onChange={e => setSortMetric(e.target.value)}>
            {Object.values(METRICS).map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Provider</label>
          <select className="form-select" style={{ width: 160 }} value={providerFilter} onChange={e => setProviderFilter(e.target.value)}>
            <option value="all">All Providers</option>
            {providers.map(p => (
              <option key={p} value={p}>{PROVIDERS[p]?.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Header row */}
      <div className="leaderboard-row header" style={{ marginBottom: 8 }}>
        <div>#</div>
        <div>Model</div>
        <div style={{ textAlign: 'right' }}><IconBenchmark size={14} style={{ verticalAlign: -2 }} /> Latency</div>
        <div style={{ textAlign: 'right' }}><IconSpeed size={14} style={{ verticalAlign: -2 }} /> Tok/s</div>
        <div style={{ textAlign: 'right' }}><IconTarget size={14} style={{ verticalAlign: -2 }} /> Quality</div>
        <div style={{ textAlign: 'right' }}><IconMoney size={14} style={{ verticalAlign: -2 }} /> Cost/1K</div>
        <div style={{ textAlign: 'right' }}>Runs</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rows.map((r, i) => (
          <div key={r.modelId} className={`leaderboard-row slide-up stagger-${Math.min(i + 1, 6)}`}>
            <div>
              <span className={`rank-badge ${getRankBadgeClass(i)}`}>{i + 1}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{r.modelName}</div>
              <span className={`provider-tag ${r.providerId}`} style={{ marginTop: 4 }}>{r.providerName}</span>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: 13 }}>
              <span style={{ color: sortMetric === 'latency' ? 'var(--text-accent)' : 'var(--text-secondary)' }}>
                {r.avg.latency} ms
              </span>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: 13 }}>
              <span style={{ color: sortMetric === 'throughput' ? 'var(--text-accent)' : 'var(--text-secondary)' }}>
                {r.avg.throughput}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                <div className="progress-bar" style={{ width: 50 }}>
                  <div className="progress-fill" style={{ width: `${r.avg.quality}%` }} />
                </div>
                <span className="td-mono" style={{ color: sortMetric === 'quality' ? 'var(--text-accent)' : 'var(--text-secondary)' }}>
                  {r.avg.quality}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: 13 }}>
              <span style={{ color: sortMetric === 'cost' ? 'var(--text-accent)' : 'var(--text-secondary)' }}>
                ${r.avg.cost}
              </span>
            </div>
            <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
              {r.runs}×
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
