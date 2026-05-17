import React from 'react';
import { api } from '../services/api.js';
import { navigate } from '../router/hashRouter.js';

function SkeletonRow() {
  return (
    <div className="compact-row" style={{ padding: 14, opacity: 0.85 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
        <div style={{ width: 38, height: 38, borderRadius: 14, background: 'rgba(10,20,40,.08)' }} />
        <div style={{ flex: 1, display: 'grid', gap: 8 }}>
          <div style={{ height: 10, width: '62%', borderRadius: 999, background: 'rgba(10,20,40,.08)' }} />
          <div style={{ height: 10, width: '45%', borderRadius: 999, background: 'rgba(10,20,40,.06)' }} />
        </div>
        <div style={{ width: 74, height: 26, borderRadius: 999, background: 'rgba(10,20,40,.08)' }} />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [items, setItems] = React.useState([]);

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getHistory();
      const list = data?.results || data?.data || data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'History yuklanmadi');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <main className="workspace">
      <div className="workspace-header">
        <div>
          <div className="crumbs">Tarix</div>
          <h2 style={{ marginTop: 6 }}>Menda ko‘rilganlar</h2>
          <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 13 }}>
            {loading ? 'Yuklanmoqda...' : `${items.length} ta`}</div>
        </div>

        <div className="top-actions" style={{ marginTop: 6 }}>
          <button className="pill-btn" type="button" onClick={() => navigate('/#/courses')}>
            Qidirish
          </button>
        </div>
      </div>

      <section className="content-panel" style={{ padding: 18 }}>
        {loading && (
          <div className="compact-list" style={{ gap: 12 }}>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {!loading && error && <div className="api-alert">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="api-alert">Hozircha tarix bo‘sh. Kursni ko‘rib keyin bu yerda chiqadi.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="compact-list" style={{ gap: 12 }}>
            {items.slice(0, 20).map((it) => {
              const id = it?.slug || it?.id || it?.uuid;
              const name = it?.title || it?.name || it?.course_name || 'Kurs/markaz';
              const rating = it?.rating ?? it?.avg_rating ?? it?.score ?? '';
              const date = it?.created_at || it?.date || it?.viewed_at || '';

              return (
                <div
                  key={id || name}
                  className="compact-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (id) window.location.hash = `#/course/${encodeURIComponent(id)}`;
                  }}
                >
                  <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '38px 1fr auto', gap: 12, alignItems: 'center' }}>
                    <div className="course-thumb" style={{ width: 38, height: 38, borderRadius: 14, background: 'rgba(6,152,216,.12)' }}>
                      🕒
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 13, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {rating !== '' ? <span>⭐ {Number(rating).toFixed ? Number(rating).toFixed(1) : rating}</span> : null}
                        {date ? <span className="dot-separator">• {new Date(date).toLocaleDateString('uz-UZ')}</span> : null}
                      </div>
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>Open →</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
