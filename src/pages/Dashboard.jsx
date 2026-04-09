import { useEffect, useRef, useState } from 'react';
import { PROVIDERS, METRICS } from '../data/providers';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell
} from 'recharts';
import { IconTest, IconBenchmark, IconTarget, IconMoney, IconCrown, IconGlobe, IconSpeed, IconBook } from '../components/NavIcons';
import { downloadCsv, exportElementAsPng } from '../lib/export';

const CHART_THEME = {
  axis: 'var(--chart-axis)',
  grid: 'var(--chart-grid)',
  legend: 'var(--chart-legend)',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.fill || p.stroke, marginBottom: 4 }}>
            {p.name}: <strong>{p.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ results, showToast }) {
  const [chartMetric, setChartMetric] = useState('latency');
  const [reduceChartMotion, setReduceChartMotion] = useState(false);
  const chartSectionRef = useRef(null);

  useEffect(() => {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const lowPowerDevice = (nav?.hardwareConcurrency || 8) <= 4 || (nav?.deviceMemory || 8) <= 4;
    const slowNetwork = !!conn?.saveData || /(^|[^0-9])2g|3g/.test(conn?.effectiveType || '');
    setReduceChartMotion(Boolean(prefersReducedMotion || lowPowerDevice || slowNetwork));
  }, []);

  const latestResults = results.slice(-20);
  const hasData = latestResults.length > 0;

  // KPI aggregates
  const totalRuns = results.length;
  const avgLatency = hasData
    ? Math.round(latestResults.reduce((a, b) => a + b.metrics.latency, 0) / latestResults.length)
    : 0;
  const avgQuality = hasData
    ? Math.round(latestResults.reduce((a, b) => a + b.metrics.quality, 0) / latestResults.length)
    : 0;
  const lowestCost = hasData
    ? Math.min(...latestResults.map(r => r.metrics.cost)).toFixed(4)
    : '—';

  // Best model
  const bySc = [...latestResults].sort((a, b) => b.metrics.quality - a.metrics.quality);
  const bestModel = bySc[0];

  // Bar chart data
  const barData = latestResults.map(r => ({
    name: r.modelName.length > 12 ? r.modelName.slice(0, 10) + '…' : r.modelName,
    value: r.metrics[chartMetric],
    provider: r.providerId,
    fill: PROVIDERS[r.providerId]?.color || '#7c3aed',
  }));

  // Radar data — compare last 3 unique models
  const uniqueModels = [];
  const seen = new Set();
  for (const r of [...latestResults].reverse()) {
    if (!seen.has(r.modelId)) {
      seen.add(r.modelId);
      uniqueModels.push(r);
      if (uniqueModels.length === 3) break;
    }
  }

  const radarMetrics = ['quality', 'throughput', 'context'];  
  const radarData = radarMetrics.map(m => {
    const entry = { metric: METRICS[m]?.label || m };
    uniqueModels.forEach(r => {
      const val = r.metrics[m];
      const max = { quality: 100, throughput: 300, context: 2000 }[m] || 100;
      entry[r.modelName] = Math.round((val / max) * 100);
    });
    return entry;
  });

  const RADAR_COLORS = ['#7c3aed', '#06b6d4', '#f59e0b'];

  const kpis = [
    { icon: <IconTest size={16} color="var(--accent-color)" />, label: 'Total Runs', value: totalRuns, delta: null },
    { icon: <IconBenchmark size={16} color="var(--accent-color)" />, label: 'Avg Latency', value: avgLatency ? `${avgLatency}ms` : '—', delta: null },
    { icon: <IconTarget size={16} color="var(--accent-color)" />, label: 'Avg Quality', value: avgQuality ? `${avgQuality}/100` : '—', delta: null },
    { icon: <IconMoney size={16} color="var(--accent-color)" />, label: 'Lowest Cost/1K', value: lowestCost !== '—' ? `$${lowestCost}` : '—', delta: null },
    { icon: <IconCrown size={16} color="var(--accent-color)" />, label: 'Best Model', value: bestModel?.modelName || '—', delta: null },
    { icon: <IconGlobe size={16} color="var(--accent-color)" />, label: 'Providers Tested', value: hasData ? new Set(latestResults.map(r => r.providerId)).size : 0, delta: null },
  ];

  const handleExportCsv = () => {
    if (!latestResults.length) {
      showToast?.('No benchmark data to export', 'error');
      return;
    }
    downloadCsv('dashboard-runs.csv', latestResults.map((r) => ({
      timestamp: r.timestamp,
      provider: r.providerName,
      model: r.modelName,
      latency_ms: r.metrics.latency,
      throughput_tok_s: r.metrics.throughput,
      quality: r.metrics.quality,
      cost_per_1k: r.metrics.cost,
      context_k: r.metrics.context,
    })));
    showToast?.('CSV exported', 'success');
  };

  const handleExportPng = async () => {
    try {
      await exportElementAsPng(chartSectionRef.current, 'dashboard-charts.png');
      showToast?.('PNG exported', 'success');
    } catch {
      showToast?.('Failed to export PNG', 'error');
    }
  };

  return (
    <div className="fade-in page-stack">
      <div className="page-header">
        <h1>Performance Dashboard</h1>
        <p>Overview of all benchmark runs across providers and models</p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>Export CSV</button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportPng}>Export Charts PNG</button>
        </div>
      </div>

      <div className="metrics-grid">
        {kpis.map((k, i) => (
          <div key={k.label} className={`metric-card slide-up stagger-${i + 1}`}>
            <div className="metric-icon">{k.icon}</div>
            <div className="metric-value">{String(k.value)}</div>
            <div className="metric-label">{k.label}</div>
          </div>
        ))}
      </div>

      {!hasData ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconSpeed size={48} strokeWidth={1} color="var(--text-muted)" /></div>
            <h3>No benchmarks yet</h3>
            <p>Head over to <strong>Run Benchmark</strong> to test your first AI model and see real performance data here.</p>
          </div>
        </div>
      ) : (
        <div className="grid-2 page-section" ref={chartSectionRef}>
          <div className="card">
            <div className="section-header">
              <div>
                <div className="section-title">Performance by Metric</div>
                <div className="section-subtitle">Compare across recent runs</div>
              </div>
              <select
                className="form-select"
                style={{ width: 'auto', fontSize: 12 }}
                value={chartMetric}
                onChange={e => setChartMetric(e.target.value)}
              >
                {Object.values(METRICS).map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="name" tick={{ fill: CHART_THEME.axis, fontSize: 11 }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fill: CHART_THEME.axis, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name={METRICS[chartMetric]?.label} radius={[4, 4, 0, 0]} isAnimationActive={!reduceChartMotion}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="section-header">
              <div>
                <div className="section-title">Model Radar</div>
                <div className="section-subtitle">Quality vs Throughput vs Context</div>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={CHART_THEME.grid} />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: CHART_THEME.axis, fontSize: 11 }} />
                  {uniqueModels.map((r, i) => (
                    <Radar
                      key={r.modelId}
                      name={r.modelName}
                      dataKey={r.modelName}
                      stroke={RADAR_COLORS[i]}
                      fill={RADAR_COLORS[i]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                      isAnimationActive={!reduceChartMotion}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16, color: CHART_THEME.legend }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {hasData && (
        <div className="card slide-up">
          <div className="section-header">
            <div>
              <div className="section-title">Recent Runs</div>
              <div className="section-subtitle">Last {Math.min(latestResults.length, 10)} benchmark results</div>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Provider</th>
                  <th><IconBenchmark size={14} style={{ verticalAlign: -2 }} /> Latency</th>
                  <th><IconSpeed size={14} style={{ verticalAlign: -2 }} /> Throughput</th>
                  <th><IconTarget size={14} style={{ verticalAlign: -2 }} /> Quality</th>
                  <th><IconMoney size={14} style={{ verticalAlign: -2 }} /> Cost /1K</th>
                  <th><IconBook size={14} style={{ verticalAlign: -2 }} /> Context</th>
                </tr>
              </thead>
              <tbody>
                {[...latestResults].reverse().slice(0, 10).map((r, i) => (
                  <tr key={i}>
                    <td className="winner-cell">
                      <strong style={{ color: 'var(--text-primary)' }}>{r.modelName}</strong>
                    </td>
                    <td>
                      <span className={`provider-tag ${r.providerId}`}>{r.providerName}</span>
                    </td>
                    <td className="td-mono">{r.metrics.latency} ms</td>
                    <td className="td-mono">{r.metrics.throughput} tok/s</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill" style={{ width: `${r.metrics.quality}%` }} />
                        </div>
                        <span className="td-mono">{r.metrics.quality}</span>
                      </div>
                    </td>
                    <td className="td-mono">${r.metrics.cost}</td>
                    <td className="td-mono">{r.metrics.context}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
