/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1d302b',        // Xanh rêu đậm nhất cho text/hover
          primary: '#294238',     // Xanh rêu chủ đạo (nút, thanh biểu đồ, icon active)
          hover: '#20372e',
          light: '#edf2ef',      // Xanh rêu nhạt (nền active menu, badge)
          border: '#d6e0da',     // Viền xanh nhạt
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
