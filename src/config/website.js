/**
 * 全局配置文件
 */
export default {
  title: 'Experience Officer',
  logo: 'S',
  key: 'saber', //配置主键,目前用于存储
  indexTitle: '百利宏控股',
  clientId: 'Admin', // 客户端id
  clientSecret: 'Admin_PC_2020ePRO', // 客户端密钥
  tenantMode: true, // 是否开启租户模式
  tenantId: '000000', // 管理组租户编号
  captchaMode: true, // 是否开启验证码模式
  lockPage: '/lock',
  tokenTime: 3000,
  //http的status默认放行不才用统一处理的,
  statusWhiteList: [],
  //配置首页不可关闭
  isFirstPage: false,
  fistPage: {
    label: '工作台',
    value: '/wel',
    params: {},
    query: {},
    meta: {
      i18n: 'dashboard'
    },
    group: [],
    close: false
  },
  //配置菜单的属性
  menu: {
    iconDefault: 'iconfont icon-caidan',
    props: {
      label: 'menuName',
      path: 'path',
      icon: 'icon',
      children: 'children'
    }
  }
}
