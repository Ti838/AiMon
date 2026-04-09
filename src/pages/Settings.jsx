import { useState } from 'react';
import { PROVIDERS } from '../data/providers';
import { ProviderLogo } from '../components/ProviderLogos';
import { IconSettings } from '../components/NavIcons';

const PROVIDER_DOCS = {
  openrouter: 'https://openrouter.ai/keys',
  openai: 'https://platform.openai.com/api-keys',
  anthropic: 'https://console.anthropic.com/settings/keys',
  google: 'https://aistudio.google.com/app/apikey',
  meta: 'https://llama.meta.com/',
  mistral: 'https://console.mistral.ai/api-keys/',
  cohere: 'https://dashboard.cohere.ai/api-keys',
};

export default function Settings({ apiKeys, onSaveKey, showToast }) {
  const [drafts, setDrafts] = useState({ ...apiKeys });
  const [visible, setVisible] = useState({});

  const handleSave = (providerId) => {
    onSaveKey(providerId, drafts[providerId] || '');
    showToast(`API key saved for ${PROVIDERS[providerId]?.name}`, 'success');
  };

  const toggle = (id) => setVisible(v => ({ ...v, [id]: !v[id] }));

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1><IconSettings size={28} style={{ verticalAlign: -4, marginRight: 8 }} /> API Keys</h1>
        <p>Store your provider API keys to run real live benchmarks (stored in browser only, never sent to any server)</p>
      </div>

      <div style={{
        padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: 28,
        background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)',
        fontSize: 14, color: 'var(--text-secondary)', display: 'flex', gap: 12, alignItems: 'center'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--success)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </span>
        <span>Keys are saved only to your browser's <strong>localStorage</strong>. Nothing is transmitted to any external server.</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.values(PROVIDERS).map(provider => {
          const hasKey = !!(apiKeys[provider.id]);
          return (
            <div key={provider.id} className="card slide-up">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 'var(--radius-sm)',
                  background: provider.color + '20', border: `1px solid ${provider.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  <ProviderLogo providerId={provider.id} size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 16 }}>
                    {provider.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {provider.models.length} models available
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {hasKey ? (
                    <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 600 }}>
                      ✓ Configured
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontWeight: 600 }}>
                      Not set
                    </span>
                  )}
                </div>
              </div>

              <div className="api-key-row">
                <input
                  id={`api-key-${provider.id}`}
                  type={visible[provider.id] ? 'text' : 'password'}
                  className="form-input"
                  placeholder={`Enter your ${provider.name} API key…`}
                  value={drafts[provider.id] || ''}
                  onChange={e => setDrafts(d => ({ ...d, [provider.id]: e.target.value }))}
                  style={{ fontFamily: 'JetBrains Mono', fontSize: 13 }}
                />
                <button
                  className="btn btn-secondary"
                  style={{ padding: '10px 14px', flexShrink: 0 }}
                  onClick={() => toggle(provider.id)}
                  title={visible[provider.id] ? 'Hide' : 'Show'}
                >
                  {visible[provider.id] ? '🙈' : '👁'}
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flexShrink: 0 }}
                  onClick={() => handleSave(provider.id)}
                >
                  Save
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                Get your key at{' '}
                <a
                  href={PROVIDER_DOCS[provider.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-accent)', textDecoration: 'none' }}
                >
                  {PROVIDER_DOCS[provider.id]}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>📡 Live vs Simulated Mode</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <p>When an API key is present, benchmarks will be run against the <strong style={{ color: 'var(--text-primary)' }}>live model API</strong>.</p>
          <p>Without a key, benchmarks use <strong style={{ color: 'var(--text-accent)' }}>high-fidelity simulated data</strong> with realistic variance — perfect for exploring the tool.</p>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              Object.keys(apiKeys).forEach(k => onSaveKey(k, ''));
              setDrafts({});
              showToast('All API keys cleared', 'success');
            }}
          >
            🗑 Clear All Keys
          </button>
        </div>
      </div>
    </div>
  );
}
