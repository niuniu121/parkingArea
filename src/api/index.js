// src/api/index.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api/parking";

export function fetchSensorStatuses() {
    return axios.get(`${API_BASE}/sensors`);
}

export function fetchParkingBays() {
    return axios.get(`${API_BASE}/bays`);
}
