import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Đảm bảo chỉ có sidebar là tối màu, toàn bộ giao diện sáng đồng nhất
if (typeof window !== 'undefined') {
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('ims_theme');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

