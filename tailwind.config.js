/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#143D30',        // Xanh rêu đậm nhất cho text/hover
          primary: '#1A4D3E',     // Xanh rêu chủ đạo (nút, thanh biểu đồ, icon active)
          hover: '#133E32',
          light: '#EAF3EE',      // Xanh bạc hà nhạt (nền active menu, card Cần chú ý)
          border: '#D1E5DC',     // Viền xanh nhạt
          bg: '#F8F9FA',         // Nền xám nhạt toàn trang
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
