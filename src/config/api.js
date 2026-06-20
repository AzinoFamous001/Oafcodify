// API Configuration for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export const API_URLS = {
  // Auth endpoints
  GOOGLE_AUTH: `${API_BASE_URL}/api/auth/google`,
  GITHUB_AUTH: `${API_BASE_URL}/api/auth/github`,
  AUTH_USER: `${API_BASE_URL}/api/auth/user`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  
  // AI endpoint
  GEMINI: `${API_BASE_URL}/api/gemini`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
