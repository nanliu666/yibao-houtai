import Layout from '@/page/index'
export default [
  {
    path: '/demo',
    component: Layout,
    redirect: '/demo/form',
    children: [
      {
        path: 'form',
        name: '测试表单页',
        meta: {
          fullscreen: true
        },
        component: () => import(/* webpackChunkName: "page" */ '@/views/demo/demoForm')
      },
      {
        path: 'test',
        name: '测试页',
        meta: {
          fullscreen: true
        },
        component: () => import(/* webpackChunkName: "page" */ '@/views/demo/demoTest')
      }
      // {
      //   path: 'details',
      //   name: 'debug_details',
      //   meta: {
      //     fullscreen: false
      //   },
      //   component: () => import(/* webpackChunkName: "page" */ '@/views/demo/details')
      // }
    ]
  }
]
