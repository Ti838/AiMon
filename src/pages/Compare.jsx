import { useEffect, useRef, useState } from 'react';
import { PROVIDERS, METRICS } from '../data/providers';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Legend
} from 'recharts';
import { IconScale, IconPointer, IconCrown, IconBenchmark, IconSpeed, IconTarget, IconMoney, IconBook } from '../components/NavIcons';
import { downloadCsv, exportElementAsPng } from '../lib/export';

const CHART_THEME = {
  axis: 'var(--chart-axis)',
  grid: 'var(--chart-grid)',
  legend: 'var(--chart-legend)',
};

const METRIC_ICONS = {
  latency: <IconBenchmark size={16} />,
  throughput: <IconSpeed size={16} />,
  cost: <IconMoney size={16} />,
  quality: <IconTarget size={16} />,
  context: <IconBook size={16} />
};

const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: 13,
      }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.fill || p.color, marginBottom: 3 }}>
            {p.name}: <strong>{p.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Compare({ results, showToast }) {
  const [selected, setSelected] = useState([]);
  const [reduceChartMotion, setReduceChartMotion] = useState(false);
  const compareChartsRef = useRef(null);

  useEffect(() => {
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const lowPowerDevice = (nav?.hardwareConcurrency || 8) <= 4 || (nav?.deviceMemory || 8) <= 4;
    const slowNetwork = !!conn?.saveData || /(^|[^0-9])2g|3g/.test(conn?.effectiveType || '');
    setReduceChartMotion(Boolean(prefersReducedMotion || lowPowerDevice || slowNetwork));
  }, []);

  if (!results.length) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <h1><IconScale size={28} style={{ verticalAlign: -4, marginRight: 8 }} /> Compare Models</h1>
          <p>Side-by-side comparison across all metrics</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconScale size={48} strokeWidth={1} color="var(--text-muted)" /></div>
            <h3>No data yet</h3>
            <p>Run benchmarks first to enable side-by-side model comparison.</p>
          </div>
        </div>
      </div>
    );
  }

  // Deduplicate by modelId, average metrics
  const modelMap = {};
  for (const r of results) {
    if (!modelMap[r.modelId]) {
      modelMap[r.modelId] = { ...r, count: 1 };
    } else {
      const entry = modelMap[r.modelId];
      entry.count++;
      for (const k of Object.keys(r.metrics)) {
        entry.metrics[k] = (entry.metrics[k] * (entry.count - 1) + r.metrics[k]) / entry.count;
      }
    }
  }

  const allModels = Object.values(modelMap);
  const compared = allModels.filter(m => selected.includes(m.modelId));

  const toggleSelect = (modelId) => {
    setSelected(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : prev.length < 4 ? [...prev, modelId] : prev
    );
  };

  // Data for radar
  const MAX = { quality: 100, throughput: 300, latency: 3000, cost: 0.08, context: 2000 };
  const radarDimensions = ['quality', 'throughput', 'context'];
  const radarData = radarDimensions.map(dim => {
    const entry = { dim: METRICS[dim]?.label };
    compared.forEach(m => {
      const v = m.metrics[dim];
      const max = MAX[dim] || 100;
      entry[m.modelName] = Math.round((v / max) * 100);
    });
    return entry;
  });

  // Data for each metric bar chart
  const metricBarData = Object.keys(METRICS).map(m => {
    const entry = { metric: METRICS[m].label };
    compared.forEach(model => {
      entry[model.modelName] = Math.round(model.metrics[m] * 100) / 100;
    });
    return entry;
  });

  const winner = (metric) => {
    if (!compared.length) return null;
    return compared.reduce((best, m) => {
      const better = METRICS[metric]?.lowerIsBetter
        ? m.metrics[metric] < best.metrics[metric]
        : m.metrics[metric] > best.metrics[metric];
      return better ? m : best;
    });
  };

  const handleExportCsv = () => {
    if (!compared.length) {
      showToast?.('Select models first', 'error');
      return;
    }
    downloadCsv('compare-models.csv', compared.map((m) => ({
      provider: m.providerName,
      model: m.modelName,
      latency_ms: Math.round(m.metrics.latency),
      throughput_tok_s: Math.round(m.metrics.throughput),
      quality: Math.round(m.metrics.quality),
      cost_per_1k: Number(m.metrics.cost).toFixed(4),
      context_k: Math.round(m.metrics.context),
    })));
    showToast?.('Compare CSV exported', 'success');
  };

  const handleExportPng = async () => {
    try {
      await exportElementAsPng(compareChartsRef.current, 'compare-charts.png');
      showToast?.('Compare PNG exported', 'success');
    } catch {
      showToast?.('Failed to export compare PNG', 'error');
    }
  };

  return (
    <div className="fade-in page-stack">
      <div className="page-header">
        <h1><IconScale size={28} style={{ verticalAlign: -4, marginRight: 8 }} /> Compare Models</h1>
        <p>Select up to 4 models for head-to-head comparison</p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>Export CSV</button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportPng}>Export Charts PNG</button>
        </div>
      </div>

      {/* Model picker */}
      <div className="card page-section">
        <div className="section-header">
          <div>
            <div className="section-title">Select Models to Compare</div>
            <div className="section-subtitle">{selected.length} / 4 selected</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setSelected([])}>
            Clear
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {allModels.map((m, idx) => {
            const sel = selected.includes(m.modelId);
            return (
              <div
                key={m.modelId}
                onClick={() => toggleSelect(m.modelId)}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${sel ? COLORS[selected.indexOf(m.modelId)] : 'var(--border)'}`,
                  background: sel ? COLORS[selected.indexOf(m.modelId)] + '20' : 'var(--bg-surface)',
                  cursor: 'pointer', transition: 'all 0.15s', fontSize: 13, fontWeight: 500,
                  color: sel ? 'var(--text-primary)' : 'var(--text-secondary)',
                  opacity: (!sel && selected.length >= 4) ? 0.4 : 1,
                }}
              >
                <span className={`provider-tag ${m.providerId}`} style={{ marginRight: 6, fontSize: 11 }}>
                  {m.providerName}
                </span>
                {m.modelName}
              </div>
            );
          })}
        </div>
      </div>

      {compared.length < 2 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconPointer size={48} strokeWidth={1} color="var(--text-muted)" /></div>
            <h3>Select at least 2 models</h3>
            <p>Pick models from the selector above to see a detailed side-by-side comparison</p>
          </div>
        </div>
      )}

      {compared.length >= 2 && (
        <>
          {/* Metric winner table */}
          <div className="card page-section">
            <div className="section-title" style={{ marginBottom: 16 }}>
              <IconScale size={20} style={{ verticalAlign: -4, marginRight: 8, color: 'var(--accent-color)' }} /> 
              Head-to-Head Metrics
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    {compared.map((m, i) => (
                      <th key={m.modelId} style={{ color: COLORS[i] }}>{m.modelName}</th>
                    ))}
                    <th>Winner <IconCrown size={14} style={{ verticalAlign: -2 }} /></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(METRICS).map(metric => {
                    const best = winner(metric.id);
                    return (
                      <tr key={metric.id}>
                        <td>
                          <span style={{ fontSize: 16, display: 'inline-flex', verticalAlign: -3, width: 24, color: 'var(--accent-color)' }}>
                            {METRIC_ICONS[metric.id]}
                          </span>{' '}
                          <strong style={{ color: 'var(--text-primary)' }}>{metric.label}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{metric.description}</div>
                        </td>
                        {compared.map((m, i) => (
                          <td key={m.modelId} className="td-mono" style={{
                            color: m.modelId === best?.modelId ? COLORS[i] : 'var(--text-secondary)',
                            fontWeight: m.modelId === best?.modelId ? 700 : 400,
                          }}>
                            {metric.id === 'cost'
                              ? `$${m.metrics[metric.id].toFixed(4)}`
                              : Math.round(m.metrics[metric.id])}
                            {' '}{metric.unit}
                          </td>
                        ))}
                        <td>
                          <div className="winner-cell">
                            <span className="winner-crown" style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center' }}>
                              <IconCrown size={16} />
                            </span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{best?.modelName}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="grid-2" ref={compareChartsRef}>
            <div className="card">
              <div className="section-title" style={{ marginBottom: 4 }}>Radar Comparison</div>
              <div className="section-subtitle" style={{ marginBottom: 12 }}>Quality · Throughput · Context (normalized)</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={CHART_THEME.grid} />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: CHART_THEME.axis, fontSize: 11 }} />
                    {compared.map((m, i) => (
                      <Radar
                        key={m.modelId}
                        name={m.modelName}
                        dataKey={m.modelName}
                        stroke={COLORS[i]}
                        fill={COLORS[i]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                        isAnimationActive={!reduceChartMotion}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 12, color: CHART_THEME.legend }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom: 4 }}>Latency vs Throughput</div>
              <div className="section-subtitle" style={{ marginBottom: 12 }}>Lower latency + higher tok/s = better</div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={compared.map((m, i) => ({
                      name: m.modelName.length > 14 ? m.modelName.slice(0, 12) + '…' : m.modelName,
                      Latency: m.metrics.latency,
                      Throughput: m.metrics.throughput,
                      fill: COLORS[i],
                    }))}
                    margin={{ top: 5, right: 10, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                    <XAxis dataKey="name" tick={{ fill: CHART_THEME.axis, fontSize: 11 }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fill: CHART_THEME.axis, fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: CHART_THEME.legend }} />
                    <Bar dataKey="Latency" fill="#7c3aed" radius={[4, 4, 0, 0]} isAnimationActive={!reduceChartMotion} />
                    <Bar dataKey="Throughput" fill="#06b6d4" radius={[4, 4, 0, 0]} isAnimationActive={!reduceChartMotion} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
