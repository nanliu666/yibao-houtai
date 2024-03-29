export default [
  {
    path: '/login',
    name: '登录页',
    component: () => import(/* webpackChunkName: "page" */ '@/page/login/index'),
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },

  {
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    },
    path: '/getBackPW',
    name: '找回密码',
    component: () => import('@/page/login/getBackPW')
  },
  {
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    },
    path: '/selectMode',
    name: '找回方式',
    component: () => import('@/page/login/selectMode')
  },

  {
    path: '/lock',
    name: '锁屏页',
    component: () => import(/* webpackChunkName: "page" */ '@/page/lock/index'),
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "page" */ '@/components/error-page/404'),
    name: '404',
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
  {
    path: '/403',
    component: () => import(/* webpackChunkName: "page" */ '@/components/error-page/403'),
    name: '403',
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
  {
    path: '/500',
    component: () => import(/* webpackChunkName: "page" */ '@/components/error-page/500'),
    name: '500',
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
  {
    path: '/666',
    component: () => import(/* webpackChunkName: "page" */ '@/components/error-page/666'),
    name: '666',
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
  {
    path: '/',
    name: '主页',
    redirect: '/wel'
  },
  {
    path: '*',
    redirect: '/404'
  }
]
