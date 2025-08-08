// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../view/LoginView.vue';
import RegisterView from '../view/RegisterView.vue';
import MapView from '../view/MapView.vue'



const routes = [
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../view/DashboardView.vue')

    },
    { path: '/map', name: 'Map', component: MapView },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
