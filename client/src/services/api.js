/**
 * API service helper with automatic HTTP-only cookie credentials
 */
const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Sends & receives HTTP-only cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'An unexpected error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Profile
  getProfile: () => request('/profile/me'),
  updateProfile: (payload) => request('/profile/me', { method: 'PUT', body: JSON.stringify(payload) }),

  // Projects
  getProjects: (category) => request(`/projects${category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (payload) => request('/projects', { method: 'POST', body: JSON.stringify(payload) }),
  updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  togglePublishProject: (id) => request(`/projects/${id}/publish`, { method: 'PATCH' }),
  toggleFeaturedProject: (id) => request(`/projects/${id}/featured`, { method: 'PATCH' }),

  // Skills
  getSkills: () => request('/skills'),
  createSkill: (payload) => request('/skills', { method: 'POST', body: JSON.stringify(payload) }),
  updateSkill: (id, payload) => request(`/skills/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteSkill: (id) => request(`/skills/${id}`, { method: 'DELETE' }),

  // Case Studies
  getCaseStudies: () => request('/case-studies'),
  createCaseStudy: (payload) => request('/case-studies', { method: 'POST', body: JSON.stringify(payload) }),
  updateCaseStudy: (id, payload) => request(`/case-studies/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCaseStudy: (id) => request(`/case-studies/${id}`, { method: 'DELETE' }),
  togglePublishCaseStudy: (id) => request(`/case-studies/${id}/publish`, { method: 'PATCH' }),

  // Testimonials
  getTestimonials: () => request('/testimonials'),
  createTestimonial: (payload) => request('/testimonials', { method: 'POST', body: JSON.stringify(payload) }),
  updateTestimonial: (id, payload) => request(`/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTestimonial: (id) => request(`/testimonials/${id}`, { method: 'DELETE' }),
  togglePublishTestimonial: (id) => request(`/testimonials/${id}/publish`, { method: 'PATCH' }),

  // Messages
  getMessages: () => request('/messages'),
  markMessageRead: (id) => request(`/messages/${id}/read`, { method: 'PATCH' }),
  deleteMessage: (id) => request(`/messages/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalytics: (range = '7d') => request(`/analytics?range=${range}`),

  // Public Endpoints
  getPublicPortfolio: (username) => request(`/public/u/${encodeURIComponent(username)}`),
  recordPortfolioView: (username) => request(`/public/u/${encodeURIComponent(username)}/view`, { method: 'POST' }),
  submitContactMessage: (username, payload) => request(`/public/u/${encodeURIComponent(username)}/message`, { method: 'POST', body: JSON.stringify(payload) })
};
