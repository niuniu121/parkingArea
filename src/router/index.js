// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../view/LoginView.vue';
import RegisterView from '../view/RegisterView.vue';


const routes = [
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
