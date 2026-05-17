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
  const { skipRefresh, ...fetchOptions } = options;
  const response = await fetch(joinUrl(path), {
    ...fetchOptions,
    headers: {
      Accept: 'application/json',
      ...(fetchOptions.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders(),
      ...fetchOptions.headers,
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
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
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
  const payload = await request('/accounts/login/', { method: 'POST', body: JSON.stringify(credentials) });
  const user = decodeJwt(payload.access) || { username: credentials.username };
  const session = { ...payload, user };
  setSession(session);
  return user;
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
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      const result = JSON.parse(xhr.responseText || '{}');
      if (xhr.status >= 200 && xhr.status < 300) return resolve(result);
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
  return getSession()?.user || null;
}

export const api = {
  getCategories: () => request('/course/categories/'),
  getCourses: (params) => request(`/course/${buildQuery(params)}`),
  getCourse: (slug) => request(`/course/${slug}/`),
  getCenters: (params) => request(`/course/centers/${buildQuery(params)}`),
  getMentors: (params) => request(`/course/mentors/${buildQuery(params)}`),
  getTags: (params) => request(`/course/tags/${buildQuery(params)}`),
  getProfile: () => request('/accounts/my/profile/'),
  updateProfile: (formData) => request('/accounts/update/', { method: 'PATCH', body: formData }),
  deleteProfile: () => request('/accounts/delete/', { method: 'DELETE' }),
  changePassword: (payload) => request('/accounts/password/change/', { method: 'POST', body: JSON.stringify(payload) }),
  getNotifications: () => request('/notifications/'),
  getFavorites: () => request('/interactions/favorites/my/'),
  getMyReviews: (params) => request(`/reviews/my/${buildQuery(params)}`),
  updateReview: (id, payload) => request(`/reviews/update/${id}/`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteReview: (id) => request(`/reviews/delete/${id}/`, { method: 'DELETE' }),
  getReview: (id) => request(`/reviews/${id}/`),
  createReview: (payload) => request('/reviews/create/', { method: 'POST', body: JSON.stringify(payload) }),
  deleteReviewMedia: (id) => request(`/reviews/media/delete/${id}/`, { method: 'DELETE' }),
  getHistory: () => request('/interactions/course/history/'),
  getMyActivities: () => request('/interactions/activities/my/'),
  getMyReports: () => request('/moderation/my_reports/'),
  createReport: (payload) => request('/moderation/report/create/', { method: 'POST', body: JSON.stringify(payload) }),
};
