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

export default function FavoritesPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [items, setItems] = React.useState([]);

  const fetchFavorites = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getFavorites();
      const list = data?.results || data?.data || data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Favorites yuklanmadi');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <main className="workspace">
      <div className="workspace-header">
        <div>
          <div className="crumbs">Sevimlilar</div>
          <h2 style={{ marginTop: 6 }}>Mening favorites</h2>
          <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 13 }}>
            {loading ? 'Yuklanmoqda...' : `${items.length} ta kurs/markaz`}
          </div>
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
          <div className="api-alert">Hozircha favorites bo‘sh. Qidirib, keyin sevimliga qo‘shing.</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="compact-list" style={{ gap: 12 }}>
            {items.slice(0, 20).map((it) => {
              const id = it?.slug || it?.id || it?.uuid;
              const name = it?.title || it?.name || it?.course_name || 'Kurs/markaz';
              const rating = it?.rating ?? it?.avg_rating ?? it?.score ?? '';
              const reviews = it?.count ?? it?.reviews_count ?? it?.review_count ?? '';
              const address = it?.address || it?.location || it?.city || '';

              return (
                <div
                  key={id || name}
                  className="compact-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (id) window.location.hash = `#/course/${encodeURIComponent(id)}`;
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <div className="course-thumb" style={{ width: 38, height: 38, borderRadius: 14 }}>
                      ⭐
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 13, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {rating !== '' ? <span>⭐ {Number(rating).toFixed ? Number(rating).toFixed(1) : rating}</span> : null}
                        {reviews !== '' ? <span>{reviews} ta sharh</span> : null}
                        {address ? <span className="dot-separator">• {address}</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13 }}>
          Tip: course detail’da sharh yozish, vote va comments flow’lari mavjud.
        </div>
      </section>
    </main>
  );
}
