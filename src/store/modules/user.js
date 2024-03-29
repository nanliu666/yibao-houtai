import { setToken, removeToken, removeRefreshToken } from '@/util/auth'
import { Message } from 'element-ui'
import { setStore, getStore } from '@/util/store'
import { filterTree, sortTree } from '@/util/util'
import {
  loginByUsername,
  getUserInfo,
  logout,
  refreshToken,
  getUserPrivilege,
  userDetailByToken,
  getOrgIds,
  getDiyInfor
} from '@/api/user'
import md5 from 'js-md5'

const user = {
  state: {
    diyInfor: {}, // 用户的logo banner 首页布局等信息
    orgIds: '',
    tenantId: getStore({ name: 'tenantId' }) || '',
    tenantContent: getStore({ name: 'tenantContent' }) || '',
    userInfo: getStore({ name: 'userInfo' }) || [],
    privileges: getStore({ name: 'privileges' }) || [],
    orgs: getStore({ name: 'orgs' }) || [],
    info: getStore({ name: 'info' }) || [],
    roles: [],
    menu: getStore({ name: 'menu' }) || [],
    menuAll: getStore({ name: 'menuAll' }) || [],
    token: getStore({ name: 'token' }) || '',
    refreshToken: getStore({ name: 'refreshToken' }) || '',
    menuLoading: false
  },
  actions: {
    set_info: ({ commit }, info) => {
      commit('SET_INFO', info)
    },
    // 获取用户的logo banner 首页布局等信息
    getDiyInforAc({ commit }, params) {
      return getDiyInfor(params).then((res) => {
        commit('SET_DIY_INFOR', res)
        setStore({ name: 'diyInfor', content: res })
      })
    },
    // 获取用户的组织id（包括当前和当前以上的），存放在localstore，vuex
    getOrgIdsAc({ commit }, telNub) {
      return getOrgIds({ account: telNub }).then((res) => {
        commit('SET_ORG_IDS', res)
        setStore({ name: 'orgIds', content: res })
      })
    },
    // token登录
    tokeLogin({ commit }, token) {
      return new Promise((resolve, reject) => {
        userDetailByToken({ accessToken: token })
          .then((res) => {
            commit('SET_TOKEN', token)
            // commit('SET_REFRESH_TOKEN', res.refresh_token)
            commit('SET_TENANT_ID', res.tenant_id)
            commit('SET_USER_INFO', res)
            // commit('DEL_ALL_TAG')
            commit('CLEAR_LOCK')
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    //根据用户名登录
    LoginByUsername({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        loginByUsername(
          userInfo.tenantId,
          userInfo.username,
          md5(userInfo.password),
          userInfo.type,
          userInfo.key,
          userInfo.code,
          userInfo.account
        )
          .then((res) => {
            if (res.error_description) {
              Message({
                message: res.error_description,
                type: 'error',
                showClose: true
              })
            } else {
              commit('SET_TOKEN', res.access_token)
              commit('SET_REFRESH_TOKEN', res.refresh_token)
              commit('SET_TENANT_ID', res.tenant_id)
              commit('SET_USER_INFO', res)
              commit('DEL_ALL_TAG')
              commit('CLEAR_LOCK')
            }
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    GetUserPrivilege({ commit }, userId) {
      return new Promise((resolve, reject) => {
        commit('SET_MENU_LOADING', true)
        getUserPrivilege(userId)
          .then((data) => {
            commit('SET_MENU_LOADING', false)
            const copy = JSON.parse(JSON.stringify(data))
            commit(
              'SET_ORGS',
              data.orgPrivileges.filter((org) => org.isOwn === 1)
            )
            const menu = filterTree(
              data.menuPrivileges,
              (node) => node.isOwn === 1 && node.menuType !== 'Button' && node.isEnabled !== 0
            )
            sortTree(menu, (a, b) => a.sort - b.sort)
            commit('SET_MENU', menu)
            commit('SET_MENU_ALL', menu)
            commit(
              'SET_PRIVILEGES',
              filterTree(
                copy.menuPrivileges,
                (node) => node.isOwn === 1 && node.menuType === 'Button' && node.isEnabled !== 0,
                true
              ).map((item) => item.path)
            )
            resolve(menu)
          })
          .catch((err) => {
            commit('SET_MENU_LOADING', false)
            reject(err)
          })
      })
    },
    //根据手机号登录
    LoginByPhone({ commit }, userInfo) {
      return new Promise((resolve) => {
        loginByUsername(userInfo.phone, userInfo.code).then((data) => {
          commit('SET_TOKEN', data)
          commit('DEL_ALL_TAG')
          commit('CLEAR_LOCK')
          resolve()
        })
      })
    },
    GetUserInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo()
          .then((data) => {
            commit('SET_ROLES', data.roles)
            resolve(data)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    //刷新token
    refreshToken({ state, commit }) {
      window.console.log('handle refresh token')
      return new Promise((resolve, reject) => {
        refreshToken(state.refreshToken, state.tenantId)
          .then((res) => {
            commit('SET_TOKEN', res.access_token)
            commit('SET_REFRESH_TOKEN', res.refresh_token)
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 登出
    LogOut({ commit }) {
      return new Promise((resolve, reject) => {
        logout()
          .then(() => {
            commit('SET_TOKEN', '')
            commit('SET_MENU', [])
            commit('SET_ROLES', [])
            commit('SET_USER_INFO', null)
            commit('DEL_ALL_TAG')
            commit('CLEAR_LOCK')
            removeToken()
            removeRefreshToken()
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    //注销session
    FedLogOut({ commit }) {
      return new Promise((resolve) => {
        commit('SET_TOKEN', '')
        commit('SET_MENU', [])
        commit('SET_USER_INFO', null)
        commit('SET_ROLES', [])
        removeToken()
        removeRefreshToken()
        resolve()
      })
    },
    // 获取系统菜单
    SetMenu({ commit }, menu) {
      return new Promise((resolve) => {
        commit('SET_MENU', menu)
        resolve(menu)
      })
    }
  },
  mutations: {
    SET_DIY_INFOR: (state, diyInfor) => {
      state.diyInfor = diyInfor
    },
    SET_ORG_IDS: (state, orgIds) => {
      state.orgIds = orgIds
    },
    SET_INFO: (state, info) => {
      state.info = info
      setStore({ name: 'info', content: state.info })
    },
    SET_TOKEN: (state, token) => {
      setToken(token)
      state.token = token
      setStore({ name: 'token', content: state.token })
    },
    SET_REFRESH_TOKEN: (state, refreshToken) => {
      state.refreshToken = refreshToken
      setStore({ name: 'refreshToken', content: state.refreshToken })
    },
    SET_TENANT_ID: (state, tenantId) => {
      state.tenantId = tenantId
      setStore({ name: 'tenantId', content: state.tenantId })
    },
    SET_TENANT_CONTENT: (state, tenantContent) => {
      state.tenantContent = tenantContent
      setStore({ name: 'tenantContent', content: state.tenantContent })
    },
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo
      setStore({ name: 'userInfo', content: state.userInfo })
    },
    SET_MENU: (state, menu) => {
      state.menu = menu
      setStore({ name: 'menu', content: state.menu })
    },
    SET_MENU_ALL: (state, menuAll) => {
      state.menuAll = menuAll
      setStore({ name: 'menuAll', content: menuAll })
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_ORGS: (state, orgs) => {
      state.orgs = orgs
      setStore({ name: 'orgs', content: orgs })
    },
    SET_PRIVILEGES: (state, privileges) => {
      state.privileges = privileges
      setStore({ name: 'privileges', content: privileges })
    },
    SET_MENU_LOADING: (state, menuLoading) => {
      state.menuLoading = menuLoading
    }
  }
}
export default user
