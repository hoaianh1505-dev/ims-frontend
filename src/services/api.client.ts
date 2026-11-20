import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface CacheEntry {
  data: any;
  timestamp: number;
}

// In-Memory LRU-style Cache Map
const cacheStore = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút lưu cache

export const apiCache = {
  clear: () => {
    cacheStore.clear();
  },
  invalidate: (prefix?: string) => {
    if (!prefix) {
      cacheStore.clear();
      return;
    }
    const cleanPrefix = prefix.replace(/^\//, '');
    for (const key of Array.from(cacheStore.keys())) {
      if (key.includes(cleanPrefix) || key.includes(prefix)) {
        cacheStore.delete(key);
      }
    }
  },
  has: (key: string) => {
    const entry = cacheStore.get(key);
    if (!entry) return false;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      cacheStore.delete(key);
      return false;
    }
    return true;
  },
  size: () => {
    // Return count of valid non-expired entries
    let count = 0;
    const now = Date.now();
    for (const [key, entry] of cacheStore.entries()) {
      if (now - entry.timestamp < CACHE_TTL_MS) {
        count++;
      } else {
        cacheStore.delete(key);
      }
    }
    return count;
  },
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept request for JWT Token
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

// Wrap apiClient.get with in-memory caching to save network calls on Render Free Tier
const rawGet = apiClient.get.bind(apiClient);

(apiClient as any).get = async function<T = any, R = AxiosResponse<T>, D = any>(
  url: string,
  config?: AxiosRequestConfig<D>
): Promise<R> {
  const bypassCache =
    (config?.headers as any)?.['x-no-cache'] ||
    (config?.headers as any)?.['x-cache-bypass'];

  const paramStr = config?.params ? JSON.stringify(config.params) : '';
  const cacheKey = `${url}?${paramStr}`;

  if (!bypassCache) {
    const cached = cacheStore.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        data: cached.data,
        status: 200,
        statusText: 'OK (Cached)',
        headers: {},
        config: config || {},
      } as unknown as R;
    }
  }

  const response = await rawGet(url, config);

  // Cache successful GET responses
  if (response.status === 200 && response.data) {
    cacheStore.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });
  }

  return response as R;
};

// Response interceptor: Auto invalidate cache on mutations & Handle 401 refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Invalidate cache on mutations (POST, PUT, PATCH, DELETE)
    const method = response.config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const url = response.config.url || '';
      const cleanPath = url.replace(/^\//, '').split('?')[0];
      const baseRoute = cleanPath.split('/')[0];
      if (baseRoute) {
        apiCache.invalidate(baseRoute);
        // Mutations ảnh hưởng đến thống kê tồn kho nên luôn xóa cache dashboard
        apiCache.invalidate('dashboard');
      } else {
        apiCache.clear();
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Không refresh token nếu request là login hoặc chính refresh-token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken =
          refreshResponse.data?.data?.access_token ||
          refreshResponse.data?.access_token;
        if (newAccessToken) {
          localStorage.setItem('ims_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('ims_access_token');
        localStorage.removeItem('ims_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
