import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import NProgress from "../utils/progress";

const routes: RouteRecordRaw[] = [
    {
        path: '/index',
        name: 'Index',
        meta: {
            title: '浏览',
        },
        component: () => import(/* webpackChunkName: "login" */ '../views/index.vue'),
    },
    {
        path: '/',
        name: 'Login',
        meta: {
            title: '登录',
        },
        component: () => import(/* webpackChunkName: "login" */ '../views/login.vue'),
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

// router.beforeEach((to, from, next) => {
//     NProgress.start();
//     document.title = `${to.meta.title} | vue-manage-system`;
//     const role = localStorage.getItem('ms_username');
//     if (!role && to.path !== '/login') {
//         next('/login');
//     } else {
//         next();
//     }
// });

router.afterEach(to => {
    NProgress.done()
});

export default router;
