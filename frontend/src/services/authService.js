import { apiRequest } from './api';

export const authService = {
  async register(username, email, password, fullName) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, fullName }),
    });
    if (data?.token) {
      localStorage.setItem('planify_jwt', data.token);
      localStorage.setItem('planify_user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
      }));
      window.dispatchEvent(new Event('planify_auth_changed'));
    }
    return data;
  },

  async login(usernameOrEmail, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    if (data?.token) {
      localStorage.setItem('planify_jwt', data.token);
      localStorage.setItem('planify_user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
      }));
      window.dispatchEvent(new Event('planify_auth_changed'));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('planify_jwt');
    localStorage.removeItem('planify_user');
    window.dispatchEvent(new Event('planify_auth_changed'));
  },

  getStoredUser() {
    try {
      const userStr = localStorage.getItem('planify_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('planify_jwt');
  },
};
