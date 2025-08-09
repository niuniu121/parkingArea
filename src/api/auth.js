// src/api/auth.js
import api from './http';

export const login = (email, password) =>
    api.post('/api/auth/login', { email, password }).then(r => r.data);

export const register = (email, password) =>
    api.post('/api/auth/register', { email, password }).then(r => r.data);
