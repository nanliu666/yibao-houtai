import request from '@/router/axios'
// 筛选获取工作地址
export const getWorkAddressList = (params) => {
  return request({
    url: '/api/user/v1/user/work/address',
    method: 'get',
    params: params
  })
}
// 新增工作地址
export const createWorkAddress = (params) => {
  return request({
    url: '/api/user/v1/user/work/address',
    method: 'post',
    params: params
  })
}
// 修改工作地址
export const editWorkAddress = (params) => {
  return request({
    url: '/api/user/v1/user/work/address',
    method: 'put',
    params: params
  })
}
// 删除工作地址
export const deleteWorkAddress = (params) => {
  return request({
    url: '/api/user/v1/user/work/address',
    method: 'delete',
    params: params
  })
}

// 员工列表
export const getUserList = (params) => {
  return request({
    url: '/api/user/v1/user/list',
    method: 'post',
    params: { ...params }
  })
}

// 员工状态人数统计
export const getUserStatusStat = (params) => {
  return request({
    url: '/api/user/v1/user/status/stat',
    method: 'get',
    params: params
  })
}

// 岗位查询
export const getOrgPosition = (params) => {
  return request({
    url: '/api/org/v1/position/define',
    method: 'get',
    params: params
  })
}

// 职位查询
export const getOrgJob = (params) => {
  return request({
    url: '/api/org/v1/job/list',
    method: 'get',
    params: params
  })
}

// 组织机构下的公司查询
export const getOrganizationCompany = (params) => {
  return request({
    url: '/api/org/v1/organization/company',
    method: 'get',
    params: params
  })
}

// 工号自动生成
export const createNewWorkNo = (params) => {
  return request({
    url: '/api/user/v1/user/workno',
    method: 'get',
    params: params
  })
}

// 员工信息校验
export const checkUserInfo = (params) => {
  return request({
    url: '/api/user/v1/user/info/check',
    method: 'post',
    params: params
  })
}

// 添加员工
export const createUser = (params) => {
  return request({
    url: '/api/user/v1/user/info',
    method: 'post',
    params: params
  })
}
//编辑员工信息
export const editUser = (params) => {
  return request({
    url: '/api/user/v1/user/info',
    method: 'put',
    params
  })
}
// 人员操作记录
export const getUserActionLog = (params) => {
  return request({
    // url: '/api/sys/log/v1/action/log',
    url: '/api/log/v1/user/record',
    method: 'get',
    params
  })
}
