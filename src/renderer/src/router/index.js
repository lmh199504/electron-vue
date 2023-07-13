import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: () => import('../views/home.vue')
        },
        {
            path: '/download',
            name: 'Download',
            component: () => import('../views/download.vue')
        },
        {
            path: '/train',
            name: 'Train',
            component: () => import('../views/train.vue')
        }
    ]
})

export default router
