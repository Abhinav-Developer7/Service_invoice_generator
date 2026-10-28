import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for centralized error shaping
api.interceptors.response.use(
  (response) => {
    // Backend standard format: { success: true, message: '...', data: {} }
    return response.data;
  },
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    let errors = [];

    if (error.response) {
      // Server returned error with response envelope
      const data = error.response.data;
      message = data?.message || `Server Error (${error.response.status})`;
      errors = data?.errors || [];

      // Handle 401 Unauthorized (session expired or unauthenticated)
      if (error.response.status === 401 && !window.location.pathname.includes('/login')) {
        // Clear local storage / session if used
        console.warn('[API] 401 Unauthorized received - session may have expired');
      }
    } else if (error.request) {
      // Request was made but no response received
      message = 'Unable to connect to the server. Please check your internet connection.';
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      errors,
      originalError: error,
    });
  }
);

export default api;

