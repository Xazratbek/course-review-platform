import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  Bookmark,
  BookOpenCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Compass,
  Flag,
  Heart,
  LayoutDashboard,
  LibraryBig,
  Loader2,
  LogIn,
  Menu,
  MessageSquareText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Upload,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { api, assetUrl, getStoredUser, login, logout, signup } from './services/api.js';
import { mockAnalytics, mockDiscussion, mockMembers } from './data/mock.js';
import './styles/app.css';

const formatPrice = (value) => {
  const number = Number(value || 0);
  if (number === 0) return 'Bepul';
  return new Intl.NumberFormat('uz-UZ').format(number) + " so'm";
};

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.courses)) return payload.courses;
  if (Array.isArray(payload?.course_centers)) return payload.course_centers;
  if (Array.isArray(payload?.mentors)) return payload.mentors;
  if (Array.isArray(payload?.tags)) return payload.tags;
  return [];
};

function usePlatformData(filters) {
  const [state, setState] = useState({
    courses: [],
    centers: [],
    mentors: [],
    tags: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      api.getCourses({
        search: filters.search,
        language: filters.language,
        level: filters.level,
        certificate_available: filters.certificate,
      }),
      api.getCenters({ search: filters.search }),
      api.getMentors({ search: filters.search }),
      api.getTags({ search: filters.search }),
    ]).then((results) => {
      if (!alive) return;
      const [courses, centers, mentors, tags] = results.map((result) =>
        result.status === 'fulfilled' ? normalizeList(result.value) : []
      );
      const error = results.some((result) => result.status === 'rejected')
        ? 'Backend ishga tushmagan yoki ayrim endpointlar javob bermadi. Mock panellar ishlayapti.'
        : '';
      setState({ courses, centers, mentors, tags, loading: false, error });
    });
    return () => {
      alive = false;
    };
  }, [filters.search, filters.language, filters.level, filters.certificate]);

  return state;
}

function Sidebar({ collapsed, setCollapsed, active, setActive }) {
  const groups = [
    { name: 'Explore', icon: LayoutDashboard, items: ['Courses', 'Centers', 'Mentors', 'Tags'] },
    { name: 'My flows', icon: UserRound, items: ['Register/Login', 'Profile', 'Favorites'] },
    { name: 'Reviews', icon: MessageSquareText, items: ['Write review', 'Vote', 'Comment', 'Report'] },
    { name: 'Settings', icon: Settings, items: ['Security'] },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-mark">CR</div>
        <div className="brand-copy">
          <strong>CourseRate</strong>
          <span>Review platform</span>
        </div>
      </div>

      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Sidebar toggle">
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <nav className="nav-stack" aria-label="Asosiy menyu">
        {groups.map((group) => {
          const Icon = group.icon;
          const open = group.items.includes(active);
          return (
            <div className={`nav-group ${open ? 'is-open' : ''}`} key={group.name}>
              <button className="nav-head" onClick={() => setActive(group.items[0])}>
                <Icon size={19} />
                <span>{group.name}</span>
                <ChevronDown className="nav-chevron" size={16} />
              </button>
              {!collapsed && (
                <div className="nav-children">
                  {group.items.map((item) => (
                    <button
                      className={active === item ? 'is-active' : ''}
                      key={item}
                      onClick={() => setActive(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="quick-action">
          <Sparkles size={18} />
          <span>AI review scout</span>
        </div>
        <div className="user-chip">
          <div className="avatar">JB</div>
          <div>
            <strong>Jonibek</strong>
            <span>Product owner</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ query, setQuery, user, onLoginClick }) {
  return (
    <header className="topbar">
      <div>
        <p className="crumbs">Education / Courses / Review Intelligence</p>
        <h1>Kurslar reyting paneli</h1>
      </div>
      <div className="top-actions">
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kurs, mentor yoki til qidirish"
          />
        </label>
        <button className="icon-btn" aria-label="Bildirishnomalar">
          <Bell size={19} />
        </button>
        <button className="pill-btn" onClick={onLoginClick}>
          {user ? <UserRound size={18} /> : <LogIn size={18} />}
          <span>{user ? user.username : 'Kirish'}</span>
        </button>
      </div>
    </header>
  );
}

function CourseHero({ course }) {
  const tags = course?.tags?.slice(0, 4) || [];
  return (
    <section className="course-hero reveal">
      <div className="course-hero__content">
        <div className="eyebrow">
          <ShieldCheck size={16} />
          {course?.course_center?.verified ? 'Verified center' : 'Open catalog'}
        </div>
        <h2>{course?.title || 'Backend Development Foundation'}</h2>
        <p>{course?.description || 'Amaliy loyiha, mentor feedback va review signalari bilan kurslarni solishtirish paneli.'}</p>
        <div className="tag-row">
          {(tags.length ? tags : [{ name: 'Django' }, { name: 'REST API' }, { name: 'Mentor' }]).map((tag) => (
            <span key={tag.slug || tag.name}>{tag.name}</span>
          ))}
        </div>
        <div className="hero-meta">
          <span><Star size={16} fill="currentColor" /> {course?.average_rating || '4.8'}</span>
          <span><BookOpenCheck size={16} /> {course?.duration_in_weeks || 8} hafta</span>
          <span><UsersRound size={16} /> {course?.students_count || 132} talaba</span>
        </div>
      </div>
      <div className="hero-side">
        <button><span>Level</span><strong>{course?.level || 'middle'}</strong></button>
        <button><span>Language</span><strong>{course?.language || 'uz'}</strong></button>
        <button><span>Price</span><strong>{formatPrice(course?.price)}</strong></button>
        <button><span>Certificate</span><strong>{course?.certificate_available ? 'Bor' : 'Yo‘q'}</strong></button>
      </div>
    </section>
  );
}

function StatsCard({ courses, mentors, centers }) {
  const totals = useMemo(() => {
    const reviews = courses.reduce((sum, course) => sum + Number(course.reviews_count || 0), 0);
    const students = courses.reduce((sum, course) => sum + Number(course.students_count || 0), 0);
    const avg = courses.length
      ? courses.reduce((sum, course) => sum + Number(course.average_rating || 0), 0) / courses.length
      : 4.4;
    return { reviews, students, avg: avg.toFixed(1) };
  }, [courses]);

  return (
    <section className="stats-card reveal">
      <div className="section-head">
        <div>
          <h3>Statistics overview</h3>
          <p>Mock analytics, course API data bilan aralash.</p>
        </div>
        <button className="ghost-btn">2026 <ChevronDown size={16} /></button>
      </div>
      <div className="bar-chart" aria-label="Oylar bo'yicha faollik">
        {mockAnalytics.map((item) => (
          <div className="bar-wrap" key={item.month}>
            <span className="bar" style={{ height: `${item.value}%` }} />
            <small>{item.month}</small>
          </div>
        ))}
      </div>
      <div className="metric-grid">
        <div><strong>{totals.avg}</strong><span>Avg. score</span></div>
        <div><strong>{totals.reviews || 48}</strong><span>Reviews</span></div>
        <div><strong>{totals.students || 132}</strong><span>Students</span></div>
        <div><strong>{mentors.length || 6}/{centers.length || 4}</strong><span>Mentor/center</span></div>
      </div>
    </section>
  );
}

function FilterBar({ filters, setFilters, onClear }) {
  return (
    <div className="filter-bar">
      <label>
        Level
        <select value={filters.level} onChange={(event) => setFilters({ ...filters, level: event.target.value })}>
          <option value="">All</option>
          <option value="beginner">Beginner</option>
          <option value="middle">Middle</option>
          <option value="pro">Pro</option>
          <option value="bootcamp">Bootcamp</option>
        </select>
      </label>
      <label>
        Language
        <select value={filters.language} onChange={(event) => setFilters({ ...filters, language: event.target.value })}>
          <option value="">All</option>
          <option value="uz">Uzbek</option>
          <option value="ru">Russian</option>
          <option value="en">English</option>
        </select>
      </label>
      <label>
        Certificate
        <select value={filters.certificate} onChange={(event) => setFilters({ ...filters, certificate: event.target.value })}>
          <option value="">All</option>
          <option value="true">Bor</option>
          <option value="false">Yo‘q</option>
        </select>
      </label>
      <button onClick={onClear}>
        Clear
      </button>
    </div>
  );
}

function CourseList({ courses, loading, selectedId, setSelectedId, filters, setFilters, onClearFilters }) {
  const fallback = [
    {
      id: 'mock-1',
      title: 'Django REST Framework Pro',
      description: 'JWT, serializer, permission va query optimization bilan production API.',
      level: 'bootcamp',
      language: 'uz',
      price: 1200000,
      average_rating: '4.9',
      students_count: 210,
      course_center: { title: 'Najot Ta’lim', verified: true },
      mentor: { full_name: 'Ali Karimov' },
    },
    {
      id: 'mock-2',
      title: 'Frontend UX Review Lab',
      description: 'UI audit, usability metrics va review dashboard prototyping.',
      level: 'middle',
      language: 'en',
      price: 890000,
      average_rating: '4.7',
      students_count: 96,
      course_center: { title: 'Grow Academy', verified: true },
      mentor: { full_name: 'Sara Green' },
    },
  ];
  const list = courses.length ? courses : fallback;

  return (
    <section className="content-panel reveal">
      <div className="section-head">
        <div>
          <h3>Kurs katalogi</h3>
          <p>{loading ? 'API yuklanmoqda...' : `${list.length} ta kurs ko‘rsatildi`}</p>
        </div>
        <button className="ghost-btn"><ClipboardList size={17} /> Filter</button>
      </div>
      <FilterBar filters={filters} setFilters={setFilters} onClear={onClearFilters} />
      <div className="course-list">
        {loading && <div className="loading-line"><Loader2 className="spin" size={18} /> Kurslar yuklanmoqda</div>}
        {!loading && list.map((course) => (
          <button
            key={course.id}
            className={`course-row ${selectedId === course.id ? 'is-selected' : ''}`}
            onClick={() => setSelectedId(course.id)}
          >
            <div className="course-thumb">
              {course.thumbnail ? <img src={assetUrl(course.thumbnail)} alt="" /> : <LibraryBig size={23} />}
            </div>
            <div>
              <strong>{course.title}</strong>
              <span>{course.course_center?.title || 'Center TBD'} · {course.mentor?.full_name || 'Mentor TBD'}</span>
            </div>
            <div className="row-meta">
              <span><Star size={15} fill="currentColor" /> {course.average_rating || '0.0'}</span>
              <span>{formatPrice(course.price)}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function DetailTabs({ course }) {
  return (
    <section className="detail-card reveal">
      <div className="tab-row">
        <button className="is-active">Details</button>
        <button>Content</button>
        <button>Review issue</button>
        <button>Discussion</button>
      </div>
      <div className="detail-grid">
        <div className="detail-item"><BookOpenCheck size={18} /><span>{course?.duration_in_weeks || 8} hafta o‘qish</span></div>
        <div className="detail-item"><ShieldCheck size={18} /><span>{course?.certificate_available ? 'Sertifikat mavjud' : 'Sertifikat belgilanmagan'}</span></div>
        <div className="detail-item"><Compass size={18} /><span>{course?.level || 'middle'} daraja</span></div>
        <div className="detail-item"><MessageSquareText size={18} /><span>{course?.reviews_count || 24} review signali</span></div>
      </div>
      <h4>Team members</h4>
      <div className="member-grid">
        {mockMembers.map((member) => (
          <div className="member" key={member.name}>
            <img src={member.avatar} alt="" />
            <div>
              <strong>{member.name}</strong>
              <span>{member.role}</span>
            </div>
            <em>{member.badge}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function UserFlowPanel({ selectedCourse }) {
  return (
    <section className="user-flow-panel reveal">
      <div className="section-head">
        <div>
          <h3>My workspace</h3>
          <p>{selectedCourse?.title || 'Course'}</p>
        </div>
        <button className="ghost-btn"><Heart size={17} /> Favorite</button>
      </div>
      <div className="review-composer">
        <div className="flow-actions">
          <button className="is-active"><MessageSquareText size={16} /> Review</button>
          <button><Upload size={16} /> Media</button>
          <button><ThumbsUp size={16} /> Vote</button>
          <button><Send size={16} /> Comment</button>
          <button><Flag size={16} /> Report</button>
        </div>
        <div className="composer-grid">
          <label>Rating <input placeholder="1-5" /></label>
          <label>Title <input placeholder="Qisqa sarlavha" /></label>
          <label className="wide">Afzalliklar <textarea placeholder="Nima yaxshi ishladi?" /></label>
          <label className="wide">Kamchiliklar <textarea placeholder="Nima yetishmadi?" /></label>
          <label className="wide">Review <textarea placeholder="Fikringizni yozing" /></label>
          <label>Media <input type="file" /></label>
        </div>
        <div className="composer-actions">
          <button><Send size={16} /> Submit</button>
          <button><ThumbsUp size={16} /> Like</button>
          <button><Flag size={16} /> Report</button>
        </div>
      </div>
    </section>
  );
}

function LoginModal({ open, onClose, onUser }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', phone_number: '', role: 'student' });
  const [status, setStatus] = useState({ loading: false, error: '' });
  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '' });
    try {
      const user = mode === 'login' ? await login(form) : await signup(form);
      onUser(user);
      onClose();
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="login-modal" onSubmit={submit}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Yopish"><X size={18} /></button>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'is-active' : ''} type="button" onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'signup' ? 'is-active' : ''} type="button" onClick={() => setMode('signup')}>Signup</button>
        </div>
        <label>
          Username
          <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required />
        </label>
        {mode === 'signup' && (
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
        )}
        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        </label>
        {mode === 'signup' && (
          <label>
            Phone
            <input value={form.phone_number} onChange={(event) => setForm({ ...form, phone_number: event.target.value })} />
          </label>
        )}
        {status.error && <div className="form-error">{status.error}</div>}
        <button className="primary-btn" disabled={status.loading}>
          {status.loading ? <Loader2 className="spin" size={18} /> : <LogIn size={18} />}
          {mode === 'login' ? 'Kirish' : 'Register'}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [collapsed, setCollapsed] = useState(() => window.matchMedia('(max-width: 920px)').matches);
  const [active, setActive] = useState('Courses');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ search: '', level: '', language: '', certificate: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser());
  const apiFilters = useMemo(() => ({ ...filters, search: query }), [filters, query]);
  const { courses, centers, mentors, tags, loading, error } = usePlatformData(apiFilters);

  useEffect(() => {
    if (!user) return;
    api.getProfile()
      .then((payload) => setUser(payload?.data || user))
      .catch(() => setUser(getStoredUser()));
  }, []);

  const filteredCourses = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return courses;
    return courses.filter((course) =>
      [course.title, course.description, course.language, course.mentor?.full_name, course.course_center?.title]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [courses, query]);

  const selectedCourse = useMemo(() => {
    const source = filteredCourses.length ? filteredCourses : courses;
    return source.find((course) => course.id === selectedId) || source[0] || null;
  }, [courses, filteredCourses, selectedId]);

  return (
    <div className="app-shell">
      <div className="sky-noise" />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={active} setActive={setActive} />
      <main className="workspace">
        <Topbar query={query} setQuery={setQuery} user={user} onLoginClick={() => user ? (logout(), setUser(null)) : setLoginOpen(true)} />
        {error && <div className="api-alert">{error}</div>}
        <div className="dashboard-grid">
          <div className="primary-column">
            <CourseHero course={selectedCourse} />
            <CourseList
              courses={filteredCourses}
              loading={loading}
              selectedId={selectedCourse?.id}
              setSelectedId={setSelectedId}
              filters={filters}
              setFilters={setFilters}
              onClearFilters={() => {
                setQuery('');
                setFilters({ level: '', language: '', certificate: '' });
              }}
            />
            <DetailTabs course={selectedCourse} />
          </div>
          <div className="side-column">
            <StatsCard courses={courses} mentors={mentors} centers={centers} />
            <section className="content-panel reveal">
              <div className="section-head">
                <div>
                  <h3>Top tags</h3>
                  <p>Course tags endpointidan.</p>
                </div>
                <Bookmark size={18} />
              </div>
              <div className="tag-cloud">
                {(tags.length ? tags : [{ name: 'Django' }, { name: 'API' }, { name: 'UX' }, { name: 'Mentor' }]).slice(0, 12).map((tag) => (
                  <span key={tag.slug || tag.name}>{tag.name}</span>
                ))}
              </div>
            </section>
            <section className="discussion-card reveal">
              <h3>Discussion signals</h3>
              {mockDiscussion.map((item) => (
                <div className="signal" key={item.title}>
                  <TrendingUp size={17} />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>
        <UserFlowPanel selectedCourse={selectedCourse} />
      </main>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onUser={setUser} />
      <button className="mobile-menu" onClick={() => setCollapsed(false)} aria-label="Menu">
        <Menu size={20} />
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
