import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'index',
    redirect: '/home',
    meta: {
      requiresAuth: true // 需要登录才能访问的页面
    }
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: (resolve) => require([ '@/views/Login' ], resolve)
  },
  {
    path: '/register',
    name: 'register',
    component: (resolve) => require([ '@/views/Register' ], resolve)
  }
]

const router = new VueRouter({
  routes
})

// 注册全局钩子用来拦截导航
router.beforeEach((to, from, next) => {
  let token = store.state.token
  if (to.meta.requiresAuth) {
    if (token) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next()
  }
})

export default router
