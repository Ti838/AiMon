import { useState, useRef } from 'react';
import { PROVIDERS, BENCHMARK_PROMPTS, simulateBenchmark } from '../data/providers';
import { ProviderLogo } from '../components/ProviderLogos';
import { IconBenchmark, IconSpeed, IconBook, IconTarget } from '../components/NavIcons';

export default function Benchmark({ onResult, showToast }) {
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState('reasoning');
  const [customPrompt, setCustomPrompt] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState([]);
  const [done, setDone] = useState([]);
  const abortRef = useRef(false);

  const toggleModel = (modelId, providerId) => {
    const key = `${providerId}::${modelId}`;
    setSelectedModels(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isSelected = (modelId, providerId) =>
    selectedModels.includes(`${providerId}::${modelId}`);

  const selectAll = (providerId) => {
    const providerModels = PROVIDERS[providerId].models.map(m => `${providerId}::${m.id}`);
    setSelectedModels(prev => {
      const allSelected = providerModels.every(k => prev.includes(k));
      if (allSelected) return prev.filter(k => !providerModels.includes(k));
      return [...new Set([...prev, ...providerModels])];
    });
  };

  const handleRun = async () => {
    if (selectedModels.length === 0) {
      showToast('Select at least one model to benchmark', 'error');
      return;
    }
    const promptText = selectedPrompt === 'custom' ? customPrompt : BENCHMARK_PROMPTS.find(p => p.id === selectedPrompt)?.prompt;
    if (!promptText) {
      showToast('Please enter a custom prompt', 'error');
      return;
    }

    abortRef.current = false;
    setRunning(true);
    setProgress([]);
    setDone([]);

    const results = [];
    for (const key of selectedModels) {
      if (abortRef.current) break;
      const [pId, mId] = key.split('::');
      setProgress(prev => [...prev, key]);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      const result = simulateBenchmark(mId, pId);
      results.push(result);
      onResult(result);
      setDone(prev => [...prev, key]);
    }
    setRunning(false);
    showToast(`✅ Benchmarked ${results.length} model${results.length > 1 ? 's' : ''}`, 'success');
  };

  const handleStop = () => {
    abortRef.current = true;
    setRunning(false);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1><IconBenchmark size={28} style={{ verticalAlign: -4, marginRight: 8 }} /> Run Benchmark</h1>
        <p>Select models, choose a prompt, and fire — results appear instantly in the Dashboard</p>
      </div>

      <div className="grid-2">
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Prompt Selector */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>
              <IconBook size={18} style={{ verticalAlign: -4, marginRight: 6, color: 'var(--accent-color)' }} /> 
              Benchmark Prompt
            </div>
            <div className="form-group">
              <label className="form-label">Select Prompt Type</label>
              <select
                className="form-select"
                value={selectedPrompt}
                onChange={e => setSelectedPrompt(e.target.value)}
              >
                {BENCHMARK_PROMPTS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            {selectedPrompt !== 'custom' && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {BENCHMARK_PROMPTS.find(p => p.id === selectedPrompt)?.prompt}
              </div>
            )}
            {selectedPrompt === 'custom' && (
              <div className="form-group">
                <label className="form-label">Your Prompt</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter your custom benchmark prompt here…"
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  rows={5}
                />
              </div>
            )}
          </div>

          {/* Run control */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>
              <IconSpeed size={18} style={{ verticalAlign: -4, marginRight: 6, color: 'var(--accent-color)' }} /> 
              Controls
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button
                id="run-benchmark-btn"
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleRun}
                disabled={running || selectedModels.length === 0}
              >
                {running ? <><span className="spinner" />Running…</> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><IconBenchmark size={16} /> Run Benchmark ({selectedModels.length})</span>}
              </button>
              {running && (
                <button className="btn btn-danger" onClick={handleStop} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect></svg> Stop
                </button>
              )}
            </div>
            {running && (
              <div className="running-indicator">
                <span className="spinner" />
                <span>{done.length} / {selectedModels.length} complete — benchmarking {selectedModels[done.length]?.split('::')[1]}…</span>
              </div>
            )}
            {selectedModels.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                ← Select models from the panel on the right
              </div>
            )}

            {/* Progress list */}
            {(progress.length > 0) && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedModels.map(key => {
                  const [pId, mId] = key.split('::');
                  const model = PROVIDERS[pId]?.models.find(m => m.id === mId);
                  const isRunning = progress.includes(key) && !done.includes(key);
                  const isDone = done.includes(key);
                  const isPending = !progress.includes(key);
                  return (
                    <div key={key} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                      background: isDone ? 'rgba(34,197,94,0.08)' : isRunning ? 'rgba(124,58,237,0.1)' : 'var(--bg-surface)',
                      border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : isRunning ? 'rgba(124,58,237,0.3)' : 'var(--border)'}`,
                      fontSize: 13,
                    }}>
                      {isDone ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : isRunning ? (
                        <IconBenchmark size={14} color="var(--accent-color)" />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      )}
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {PROVIDERS[pId]?.name} / <strong style={{ color: 'var(--text-primary)' }}>{model?.name || mId}</strong>
                      </span>
                      {isRunning && <span className="spinner" style={{ marginLeft: 'auto', width: 14, height: 14 }} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — model selector */}
        <div className="card" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="section-header" style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', paddingBottom: 12, zIndex: 1 }}>
            <div>
              <div className="section-title">
                <IconTarget size={18} style={{ verticalAlign: -4, marginRight: 6, color: 'var(--accent-color)' }} /> 
                Select Models
              </div>
              <div className="section-subtitle">{selectedModels.length} selected</div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedModels([])}
            >
              Clear All
            </button>
          </div>

          {Object.values(PROVIDERS).map(provider => (
            <div key={provider.id} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ProviderLogo providerId={provider.id} size={18} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: provider.color }}>{provider.name}</span>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11 }}
                  onClick={() => selectAll(provider.id)}
                >
                  {provider.models.every(m => isSelected(m.id, provider.id)) ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {provider.models.map(model => {
                  const sel = isSelected(model.id, provider.id);
                  return (
                    <div
                      key={model.id}
                      onClick={() => toggleModel(model.id, provider.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${sel ? provider.color + '60' : 'var(--border)'}`,
                        background: sel ? provider.color + '15' : 'var(--bg-surface)',
                        cursor: 'pointer', transition: 'all 0.15s',
                        fontSize: 13,
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: 4,
                        border: `2px solid ${sel ? provider.color : 'var(--text-muted)'}`,
                        background: sel ? provider.color : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {sel && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{model.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {(model.contextWindow / 1000).toFixed(0)}K ctx • ${model.inputCost}/1K in
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
