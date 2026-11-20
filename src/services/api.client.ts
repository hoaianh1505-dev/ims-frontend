import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface CacheEntry {
  data: any;
  status: number;
  headers: any;
  expiresAt: number;
}

// Global In-Memory API Cache với cơ chế TTL & Auto Invalidation
const requestCache = new Map<string, CacheEntry>();

export const apiCache = {
  clear: () => {
    requestCache.clear();
  },
  invalidate: (prefix?: string) => {
    if (!prefix) {
      requestCache.clear();
      return;
    }
    for (const key of requestCache.keys()) {
      if (key.includes(prefix)) {
        requestCache.delete(key);
      }
    }
  },
  has: (key: string) => {
    const entry = requestCache.get(key);
    return !!entry && Date.now() < entry.expiresAt;
  },
};

const getCacheTTL = (url: string): number => {
  // Dữ liệu tham chiếu ít thay đổi: Cache 3 phút (Warehouses, Categories, Units, Suppliers, Customers)
  if (
    url.includes('/categories') ||
    url.includes('/units') ||
    url.includes('/warehouses') ||
    url.includes('/suppliers') ||
    url.includes('/customers')
  ) {
    return 3 * 60 * 1000;
  }
  // Dashboard số liệu tổng quan: Cache 30 giây
  if (url.includes('/dashboard')) {
    return 30 * 1000;
  }
  // Danh sách giao dịch, sản phẩm, PO: Cache 45 giây
  return 45 * 1000;
};

const getCacheKey = (config: AxiosRequestConfig): string => {
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `GET::${url}::${params}`;
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache Adapter Wrapper
const defaultAdapter = apiClient.defaults.adapter;

apiClient.defaults.adapter = async (config) => {
  const method = config.method?.toLowerCase();
  const isBypass =
    config.headers?.['x-cache-bypass'] === 'true' ||
    config.headers?.['x-no-cache'] === 'true';

  // 1. Kiểm tra cache đối với phương thức GET
  if (method === 'get' && !isBypass && !config.url?.includes('/auth/')) {
    const key = getCacheKey(config);
    const cached = requestCache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return {
        data: JSON.parse(JSON.stringify(cached.data)),
        status: cached.status,
        statusText: 'OK (From Memory Cache)',
        headers: cached.headers,
        config,
        request: {},
      } as AxiosResponse;
    }
  }

  // 2. Thực hiện gọi mạng qua adapter mặc định của Axios
  const adapterFn: any = Array.isArray(defaultAdapter)
    ? defaultAdapter[0]
    : defaultAdapter || axios.defaults.adapter;
  const response: AxiosResponse = await adapterFn(config);

  // 3. Nếu là GET thành công, lưu kết quả vào cache
  if (
    method === 'get' &&
    response.status >= 200 &&
    response.status < 300 &&
    !config.url?.includes('/auth/')
  ) {
    const key = getCacheKey(config);
    const ttl = getCacheTTL(config.url || '');
    requestCache.set(key, {
      data: response.data,
      status: response.status,
      headers: response.headers,
      expiresAt: Date.now() + ttl,
    });
  }

  // 4. Nếu là Mutation (POST, PUT, PATCH, DELETE), tự động xóa cache liên quan
  if (['post', 'put', 'patch', 'delete'].includes(method || '')) {
    const url = config.url || '';
    if (url.includes('/products')) {
      apiCache.invalidate('/products');
      apiCache.invalidate('/dashboard');
    } else if (url.includes('/stock-transactions')) {
      apiCache.invalidate('/stock-transactions');
      apiCache.invalidate('/dashboard');
      apiCache.invalidate('/products');
      apiCache.invalidate('/inventory');
    } else if (url.includes('/purchase-orders')) {
      apiCache.invalidate('/purchase-orders');
      apiCache.invalidate('/dashboard');
      apiCache.invalidate('/stock-transactions');
    } else if (url.includes('/warehouses')) {
      apiCache.invalidate('/warehouses');
      apiCache.invalidate('/dashboard');
    } else if (url.includes('/categories') || url.includes('/units')) {
      apiCache.invalidate('/categories');
      apiCache.invalidate('/units');
      apiCache.invalidate('/dashboard');
    } else if (url.includes('/suppliers')) {
      apiCache.invalidate('/suppliers');
    } else if (url.includes('/customers')) {
      apiCache.invalidate('/customers');
    } else if (url.includes('/users')) {
      apiCache.invalidate('/users');
    }
  }

  return response;
};

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
