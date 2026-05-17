import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  SlidersHorizontal,
  RotateCcw,
  Star,
  Tag,
  ThumbsUp,
  Upload,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { api, assetUrl, getStoredUser, login, logout, signup } from './services/api.js';
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

const parseRoute = () => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts[0] === 'centers' && parts[1]) return { type: 'center-detail', slug: parts[1] };
  if (parts[0] === 'mentors' && parts[1]) return { type: 'mentor-detail', slug: parts[1] };
  return { type: 'dashboard' };
};

function VerifiedBadge({ show }) {
  if (!show) return null;
  return (
    <span className="verified-badge" title="Tasdiqlangan">
      <CheckCircle2 size={15} />
    </span>
  );
}

function usePlatformData(filters) {
  const [state, setState] = useState({
    categories: [],
    courses: [],
    centers: [],
    mentors: [],
    tags: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    let alive = true;
    setState((current) => ({ ...current, loading: true }));
    Promise.allSettled([
      api.getCategories(),
      api.getCourses({
        search: filters.search,
        language: filters.language,
        level: filters.level,
        certificate_available: filters.certificate,
        category: filters.category,
      }),
      api.getCenters({ search: filters.search }),
      api.getMentors({ search: filters.search }),
      api.getTags({ search: filters.search }),
    ]).then((results) => {
      if (!alive) return;
      const [categories, courses, centers, mentors, tags] = results.map((result) =>
        result.status === 'fulfilled' ? normalizeList(result.value) : []
      );
      setState({
        categories,
        courses,
        centers,
        mentors,
        tags,
        loading: false,
        error: results.some((result) => result.status === 'rejected')
          ? 'API bilan aloqa bo‘lmadi. Backend serverni tekshiring.'
          : '',
      });
    });
    return () => {
      alive = false;
    };
  }, [filters.search, filters.language, filters.level, filters.certificate, filters.category]);

  return state;
}

function Sidebar({ collapsed, setCollapsed, active, setActive, user, onProfileClick }) {
  const groups = [
    {
      name: 'Explore',
      icon: LayoutDashboard,
      items: [
        { name: 'Courses', icon: LibraryBig },
        { name: 'Centers', icon: Building2 },
        { name: 'Mentors', icon: UsersRound },
        { name: 'Tags', icon: Tag },
      ],
    },
    {
      name: 'Account',
      icon: UserRound,
      items: [
        { name: 'Profile', icon: UserRound },
        { name: 'Favorites', icon: Heart },
        { name: 'Notifications', icon: Bell },
      ],
    },
    {
      name: 'Reviews',
      icon: MessageSquareText,
      items: [
        { name: 'My reviews', icon: MessageSquareText },
        { name: 'Votes', icon: ThumbsUp },
        { name: 'Reports', icon: Flag },
      ],
    },
    {
      name: 'Settings',
      icon: Settings,
      items: [{ name: 'Security', icon: ShieldCheck }],
    },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-mark">CR</div>
        <div className="brand-copy">
          <strong>CourseRate</strong>
          <span>Course reviews</span>
        </div>
      </div>

      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Sidebar toggle">
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <nav className="nav-stack" aria-label="Asosiy menyu">
        {groups.map((group) => {
          const GroupIcon = group.icon;
          const open = group.items.some((item) => item.name === active);
          return (
            <div className={`nav-group ${open ? 'is-open' : ''}`} key={group.name}>
              <button className="nav-head" onClick={() => setActive(group.items[0].name)}>
                <GroupIcon size={19} />
                <span>{group.name}</span>
                <ChevronDown className="nav-chevron" size={16} />
              </button>
              {!collapsed && (
                <div className="nav-children">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        className={active === item.name ? 'is-active' : ''}
                        key={item.name}
                        onClick={() => setActive(item.name)}
                      >
                        <ItemIcon size={16} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <button className="user-chip user-chip-btn" onClick={onProfileClick}>
            <div className="avatar">{(user.username || 'U').slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{user.username}</strong>
              <span>{user.email || 'Profile'}</span>
            </div>
          </button>
        ) : (
          <div className="user-chip">
            <div className="avatar">GU</div>
            <div>
              <strong>Guest</strong>
              <span>Login qiling</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function Topbar({ draftSearch, setDraftSearch, onSearch, user, onLoginClick, onLogout, unreadCount, onOpenNotifications }) {
  return (
    <header className="topbar">
      <div>
        <p className="crumbs">Education / Course reviews</p>
        <h1>Kurslarni solishtiring</h1>
      </div>
      <div className="top-actions">
        <form className="search-box" onSubmit={onSearch}>
          <Search size={18} />
          <input
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder="Kurs, mentor yoki markaz"
          />
          <button className="search-submit" aria-label="Qidirish">
            <Search size={16} />
          </button>
        </form>
        <button className="icon-btn" aria-label="Bildirishnomalar" onClick={onOpenNotifications}>
          <Bell size={19} />
          {unreadCount > 0 && <span className="notify-dot">{unreadCount}</span>}
        </button>
        <button className="pill-btn" onClick={onLoginClick}>
          {user ? <UserRound size={18} /> : <LogIn size={18} />}
          <span>{user ? user.username : 'Kirish'}</span>
        </button>
        {user && (
          <button className="pill-btn" onClick={onLogout}>
            <span>Chiqish</span>
          </button>
        )}
      </div>
    </header>
  );
}

function CourseHero({ course, onReview }) {
  const tags = course?.tags?.slice(0, 4) || [];
  return (
    <section className="course-hero reveal">
      <div className="course-hero__content">
        <div className="eyebrow">
          <Building2 size={16} />
          <span>{course?.course_center?.title || 'Course center'}</span>
          <VerifiedBadge show={course?.course_center?.verified} />
        </div>
        <h2>{course?.title || 'Kurs tanlang'}</h2>
        <p>{course?.description || 'Katalogdan kurs tanlang va batafsil ma’lumotni ko‘ring.'}</p>
        <div className="tag-row">
          {(tags.length ? tags : [{ name: 'Django' }, { name: 'API' }, { name: 'Frontend' }]).map((tagItem) => (
            <span key={tagItem.slug || tagItem.name}>{tagItem.name}</span>
          ))}
        </div>
        <div className="hero-meta">
          <span><Star size={16} fill="currentColor" /> {course?.average_rating || '0.0'}</span>
          <span><BookOpenCheck size={16} /> {course?.duration_in_weeks || '-'} hafta</span>
          <span><UsersRound size={16} /> {course?.students_count || 0} talaba</span>
        </div>
      </div>
      <div className="hero-side">
        <button><span>Level</span><strong>{course?.level || '-'}</strong></button>
        <button><span>Language</span><strong>{course?.language || '-'}</strong></button>
        <button><span>Price</span><strong>{formatPrice(course?.price)}</strong></button>
        <button onClick={onReview} className="hero-review-btn"><MessageSquareText size={16} /> Sharh qoldirish</button>
      </div>
    </section>
  );
}

function FilterBar({ open, filters, setFilters, onClear, categories }) {
  if (!open) return null;
  return (
    <div className="filter-bar">
      <label>
        Category
        <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
          <option value="">All</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
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
      <button className="clear-icon-btn" onClick={onClear} aria-label="Filterlarni tozalash">
        <RotateCcw size={17} />
      </button>
    </div>
  );
}

function CourseList({ courses, loading, selectedId, setSelectedId, filters, setFilters, onClearFilters, categories }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const fallback = [
    {
      id: 'mock-1',
      title: 'Django REST Framework Pro',
      description: 'Production API, JWT va permissions.',
      level: 'bootcamp',
      language: 'uz',
      price: 1200000,
      average_rating: '4.9',
      students_count: 210,
      course_center: { title: 'Najot Ta’lim', verified: true },
      mentor: { full_name: 'Ali Karimov', verified: true },
    },
    {
      id: 'mock-2',
      title: 'Frontend UX Review Lab',
      description: 'Interface audit va usability basics.',
      level: 'middle',
      language: 'en',
      price: 890000,
      average_rating: '4.7',
      students_count: 96,
      course_center: { title: 'Grow Academy', verified: true },
      mentor: { full_name: 'Sara Green' },
    },
  ];
  const normalizeValue = (value) => String(value || '').trim().toLowerCase();
  const languageMap = { uzbek: 'uz', uz: 'uz', russian: 'ru', ru: 'ru', english: 'en', en: 'en' };
  const selectedLanguage = languageMap[normalizeValue(filters.language)] || normalizeValue(filters.language);

  const baseList = courses.length ? courses : fallback;
  const list = baseList.filter((course) => {
    if (filters.level && normalizeValue(course.level) !== normalizeValue(filters.level)) return false;

    if (selectedLanguage) {
      const courseLanguage = languageMap[normalizeValue(course.language)] || normalizeValue(course.language);
      if (courseLanguage !== selectedLanguage) return false;
    }

    if (filters.certificate !== '') {
      const certificateValue = Boolean(course.certificate_available);
      const expected = filters.certificate === 'true';
      if (certificateValue !== expected) return false;
    }

    if (filters.category && String(course.category?.id || course.category) !== String(filters.category)) return false;
    return true;
  });

  return (
    <section className="content-panel reveal">
      <div className="section-head">
        <div>
          <h3>Kurs katalogi</h3>
          <p>{loading ? 'Yuklanmoqda...' : `${list.length} ta kurs`}</p>
        </div>
        <button className={`ghost-btn ${filterOpen ? 'is-active' : ''}`} onClick={() => setFilterOpen(!filterOpen)}>
          <SlidersHorizontal size={17} /> Filter
        </button>
      </div>
      <FilterBar open={filterOpen} filters={filters} setFilters={setFilters} onClear={onClearFilters} categories={categories} />
      <div className="course-list">
        {loading && <div className="loading-line"><Loader2 className="spin" size={18} /> Kurslar yuklanmoqda</div>}
        {!loading && list.length === 0 && (
          <div className="loading-line">Filter bo‘yicha kurs topilmadi.</div>
        )}
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
              <span>
                {course.course_center?.title || 'Center TBD'} <VerifiedBadge show={course.course_center?.verified} />
                <span className="dot-separator">·</span>
                {course.mentor?.full_name || 'Mentor TBD'} <VerifiedBadge show={course.mentor?.verified} />
              </span>
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

function CourseDetail({ course, onReview }) {
  return (
    <section className="detail-card reveal">
      <div className="tab-row">
        <button className="is-active">Details</button>
        <button>Reviews</button>
        <button>Mentor</button>
      </div>
      <div className="detail-grid">
        <div className="detail-item"><BookOpenCheck size={18} /><span>{course?.duration_in_weeks || '-'} hafta</span></div>
        <div className="detail-item"><ShieldCheck size={18} /><span>{course?.certificate_available ? 'Sertifikat bor' : 'Sertifikat yo‘q'}</span></div>
        <div className="detail-item"><Compass size={18} /><span>{course?.level || '-'} daraja</span></div>
        <div className="detail-item"><MessageSquareText size={18} /><span>{course?.reviews_count || 0} sharh</span></div>
      </div>
      <div className="detail-summary">
        <div>
          <span>Mentor</span>
          <strong>{course?.mentor?.full_name || 'Belgilanmagan'} <VerifiedBadge show={course?.mentor?.verified} /></strong>
        </div>
        <div>
          <span>Markaz</span>
          <strong>{course?.course_center?.title || 'Belgilanmagan'} <VerifiedBadge show={course?.course_center?.verified} /></strong>
        </div>
        <button onClick={onReview}><MessageSquareText size={17} /> Sharh qoldirish</button>
      </div>
    </section>
  );
}

function DirectoryPanel({ centers, mentors, tags }) {
  return (
    <div className="side-column">
      <section className="content-panel reveal">
        <div className="section-head">
          <div>
            <h3>O‘quv markazlar</h3>
            <p>{centers.length} ta markaz</p>
          </div>
          <Building2 size={18} />
        </div>
        <div className="compact-list">
          {(centers.length ? centers : [{ title: 'Najot Ta’lim', verified: true }, { title: 'Grow Academy' }]).slice(0, 5).map((center) => (
            <div className="compact-row" key={center.id || center.title}>
              <span>{center.title}</span>
              <VerifiedBadge show={center.verified} />
            </div>
          ))}
        </div>
      </section>

      <section className="content-panel reveal">
        <div className="section-head">
          <div>
            <h3>Mentorlar</h3>
            <p>{mentors.length} ta mentor</p>
          </div>
          <UsersRound size={18} />
        </div>
        <div className="compact-list">
          {(mentors.length ? mentors : [{ full_name: 'Ali Karimov', specialization: 'Backend' }]).slice(0, 5).map((mentor) => (
            <div className="mentor-row" key={mentor.id || mentor.full_name}>
              <div className="avatar small">{mentor.full_name?.slice(0, 2).toUpperCase() || 'MN'}</div>
              <div>
                <strong>{mentor.full_name}</strong>
                <span>{mentor.specialization || 'Mentor'}</span>
              </div>
              <VerifiedBadge show={mentor.verified} />
            </div>
          ))}
        </div>
      </section>

      <section className="content-panel reveal">
        <div className="section-head">
          <div>
            <h3>Teglar</h3>
            <p>Tezkor filter</p>
          </div>
          <Tag size={18} />
        </div>
        <div className="tag-cloud">
          {(tags.length ? tags : [{ name: 'Django' }, { name: 'API' }, { name: 'React' }]).slice(0, 14).map((tagItem) => (
            <span key={tagItem.slug || tagItem.name}>{tagItem.name}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

function ExploreSection({ active, courses, categories, centers, mentors, tags, loading, selectedCourse, setSelectedId, filters, setFilters, setDraftSearch, setQuery, onReview, onOpenEntity }) {
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    setSelectedDetail(null);
    setDetailError('');
  }, [active]);

  if (active === 'Courses') {
    return (
      <div className="dashboard-grid">
        <div className="primary-column">
          <CourseHero course={selectedCourse} onReview={onReview} />
          <CourseList
            courses={courses}
            loading={loading}
            selectedId={selectedCourse?.id}
            setSelectedId={setSelectedId}
            filters={filters}
            setFilters={setFilters}
            onClearFilters={() => {
              setDraftSearch('');
              setQuery('');
              setFilters({ level: '', language: '', certificate: '', category: '' });
            }}
            categories={categories}
          />
          <CourseDetail course={selectedCourse} onReview={onReview} />
        </div>
        <DirectoryPanel centers={centers} mentors={mentors} tags={tags} />
      </div>
    );
  }

  const mapByTab = {
    Centers: centers,
    Mentors: mentors,
    Tags: tags,
  };
  const list = mapByTab[active] || [];
  const titleKey = active === 'Mentors' ? 'full_name' : 'title';
  const handleDetail = async (item) => {
    if (!(active === 'Centers' || active === 'Mentors') || !item.slug) return;
    onOpenEntity?.(active === 'Centers' ? 'center' : 'mentor', item.slug);
    return;
  };

  const handleInlineDetail = async (item) => {
    if (!(active === 'Centers' || active === 'Mentors') || !item.slug) return;
    setDetailLoading(true);
    setDetailError('');
    try {
      const payload = active === 'Centers' ? await api.getCenter(item.slug) : await api.getMentor(item.slug);
      setSelectedDetail(payload);
    } catch (error) {
      setDetailError(error.message);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <section className="workspace-view reveal">
      <div className="workspace-header"><h2>{active} detail</h2></div>
      <div className="compact-list">
        {list.map((item) => (
          <article
            className="content-panel"
            key={item.id || item.slug || item[titleKey] || item.name}
            onClick={() => handleDetail(item)}
          >
            <h3>{item[titleKey] || item.name}</h3>
            <p>{item.description || item.specialization || 'Detail ma’lumot backenddan keladi.'}</p>
          </article>
        ))}
      </div>
      {detailLoading && <div className="loading-line"><Loader2 className="spin" size={18} /> Detail yuklanmoqda</div>}
      {detailError && <div className="form-error">{detailError}</div>}
      {selectedDetail && active === 'Tags' && (
        <section className="detail-card reveal">
          <h3>{selectedDetail.title || selectedDetail.full_name}</h3>
          <p>{selectedDetail.description || selectedDetail.bio || selectedDetail.website || 'Detail topilmadi'}</p>
        </section>
      )}
    </section>
  );
}

function WorkspaceView({ active, user, onEditProfile, onLogout, onReview }) {
  return (
    <section className="workspace-view reveal">
      <div className="workspace-header">
        <div>
          <p className="crumbs">Account / {active}</p>
          <h2>{active}</h2>
        </div>
        <button className="ghost-btn" onClick={onReview}><MessageSquareText size={17} /> Sharh yozish</button>
      </div>
      <div className="workspace-grid">
        <article className="action-card">
          <UserRound size={24} />
          <h3>{user?.username || 'Guest'}</h3>
          <p>{user?.email || 'Login qiling va profilingizni boshqaring.'}</p>
          <button onClick={onEditProfile}>Profilni tahrirlash</button>
        </article>
        <article className="action-card">
          <Heart size={24} />
          <h3>Favorites</h3>
          <p>Favorite kurslar shu yerda boshqariladi.</p>
          <button>Favorite</button>
        </article>
        <article className="action-card">
          <Bell size={24} />
          <h3>Notifications</h3>
          <p>Sharh, reply va system xabarlar shu yerda ko‘rinadi.</p>
          {user ? <button onClick={onLogout}>Tizimdan chiqish</button> : <button>Mark as read</button>}
        </article>
      </div>
    </section>
  );
}


function AccountSection({ active, user, notifications, favorites, myReviews, myReports, onOpenNotification, onMarkNotificationRead, onMarkAllNotificationsRead, onToggleFavorite, onVoteReview, onOpenReviewDetail, onOpenProfileSettings, onCreateReport, onReviewUpdate, onReviewDelete, onReviewMediaDelete, onChangePassword, onDeleteProfile, onLoadHistory, onLoadActivities }) {
  if (active === 'Notifications') {
    return <section className="workspace-view reveal"><div className="workspace-header"><h2>Notifications</h2><button className="ghost-btn" onClick={onMarkAllNotificationsRead}>Barchasini o‘qildi qilish</button></div><div className="compact-list">{notifications.map((n)=><article key={n.id} className="content-panel"><button className="course-row" onClick={()=>onOpenNotification(n)}><strong>{n.title}</strong><span>{n.notification_type_display}</span></button><button className="ghost-btn" onClick={()=>onMarkNotificationRead(n.id)}><CheckCircle2 size={16} /> O‘qildi</button></article>)}</div></section>;
  }
  if (active === 'Reports') {
    return <section className="workspace-view reveal"><h2>Reports management</h2><button className="ghost-btn" onClick={onCreateReport}><Flag size={16} /> Report create</button><div className="compact-list">{myReports.map((r)=><article key={r.id} className="content-panel"><h3>{r.reason_display || r.reason}</h3><p>Status: {r.status_display || r.status}</p></article>)}</div></section>;
  }
  if (active === 'Reports') {
    return <section className="workspace-view reveal"><h2>Reports management</h2><button className="ghost-btn" onClick={onCreateReport}><Flag size={16} /> Report create</button><div className="compact-list">{myReports.map((r)=><article key={r.id} className="content-panel"><h3>{r.reason_display || r.reason}</h3><p>Status: {r.status_display || r.status}</p></article>)}</div></section>;
  }
  if (active === 'Favorites') {
    return <section className="workspace-view reveal"><h2>Favorites</h2><div className="compact-list">{favorites.map((f)=><article key={f.id} className="content-panel"><h3>{f.title || f.course?.title || 'Course'}</h3><button className="ghost-btn" onClick={()=>onToggleFavorite(f.id || f.course?.id)}>Remove</button></article>)}</div></section>;
  }
  if (active === 'My reviews' || active === 'Votes') {
    return <section className="workspace-view reveal"><h2>{active}</h2><div className="compact-list">{myReviews.map((r)=><article key={r.id} className="content-panel"><h3>{r.title}</h3><p>Rating: {r.rating}</p><div className="top-actions"><button className="ghost-btn" onClick={()=>onVoteReview(r.id,'like')}>Like</button><button className="ghost-btn" onClick={()=>onVoteReview(r.id,'dislike')}>Dislike</button><button className="ghost-btn" onClick={()=>onOpenReviewDetail(r.id)}>Review detail</button><button className="ghost-btn" onClick={()=>onReviewUpdate(r)}>Update</button><button className="ghost-btn" onClick={()=>onReviewMediaDelete(r.id)}>Delete media</button><button className="ghost-btn" onClick={()=>onReviewDelete(r.id)}>Delete</button></div></article>)}</div></section>;
  }
  if (active === 'Profile') {
    return <section className="workspace-view reveal"><h2>Profile view</h2><article className="content-panel"><h3>{user?.username}</h3><p>{user?.email}</p><button className="ghost-btn" onClick={onOpenProfileSettings}>Profile settings</button></article></section>;
  }
  if (active === 'Security') {
    return <section className="workspace-view reveal"><h2>Security</h2><div className="top-actions"><button className="ghost-btn" onClick={onChangePassword}>Change password</button><button className="ghost-btn" onClick={onDeleteProfile}>Delete profile</button><button className="ghost-btn" onClick={onLoadHistory}>Course history</button><button className="ghost-btn" onClick={onLoadActivities}>My activity</button></div></section>;
  }
  return <WorkspaceView active={active} user={user} />;
}

function ReviewModal({ open, onClose, course }) {
  const [rating, setRating] = useState(0);
  const [form, setForm] = useState({ title: '', advantages: '', disadvantages: '', body: '' });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: '' });
  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (!course?.id) return;
    setStatus({ loading: true, error: '' });
    try {
      const created = await api.createReview({ ...form, rating, course: course.id });
      const reviewId = created?.id || created?.data?.id;
      if (reviewId && mediaFiles.length > 0) {
        const fd = new FormData();
        fd.append('review', reviewId);
        mediaFiles.forEach((file) => fd.append('images', file));
        await api.uploadReviewMedia(fd);
      }
      onClose();
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };
  return (
    <div className="modal-backdrop">
      <form className="review-modal" onSubmit={submit}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Yopish"><X size={18} /></button>
        <div>
          <p className="crumbs">{course?.title || 'Course'}</p>
          <h3>Sharh qoldirish</h3>
        </div>
        <div className="review-form-grid">
          <label>Rating
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" className="star-btn" onClick={() => setRating(value)}>
                  <Star size={18} fill={value <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </label>
          <label>Title <input placeholder="Qisqa sarlavha" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} /></label>
          <label>Afzalliklar <textarea placeholder="Nima yaxshi?" value={form.advantages} onChange={(e)=>setForm({...form, advantages:e.target.value})} /></label>
          <label>Kamchiliklar <textarea placeholder="Nima yetishmadi?" value={form.disadvantages} onChange={(e)=>setForm({...form, disadvantages:e.target.value})} /></label>
          <label className="wide">Sharh <textarea placeholder="To‘liq fikringiz" value={form.body} onChange={(e)=>setForm({...form, body:e.target.value})} /></label>
          <label>Media <input type="file" multiple onChange={(e)=>setMediaFiles(Array.from(e.target.files || []))} /></label>
        </div>
        <div className="composer-actions">
          {status.error && <div className="form-error">{status.error}</div>}
          <button type="submit" disabled={status.loading}><Send size={16} /> Yuborish</button>
        </div>
      </form>
    </div>
  );
}

function LoginModal({ open, onClose, onUser }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', phone_number: '', role: 'student', avatar: null });
  const [status, setStatus] = useState({ loading: false, error: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setUploadProgress(0);
    setStatus({ loading: true, error: '' });
    try {
      const nextUser =
        mode === 'login'
          ? await login(form)
          : await signup(form, {
              onProgress: (percent) => setUploadProgress(percent),
            });
      onUser(nextUser);
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
        <label>Username <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></label>
        {mode === 'signup' && (
          <label>Email <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        )}
        <label>Password <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
        {mode === 'signup' && (
          <label>Phone <input value={form.phone_number} onChange={(event) => setForm({ ...form, phone_number: event.target.value })} /></label>
        )}
        {mode === 'signup' && (
          <label>
            Avatar
            <input type="file" accept="image/*" onChange={(event) => setForm({ ...form, avatar: event.target.files?.[0] || null })} />
          </label>
        )}
        {mode === 'signup' && status.loading && (
          <div className="upload-progress-wrap">
            <div className="upload-progress-head">
              <span>Avatar yuklanmoqda...</span>
              <strong>{uploadProgress}%</strong>
            </div>
            <div className="upload-progress">
              <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
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


function EditProfileModal({ open, user, onClose, onSaved }) {
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '', phone_number: user?.phone_number || '' });
  const [status, setStatus] = useState({ loading: false, error: '' });

  useEffect(() => {
    if (!open) return;
    setForm({
      username: user?.username || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
    });
    setStatus({ loading: false, error: '' });
  }, [open, user]);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '' });
    try {
      const payload = await api.updateProfile(form);
      onSaved(payload?.data || { ...user, ...form });
      onClose();
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="login-modal" onSubmit={submit}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Yopish"><X size={18} /></button>
        <h3>Profilni tahrirlash</h3>
        <label>Username <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></label>
        <label>Email <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label>Phone <input value={form.phone_number} onChange={(event) => setForm({ ...form, phone_number: event.target.value })} /></label>
        {status.error && <div className="form-error">{status.error}</div>}
        <button className="primary-btn" disabled={status.loading}>
          {status.loading ? <Loader2 className="spin" size={18} /> : 'Saqlash'}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [collapsed, setCollapsed] = useState(() => window.matchMedia('(max-width: 920px)').matches);
  const [active, setActive] = useState('Courses');
  const [query, setQuery] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [filters, setFilters] = useState({ level: '', language: '', certificate: '', category: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [route, setRoute] = useState(parseRoute());
  const [entityDetail, setEntityDetail] = useState(null);
  const [entityLoading, setEntityLoading] = useState(false);
  const [entityError, setEntityError] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser());
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [reviewDetail, setReviewDetail] = useState(null);
  const [reviewComments, setReviewComments] = useState([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [courseDetail, setCourseDetail] = useState(null);
  const [courseReviews, setCourseReviews] = useState([]);
  const { categories, courses, centers, mentors, tags, loading, error } = usePlatformData({ ...filters, search: query });

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([api.getProfile(), api.getNotifications(), api.getFavorites(), api.getMyReviews(), api.getMyReports()]).then((items)=>{
      const [profile, nt, fav, reviews, reports] = items;
      if (profile.status==='fulfilled') setUser(profile.value?.data || user);
      if (nt.status==='fulfilled') setNotifications(normalizeList(nt.value));
      if (fav.status==='fulfilled') setFavorites(normalizeList(fav.value));
      if (reviews.status==='fulfilled') setMyReviews(normalizeList(reviews.value));
      if (reports.status==='fulfilled') setMyReports(normalizeList(reports.value));
    }).catch(()=>{});
    api.getProfile()
      .then((payload) => setUser(payload?.data || user))
      .catch(() => setUser(getStoredUser()));
  }, []);

  useEffect(() => {
    const load = async () => {
      if (route.type === 'center-detail') {
        setEntityLoading(true); setEntityError('');
        try { setEntityDetail(await api.getCenter(route.slug)); } catch (e) { setEntityError(e.message); }
        finally { setEntityLoading(false); }
      } else if (route.type === 'mentor-detail') {
        setEntityLoading(true); setEntityError('');
        try { setEntityDetail(await api.getMentor(route.slug)); } catch (e) { setEntityError(e.message); }
        finally { setEntityLoading(false); }
      } else {
        setEntityDetail(null);
      }
    };
    load();
  }, [route]);

  useEffect(() => {
    const loadCourseDetail = async () => {
      if (!selectedCourse?.slug) return;
      try {
        const [detail, reviewsPayload] = await Promise.all([
          api.getCourse(selectedCourse.slug),
          api.getCourseReviews(selectedCourse.slug),
        ]);
        setCourseDetail(detail);
        setCourseReviews(normalizeList(reviewsPayload));
      } catch {
        setCourseDetail(selectedCourse);
        setCourseReviews([]);
      }
    };
    loadCourseDetail();
  }, [selectedCourse?.slug]);

  const selectedCourse = useMemo(() => {
    return courses.find((course) => course.id === selectedId) || courses[0] || null;
  }, [courses, selectedId]);

  const isExplore = ['Courses', 'Centers', 'Mentors', 'Tags'].includes(active) && route.type === 'dashboard';

  const handleLogout = () => {
    logout();
    setUser(null);
    setActive('Courses');
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setQuery(draftSearch.trim());
  };

  return (
    <div className="app-shell">
      <div className="sky-noise" />
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        active={active}
        setActive={setActive}
        user={user}
        onProfileClick={() => setActive('Profile')}
      />
      <main className="workspace">
        <Topbar
          draftSearch={draftSearch}
          setDraftSearch={setDraftSearch}
          onSearch={submitSearch}
          user={user}
          onLoginClick={() => (user ? setActive('Profile') : setLoginOpen(true))}
          onLogout={handleLogout}
          unreadCount={notifications.length}
          onOpenNotifications={() => setActive('Notifications')}
        />
        {error && <div className="api-alert">{error}</div>}

        {isExplore ? (
          <ExploreSection
            active={active}
            courses={courses}
            categories={categories}
            centers={centers}
            mentors={mentors}
            tags={tags}
            loading={loading}
            selectedCourse={courseDetail || selectedCourse}
            setSelectedId={setSelectedId}
            filters={filters}
            setFilters={setFilters}
            setDraftSearch={setDraftSearch}
            setQuery={setQuery}
            onReview={() => setReviewOpen(true)}
            onOpenEntity={(type, slug) => {
              const path = type === 'center' ? `/centers/${slug}/` : `/mentors/${slug}/`;
              window.history.pushState({}, '', path);
              setRoute(parseRoute());
            }}
          />
        ) : route.type !== 'dashboard' ? (
          <section className="workspace-view reveal">
            <button className="ghost-btn" onClick={() => { window.history.pushState({}, '', '/'); setRoute(parseRoute()); setActive(route.type === 'center-detail' ? 'Centers' : 'Mentors'); }}>← Orqaga</button>
            {entityLoading && <div className="loading-line"><Loader2 className="spin" size={18} /> Detail yuklanmoqda</div>}
            {entityError && <div className="form-error">{entityError}</div>}
            {entityDetail && (
              <article className="detail-card reveal">
                <h2>{entityDetail.title || entityDetail.full_name}</h2>
                <p>{entityDetail.description || entityDetail.bio || entityDetail.website || 'Detail topilmadi'}</p>
              </article>
            )}
          </section>
        ) : (
          <AccountSection
            active={active}
            user={user}
            notifications={notifications}
            favorites={favorites}
            myReviews={myReviews}
            myReports={myReports}
            onOpenNotification={async (n) => { await api.getNotificationDetail(n.id).catch(()=>null); await api.markNotificationRead(n.id); setNotifications((prev)=>prev.filter((x)=>x.id!==n.id)); }}
            onMarkNotificationRead={async (id) => { await api.markNotificationRead(id); setNotifications((prev)=>prev.filter((x)=>x.id!==id)); }}
            onMarkAllNotificationsRead={async () => { await api.markAllNotificationsRead(); setNotifications([]); }}
            onToggleFavorite={async (courseId) => { await api.toggleFavorite(courseId); setFavorites((prev)=>prev.filter((x)=>(x.id||x.course?.id)!==courseId)); }}
            onVoteReview={async (id, type) => { await api.voteReview(id, type); }}
            onOpenReviewDetail={async (id) => { const detail = await api.getReview(id); const comments = await api.getReviewComments(id); setReviewDetail(detail); setReviewComments(normalizeList(comments)); setActive('Review detail'); }}
            onOpenProfileSettings={() => setEditProfileOpen(true)}
            onCreateReport={async () => { const firstReview = myReviews[0]; if (!firstReview) return; const reason = window.prompt('Reason kiriting (spam/hate/fake/other)', 'spam') || 'spam'; await api.createReport({ review: firstReview.id, reason }); const list = await api.getMyReports(); setMyReports(normalizeList(list)); }}
            onReviewUpdate={async (r) => { await api.updateReview(r.id, { title: r.title, body: r.body, advantages: r.advantages || 'Afzallik', disadvantages: r.disadvantages || 'Kamchilik' }); }}
            onReviewDelete={async (id) => { await api.deleteReview(id); const list = await api.getMyReviews(); setMyReviews(normalizeList(list)); }}
            onReviewMediaDelete={async (id) => { await api.deleteReviewMedia(id); }}
            onChangePassword={async () => { const old_password = window.prompt('Old password'); const new_password = window.prompt('New password'); const confirm_password = window.prompt('Confirm password'); if (!old_password || !new_password || !confirm_password) return; await api.changePassword({ old_password, new_password, confirm_password }); }}
            onDeleteProfile={async () => { if (!window.confirm('Profilni o‘chirasizmi?')) return; await api.deleteProfile(); logout(); setUser(null); }}
            onLoadHistory={async () => { const payload = await api.getCourseHistory(); alert(`History items: ${normalizeList(payload).length}`); }}
            onLoadActivities={async () => { const payload = await api.getMyActivities(); alert(`Activities: ${normalizeList(payload).length}`); }}
          />
        )}
        {active === 'Review detail' && reviewDetail && (
          <section className="workspace-view reveal">
            <div className="workspace-header">
              <h2>Review detail</h2>
              <button className="ghost-btn" onClick={() => setActive('My reviews')}>Orqaga</button>
            </div>
            <article className="content-panel">
              <h3>{reviewDetail.title}</h3>
              <p>{reviewDetail.body}</p>
              <p>Rating: {reviewDetail.rating}</p>
            </article>
            <h3>Comments</h3>
            <div className="compact-list">
              {reviewComments.map((c) => (
                <article key={c.id} className="content-panel">
                  <strong>{c.user_username}</strong>
                  <p>{c.body}</p>
                  <div className="top-actions">
                    <button className="ghost-btn" onClick={async () => { await api.updateComment(c.id, { body: `${c.body} (edited)` }); const refreshed = await api.getReviewComments(reviewDetail.id); setReviewComments(normalizeList(refreshed)); }}>Edit</button>
                    <button className="ghost-btn" onClick={async () => { await api.deleteComment(c.id); setReviewComments((prev) => prev.filter((x) => x.id !== c.id)); }}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); if (!commentDraft.trim()) return; await api.createComment({ review: reviewDetail.id, body: commentDraft }); const refreshed = await api.getReviewComments(reviewDetail.id); setReviewComments(normalizeList(refreshed)); setCommentDraft(''); }}>
              <input value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} placeholder="Comment yozing" />
              <button type="submit" className="ghost-btn">Yuborish</button>
            </form>
          </section>
        )}
      </main>
      <ReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} course={selectedCourse} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onUser={setUser} />
      <EditProfileModal
        open={editProfileOpen}
        user={user}
        onClose={() => setEditProfileOpen(false)}
        onSaved={setUser}
      />
      <button className="mobile-menu" onClick={() => setCollapsed(false)} aria-label="Menu">
        <Menu size={20} />
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
