/**
 * 全站权限配置
 *
 */
import router from './router/router'
import store from './store'
import { validatenull } from '@/util/validate'
import { getToken, removeToken, removeRefreshToken } from '@/util/auth'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
NProgress.configure({ showSpinner: false })
const lockPage = store.getters.website.lockPage //锁屏页

const userPaths = ['/info/securitySetting']
const userCenterMenu = [
  {
    menuId: '312123',
    menuName: '安全设置',
    isOwn: 1,
    isShow: 1,
    code: 'user_securitySetting',
    alias: 'securitySetting',
    path: '/info/securitySetting',
    children: []
  }
]

/**
 * 更新左侧菜单和顶部菜单
 **/
function updateMenu(currentPath) {
  let currentMenu = null
  if (userPaths.includes(currentPath)) {
    currentMenu = userCenterMenu
  } else {
    currentMenu = store.getters.menuAll
  }
  // 找不到对应根菜单，将顶部菜单置为工作台
  store.commit('SET_MENU', currentMenu)
}
router.beforeEach((to, from, next) => {
  const meta = to.meta || {}
  const isMenu = meta.menu === undefined ? to.query.menu : meta.menu
  store.commit('SET_IS_MENU', isMenu === undefined)
  if (to.query.tid) {
    // 如果url带token，做token登录处理
    isToken(to.query.tid, next)
  }

  if (getToken()) {
    if (store.getters.isLock && to.path !== lockPage) {
      //如果系统激活锁屏，全部跳转到锁屏页
      next({ path: lockPage })
    } else if (to.path === '/login') {
      //如果登录成功访问登录页跳转到主页
      next({ path: '/' })
    } else {
      //如果用户信息为空则获取用户信息，获取用户信息失败，跳转到登录页
      if (store.getters.token.length === 0) {
        store.dispatch('FedLogOut').then(() => {
          next({ path: '/login' })
        })
      } else {
        const value = to.path
        updateMenu(value)
        const label = to.query.tagName || to.name
        // 每次路由跳转时找到目标路径对应的根菜单数据
        const meta = to.meta || router.$avueRouter.meta || {}
        const i18n = to.query.i18n
        if (meta.isTab !== false && !validatenull(value) && !validatenull(label)) {
          store.commit('ADD_TAG', {
            label: label,
            value: value,
            params: to.params,
            query: to.query,
            meta: (() => {
              if (!i18n) {
                return meta
              }
              return {
                i18n: i18n
              }
            })(),
            group: router.$avueRouter.group || []
          })
        }
        next()
      }
    }
  } else {
    //判断是否需要认证，没有登录访问去登录页
    if (meta.isAuth === false) {
      next()
    } else {
      const path = { path: '/login' }
      const previewUrl = to.query.type ? encodeURI(to.fullPath) : ''
      const toPath = previewUrl ? _.assign(path, { query: { previewUrl } }) : path
      next(toPath)
    }
  }
})

router.afterEach(() => {
  NProgress.done()
  let title = store.getters.tag.label
  //根据当前的标签也获取label的值动态设置浏览器标题
  router.$avueRouter.setTitle(title)
})
function isToken(tid, next) {
  removeToken()
  removeRefreshToken()
  // 如果url带token，做token登录处理
  store.dispatch('tokeLogin', tid).then((res) => {
    if (res.account) {
      next({ path: '/' })
      store.dispatch('getDiyInforAc', { device: '1' }) // 用户的logo banner 首页布局等信息，存放在localstore，vuex
      store.dispatch('GetUserPrivilege', res.user_id).then((menu) => {
        //更新用户菜单
        router.$avueRouter.formatRoutes(menu, true)
      })
      //store.dispatch('getOrgIdsAc', res.account) // 获取用户的组织id（包括当前和当前以上的），存放在localstore，vuex
    }
  })
}
