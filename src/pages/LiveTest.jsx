import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { PROVIDERS } from '../data/providers';
import { callProvider, fetchOpenRouterModels } from '../lib/api';
import { simulateBenchmark } from '../data/providers';
import { ProviderLogo } from '../components/ProviderLogos';
import { IconLive, IconSpeed, IconBenchmark, IconTarget, IconCrown } from '../components/NavIcons';

const LIVE_PRESET_STORAGE_KEY = 'aiperf_live_saved_selection';
const DEVICE_HINT_DISMISS_KEY = 'aiperf_device_hint_dismissed';
const AUTO_PRESET_APPLIED_KEY = 'aiperf_auto_preset_applied';

const PROMPT_SUGGESTIONS_DEFAULT = [
  'Explain quantum computing in simple terms',
  'Write a recursive Fibonacci in Python with memoization',
  'What are the ethical risks of autonomous AI agents?',
  'Create a haiku about machine learning',
  'Pros and cons of GraphQL vs REST APIs',
];

const PROMPT_SUGGESTIONS_MOBILE = [
  'Explain quantum computing simply',
  'Python quicksort example',
  'AI ethics top 3 risks',
  'Write a short ML haiku',
  'GraphQL vs REST quick compare',
];

function detectClientProfile() {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
  const ua = (nav?.userAgent || '').toLowerCase();
  const platform = nav?.userAgentData?.platform || nav?.platform || 'Unknown';
  const cpuCores = nav?.hardwareConcurrency || 0;
  const memoryGb = nav?.deviceMemory || 0;
  const networkType = conn?.effectiveType || '';
  const saveData = !!conn?.saveData;
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
  const isTablet = /ipad|tablet/i.test(ua);

  const lowSpec = isMobile || saveData || /(^|[^0-9])2g|3g/.test(networkType) || (cpuCores > 0 && cpuCores <= 4) || (memoryGb > 0 && memoryGb <= 4);
  const slowNetwork = saveData || /(^|[^0-9])2g|3g/.test(networkType);
  const recommendPreset = lowSpec ? 'cheapest' : 'reasoning';
  const reason = lowSpec
    ? 'Detected mobile or lower-power environment. Lower-cost preset is recommended.'
    : 'Detected desktop/high-capability environment. Reasoning preset is recommended.';

  return {
    platform,
    deviceType: isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop',
    cpuCores,
    memoryGb,
    networkType: networkType || 'unknown',
    slowNetwork,
    recommendPreset,
    reason,
  };
}

function scoreModelForPrompt(modelRecord, promptText, deviceProfile) {
  const text = `${modelRecord.model.name} ${modelRecord.model.id}`.toLowerCase();
  const prompt = (promptText || '').toLowerCase();

  const isCoding = /code|debug|bug|function|api|sql|typescript|python|javascript|algorithm/.test(prompt);
  const isMathReasoning = /reason|logic|math|proof|equation|derive|analyze/.test(prompt);
  const wantsFast = /fast|quick|short|brief|instant|latency|speed/.test(prompt);
  const wantsCheap = /cheap|low cost|budget|affordable|save|econom/.test(prompt);

  const price = (modelRecord.model.inputCost || 0) + (modelRecord.model.outputCost || 0);
  const context = modelRecord.model.contextWindow || 0;

  let score = 0;

  if (/gpt-4|claude|sonnet|opus|o1|grok|deepseek-r1/.test(text)) score += 4;
  if (/mini|flash|haiku|instant|small|light/.test(text)) score += 2;
  if (/code|coder|codestral|deepseek|qwen/.test(text) && isCoding) score += 8;
  if (/o1|reason|r1|sonnet|opus|gpt-4/.test(text) && isMathReasoning) score += 8;
  if (wantsFast && /flash|haiku|mini|instant|small/.test(text)) score += 6;
  if (wantsCheap && price > 0) score += Math.max(0, 5 - price * 500);

  if (context >= 128000) score += 1;
  if (deviceProfile?.deviceType === 'Mobile' && /mini|flash|haiku|small|light|instant/.test(text)) score += 4;
  if (deviceProfile?.slowNetwork && /mini|flash|haiku|small|light|instant/.test(text)) score += 4;
  if (deviceProfile?.slowNetwork && price > 0) score += Math.max(0, 3 - price * 300);

  // Slight penalty for very expensive models unless explicitly reasoning-heavy
  if (price > 0.03 && !isMathReasoning) score -= 4;

  return score;
}

function VirtualModelList({ models, providerId, selectedModels, addModel, maxSelectedReached }) {
  const rowHeight = 44;
  const viewportHeight = 260;
  const overscan = 6;
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = models.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
  const endIndex = Math.min(models.length, startIndex + visibleCount);
  const visible = models.slice(startIndex, endIndex);

  return (
    <div
      style={{ height: viewportHeight, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visible.map((model, i) => {
          const index = startIndex + i;
          const top = index * rowHeight;
          const key = `${providerId}::${model.id}`;
          const alreadyAdded = selectedModels.includes(key);
          return (
            <button
              key={model.id}
              className="btn btn-secondary btn-sm"
              style={{
                position: 'absolute',
                top,
                left: 6,
                right: 6,
                height: rowHeight - 6,
                justifyContent: 'space-between',
                fontSize: 12,
                opacity: alreadyAdded ? 0.45 : 1,
                textAlign: 'left',
                padding: '0 10px',
              }}
              disabled={alreadyAdded || maxSelectedReached}
              onClick={() => addModel(providerId, model.id, model)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>{alreadyAdded ? '✓' : '+'}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{model.name}</span>
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                {model.contextWindow ? `${Math.round(model.contextWindow / 1000)}K` : '—'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Streaming text panel for one model
function ModelPanel({ slot, onRemove }) {
  const { modelId, providerId, modelName, providerName, status, text, metrics, error } = slot;
  const provider = PROVIDERS[providerId];
  const textRef = useRef(null);

  // Auto-scroll to bottom as tokens arrive
  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [text]);

  const statusColor = {
    idle: 'var(--text-muted)',
    waiting: 'var(--warning)',
    streaming: 'var(--text-accent)',
    done: 'var(--success)',
    error: 'var(--error)',
  }[status] || 'var(--text-muted)';

  const statusLabel = {
    idle: 'Idle',
    waiting: 'Waiting…',
    streaming: 'Streaming',
    done: 'Done',
    error: 'Error',
  }[status] || status;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card)',
      border: `1px solid ${status === 'streaming' ? 'rgba(124,58,237,0.5)' : status === 'done' ? 'rgba(34,197,94,0.3)' : status === 'error' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      transition: 'border-color 0.3s',
      boxShadow: status === 'streaming' ? 'var(--shadow-glow)' : 'none',
      minHeight: 360,
    }}>
      {/* Panel header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-surface)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: (provider?.color || '#7c3aed') + '20',
          border: `1px solid ${provider?.color || '#7c3aed'}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>
          {providerId ? <ProviderLogo providerId={providerId} size={18} /> : 
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {modelName}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{providerName}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
          {status === 'streaming' && <span className="spinner" style={{ width: 12, height: 12 }} />}
          <button
            onClick={onRemove}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px',
              borderRadius: 4,
            }}
            title="Remove panel"
          >
            ×
          </button>
        </div>
      </div>

      {/* Metrics bar */}
      {(status === 'streaming' || status === 'done') && metrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: 'var(--border)',
        }}>
          {[
            { label: 'TTFT', value: metrics.ttft ? `${metrics.ttft}ms` : '—' },
            { label: 'Tok/s', value: metrics.tokensPerSec ? `${metrics.tokensPerSec.toFixed(1)}` : '—' },
            { label: 'Tokens', value: metrics.outputTokens || '—' },
            { label: 'Total', value: metrics.totalTime ? `${(metrics.totalTime / 1000).toFixed(1)}s` : '—' },
          ].map(m => (
            <div key={m.label} style={{
              padding: '8px 10px', background: 'var(--bg-surface)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--text-primary)' }}>
                {m.value}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response text */}
      <div
        ref={textRef}
        style={{
          flex: 1, padding: '16px', overflowY: 'auto', maxHeight: 400,
          fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)',
          fontFamily: status === 'error' ? 'inherit' : 'inherit',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}
      >
        {error ? (
          <div style={{ color: 'var(--error)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Error
            </div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono' }}>{error}</div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
              Make sure your API key is set correctly in API Keys
            </div>
          </div>
        ) : text ? (
          <>
            <span style={{ color: 'var(--text-primary)' }}>{text}</span>
            {status === 'streaming' && (
              <span style={{
                display: 'inline-block', width: 2, height: '1em',
                background: 'var(--text-accent)', marginLeft: 1,
                animation: 'cursorBlink 0.8s step-end infinite',
                verticalAlign: 'text-bottom',
              }} />
            )}
          </>
        ) : status === 'waiting' ? (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Waiting for first token…</div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Response will appear here</div>
        )}
      </div>

      {/* Cost estimate footer */}
      {status === 'done' && metrics?.estimatedCost != null && (
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          fontSize: 12,
          color: 'var(--text-muted)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>Estimated cost</span>
          <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', fontWeight: 600 }}>
            ~${metrics.estimatedCost.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main LiveTest Page ────────────────────────────────────────────────────
export default function LiveTest({ apiKeys, onResult, showToast }) {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState([]);
  const [slots, setSlots] = useState([]);
  const [running, setRunning] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [customOpenRouterModel, setCustomOpenRouterModel] = useState('');
  const [openRouterCatalog, setOpenRouterCatalog] = useState([]);
  const [openRouterCatalogLoading, setOpenRouterCatalogLoading] = useState(false);
  const [openRouterCatalogError, setOpenRouterCatalogError] = useState('');
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerProviderFilter, setPickerProviderFilter] = useState('all');
  const [pickerSort, setPickerSort] = useState('name-asc');
  const [pickerGiantOnly, setPickerGiantOnly] = useState(false);
  const [savedSelection, setSavedSelection] = useState(() => {
    try {
      const raw = localStorage.getItem(LIVE_PRESET_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [deviceProfile, setDeviceProfile] = useState(null);
  const [hideDeviceHint, setHideDeviceHint] = useState(() => {
    try {
      return localStorage.getItem(DEVICE_HINT_DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const pickerSearchRef = useRef(null);
  const abortRef = useRef(false);

  const DEFAULT_MAX_PANELS = 4;
  const MAX_PANELS = deviceProfile?.deviceType === 'Mobile' ? 2 : DEFAULT_MAX_PANELS;
  const MAX_MODELS_PER_PROVIDER = 200;
  const openRouterModels = openRouterCatalog.length
    ? openRouterCatalog
    : (PROVIDERS.openrouter?.models || []);

  const visibleProviders = useMemo(() => {
    const list = Object.values(PROVIDERS);
    if (pickerProviderFilter === 'all') return list;
    return list.filter((p) => p.id === pickerProviderFilter);
  }, [pickerProviderFilter]);

  const filterAndSortModels = useCallback((models) => {
    const query = pickerQuery.trim().toLowerCase();
    const filtered = models.filter((m) => {
      const matchesQuery = !query || m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query);
      const matchesSize = !pickerGiantOnly || (m.contextWindow || 0) >= 128000;
      return matchesQuery && matchesSize;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (pickerSort === 'context-desc') return (b.contextWindow || 0) - (a.contextWindow || 0);
      if (pickerSort === 'price-asc') {
        const aPrice = (a.inputCost || 0) + (a.outputCost || 0);
        const bPrice = (b.inputCost || 0) + (b.outputCost || 0);
        return aPrice - bPrice;
      }
      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [pickerQuery, pickerGiantOnly, pickerSort]);

  const allModelRecords = useMemo(() => {
    const records = [];
    Object.values(PROVIDERS).forEach((provider) => {
      const models = provider.id === 'openrouter' ? openRouterModels : provider.models;
      models.forEach((model) => {
        records.push({
          providerId: provider.id,
          providerName: provider.name,
          model,
        });
      });
    });
    return records;
  }, [openRouterModels]);

  useEffect(() => {
    setDeviceProfile(detectClientProfile());
  }, []);

  useEffect(() => {
    if (!deviceProfile?.slowNetwork) return;
    setPickerSort('price-asc');
    setPickerProviderFilter('openrouter');
    setPickerGiantOnly(false);
  }, [deviceProfile]);

  useEffect(() => {
    if (!showPicker) return;
    if (!apiKeys.openrouter) return;
    if (openRouterCatalogLoading || openRouterCatalog.length > 0) return;

    let active = true;
    setOpenRouterCatalogLoading(true);
    setOpenRouterCatalogError('');

    fetchOpenRouterModels(apiKeys.openrouter)
      .then((models) => {
        if (!active) return;
        setOpenRouterCatalog(models);
      })
      .catch((err) => {
        if (!active) return;
        setOpenRouterCatalogError(err?.message || 'Failed to load OpenRouter catalog');
      })
      .finally(() => {
        if (!active) return;
        setOpenRouterCatalogLoading(false);
      });

    return () => {
      active = false;
    };
  }, [showPicker, apiKeys.openrouter, openRouterCatalogLoading, openRouterCatalog.length]);

  useEffect(() => {
    if (!showPicker) return;
    requestAnimationFrame(() => {
      pickerSearchRef.current?.focus();
    });
  }, [showPicker]);

  useEffect(() => {
    const onKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowPicker(true);
      }
      if (e.key === 'Escape' && showPicker) {
        e.preventDefault();
        setShowPicker(false);
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [showPicker]);

  useEffect(() => {
    if (!deviceProfile) return;
    if (!allModelRecords.length) return;
    if (slots.length > 0) return;

    const alreadyApplied = localStorage.getItem(AUTO_PRESET_APPLIED_KEY) === '1';
    if (alreadyApplied) return;

    applyPreset(deviceProfile.recommendPreset, { silent: true });
    localStorage.setItem(AUTO_PRESET_APPLIED_KEY, '1');
    showToast(`Auto-applied ${deviceProfile.recommendPreset} preset for this device`, 'info');
  }, [deviceProfile, allModelRecords.length, slots.length]);

  const addModel = (providerId, modelId, modelMeta = null) => {
    const key = `${providerId}::${modelId}`;
    if (selectedModels.includes(key)) return;
    if (selectedModels.length >= MAX_PANELS) {
      showToast(`Max ${MAX_PANELS} models at once`, 'error');
      return;
    }
    const provider = PROVIDERS[providerId];
    const providerModels = providerId === 'openrouter' ? openRouterModels : provider.models;
    const model = modelMeta || providerModels.find(m => m.id === modelId);
    setSelectedModels(prev => [...prev, key]);
    setSlots(prev => [...prev, {
      key,
      providerId,
      modelId,
      modelName: model?.name || modelId,
      providerName: provider?.name || providerId,
      inputCost: model?.inputCost || 0,
      outputCost: model?.outputCost || 0,
      contextWindow: model?.contextWindow || 0,
      status: 'idle',
      text: '',
      metrics: null,
      error: null,
    }]);
  };

  const replaceSelection = (records) => {
    const next = records.slice(0, MAX_PANELS).map((r) => {
      const key = `${r.providerId}::${r.model.id}`;
      return {
        key,
        providerId: r.providerId,
        modelId: r.model.id,
        modelName: r.model.name || r.model.id,
        providerName: r.providerName || PROVIDERS[r.providerId]?.name || r.providerId,
        inputCost: r.model.inputCost || 0,
        outputCost: r.model.outputCost || 0,
        contextWindow: r.model.contextWindow || 0,
        status: 'idle',
        text: '',
        metrics: null,
        error: null,
      };
    });

    setSelectedModels(next.map((s) => s.key));
    setSlots(next);
    showToast(`Preset applied with ${next.length} model${next.length !== 1 ? 's' : ''}`, 'success');
  };

  const applyPreset = (presetId, options = {}) => {
    const { silent = false } = options;
    const tokensByName = {
      reasoning: /o1|reasoning|sonnet|opus|gpt-4|claude|grok|deepseek-r1/i,
      coding: /code|codestral|gpt-4|claude|deepseek|qwen|llama|coder/i,
    };

    let candidates = allModelRecords;
    if (presetId === 'largest') {
      candidates = [...allModelRecords].sort((a, b) => (b.model.contextWindow || 0) - (a.model.contextWindow || 0));
    } else if (presetId === 'cheapest') {
      candidates = [...allModelRecords].sort((a, b) => {
        const aPrice = (a.model.inputCost || 0) + (a.model.outputCost || 0);
        const bPrice = (b.model.inputCost || 0) + (b.model.outputCost || 0);
        return aPrice - bPrice;
      });
    } else {
      const re = tokensByName[presetId];
      candidates = allModelRecords.filter((r) => re.test(r.model.name) || re.test(r.model.id));
      if (!candidates.length) candidates = allModelRecords;
    }

    const capped = candidates.slice(0, MAX_PANELS);
    replaceSelection(capped);
    if (!silent) {
      showToast(`Applied ${presetId} preset`, 'success');
    }
  };

  const autoDetectModels = () => {
    if (!allModelRecords.length) {
      showToast('Model catalog is empty right now', 'error');
      return;
    }

    const liveCandidates = allModelRecords.filter((r) => !!apiKeys[r.providerId]);
    const pool = liveCandidates.length ? liveCandidates : allModelRecords;

    const scored = [...pool]
      .map((r) => ({ record: r, score: scoreModelForPrompt(r, prompt, deviceProfile) }))
      .sort((a, b) => b.score - a.score);

    const selected = [];
    const usedProviders = new Set();

    // First pass: diversify providers for balanced comparison.
    for (const item of scored) {
      if (selected.length >= MAX_PANELS) break;
      if (usedProviders.has(item.record.providerId)) continue;
      selected.push(item.record);
      usedProviders.add(item.record.providerId);
    }

    // Second pass: fill remaining slots by highest score.
    for (const item of scored) {
      if (selected.length >= MAX_PANELS) break;
      if (selected.some((s) => s.providerId === item.record.providerId && s.model.id === item.record.model.id)) continue;
      selected.push(item.record);
    }

    if (!selected.length) {
      showToast('Could not auto-detect suitable models', 'error');
      return;
    }

    replaceSelection(selected);
    showToast(`Auto-detected ${selected.length} model${selected.length !== 1 ? 's' : ''}`, 'success');
  };

  const saveCurrentSelection = () => {
    const payload = slots.map((s) => ({
      providerId: s.providerId,
      providerName: s.providerName,
      model: {
        id: s.modelId,
        name: s.modelName,
        contextWindow: s.contextWindow || 0,
        inputCost: s.inputCost || 0,
        outputCost: s.outputCost || 0,
      },
    }));
    setSavedSelection(payload);
    localStorage.setItem(LIVE_PRESET_STORAGE_KEY, JSON.stringify(payload));
    showToast('Current selection saved', 'success');
  };

  const loadSavedSelection = () => {
    if (!savedSelection.length) {
      showToast('No saved selection yet', 'error');
      return;
    }
    replaceSelection(savedSelection);
  };

  const dismissDeviceHint = () => {
    setHideDeviceHint(true);
    localStorage.setItem(DEVICE_HINT_DISMISS_KEY, '1');
  };

  const removeModel = (key) => {
    setSelectedModels(prev => prev.filter(k => k !== key));
    setSlots(prev => prev.filter(s => s.key !== key));
  };

  const addCustomOpenRouterModel = () => {
    const modelId = customOpenRouterModel.trim();
    if (!modelId) {
      showToast('Enter an OpenRouter model ID first', 'error');
      return;
    }
    if (!modelId.includes('/')) {
      showToast('Use provider/model format, example: openai/gpt-4o', 'error');
      return;
    }
    addModel('openrouter', modelId, {
      id: modelId,
      name: modelId,
      contextWindow: 0,
      inputCost: 0,
      outputCost: 0,
    });
    setCustomOpenRouterModel('');
  };

  const updateSlot = useCallback((key, patch) => {
    setSlots(prev => prev.map(s => s.key === key ? { ...s, ...patch } : s));
  }, []);

  const handleSend = async () => {
    if (!prompt.trim()) { showToast('Enter a prompt first', 'error'); return; }
    if (slots.length === 0) {
      autoDetectModels();
      showToast('Models auto-selected. Press send again to run.', 'info');
      return;
    }

    abortRef.current = false;
    setRunning(true);

    // Reset all panels
    setSlots(prev => prev.map(s => ({
      ...s, status: 'waiting', text: '', metrics: null, error: null,
    })));

    // Run all models concurrently
    const runs = slots.map(async (slot) => {
      const { key, providerId, modelId, modelName, inputCost, outputCost, contextWindow } = slot;
      const apiKey = apiKeys[providerId];
      const provider = PROVIDERS[providerId];
      const model = provider?.models.find(m => m.id === modelId);

      const startTime = performance.now();
      let firstTokenTime = null;
      let tokenCount = 0;
      let text = '';

      const onToken = (chunk) => {
        if (abortRef.current) return;
        if (!firstTokenTime) {
          firstTokenTime = performance.now();
          const ttft = Math.round(firstTokenTime - startTime);
          updateSlot(key, { status: 'streaming', metrics: { ttft, tokensPerSec: 0, outputTokens: 0, totalTime: ttft } });
        }
        text += chunk;
        tokenCount++;
        const elapsed = performance.now() - startTime;
        const tokensPerSec = tokenCount / (elapsed / 1000);
        updateSlot(key, {
          text,
          metrics: {
            ttft: Math.round(firstTokenTime - startTime),
            tokensPerSec,
            outputTokens: tokenCount,
            totalTime: Math.round(elapsed),
          },
        });
      };

      try {
        if (!apiKey) {
          // Simulate streaming for demo
          showToast(`No API key for ${PROVIDERS[providerId]?.name} — using simulation`, 'info');
          const sim = simulateBenchmark(modelId, providerId);
          const fakeResponse = generateSimulatedResponse(prompt, modelId);
          updateSlot(key, { status: 'streaming' });
          for (const char of fakeResponse) {
            if (abortRef.current) break;
            onToken(char);
            await sleep(12 + Math.random() * 8);
          }
        } else {
          await callProvider({ providerId, modelId, prompt, apiKey, onToken });
        }

        const totalTime = Math.round(performance.now() - startTime);
        const ttft = firstTokenTime ? Math.round(firstTokenTime - startTime) : totalTime;
        const tokensPerSec = tokenCount / (totalTime / 1000);
        const inputTokens = Math.ceil(prompt.split(/\s+/).length * 1.3);
        const finalInputCost = inputCost || model?.inputCost || 0;
        const finalOutputCost = outputCost || model?.outputCost || 0;
        const estimatedCost = model
          ? ((inputTokens / 1000) * finalInputCost) + ((tokenCount / 1000) * finalOutputCost)
          : ((inputTokens / 1000) * finalInputCost) + ((tokenCount / 1000) * finalOutputCost);

        const finalMetrics = { ttft, tokensPerSec, outputTokens: tokenCount, totalTime, estimatedCost };

        updateSlot(key, { status: 'done', metrics: finalMetrics });

        // Save to history
        onResult({
          modelId,
          providerId,
          modelName,
          providerName: provider?.name,
          timestamp: new Date().toISOString(),
          metrics: {
            latency: ttft,
            throughput: Math.round(tokensPerSec),
            quality: 85 + Math.floor(Math.random() * 15), // placeholder
            context: Math.round(((contextWindow || model?.contextWindow || 8000) / 1000)),
            cost: parseFloat((estimatedCost * 1000).toFixed(4)),
          },
          tokens: { input: inputTokens, output: tokenCount },
          success: true,
        });

      } catch (err) {
        if (!abortRef.current) {
          updateSlot(key, { status: 'error', error: err.message });
          showToast(`${modelName}: ${err.message}`, 'error');
        }
      }
    });

    await Promise.allSettled(runs);
    setRunning(false);
  };

  const handleStop = () => {
    abortRef.current = true;
    setRunning(false);
    setSlots(prev => prev.map(s =>
      s.status === 'streaming' || s.status === 'waiting'
        ? { ...s, status: 'idle' }
        : s
    ));
  };

  const handleClear = () => {
    setSlots(prev => prev.map(s => ({ ...s, text: '', status: 'idle', metrics: null, error: null })));
  };

  const promptSuggestions = deviceProfile?.deviceType === 'Mobile'
    ? PROMPT_SUGGESTIONS_MOBILE
    : PROMPT_SUGGESTIONS_DEFAULT;

  // Grid columns based on panel count
  const cols = Math.min(slots.length, 2);
  const gridCols = cols === 0 ? '1fr' : cols === 1 ? '1fr' : 'repeat(2, 1fr)';

  return (
    <div className="fade-in">
      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <div className="page-header">
        <h1><IconLive size={28} style={{ verticalAlign: -4, marginRight: 8 }} /> Live Test</h1>
        <p>Type a prompt and compare real AI responses streaming side-by-side with live metrics</p>
      </div>

      {deviceProfile && !hideDeviceHint && (
        <div className="card" style={{ marginBottom: 14, padding: 14 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Device detected: {deviceProfile.deviceType} on {deviceProfile.platform}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {deviceProfile.reason} ({deviceProfile.cpuCores || 'n/a'} cores, {deviceProfile.memoryGb || 'n/a'}GB RAM, {deviceProfile.networkType})
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => applyPreset(deviceProfile.recommendPreset)}>
              Apply Recommended Preset
            </button>
            <button className="btn btn-secondary btn-sm" onClick={dismissDeviceHint}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {running && deviceProfile?.slowNetwork && (
        <div className="card" style={{ marginBottom: 14, padding: 12, borderColor: 'rgba(245,158,11,0.45)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Slow network detected ({deviceProfile.networkType}). For smoother streaming use 1-2 models, keep prompt concise, or apply the Cheapest preset.
          </div>
        </div>
      )}

      {/* Prompt input area */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Your Prompt</label>
          <textarea
            id="live-prompt-input"
            className="form-textarea"
            placeholder="Ask anything… e.g. 'Explain quantum entanglement simply' or 'Write a Python quicksort'"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !running) handleSend();
            }}
            style={{ resize: 'vertical' }}
            disabled={running}
          />
          <div className="form-hint">Ctrl+Enter to send</div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            id="live-send-btn"
            className="btn btn-primary"
            onClick={handleSend}
            disabled={running || slots.length === 0 || !prompt.trim()}
            style={{ minWidth: 140 }}
          >
            {running
              ? <><span className="spinner" /> Streaming…</>
              : <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconSpeed size={16} /> Send to {slots.length || '?'} model{slots.length !== 1 ? 's' : ''}</span>
            }
          </button>

          {running && (
            <button className="btn btn-danger" onClick={handleStop} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect></svg> Stop
            </button>
          )}

          {!running && slots.some(s => s.text) && (
            <button className="btn btn-secondary" onClick={handleClear} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              Clear Responses
            </button>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button
              id="add-model-btn"
              className="btn btn-secondary"
              onClick={() => setShowPicker(p => !p)}
              disabled={running || selectedModels.length >= MAX_PANELS}
              title="Open model picker (Ctrl/Cmd+K)"
            >
              ＋ Add Model
            </button>
          </div>
        </div>

        {/* Quick prompt suggestions */}
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={autoDetectModels} disabled={running}>
            Auto Detect Models
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('reasoning')} disabled={running}>Preset: Reasoning</button>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('coding')} disabled={running}>Preset: Coding</button>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('cheapest')} disabled={running}>Preset: Cheapest</button>
          <button className="btn btn-secondary btn-sm" onClick={() => applyPreset('largest')} disabled={running}>Preset: Largest Context</button>
          <button className="btn btn-secondary btn-sm" onClick={saveCurrentSelection} disabled={running || slots.length === 0}>Save Selection</button>
          <button className="btn btn-secondary btn-sm" onClick={loadSavedSelection} disabled={running}>Load Saved</button>
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {promptSuggestions.map(suggestion => (
            <button
              key={suggestion}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12 }}
              onClick={() => setPrompt(suggestion)}
              disabled={running}
            >
              {suggestion.length > 40 ? suggestion.slice(0, 38) + '…' : suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Model picker dropdown */}
      {showPicker && (
        <div className="card" style={{ marginBottom: 20, maxHeight: 360, overflowY: 'auto' }}>
          <div className="section-header" style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', paddingBottom: 12, zIndex: 1 }}>
            <div className="section-title">Select a Model to Add</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowPicker(false)}>✕ Close</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) auto auto auto', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <input
              ref={pickerSearchRef}
              type="text"
              className="form-input"
              placeholder="Search by model name or id"
              value={pickerQuery}
              onChange={e => setPickerQuery(e.target.value)}
              disabled={running}
              style={{ minWidth: 180 }}
            />
            <select
              className="form-select"
              value={pickerProviderFilter}
              onChange={e => setPickerProviderFilter(e.target.value)}
              disabled={running}
            >
              <option value="all">All providers</option>
              {Object.values(PROVIDERS).map(provider => (
                <option key={provider.id} value={provider.id}>{provider.name}</option>
              ))}
            </select>
            <select
              className="form-select"
              value={pickerSort}
              onChange={e => setPickerSort(e.target.value)}
              disabled={running}
            >
              <option value="name-asc">Sort: Name</option>
              <option value="context-desc">Sort: Context (High to Low)</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
            </select>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={pickerGiantOnly}
                onChange={e => setPickerGiantOnly(e.target.checked)}
                disabled={running}
              />
              Giant only (&gt;=128K)
            </label>
          </div>

          <div style={{ marginBottom: 16, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>Test Any Global Model (OpenRouter)</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Add any OpenRouter model ID in provider/model format, for example: anthropic/claude-3.5-sonnet
            </div>
            {apiKeys.openrouter && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                {openRouterCatalogLoading
                  ? 'Loading latest OpenRouter model catalog...'
                  : openRouterCatalogError
                    ? `Catalog load failed: ${openRouterCatalogError}`
                    : openRouterCatalog.length
                      ? `Loaded ${openRouterCatalog.length} OpenRouter models`
                      : 'Using built-in OpenRouter presets'}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. openai/gpt-4o or deepseek/deepseek-chat"
                value={customOpenRouterModel}
                onChange={e => setCustomOpenRouterModel(e.target.value)}
                disabled={running || selectedModels.length >= MAX_PANELS}
                style={{ flex: 1, minWidth: 220, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={addCustomOpenRouterModel}
                disabled={running || selectedModels.length >= MAX_PANELS}
              >
                Add Custom Model
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {openRouterCatalogLoading && pickerProviderFilter === 'all' && (
              <div className="picker-skeleton-list" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="picker-skeleton-item" />
                ))}
              </div>
            )}
            {visibleProviders.map(provider => {
              const rawModels = provider.id === 'openrouter' ? openRouterModels : provider.models;
              const filteredModels = filterAndSortModels(rawModels);
              const models = filteredModels.slice(0, MAX_MODELS_PER_PROVIDER);
              return (
              <div key={provider.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ProviderLogo providerId={provider.id} size={18} />
                  </div>
                  <span style={{ fontWeight: 700, color: provider.color }}>{provider.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 8px', border: '1px solid var(--border)', borderRadius: 999 }}>
                    {filteredModels.length} shown
                  </span>
                  {!apiKeys[provider.id] && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
                      No API key
                    </span>
                  )}
                </div>
                {models.length > 80 ? (
                  <VirtualModelList
                    models={models}
                    providerId={provider.id}
                    selectedModels={selectedModels}
                    addModel={addModel}
                    maxSelectedReached={selectedModels.length >= MAX_PANELS}
                  />
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {models.map(model => {
                      const key = `${provider.id}::${model.id}`;
                      const alreadyAdded = selectedModels.includes(key);
                      return (
                        <button
                          key={model.id}
                          className={`btn btn-secondary btn-sm ${alreadyAdded ? '' : ''}`}
                          style={{
                            fontSize: 12,
                            opacity: alreadyAdded ? 0.4 : 1,
                            borderColor: alreadyAdded ? 'transparent' : undefined,
                            background: alreadyAdded ? 'var(--bg-surface)' : undefined,
                          }}
                          disabled={alreadyAdded || selectedModels.length >= MAX_PANELS}
                          onClick={() => addModel(provider.id, model.id, model)}
                        >
                          {alreadyAdded ? '✓ ' : '＋ '}{model.name}
                        </button>
                      );
                    })}
                  </div>
                )}
                {filteredModels.length > MAX_MODELS_PER_PROVIDER && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    Showing first {MAX_MODELS_PER_PROVIDER} models. Refine search/filter to narrow further.
                  </div>
                )}
              </div>
            )})}
          </div>
        </div>
      )}

      {/* Empty state */}
      {slots.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconLive size={48} strokeWidth={1} color="var(--text-muted)" /></div>
            <h3>Add models to start</h3>
            <p>Click <strong>＋ Add Model</strong> above to choose which AI models to test live side-by-side. Up to {MAX_PANELS} at once.</p>
            <button className="btn btn-primary" onClick={() => setShowPicker(true)}>
              ＋ Add Your First Model
            </button>
          </div>
        </div>
      )}

      {/* Panels grid */}
      {slots.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: slots.length === 1 ? '1fr' : slots.length === 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: 16,
        }}>
          {slots.map(slot => (
            <ModelPanel
              key={slot.key}
              slot={slot}
              onRemove={() => removeModel(slot.key)}
            />
          ))}
        </div>
      )}

      {/* Live metrics summary (shown when at least one is done) */}
      {slots.some(s => s.status === 'done') && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>
            <IconTarget size={18} style={{ verticalAlign: -4, marginRight: 6, color: 'var(--accent-color)' }} /> 
            Run Summary
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>TTFT <IconBenchmark size={14} style={{ verticalAlign: -2 }} /></th>
                  <th>Throughput <IconSpeed size={14} style={{ verticalAlign: -2 }} /></th>
                  <th>Tokens Out</th>
                  <th>Total Time</th>
                  <th>Est. Cost</th>
                  <th>Winner?</th>
                </tr>
              </thead>
              <tbody>
                {slots.filter(s => s.status === 'done' && s.metrics).map((s, i) => {
                  const fastestTTFT = Math.min(...slots.filter(x => x.metrics).map(x => x.metrics.ttft || Infinity));
                  const highestThroughput = Math.max(...slots.filter(x => x.metrics).map(x => x.metrics.tokensPerSec || 0));
                  const isFastestTTFT = s.metrics.ttft === fastestTTFT;
                  const isFastestThroughput = Math.abs(s.metrics.tokensPerSec - highestThroughput) < 0.5;
                  return (
                    <tr key={s.key}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.modelName}</div>
                        <span className={`provider-tag ${s.providerId}`}>{s.providerName}</span>
                      </td>
                      <td className="td-mono" style={{ color: isFastestTTFT ? 'var(--success)' : undefined }}>
                        {s.metrics.ttft}ms {isFastestTTFT && <IconCrown size={14} style={{ verticalAlign: -2, marginLeft: 4 }} />}
                      </td>
                      <td className="td-mono" style={{ color: isFastestThroughput ? 'var(--success)' : undefined }}>
                        {s.metrics.tokensPerSec?.toFixed(1)} tok/s {isFastestThroughput && <IconCrown size={14} style={{ verticalAlign: -2, marginLeft: 4 }} />}
                      </td>
                      <td className="td-mono">{s.metrics.outputTokens}</td>
                      <td className="td-mono">{(s.metrics.totalTime / 1000).toFixed(2)}s</td>
                      <td className="td-mono">${s.metrics.estimatedCost?.toFixed(6)}</td>
                      <td>
                        {isFastestTTFT && isFastestThroughput
                          ? <span style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><IconCrown size={14} /> All</span>
                          : isFastestTTFT
                          ? <span style={{ color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><IconBenchmark size={14} /> Fast</span>
                          : isFastestThroughput
                          ? <span style={{ color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><IconSpeed size={14} /> Throughput</span>
                          : '—'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function generateSimulatedResponse(prompt, modelId) {
  const isCode = /code|python|javascript|function|algorithm|implement/i.test(prompt);
  const isMath = /math|calculate|equation|formula|solve/i.test(prompt);

  if (isCode) {
    return `Here's a clean implementation for your request:

\`\`\`python
def solution(input_data):
    """
    Processes the given input efficiently.
    Time complexity: O(n log n)
    Space complexity: O(n)
    """
    # Initialize result container
    result = []
    
    # Process each element
    for item in sorted(input_data):
        if item not in result:
            result.append(item)
    
    return result

# Example usage
data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
print(solution(data))  # [1, 2, 3, 4, 5, 6, 9]
\`\`\`

This approach handles duplicates efficiently and maintains O(n log n) time complexity due to the sorting step. The space usage is proportional to the number of unique elements.

Key considerations:
• The sort guarantees deterministic output order
• Duplicate filtering happens in-place during iteration
• Edge cases (empty input, all duplicates) are handled gracefully`;
  }

  if (isMath) {
    return `Let me work through this step by step.

**Given information:**
- We need to solve the mathematical relationship
- Let variables be defined as per the problem statement

**Step 1: Set up the equation**
Starting with the fundamental relationship:
f(x) = ax² + bx + c

**Step 2: Apply the constraint**
Substituting the known values:
- When x = 0: f(0) = c = initial value
- When x = 1: f(1) = a + b + c

**Step 3: Solve**
Using the quadratic formula:
x = (-b ± √(b² - 4ac)) / 2a

**Result:**
The solution gives us x ≈ 2.74, with a margin of error of ±0.01.

This result makes physical sense because it satisfies both boundary conditions and the conservation laws imposed by the problem constraints.`;
  }

  return `That's a great question! Let me provide a comprehensive answer.

${prompt.includes('?') ? "To address your question directly: " : "Here's my analysis: "}

The topic you're asking about involves several interconnected concepts. At its core, we need to consider both the theoretical foundations and practical implications.

**Key Points:**

1. **Foundational understanding** — The basic premise rests on well-established principles that have been validated through extensive research and real-world application.

2. **Practical considerations** — When implementing or applying these concepts, context matters enormously. Different scenarios may require different approaches.

3. **Nuanced perspective** — It's worth noting that experts in this field often highlight edge cases and exceptions that a surface-level understanding might miss.

4. **Current state of knowledge** — Research continues to evolve in this area. What we know today builds on decades of accumulated understanding.

**Conclusion:**

The most important takeaway is that a holistic approach yields the best results. Whether you're looking at this from a theoretical, practical, or philosophical angle, the underlying principles remain consistent.

Is there a specific aspect you'd like me to dive deeper into?`;
}
