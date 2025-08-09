// src/api/auth.js
import http from './http';

export const register = (email, password) =>
    http.post('/auth/register', { email, password });

export const login = (email, password) =>
    http.post('/auth/login', { email, password });
