/**
 * 全站http配置
 *
 * axios参数说明
 * isSerialize是否开启form表单提交
 * isToken是否需要token
 */
import axios from 'axios'
import store from '@/store/'
import router from '@/router/router'
import { serialize } from '@/util/util'
import { getToken } from '@/util/auth'
import { Message, MessageBox } from 'element-ui'
import website from '@/config/website'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Base64 } from 'js-base64'

const instance = axios.create({
  timeout: 3000000, //默认超时时间
  withCredentials: false, //跨域请求，允许保存cookie
  validateStatus: function(status) {
    return status >= 200 && status <= 500
  }
})
let cancelToken = axios.CancelToken
let reqCancel = null

// NProgress 配置
NProgress.configure({
  showSpinner: false
})
//http request拦截
instance.interceptors.request.use(
  (config) => {
    if (!config.cancelToken) {
      config.cancelToken = new cancelToken(function executor(c) {
        // executor 函数接收一个 cancel 函数作为参数
        reqCancel = c
      })
    }

    //开启 progress bar
    NProgress.start()
    const meta = config.meta || {}
    const isToken = meta.isToken === false
    config.headers['Authorization'] = `Basic ${Base64.encode(
      `${website.clientId}:${website.clientSecret}`
    )}`

    config.headers['Tenant-Id'] =
      !config.headers.RemoveTenantId && store.state.user.tenantId
        ? store.state.user.tenantId
        : 'learn'
    config.headers.appId = 'Admin'

    if (
      !config.url.startsWith('/api') &&
      !config.url.endsWith('eln/upload') &&
      !config.url.startsWith('api')
    ) {
      config.url = '/api' + config.url
    }
    if (getToken() && !isToken) {
      //让每个请求携带token--['Authorization']为自定义key 请根据实际情况自行修改
      config.headers.accessToken = store.state.user.userInfo.token_type + ' ' + getToken()
    }
    //headers中配置serialize为true开启序列化
    if (config.method === 'post' && meta.isSerialize === true) {
      config.data = serialize(config.data)
    }
    // 登录接口后台数据从url获取 其他接口正常
    if (
      config.method.toLowerCase() !== 'get' &&
      !String.prototype.endsWith.call(config.url, '/oauth/token')
    ) {
      config.data = config.data || config.params
      config.params = null
    }
    if (config.method.toLowerCase() === 'delete') config.params = config.data
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
let loadingCount = 0
/**
 * 只取头一个8000状态，第一个确定后就跳转
 */
function addLoading(res) {
  if (loadingCount > 0) return
  loadingCount++
  MessageBox({
    title: '提示',
    message: res.data.resMsg,
    showClose: false,
    closeOnPressEscape: false,
    closeOnClickModal: false,
    type: 'warning',
    confirmButtonText: '重新登录'
  }).then(() =>
    store.dispatch('FedLogOut').then(() => {
      router.push({ path: '/login' })
      loadingCount = 0
    })
  )
}
//http response 拦截
instance.interceptors.response.use(
  (res) => {
    //关闭 progress bar
    NProgress.done()
    //获取状态码
    const status = res.data.resCode || res.status
    const statusWhiteList = website.statusWhiteList || []
    const message = res.data.resMsg || res.data.error_description || '服务请求出错，请联系管理员'
    const { config } = res
    if (_.get(config, 'responseType') === 'blob') {
      return res
    } else {
      //如果在白名单里则自行catch逻辑处理
      if (statusWhiteList.includes(status)) return Promise.reject(res)

      // 如果请求为非200否者默认统一处理
      if (status !== 200) {
        if (status === 8000 || status === 8001) {
          // 8000 为被挤出来；8001为token过期
          addLoading(res)
        } else if (String(status).startsWith('5')) {
          // Message({
          //   message: '服务请求出错，请联系管理员',
          //   type: 'error',
          //   showClose: true
          // })
        } else if (getToken() || status === 400) {
          Message({
            message,
            type: 'error',
            showClose: true
          })
        }
        //如果是401则跳转到登录页面
        if (status === 401) store.dispatch('FedLogOut').then(() => router.push({ path: '/login' }))
         //如果是666则跳转到付费页面
         if (status === '666') store.dispatch('FedLogOut').then(() => router.push({ path: '/666' }))
        return Promise.reject(new Error(message))
      }
      if (String.prototype.endsWith.call(res.config.url, '/oauth/token')) {
        return res.data
      }
      if (String.prototype.endsWith.call(res.config.url, '/eln/upload')) {
        return res.data
      }
      return res.data.response
    }
  },
  (error) => {
    NProgress.done()
    return Promise.reject(new Error(error))
  }
)

export function cancel() {
  return reqCancel('取消频繁请求')
}

export function post(urls, data, config = {}) {
  return instance.post(urls, data, config)
}

export function get(urls, params, config = {}) {
  return instance.get(urls, {
    params,
    ...config
  })
}

export function put(urls, data, config = {}) {
  return instance.put(urls, data, config)
}

export function del(urls, data, config = {}) {
  return instance.delete(urls, {
    params: data,
    data,
    ...config
  })
}

export default instance
