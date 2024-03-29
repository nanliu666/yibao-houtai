import request, { del, get } from '@/router/axios'
/**
 * 树状查询岗位
 */
export const getPositionAll = (params) => get('/manage/v1/source/base/position/all', params)
export const getList = (current, size, params) => {
  return request({
    url: '/api/blade-system/role/list',
    method: 'get',
    params: {
      ...params,
      current,
      size
    }
  })
}
export const grantTree = () => {
  return request({
    url: '/api/blade-system/menu/grant-tree',
    method: 'get'
  })
}

export const grant = (roleIds, menuIds, dataScopeIds, apiScopeIds) => {
  return request({
    url: '/api/blade-system/role/grant',
    method: 'post',
    data: {
      roleIds,
      menuIds,
      dataScopeIds,
      apiScopeIds
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/blade-system/role/remove',
    method: 'post',
    params: {
      ids
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/blade-system/role/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/blade-system/role/submit',
    method: 'post',
    data: row
  })
}

export const getRole = (roleIds) => {
  return request({
    url: '/api/blade-system/menu/role-tree-keys',
    method: 'get',
    params: {
      roleIds
    }
  })
}

export const getRoleTree = (tenantId) => {
  return request({
    url: '/api/blade-system/role/tree',
    method: 'get',
    params: {
      tenantId
    }
  })
}

/**
 * @description 角色分类修改接口
 * @param params
 * @returns {*}
 */
export const updateCate = (params) => {
  return request({
    url: '/api/sys/v1/role/category/define',
    method: 'put',
    data: {
      ...params
    }
  })
}

/**
 * @description 角色分类删除接口
 * @param params
 * @returns {*}
 */
export const delCate = (params) => {
  return request({
    url: '/api/sys/v1/role/category/define',
    method: 'delete',
    params: {
      ...params
    }
  })
}

/**
 * @description 角色分类新增接口
 * @param params
 * @returns {*}
 */
export const createCate = (params) => {
  return request({
    url: '/api/sys/v1/role/category/define',
    method: 'post',
    data: {
      ...params
    }
  })
}

/**
 * @description 角色分类查询接口
 * @param params
 * @returns {*}
 */
export const getCate = (params) => {
  return request({
    url: '/api/sys/v1/role/category/define',
    method: 'get',
    params: {
      ...params
    }
  })
}

/**
 * @description 角色分组修改接口
 * @param params
 * @returns {*}
 */
export const updateGroup = (params) => {
  return request({
    url: '/api/sys/v1/role/group/define',
    method: 'put',
    data: {
      ...params
    }
  })
}

/**
 * @description 角色分组删除接口
 * @param params
 * @returns {*}
 */
export const delGroup = (params) => {
  return request({
    url: '/api/sys/v1/role/group/define',
    method: 'delete',
    params: {
      ...params
    }
  })
}

/**
 * @description 角色分组新增接口
 * @param params
 * @returns {*}
 */
export const createGroup = (params) => {
  return request({
    url: '/api/sys/v1/role/group/define',
    method: 'post',
    data: {
      ...params
    }
  })
}

/**
 * @description 角色删除接口
 * @param params
 * @returns {*}
 */
export const delRole = (params) => {
  return request({
    url: '/api/sys/v1/role',
    method: 'delete',
    params: {
      ...params
    }
  })
}

/**
 * @description 角色新增接口
 * @param params
 * @returns {*}
 */
export const createRole = (params) => {
  return request({
    url: '/api/sys/v1/role',
    method: 'post',
    data: {
      ...params
    }
  })
}

/**
 * @description 角色权限查询接口
 * @param params
 * @returns {*}
 */
export const getPrivilege = (params) => {
  return request({
    url: '/sys/v1/role/menu/privilege',
    method: 'get',
    params: {
      clientId: 'Admin',
      parentId: 0,
      ...params
    }
  })
}

/**
 * @description 角色权限查询接口
 * @param params
 * @returns {*}
 */
export const updatePrivilege = (params) => {
  return request({
    url: '/api/sys/v1/role/privilege',
    method: 'put',
    data: {
      ...params
    }
  })
}

/**
 * @description 角色查询接口
 * @param params
 * @returns {*}
 */
export const getRoleList = (params) => {
  return request({
    url: '/api/sys/v1/role',
    method: 'get',
    params: {
      ...params
    }
  })
}

/**
 * @description 角色编辑接口
 * @param params
 * @returns {*}
 */
export const updateRole = (params) => {
  return request({
    url: '/api/sys/v1/role',
    method: 'put',
    data: {
      ...params
    }
  })
}

/**
 * @description 用户添加列表查询
 */
export const getUser = (params) => {
  return request({
    url: '/api/sys/v1/role/user',
    method: 'get',
    params: {
      ...params
    }
  })
}

/**
 * @description 角色所属的用户添加接口
 */
export const addUser = (params) => {
  return request({
    url: '/api/sys/v1/role/user',
    method: 'post',
    data: {
      ...params
    }
  })
}

/**
 * @description 角色的待添加用户查询接口
 */
export const getUnuser = (params) => {
  return request({
    url: '/api/sys/v1/role/unuser',
    method: 'get',
    params: {
      ...params
    }
  })
}

/**
 * @description 组织机构列表查询接口
 */
export const getOrgList = (params) => {
  return request({
    url: '/api/org/v1/organization/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

/**
 * @description 岗位定义查询接口
 */
export const getPosition = (params) => {
  return request({
    url: '/api/org/v1/position/define',
    method: 'get',
    params: {
      ...params
    }
  })
}
//查询关联职位
export const getRelativeJobs = (params) => {
  return request({
    url: '/api/org/v1/role/job',
    method: 'get',
    params: {
      ...params
    }
  })
}

/*以下是mock接口*/
/**
 * @description 关联职位列表查询
 */
export const getJobs = (params) => {
  return request({
    url: '/api/org/v1/job/tree',
    method: 'get',
    params: {
      ...params
    }
  })
}

/**
 * @description 角色关联岗位查询接口
 */
export const getPositions = (params) => {
  return request({
    url: '/api/sys/v1/role/position',
    method: 'get',
    params: {
      ...params
    }
  })
}
//查看用户 获取用户列表
export const getUserList = (params) => {
  return request({
    url: '/api/sys/v1/role/user',
    method: 'get',
    params: {
      ...params
    }
  })
}
//删除角色里面的用户
export const deleteUser = (params) => {
  return del('/api/sys/v1/role/user', params)
}
//查看组织下面的用户
export const getOrgMember = (params) => {
  return request({
    url: '/org/v1/org/user/child',
    method: 'get',
    params: {
      ...params
    }
  })
}

//角色级别范围查询
export const queryMaxOrgType = (params) => {
  return request({
    url: '/blade-system/v1/role/queryMaxOrgType',
    method: 'post',
    params: {
      ...params
    }
  })
}
//查询分组列表
export const groupList = (params) => {
  return request({
    url: '/user/v1/usergroup/listPage',
    method: 'get',
    params: {
      ...params
    }
  })
}

// 添加分组
export const addGroup = (params) => {
  return request({
    url: '/user/v1/usergroup/save',
    method: 'post',
    params: {
      ...params
    }
  })
}

// 删除分组
export const sysDelGroup = (params) => {
  return request({
    url: '/user/v1/usergroup/delete',
    method: 'delete',
    params: params
  })
}

// 编辑分组
export const sysEditGroup = (params) => {
  return request({
    url: '/user/v1/usergroup/update',
    method: 'put',
    params: {
      ...params
    }
  })
}

//查看分组下的用户
export const getGroupUser = (params) => {
  return request({
    url: '/user/v1/usergrouprel/userList',
    method: 'get',
    params: {
      ...params
    }
  })
}
// 删除分组下的用户
export const delGroupUser = (params) => {
  return request({
    url: '/user/v1/usergrouprel/delete',
    method: 'delete',
    params: params
  })
}

// 添加分组下的用户
export const addGroupUser = (params) => {
  return request({
    url: '/user/v1/usergrouprel/save',
    method: 'post',
    params: {
      ...params
    }
  })
}
