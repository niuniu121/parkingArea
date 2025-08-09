// 统一的 axios 实例
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000',
});

// 可选：自动带上 token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
