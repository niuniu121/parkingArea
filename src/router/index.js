// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../view/LoginView.vue';
import RegisterView from '../view/RegisterView.vue';
import MapView from '../view/MapView.vue'
import History from '../view/HistoryView.vue'



const routes = [
    { path: '/', component: LoginView },
    { path: '/register', component: RegisterView, meta: { hideNav: true } },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../view/DashboardView.vue')

    },
    { path: '/map', name: 'Map', component: MapView },
    { path: '/history', component: History },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
