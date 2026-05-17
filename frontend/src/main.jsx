import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { login, logout, getStoredUser } from './services/api.js';
import './styles/app.css';
import { useHashRoute, navigate } from './router/hashRouter.js';
import HomePage from './pages/HomePage.jsx';
import CategoryResultsPage from './pages/CategoryResultsPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import { Bell, Bookmark, History as HistoryIcon, Menu, Search, Square, UserRound } from 'lucide-react';

function LoginPage({ auth, setAuth, err, onSubmit }) {
  return (
    <main className="workspace-view">
      <h2>Kirish</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        style={{ display: 'grid', gap: 12 }}
      >
        <input
          placeholder="username"
          value={auth.username}
          autoComplete="username"
          onChange={(e) => setAuth({ ...auth, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="password"
          value={auth.password}
          autoComplete="current-password"
          onChange={(e) => setAuth({ ...auth, password: e.target.value })}
        />
        <button className="primary-btn" type="submit">
          Kirish <span aria-hidden="true">→</span>
        </button>
      </form>
      {err ? <p style={{ color: 'crimson' }}>{err}</p> : null}
    </main>
  );
}

function Shell({ user, children, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      {/* LEFT SIDEBAR */}
      <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`} aria-label="Sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            sh
          </div>
          <div className="brand-copy" style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              sharh
            </strong>
            <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Realtime UX</span>
          </div>
        </div>

        <button
          type="button"
          className="collapse-btn"
          aria-label="Collapse"
          onClick={() => setCollapsed((v) => !v)}
        >
          <Menu size={16} />
        </button>

        <div className="nav-stack" style={{ marginTop: 4 }}>
          <div>
            <div className="nav-head" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 0.2 }}>NAVIGATSIYA</span>
            </div>

            <div className="nav-children" style={{ paddingLeft: collapsed ? 10 : 50 }}>
              <button className="user-chip-btn" type="button" onClick={() => navigate('/#/home')}>
                <Square size={18} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Bosh</span>
              </button>

              <button className="user-chip-btn" type="button" onClick={() => navigate('/#/courses')}>
                <Search size={18} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Qidirish</span>
              </button>

              <button className="user-chip-btn" type="button" onClick={() => navigate('/#/favorites/my')}>
                <Bookmark size={18} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Sevimlilar</span>
              </button>

              <button className="user-chip-btn" type="button" onClick={() => navigate('/#/history')}>
                <HistoryIcon size={18} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Tarix</span>
              </button>

              <button className="user-chip-btn" type="button" onClick={() => navigate('/#/notifications')}>
                <Bell size={18} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Bildirishnomalar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-chip" style={{ paddingTop: 6 }}>
            <div className="avatar" aria-hidden="true" style={{ fontSize: 12, display: 'grid', placeItems: 'center' }}>
              <UserRound size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username || 'User'}
              </strong>
              <span style={{ display: 'block', fontSize: 12, opacity: 0.65, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                аккаунт
              </span>
            </div>
          </div>

          <button
            className="pill-btn"
            type="button"
            style={{ width: '100%', marginTop: 16, minHeight: 46, borderRadius: 18, justifyContent: 'center' }}
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      {children}
    </div>
  );
}

function NotFoundPage() {
  return (
    <main className="workspace">
      <div className="workspace-header">
        <div>
          <div className="crumbs">404</div>
          <h2 style={{ marginTop: 6 }}>Sahifa topilmadi</h2>
          <p style={{ marginTop: 8, color: 'var(--muted)' }}>URL noto‘g‘ri yoki hali UI ga ulanmagan.</p>
        </div>
        <div className="top-actions" style={{ marginTop: 6 }}>
          <button className="pill-btn" type="button" onClick={() => navigate('/#/home')}>
            Bosh sahifa
          </button>
        </div>
      </div>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [auth, setAuth] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const routes = useMemo(
    () => [
      { pattern: '/', component: HomePage },
      { pattern: '/home', component: HomePage },
      { pattern: '/categories', component: HomePage },
      { pattern: '/category/:slug', component: CategoryResultsPage },
      { pattern: '/courses', component: CategoryResultsPage },

      { pattern: '/course/:slug', component: CourseDetailPage },
      { pattern: '/course/:id', component: CourseDetailPage },

      { pattern: '/favorites/my', component: FavoritesPage },
      { pattern: '/history', component: HistoryPage },
      { pattern: '/notifications', component: NotificationsPage },
    ],
    []
  );

  const route = useHashRoute(routes);

  if (!user) {
    return (
      <LoginPage
        auth={auth}
        setAuth={setAuth}
        err={err}
        onSubmit={async () => {
          setAuthBusy(true);
          setErr('');
          try {
            const u = await login(auth);
            setUser(u);
          } catch (e) {
            setErr(e?.message || 'Kirishda xatolik');
          } finally {
            setAuthBusy(false);
          }
        }}
      />
    );
  }

  const Page = route?.component || NotFoundPage;
  const params = route?.params || {};
  const courseSlugOrId = params.slug || params.id || '';

  return (
    <Shell
      user={user}
      onLogout={() => {
        logout();
        setUser(null);
      }}
    >
      {route?.component === CourseDetailPage ? <Page slug={courseSlugOrId} /> : <Page />}
      {authBusy ? <p className="crumbs">...auth</p> : null}
    </Shell>
  );
}

createRoot(document.getElementById('root')).render(<App />);
