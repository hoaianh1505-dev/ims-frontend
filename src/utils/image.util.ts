/**
 * Chuẩn hóa URL hình ảnh:
 * Nếu URL trỏ trực tiếp đến AWS S3 bucket riêng tư, chuyển tiếp qua proxy stream của Backend
 * để vượt qua lỗi 403 Access Denied của AWS S3.
 */
export const formatImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  // Nếu là đường dẫn S3 trực tiếp
  if (url.includes('.amazonaws.com/')) {
    const key = url.split('.amazonaws.com/')[1];
    return `http://localhost:5000/upload/file?key=${encodeURIComponent(key)}`;
  }
  return url;
};
