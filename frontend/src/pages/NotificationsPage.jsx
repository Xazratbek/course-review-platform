import React from 'react';
import { api } from '../services/api.js';
import { navigate } from '../router/hashRouter.js';

function SkeletonLine() {
  return (
    <div style={{ height: 54, borderRadius: 18, background: 'rgba(10,20,40,.08)', border: '1px solid rgba(0,0,0,.03)' }} />
  );
}

function formatWhen(v) {
  if (!v) return '';
  try {
    return new Date(v).toLocaleString('uz-UZ');
  } catch {
    return String(v);
  }
}

export default function NotificationsPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [items, setItems] = React.useState([]);

  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getNotifications();
      const list = data?.results || data?.data || data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Notifications yuklanmadi');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAll = async () => {
    try {
      await api.markAllNotifications();
      await fetchNotifications();
    } catch (e) {
      alert(e?.message || 'Mark all ishlamadi');
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await api.markOneNotification(id);
      await fetchNotifications();
    } catch (e) {
      alert(e?.message || 'Mark one ishlamadi');
    }
  };

  return (
    <main className="workspace">
      <div className="workspace-header">
        <div>
          <div className="crumbs">Bildirishnomalar</div>
          <h2 style={{ marginTop: 6 }}>Sizga kelgan xabarlar</h2>
          <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 13 }}>
            {loading ? 'Yuklanmoqda...' : `${items.length} ta`}
          </div>
        </div>

        <div className="top-actions" style={{ marginTop: 6 }}>
          <button className="pill-btn" type="button" onClick={() => navigate('/#/courses')}>
            Qidirish
          </button>
          <button className="ghost-btn" type="button" onClick={handleMarkAll}>
            Hammasini ko‘rindi
          </button>
        </div>
      </div>

      <section className="content-panel" style={{ padding: 18 }}>
        {loading && (
          <div className="compact-list" style={{ gap: 12 }}>
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine />
          </div>
        )}

        {!loading && error && <div className="api-alert">{error}</div>}

        {!loading && !error && items.length === 0 && <div className="api-alert">Hali bildirishnoma yo‘q.</div>}

        {!loading && !error && items.length > 0 && (
          <div className="compact-list" style={{ gap: 12 }}>
            {items.slice(0, 30).map((n) => {
              const id = n?.id ?? n?.uuid ?? n?.notification_id;
              const title = n?.title || n?.text || n?.message || 'Bildirishnoma';
              const body = n?.body || n?.description || '';
              const createdAt = n?.created_at || n?.date || n?.timestamp || '';
              const isRead = Boolean(n?.is_read ?? n?.read ?? n?.seen);

              return (
                <div
                  key={id || title}
                  className="compact-row"
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: isRead ? 'rgba(255,255,255,.58)' : 'rgba(6,152,216,.14)',
                    border: isRead ? '1px solid rgba(0,0,0,.03)' : '1px solid rgba(6,152,216,.22)',
                  }}
                >
                  <div style={{ display: 'flex', width: '100%', gap: 14, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 16,
                        display: 'grid',
                        placeItems: 'center',
                        background: isRead ? 'rgba(10,20,40,.06)' : 'rgba(6,152,216,.16)',
                        border: isRead ? '1px solid rgba(0,0,0,.05)' : '1px solid rgba(6,152,216,.25)',
                      }}
                    >
                      {isRead ? '🔔' : '✨'}
                    </div>

                    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ fontWeight: 950, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {title}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatWhen(createdAt)}</div>
                      </div>

                      {body ? (
                        <div style={{ marginTop: 8, color: 'var(--muted)', lineHeight: 1.6, wordBreak: 'break-word' }}>
                          {body}
                        </div>
                      ) : null}

                      <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {!isRead && id ? (
                          <button className="pill-btn" type="button" style={{ minHeight: 40 }} onClick={() => handleMarkOne(id)}>
                            ✅ Ko‘rindi
                          </button>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: 13 }}>Ko‘rindi</span>
                        )}
                      </div>
                    </div>
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
