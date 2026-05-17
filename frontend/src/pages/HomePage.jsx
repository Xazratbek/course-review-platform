import React from 'react';
import { api } from '../services/api.js';

function SkeletonLine({ w = '100%' }) {
  return <div style={{ height: 12, width: w, background: 'rgba(10,20,40,.08)', borderRadius: 999 }} />;
}

function Chip({ icon, text, subtext }) {
  return (
    <div className="course-row" style={{ gridTemplateColumns: '52px minmax(0, 1fr) auto' }}>
      <div className="course-thumb" aria-hidden="true">
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</strong>
        <span style={{ marginTop: 2 }}>{subtext}</span>
      </div>
      <div className="row-meta">
        <span style={{ color: 'rgba(101,112,134,.95)' }}>→</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [categories, setCategories] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.getCategories();
        if (!mounted) return;
        setCategories(res?.results || res || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load categories');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="workspace">
      <div className="topbar">
        <div>
          <div className="crumbs">Asosiy</div>
          <h1>Shaharlar bilan tanishing. Sharh qoldiring.</h1>
        </div>

        <div className="top-actions">
          <button className="pill-btn" type="button" onClick={() => window.location.hash = '#/courses'}>
            <span style={{ fontWeight: 800 }}>Qidirish</span>
            <span aria-hidden="true">🔍</span>
          </button>
          <button className="ghost-btn" type="button" onClick={() => window.location.hash = '#/favorites/my'}>
            Sevimlilar
          </button>
        </div>
      </div>

      <section className="course-hero">
        <div>
          <div className="eyebrow">ishonch • tajriba • baholash</div>
          <h2>
            Kimgа <span style={{ color: '#12a2ff' }}>ishonish</span> mumkinligini biling!
          </h2>
          <p>
            Back-enddan kelayotgan kategoriyalar asosida kerakli ta’lim/servis/markazlarni toping va real sharhlar orqali qaror qiling.
          </p>

          <div className="tag-row" style={{ marginTop: 22 }}>
            <span>Real reyting</span>
            <span>Tez topish</span>
            <span>Animatsiya & UX</span>
          </div>
        </div>

        <div className="hero-side" style={{ marginTop: 6 }}>
          <button type="button" className="hero-review-btn">
            <span style={{ fontWeight: 900 }}>Qish</span>
            <span style={{ opacity: 0.85 }}>⛄</span>
          </button>
          <button type="button">
            <span style={{ fontWeight: 900 }}>Ish vaqti</span>
            <span style={{ opacity: 0.85 }}>🕒</span>
          </button>
        </div>
      </section>

      <div style={{ marginTop: 22 }}>
        <div className="section-head">
          <h3>Kategoriyalar</h3>
          <p>Hammasini ko‘rish</p>
        </div>

        {loading && (
          <div className="workspace-header" style={{ gap: 16 }}>
            <div style={{ display: 'grid', gap: 10, flex: 1 }}>
              <SkeletonLine w="70%" />
              <SkeletonLine w="90%" />
              <SkeletonLine w="85%" />
            </div>
          </div>
        )}

        {error && <div className="api-alert">{error}</div>}

        {categories && (
          <div className="workspace-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
            {categories.slice(0, 8).map((c) => (
              <div key={c.id || c.slug || c.name} className="action-card" role="button" tabIndex={0}
                onClick={() => window.location.hash = `#/category/${encodeURIComponent(c.slug || c.id || '')}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') window.location.hash = `#/category/${encodeURIComponent(c.slug || c.id || '')}`;
                }}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="course-thumb" style={{ width: 52, height: 52 }}>
                    <span style={{ fontSize: 18, color: 'var(--accent)' }}>🏷️</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name || c.title || 'Kategoriya'}
                    </strong>
                    <p style={{ marginTop: 6, color: 'var(--muted)' }}>
                      {c.count != null ? `${c.count} muassasa` : 'Muassasalar soni'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
