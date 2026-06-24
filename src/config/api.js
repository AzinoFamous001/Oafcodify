// API Configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

export const API_URLS = {
  // Auth endpoints
  GOOGLE_AUTH: `${API_BASE_URL}/api/auth/google`,
  GITHUB_AUTH: `${API_BASE_URL}/api/auth/github`,
  AUTH_USER: `${API_BASE_URL}/api/auth/user`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  
  // User progress
  USER_PROGRESS: (userId) => `${API_BASE_URL}/api/user/progress/${userId}`,
  QUIZ_RESULT: (userId) => `${API_BASE_URL}/api/user/quiz-result/${userId}`,
  LESSON_PROGRESS: (userId) => `${API_BASE_URL}/api/user/lesson-progress/${userId}`,
  NOTIFICATION: (userId) => `${API_BASE_URL}/api/user/notification/${userId}`,
  STREAK: (userId) => `${API_BASE_URL}/api/user/streak/${userId}`,
  
  // AI endpoint
  GEMINI: `${API_BASE_URL}/api/gemini`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
