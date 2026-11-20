import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Khôi phục giao diện Sáng / Tối từ localStorage ngay khi nạp ứng dụng
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('ims_theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);


