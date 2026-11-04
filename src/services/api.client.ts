import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ims_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Tự động gọi refresh token nếu lỗi 401
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = refreshRes.data?.data?.access_token || refreshRes.data?.access_token;
        if (newToken) {
          localStorage.setItem('ims_access_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('ims_access_token');
        localStorage.removeItem('ims_user');
        window.location.reload();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

