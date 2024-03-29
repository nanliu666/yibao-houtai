import { del, get, post, put } from '@/router/axios'
/**
 * 审批流程列表查询接口
 * @param {*} params
 */
export const getProcessList = (params) => get('/appr/v2/appr/process/all/list', params)
/**
 * 可发起的课程审批流程列表查询接口
 * @param {*} params
 */
export const getCourseProcessList = (params) => get('/appr/v2/appr/course/process/list', params)
/**
 * 审批申请提交接口
 * */
export const submitApprApply = (params) => post('/appr/v2/appr/apply/submit', params)
/**
 * 审批流程查询接口
 * @param {Object} params - 参数
 * @param {String} params.processId - 流程ID
 * */
export const getProcessDetail = (params) => get('/appr/v2/appr/process', params)
/**
 * 审批记录查询接口
 * @param {object} params 查询参数
 */
export const getRecordList = (params) => get('/appr/v2/appr/approve/record/list', params)

/**
 * 审批流程停用接口
 */
export const stopProcess = (params) => post('/appr/v2/appr/process/stop', params)

/**
 * 审批流程启用接口
 */
export const startProcess = (params) => post('/appr/v2/appr/process/start', params)

/**
 * 审批流程删除接口
 */
export const deleteProcess = (params) => post('/appr/v2/appr/process/del', params)

// 审批历史记录、审批进度
export const getApprRecord = (params) => get('/appr/v2/appr/apply/record', params)
/**
 * 用户申请详情查询接口
 * @param {object} params 参数
 * @param {string} params.apprNo 审批编号
 * @returns {object}
 */
export const getApprDetail = (params) => get('/appr/v2/appr/process/apply/detail', params)
// 同意审批
export const createApprPass = (params) => post('/appr/v2/appr/apply/pass', params)
// 审批拒绝
export const createApprReject = (params) => post('/appr/v2/appr/apply/reject', params)
// 撤销
export const createApprCancel = (params) => post('/appr/v2/appr/apply/cancel', params)
// 撤销2    课程审批撤销
export const cancelCourseApply = (params) => post('/api/appr/v2/appr/apply/cancel', params)
// 催一下
export const createApprUrge = (params) => post('/appr/v2/appr/apply/urge', params)
/**
 *
 * 下面的都是OA的旧接口
 *
 **/

/**
 * 审批数据导出接口
 * */
export const exportData = (params) => post('/appr/v2/appr/export/data', params)
/**
 * 审批表单内容编辑提交
 * */
export const putApprForm = (params) => put('/appr/v2/appr/apply/form', params)
/**
 * 获取历史版本
 */
export const getApprVersion = (params) => get('/appr/v2/appr/process/version', params)
/**
 * 生成预览数据
 */
export const createApprRreview = (params) => post('/appr/v2/appr/process/preview', params)
/**
 * 获取预览数据
 */
export const getApprRreview = (params) => get('/appr/v2/appr/process/preview', params)

/**
 * 我发起的审批查询接口
 * @param {*} params
 */
export const getMyApproveList = (params) => get('/appr/v2/appr/my/approve/list', params)
/**
 * 待我审批查询接口
 * @param {*} params
 */
export const getWaitApproveList = (params) => get('/appr/v2/appr/wait/approve/list', params)
/**
 * 我已审批查询接口
 * @param {*} params
 */
export const getHasApproveList = (params) => get('/appr/v2/appr/has/approve/list', params)
/**
 * 抄送我的审批查询接口
 * @param {*} params
 */
export const getCopyApproveList = (params) => get('/appr/v2/appr/cc/approve/list', params)
/**
 * 可发起的审批流程查询接口
 * @param {*} params
 */
export const getUserProcessList = (params) => get('/appr/v2/appr/user/process/list', params)
/**
 * 审批分组新建接口
 */
export const addProcessCategory = (params) => post('/appr/v2/appr/category', params)
/**
 * 审批分组新建接口
 */
export const renameProcessCategory = (params) => put('/appr/v2/appr/category', params)
/**
 * 审批分组删除接口
 */
export const deleteCategory = (params) => del('/appr/v2/appr/category', params)
/**
 * 未启用审批流程列表查询接口
 */
export const getDraftList = (params) => get('/appr/v2/appr/process/draft/list', params)
/**
 * 审批分组查询接口
 */
export const getCategoryList = (params) => get('/appr/v2/appr/category', params)
/**
 * 审批类型查询接口
 */
export const getProcessTypeList = (params) => get('/appr/v2/appr/process/type', params)
/**
 * 审批流程移动接口
 */
export const moveProcess = (params) => post('/appr/v2/appr/process/move', params)
/**
 * 审批流程发布接口
 */
export const releaseProcess = (params) => post('/appr/v2/appr/process/release', params)
/**
 * 审批流程发布接口
 */
export const sortCategory = (params) => post('/appr/v2/appr/category/sort', params)
/**
 * 审批流程排序接口
 */
export const sortProcess = (params) => post('/appr/v2/appr/process/sort', params)
/**
 *
 * 审批类型查询接口
 * @package {obje}
 * @param {object} [params] 查询参数
 * @param {string} [params.processName] 流程名称，支持模糊搜索
 */
export const getProcessType = (params) => get('/appr/v2/appr/process/type', params)

/**
 *
 * 发起人所在业务部门查询接口
 * @param {object} params 查询参数
 * @param {string} params.userId
 */
export const getUserBizList = (params) => get('/appr/v2/appr/user/biz/list', params)

/**
 *
 * 发起人所在部门查询接口
 * @param {object} params 查询参数
 * @param {string} params.userId
 */
export const getUserOrgList = (params) => get('/appr/v2/appr/user/org/list', params)

/**
 *
 * 根据formKey查询流程ID接口
 * @param {object} params 查询参数
 * @param {string} params.formKey
 */
export const getProcessIDByFormKey = (params) => get('/appr/v2/appr/process/id', params)

/**
 * 发起人指定职位查询接口
 * @param {object} params
 * @param {string} params.id 职位id
 */
export const getUserByJob = (params) => get('/appr/v2/appr/user/job', params)

/**
 * 发起人指定岗位查询接口
 * @param {object} params
 * @param {string} params.id 岗位id
 */
export const getUserByPosition = (params) => get('/appr/v2/appr/user/position', params)

/**
 * 发起人指定标签查询接口
 * @param {object} params
 * @param {string} params.id 标签id
 */
export const getUserByTag = (params) => get('/appr/v2/appr/user/tag', params)

/**
 * 发起人上级领导查询接口
 * @param {object} params
 * @param {string} params.userId 发起人的用户id
 * @param {string} params.level 上级领导层级，对应字典组：ManageLevel
 */
export const getUserLeader = (params) => get('/appr/v2/appr/user/leader', params)
/**
 * 退回指定审批节点
 *  @param {object} params
 * @param {string} params.comment 审批的说明  comment":"","nodeId":"","nodeName":"","processInstanceId":"","taskId":""
 *@param {string} params.nodeId   退回审批的节点
 *@param {string} params.nodeName   退回审批的节点的名字
 * @param {string} params.processInstanceId  审批实例ID
 * @param {string} params.taskId  任务ID
 * */
export const postOverrule = (params) => post('/appr/v2/appr/apply/overrule', params)

/**
 * 发起人组织架构主管查询接口
 * @param {object} params
 * @param {string} params.level 上级领导层级，对应字典组：ManageLevel
 * @param {string} params.orgId 发起人所在组织架构（选择的组织架构）
 * @param {string} params.userId 发起人的用户Id
 * @returns {Array<{userId: string; name: string; workNo: string; avatarUrl: string}>} 返回参数
 */
export const getOrgLeader = (params) => get('/appr/v2/appr/user/org/leader', params)

/**
 * 发起人业务架构主管查询接口
 * @param {object} params
 * @param {string} params.level 上级领导层级，对应字典组：ManageLevel
 * @param {string} params.bizId 发起人所在组织架构（选择的组织架构）
 * @param {string} params.userId 发起人的用户Id
 * @returns {Array<{userId: string; name: string; workNo: string; avatarUrl: string}>} 返回参数
 */
export const getBizLeader = (params) => get('/appr/v2/appr/user/biz/leader', params)

// 批量导出
export const exportAppr = (params) =>
  get('/api/appr/v2/appr/export/data', params, { responseType: 'blob' })
