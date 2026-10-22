const API_BASE = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('planify_jwt');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Unauthorized: token might be expired
    localStorage.removeItem('planify_jwt');
    localStorage.removeItem('planify_user');
    window.dispatchEvent(new Event('planify_auth_changed'));
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMsg = data?.message || data?.error;
    if (!errorMsg) {
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        errorMsg = 'Backend server is not reachable on port 8082. Please ensure the Spring Boot backend is running.';
      } else {
        errorMsg = `Request failed with status ${response.status}`;
      }
    }
    throw new Error(errorMsg);
  }

  return data;
}
