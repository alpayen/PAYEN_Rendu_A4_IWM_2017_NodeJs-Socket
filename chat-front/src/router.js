import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/Login.vue'
import Chatrooms from './views/Chatrooms.vue'
import ChatroomSingle from './views/ChatroomSingle.vue'

Vue.use(Router);
const router = new Router({
    routes: [
        {
            path: '/',
            name: 'Login',
            component: Login
        },
        {
            path: '/chatrooms',
            name: 'Chatrooms',
            component: Chatrooms,
            meta: {requiresAuth: true}
        },
        {
            path: '/chatrooms/:slug',
            name: 'Chatroom',
            component: ChatroomSingle,
            meta: {requiresAuth: true}
        }
    ]
});

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (localStorage.getItem('username') == null) {
            next({
                path: '/',
                query: {
                    redirect: to.fullPath
                }
            });
        } else {
            next();
        }
    } else if (to.matched.some(record => record.name === 'Login')) {
        if (localStorage.getItem('username') !== null) {
            next({
                path: '/chatrooms',
                query: {
                    redirect: to.fullPath
                }
            });
        } else {
            next();
        }
    }


    }
);


export default router;
