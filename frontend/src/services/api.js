const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEY = 'course-review-platform-auth';

function joinUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function authHeaders() {
  const session = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  return session?.access ? { Authorization: `Bearer ${session.access}` } : {};
}

function getSession() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
}

function setSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

async function fetchJson(path, options = {}) {
  const response = await fetch(joinUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders(),
      ...options.headers,
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return { response, payload };
}

async function refreshAccessToken() {
  const session = getSession();
  if (!session?.refresh) return null;
  const { response, payload } = await fetchJson('/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh: session.refresh }),
  });
  if (!response.ok || !payload?.access) {
    clearSession();
    return null;
  }
  const nextSession = { ...session, access: payload.access };
  setSession(nextSession);
  return payload.access;
}

async function request(path, options = {}) {
  let { response, payload } = await fetchJson(path, options);

  if (response.status === 401 && !options.skipRefresh) {
    const access = await refreshAccessToken();
    if (access) {
      ({ response, payload } = await fetchJson(path, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${access}` },
        skipRefresh: true,
      }));
    }
  }

  if (!response.ok) {
    const message = payload?.detail || payload?.message || 'API request failed';
    throw new Error(message);
  }

  return payload;
}

function decodeJwt(token) {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function assetUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//.test(value)) return value;
  const base = API_BASE === '/api' ? 'http://127.0.0.1:8000' : API_BASE.replace(/\/$/, '');
  return `${base}${value.startsWith('/') ? value : `/${value}`}`;
}

export async function login(credentials) {
  const payload = await request('/accounts/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  const user = decodeJwt(payload.access) || { username: credentials.username };
  const session = { ...payload, user };
  setSession(session);
  try {
    const profile = await request('/accounts/my/profile/');
    const nextUser = profile?.data || user;
    setSession({ ...session, user: nextUser });
    return nextUser;
  } catch {
    return user;
  }
}

export async function signup(values, options = {}) {
  const { onProgress } = options;
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') formData.append(key, value);
  });

  const payload = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', joinUrl('/accounts/signup/'));
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    };

    xhr.onload = () => {
      let result = null;
      try {
        result = JSON.parse(xhr.responseText || '{}');
      } catch {
        result = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(result);
        return;
      }
      reject(new Error(result?.detail || result?.message || 'Signup failed'));
    };

    xhr.onerror = () => reject(new Error('Tarmoq xatosi'));
    xhr.send(formData);
  });

  const user = payload.user || decodeJwt(payload.access) || { username: values.username };
  setSession({ access: payload.access, refresh: payload.refresh, user });
  return user;
}

export function logout() {
  clearSession();
}

export function getStoredUser() {
  const session = getSession();
  return session?.user || null;
}

export const api = {
  getCategories: () => request('/course/categories/'),
  getCourses: (params) => request(`/course/${buildQuery(params)}`),
  getCourse: (slug) => request(`/course/${slug}/`),
  getCenters: (params) => request(`/course/centers/${buildQuery(params)}`),
  getCenter: (slug) => request(`/course/centers/${slug}/`),
  getMentors: (params) => request(`/course/mentors/${buildQuery(params)}`),
  getMentor: (slug) => request(`/course/mentors/${slug}/`),
  getTags: (params) => request(`/course/tags/${buildQuery(params)}`),
  getProfile: () => request('/accounts/my/profile/'),
  updateProfile: (formData) => request('/accounts/update/', { method: 'PATCH', body: formData }),
  getNotifications: () => request('/notifications/'),
  markNotificationRead: (notification_id) => request('/notifications/mark_one/', { method: 'POST', body: JSON.stringify({ notification_id }) }),
  markAllNotificationsRead: () => request('/notifications/mark_all/', { method: 'POST' }),
  getFavorites: () => request('/interactions/favorites/my/'),
  toggleFavorite: (course) => request('/interactions/favorites/toggle/', { method: 'POST', body: JSON.stringify({ course }) }),
  getMyReviews: (params) => request(`/reviews/my/${buildQuery(params)}`),
  getReview: (id) => request(`/reviews/${id}/`),
  getCourseReviews: (slug) => request(`/reviews/by_course/${slug}/`),
  createReview: (payload) => request('/reviews/create/', { method: 'POST', body: JSON.stringify(payload) }),
  uploadReviewMedia: (payload) => request('/reviews/media/upload/', { method: 'POST', body: payload }),
  voteReview: (review_id, vote_type) => request('/reviews/vote/', { method: 'POST', body: JSON.stringify({ review_id, vote_type }) }),
  getReviewComments: (id) => request(`/reviews/comments/by_review/${id}/`),
  createComment: (payload) => request('/reviews/comments/comment/', { method: 'POST', body: JSON.stringify(payload) }),
  getCommentReplies: (id) => request(`/reviews/comments/${id}/replies/`),
  updateComment: (id, payload) => request(`/reviews/comments/${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteComment: (id) => request(`/reviews/comments/${id}/`, { method: 'DELETE' }),
  getMyReports: () => request('/moderation/my_reports/'),
  createReport: (payload) => request('/moderation/report/create/', { method: 'POST', body: JSON.stringify(payload) }),

  updateReview: (id, payload) => request(`/reviews/update/${id}/`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteReview: (id) => request(`/reviews/delete/${id}/`, { method: 'DELETE' }),
  deleteReviewMedia: (id) => request(`/reviews/media/delete/${id}/`, { method: 'DELETE' }),
  changePassword: (payload) => request('/accounts/password/change/', { method: 'POST', body: JSON.stringify(payload) }),
  deleteProfile: () => request('/accounts/delete/', { method: 'DELETE' }),
  getCourseHistory: () => request('/interactions/course/history/'),
  getMyActivities: () => request('/interactions/activities/my/'),
  getNotificationDetail: (id) => request(`/notifications/${id}/`),
};
