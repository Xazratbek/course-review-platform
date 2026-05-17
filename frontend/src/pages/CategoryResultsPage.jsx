import React from 'react';
import { api } from '../services/api.js';
import { navigate } from '../router/hashRouter.js';

function SkeletonCard() {
  return (
    <div className="review-card" style={{ padding: 16, borderRadius: 18, background: 'rgba(255,255,255,.66)', border: '1px solid rgba(0,0,0,.04)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(6,152,216,.12)' }} />
        <div style={{ flex: 1, display: 'grid', gap: 8 }}>
          <div style={{ height: 10, width: '62%', borderRadius: 999, background: 'rgba(10,20,40,.08)' }} />
          <div style={{ height: 10, width: '45%', borderRadius: 999, background: 'rgba(10,20,40,.08)' }} />
        </div>
        <div style={{ width: 70, height: 24, borderRadius: 999, background: 'rgba(10,20,40,.08)' }} />
      </div>
      <div style={{ marginTop: 12, height: 10, width: '88%', borderRadius: 999, background: 'rgba(10,20,40,.06)' }} />
      <div style={{ marginTop: 8, height: 10, width: '74%', borderRadius: 999, background: 'rgba(10,20,40,.06)' }} />
    </div>
  );
}

function ScorePills({ rating }) {
  const r = typeof rating === 'number' ? rating : Number(rating);
  const value = Number.isFinite(r) ? r : 0;

  const pills = [
    { min: 0, label: '1+', color: '#e64b61' },
    { min: 2, label: '2+', color: '#d99400' },
    { min: 3.5, label: '3+', color: '#f4c542' },
    { min: 4, label: '4+', color: '#80d99c' },
    { min: 4.5, label: '4.5+', color: '#1bd3b3' },
  ];

  // active pill: the highest min that fits
  const active = pills
    .filter((p) => value >= p.min)
    .sort((a, b) => b.min - a.min)[0];

  return (
    <div className="rating-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {pills.map((p) => {
        const isActive = active?.label === p.label;
        return (
          <div
            key={p.label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 42,
              height: 26,
              padding: '0 10px',
              borderRadius: 10,
              fontWeight: 900,
              color: isActive ? 'white' : 'rgba(16,21,35,.9)',
              background: isActive ? p.color : 'rgba(255,255,255,.6)',
              border: isActive ? '1px solid rgba(0,0,0,.08)' : '1px solid rgba(0,0,0,.04)',
              boxShadow: isActive ? '0 10px 24px rgba(0,0,0,.12)' : 'none',
              transform: isActive ? 'translateY(-1px)' : 'none',
              transition: 'all 180ms ease',
              userSelect: 'none',
            }}
          >
            {p.label}
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ title, subtitle, action }) {
  return (
    <div className="content-panel" style={{ padding: 22, display: 'grid', gap: 10, justifyItems: 'start' }}>
      <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
      <div style={{ color: 'var(--muted)' }}>{subtitle}</div>
      {action}
    </div>
  );
}

export default function CategoryResultsPage({ slug }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Filters (rasmdagidek “rating” + sort)
  const [ratingMin, setRatingMin] = React.useState('');
  const [sortKey, setSortKey] = React.useState('top'); // top | newest | rating
  const [query, setQuery] = React.useState('');

  const [categoryTitle, setCategoryTitle] = React.useState('');
  const [items, setItems] = React.useState([]);

  const runFetch = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTagItemsByCourseSlug(slug);
      // backend turlicha structured bo‘lishi mumkin: results / data / list
      const list = data?.results || data?.data || data || [];
      setItems(Array.isArray(list) ? list : []);
      setCategoryTitle(data?.title || data?.name || data?.category_name || 'Natijalar');
    } catch (e) {
      setError(e?.message || 'Natijalar yuklanmadi');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    runFetch();
  }, [runFetch]);

  const normalized = React.useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const q = query.trim().toLowerCase();

    const min = ratingMin === '' ? null : Number(ratingMin);
    let out = list;

    if (q) {
      out = out.filter((it) => {
        const name = it?.title || it?.name || it?.course_name || '';
        return String(name).toLowerCase().includes(q);
      });
    }

    if (min != null && Number.isFinite(min)) {
      out = out.filter((it) => {
        const r = it?.rating ?? it?.avg_rating ?? it?.score ?? it?.stars;
        const rv = Number(r);
        return Number.isFinite(rv) ? rv >= min : false;
      });
    }

    if (sortKey === 'rating') {
      out = [...out].sort((a, b) => Number(b.rating ?? b.avg_rating ?? 0) - Number(a.rating ?? a.avg_rating ?? 0));
    } else if (sortKey === 'newest') {
      out = [...out].sort((a, b) => Number(b.created_at ?? b.date ?? 0) - Number(a.created_at ?? a.date ?? 0));
    } else {
      out = [...out].sort((a, b) => Number(b.count ?? b.reviews_count ?? 0) - Number(a.count ?? a.reviews_count ?? 0));
    }

    return out;
  }, [items, query, ratingMin, sortKey]);

  return (
    <main className="workspace">
      <div className="workspace-header">
        <div>
          <div className="crumbs">Asosiy • Kategoriyalar • {categoryTitle || slug}</div>
          <h2 style={{ marginTop: 6 }}>{categoryTitle || 'O‘qituvchilar/markazlar'}</h2>
        </div>

        <div className="top-actions" style={{ marginTop: 6 }}>
          <button className="pill-btn" type="button" onClick={() => navigate('/#/courses')}>
            <span style={{ fontWeight: 900 }}>Qidirish</span>
            <span aria-hidden="true">🔎</span>
          </button>
          <button className="ghost-btn" type="button" onClick={() => navigate('/#/favorites/my')}>
            Sevimlilar
          </button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(340px, .85fr)' }}>
        {/* Sidebar filters */}
        <section className="primary-column content-panel" style={{ padding: 18 }}>
          <div className="section-head" style={{ marginBottom: 16 }}>
            <h3>Rating</h3>
            <p>Minimal</p>
          </div>

          <ScorePills rating={ratingMin === '' ? 4.5 : Number(ratingMin)} />

          <div className="filter-bar" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>
            <label>
              <span>Minimal reyting</span>
              <select value={ratingMin} onChange={(e) => setRatingMin(e.target.value)}>
                <option value="">Eng yuqori</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
                <option value="3.5">3.5+</option>
              </select>
            </label>

            <label>
              <span>Sort</span>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                <option value="top">Eng mashhur</option>
                <option value="rating">Yuqori reyting</option>
                <option value="newest">Yaqinda qo‘shilgan</option>
              </select>
            </label>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: 'var(--muted)', fontWeight: 800, fontSize: 12 }}>Qidirish</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Qidirish uchun kiriting..."
                style={{
                  minHeight: 46,
                  padding: '0 14px',
                  borderRadius: 14,
                  background: 'white',
                  border: '1px solid var(--border)',
                  outline: 'none',
                }}
              />
            </label>
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                setRatingMin('');
                setSortKey('top');
                setQuery('');
              }}
              style={{ minHeight: 44 }}
            >
              Tozalash
            </button>
            <button
              className="pill-btn"
              type="button"
              onClick={() => runFetch()}
              style={{ minHeight: 44 }}
            >
              Yangilash
            </button>
          </div>

          {/* Map/side visual placeholder (rasmdagi xarita kartasi kabi) */}
          <div style={{ marginTop: 18, padding: 14, borderRadius: 18, background: 'rgba(255,255,255,.58)', border: '1px solid rgba(0,0,0,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 900 }}>Xaritadagi kompaniyalar</div>
                <div style={{ color: 'var(--muted)', marginTop: 4, fontSize: 13 }}>Orqali qidirib toping</div>
              </div>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(6,152,216,.12)', display: 'grid', placeItems: 'center' }}>
                🧭
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="pill-btn" type="button" onClick={() => alert('Demo: xarita integratsiyasi keyin qo‘shiladi')} style={{ width: '100%' }}>
                Xaritani ochish
              </button>
            </div>
          </div>
        </section>

        {/* Main list */}
        <section className="side-column content-panel" style={{ padding: 18 }}>
          <div className="section-head" style={{ marginBottom: 14 }}>
            <h3>Natijalar</h3>
            <p>{loading ? '...' : `${normalized.length} ta`}</p>
          </div>

          {loading && (
            <div className="compact-list" style={{ gap: 12 }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {!loading && error && <div className="api-alert">{error}</div>}

          {!loading && !error && normalized.length === 0 && (
            <EmptyState
              title="Hech narsa topilmadi"
              subtitle="Filtrlarni o‘zgartirib qayta urinib ko‘ring."
              action={
                <button
                  className="pill-btn"
                  type="button"
                  onClick={() => {
                    setRatingMin('');
                    setSortKey('top');
                    setQuery('');
                  }}
                >
                  Filtrlarni tozalash
                </button>
              }
            />
          )}

          {!loading && !error && normalized.length > 0 && (
            <div className="compact-list" style={{ gap: 12 }}>
              {normalized.slice(0, 12).map((it) => {
                const name = it?.title || it?.name || it?.course_name || 'Kurs/markaz';
                const rating = it?.rating ?? it?.avg_rating ?? it?.score ?? 0;
                const reviews = it?.count ?? it?.reviews_count ?? it?.review_count ?? null;
                const address = it?.address || it?.location || it?.city || '';

                const handleOpen = () => {
                  // Backend ko‘pincha /course/:slug talab qiladi — shuning uchun avval slug qidiramiz.
                  const slugToOpen =
                    it?.slug ||
                    it?.course_slug ||
                    it?.course?.slug ||
                    null;

                  // Agar slug topilmasa, oxirgi fallback sifatida id/uuid yuboramiz (backendga qarab farq qilishi mumkin).
                  const fallbackId = it?.id || it?.uuid || null;

                  const target = slugToOpen || fallbackId;
                  if (!target) return;

                  window.location.hash = `#/course/${encodeURIComponent(target)}`;
                };

                return (
                  <div key={it?.id || it?.uuid || name} className="compact-row" style={{ cursor: 'pointer' }} onClick={handleOpen}>
                    <div style={{ display: 'grid', gridTemplateColumns: '38px minmax(0,1fr) auto', alignItems: 'center', gap: 12, width: '100%' }}>
                      <div className="course-thumb" style={{ width: 38, height: 38, borderRadius: 14, background: 'rgba(6,152,216,.12)', color: 'var(--accent)' }}>
                        📚
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {name}
                        </strong>
                        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', color: 'var(--muted)', marginTop: 6 }}>
                          <span style={{ color: 'var(--accent)', fontWeight: 900 }}>⭐ {Number(rating).toFixed ? Number(rating).toFixed(1) : rating}</span>
                          {reviews != null ? <span>({reviews} ta sharh)</span> : null}
                          {address ? <span className="dot-separator">• {address}</span> : null}
                        </span>
                      </div>
                      <div style={{ display: 'grid', justifyItems: 'end', gap: 6 }}>
                        <button className="ghost-btn" type="button" style={{ minHeight: 36, padding: '0 14px' }} onClick={(e) => { e.stopPropagation(); handleOpen(); }}>
                          OTMar
                        </button>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Qisqa profil</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
