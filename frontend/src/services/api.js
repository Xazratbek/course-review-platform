const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEY = 'course-review-platform-auth';

const joinUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
const getSession = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
const setSession = (session) => localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
const clearSession = () => localStorage.removeItem(STORAGE_KEY);

const authHeaders = () => {
  const s = getSession();
  return s?.access ? { Authorization: `Bearer ${s.access}` } : {};
};

const buildQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== '' && v !== undefined && v !== null && q.set(k, v));
  return q.toString() ? `?${q.toString()}` : '';
};

async function fetchJson(path, options = {}) {
  const { response } = await (async () => {
    const r = await fetch(joinUrl(path), {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...authHeaders(),
        ...options.headers,
      },
    });
    return { response: r };
  })();
  let payload = null;
  try { payload = await response.json(); } catch { payload = null; }
  return { response, payload };
}

async function refreshAccessToken() {
  const s = getSession();
  if (!s?.refresh) return null;
  const { response, payload } = await fetchJson('/token/refresh/', { method: 'POST', body: JSON.stringify({ refresh: s.refresh }) });
  if (!response.ok || !payload?.access) return clearSession(), null;
  setSession({ ...s, access: payload.access });
  return payload.access;
}

async function request(path, options = {}) {
  let { response, payload } = await fetchJson(path, options);
  if (response.status === 401 && !options.skipRefresh) {
    const access = await refreshAccessToken();
    if (access) ({ response, payload } = await fetchJson(path, { ...options, skipRefresh: true, headers: { ...options.headers, Authorization: `Bearer ${access}` } }));
  }
  if (!response.ok) throw new Error(payload?.detail || payload?.message || JSON.stringify(payload) || 'API xatosi');
  return payload;
}

const decodeJwt = (token) => {
  try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return null; }
};

export const normalizeList = (x) => (Array.isArray(x) ? x : x?.results || x?.data || []);
export const getStoredUser = () => getSession()?.user || null;
export const logout = () => clearSession();

export async function login(credentials) {
  const payload = await request('/accounts/login/', { method: 'POST', body: JSON.stringify(credentials) });
  const user = decodeJwt(payload.access) || { username: credentials.username };
  setSession({ ...payload, user });
  return user;
}

export const api = {
  signup: (formData) => request('/accounts/signup/', { method: 'POST', body: formData }),
  getProfile: () => request('/accounts/my/profile/'),
  updateProfile: (formData) => request('/accounts/update/', { method: 'PATCH', body: formData }),
  deleteProfile: () => request('/accounts/delete/', { method: 'DELETE' }),
  changePassword: (payload) => request('/accounts/password/change/', { method: 'POST', body: JSON.stringify(payload) }),

  getCategories: () => request('/course/categories/'),
  getCenters: (params) => request(`/course/centers/${buildQuery(params)}`),
  getCenter: (slug) => request(`/course/centers/${slug}/`),
  getMentors: (params) => request(`/course/mentors/${buildQuery(params)}`),
  getMentor: (slug) => request(`/course/mentors/${slug}/`),
  getTags: (params) => request(`/course/tags/${buildQuery(params)}`),
  getTagItemsByCourseSlug: (slug) => request(`/course/tags/${slug}/`),
  getCourses: (params) => request(`/course/${buildQuery(params)}`),
  getCourse: (slug) => request(`/course/${slug}/`),

  getCommentsByReview: (reviewId) => request(`/reviews/comments/by_review/${reviewId}/`),
  createComment: (payload) => request('/reviews/comments/comment/', { method: 'POST', body: JSON.stringify(payload) }),
  updateComment: (id, formData) => request(`/reviews/comments/comment/${id}/`, { method: 'PATCH', body: formData }),
  deleteComment: (id) => request(`/reviews/comments/comment/${id}/`, { method: 'DELETE' }),
  getReviewsByCourse: (slug) => request(`/reviews/by_course/${slug}/`),
  createReview: (payload) => request('/reviews/create/', { method: 'POST', body: JSON.stringify(payload) }),
  getMyReviews: (params) => request(`/reviews/my/${buildQuery(params)}`),
  getReview: (id) => request(`/reviews/${id}/`),
  updateReview: (id, payload) => request(`/reviews/update/${id}/`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteReview: (id) => request(`/reviews/delete/${id}/`, { method: 'DELETE' }),
  voteReview: (payload) => request('/reviews/vote/', { method: 'POST', body: JSON.stringify(payload) }),
  uploadReviewMedia: (formData) => request('/reviews/media/upload/', { method: 'POST', body: formData }),
  deleteReviewMedia: (id) => request(`/reviews/media/delete/${id}/`, { method: 'DELETE' }),

  toggleFavorite: (payload) => request('/interactions/favorites/toggle/', { method: 'POST', body: JSON.stringify(payload) }),
  getFavorites: () => request('/interactions/favorites/my/'),
  getHistory: () => request('/interactions/course/history/'),
  getAllActivities: () => request('/interactions/activities/'),
  getMyActivities: () => request('/interactions/activities/my/'),
  getActivitiesByUser: (id) => request(`/interactions/activities/${id}/`),

  getNotifications: () => request('/notifications/'),
  getNotification: (id) => request(`/notifications/${id}/`),
  markAllNotifications: () => request('/notifications/mark_all/', { method: 'POST' }),
  markOneNotification: (notification_id) => request('/notifications/mark_one/', { method: 'POST', body: JSON.stringify({ notification_id }) }),

  getMyReports: (params) => request(`/moderation/my_reports/${buildQuery(params)}`),
  createReport: (payload) => request('/moderation/report/create/', { method: 'POST', body: JSON.stringify(payload) }),
};
