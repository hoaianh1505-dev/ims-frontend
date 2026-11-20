/**
 * Chuẩn hóa URL hình ảnh:
 * Nếu URL trỏ trực tiếp đến AWS S3 bucket riêng tư, chuyển tiếp qua proxy stream của Backend
 * để vượt qua lỗi 403 Access Denied của AWS S3.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const formatImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  // Nếu URL trỏ về localhost, tự động thay bằng BASE_URL của Backend
  if (url.includes('localhost:5000') || url.includes('localhost:3000')) {
    return url.replace(/https?:\/\/localhost:\d+/, BASE_URL);
  }
  // Nếu là đường dẫn tương đối
  if (url.startsWith('/upload/file')) {
    return `${BASE_URL}${url}`;
  }
  // Nếu là đường dẫn S3 trực tiếp
  if (url.includes('.amazonaws.com/')) {
    const key = url.split('.amazonaws.com/')[1];
    return `${BASE_URL}/upload/file?key=${encodeURIComponent(key)}`;
  }
  // Nếu là URL hoàn chỉnh khác
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BASE_URL}/${url.replace(/^\/+/, '')}`;
};

