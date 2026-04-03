import { PROVIDERS } from '../data/providers';
import { ProviderLogo } from './ProviderLogos';
import { IconDashboard, IconLive, IconBenchmark, IconTrophy, IconScale, IconHistory, IconSettings } from './NavIcons';

export default function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    { id: 'dashboard', icon: <IconDashboard size={18} />, label: 'Dashboard' },
    { id: 'live', icon: <IconLive size={18} color="var(--error)" />, label: 'Live Test', badge: 'NEW' },
    { id: 'benchmark', icon: <IconBenchmark size={18} />, label: 'Run Benchmark' },
    { id: 'leaderboard', icon: <IconTrophy size={18} />, label: 'Leaderboard' },
    { id: 'compare', icon: <IconScale size={18} />, label: 'Compare Models' },
    { id: 'history', icon: <IconHistory size={18} />, label: 'History' },
    { id: 'settings', icon: <IconSettings size={18} />, label: 'API Keys' },
  ];

  const providerList = Object.values(PROVIDERS);

  return (
    <aside className="sidebar">
      <div className="sidebar-section-label">Navigation</div>
      {navItems.map(item => (
        <button
          key={item.id}
          className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="sidebar-item-icon">{item.icon}</span>
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.badge && (
            <span style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 10, fontWeight: 700,
              background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em',
              animation: 'pulse 2s infinite',
            }}>
              {item.badge}
            </span>
          )}
        </button>
      ))}

      <div className="sidebar-section-label" style={{ marginTop: 16 }}>Providers</div>
      {providerList.map(p => (
        <div key={p.id} className="sidebar-item" style={{ cursor: 'default' }}>
          <span className="sidebar-item-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <ProviderLogo providerId={p.id} size={16} />
          </span>
          <span style={{ flex: 1 }}>{p.name}</span>
          <span className="sidebar-item-badge" style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
            {p.models.length}
          </span>
        </div>
      ))}

      <div style={{ marginTop: 'auto', padding: '16px 12px 0' }}>
        <div style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-brand-subtle)',
          border: '1px solid rgba(124,58,237,0.2)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-accent)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
            Pro Tip
          </div>
          Add your API keys in Settings to run real benchmarks against live models.
        </div>
      </div>
    </aside>
  );
}
