// src/api/auth.js
import axios from 'axios';

const API = 'http://localhost:5000/api/auth';  // 如果后端运行在本地

export const register = (email, password) => {
    return axios.post(`${API}/register`, { email, password });
};

export const login = (email, password) => {
    return axios.post(`${API}/login`, { email, password });
};
