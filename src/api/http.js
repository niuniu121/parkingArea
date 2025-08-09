import axios from 'axios';

const baseURL = import.meta.env.DEV
    ? '/api'
    : `${import.meta.env.VITE_API_BASE}/api`;

const http = axios.create({
    baseURL,
});

export default http;
