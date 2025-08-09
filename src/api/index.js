// src/api/index.js
import http from './http';

export function fetchSensorStatuses() {
    return http.get('/parking/sensors');
}

export function fetchParkingBays() {
    return http.get('/parking/bays');
}
