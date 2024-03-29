// 课程管理页面的鉴权
export const ADD_COURSE = '/course/courseDraft/add' //新增
export const EXPORT_COURSE = '/course/courseDraft/export' //导出
export const TOP_COURSE = '/course/courseDraft/top' //置顶/取消置顶
export const EDIT_COURSE = '/course/courseDraft/edit' //编辑
export const DELETE_COURSE = '/course/courseDraft/delete' //删除
export const SYNCHRONIZATION_COURSE = '/course/courseDraft/synchronization' //批量同步
export const MOVE_COURSE = '/course/courseDraft/move' // 移动
export const PUTAWAY_COURSE = '/course/courseDraft/putaway' // 发布/停用
export const REFRESH_COURSE = '/course/courseDraft/test1'
export const IMPORT_COURSE = '/course/courseDraft/importCourse' //导入课程
// 课程中心的分类管理的鉴权
export const ADD_COURSE_CATALOG = '/course/catalog/add' // 新增
export const STOP_COURSE_CATALOG = '/course/catalog/stop' // 停用/启用
export const AUTH_COURSE_CATALOG = '/course/catalog/author' // 权限配置
export const EDIT_COURSE_CATALOG = '/course/catalog/edit' // 编辑
export const DELETE_COURSE_CATALOG = '/course/catalog/delete' // 删除
export const ADD_GROUNP_COURSE_CATALOG = '/course/catalog/addNewGroup' // 新增子分类
// 课程中心的审核
export const COURSE_APPROVALCENTER_VIEW = '/course/approvalCenter/view' // 查看详情
// 培训中心的鉴权
export const ADD_TRAIN = '/training/trainingArrange/add' // 新增培训
export const ADD_GROUNP_TRAIN = '/training/trainingArrange/addGroup' // 新增分组
export const DELETE_TRAIN = '/training/trainingArrange/delete' // 删除
export const EDIT_TRAIN = '/training/trainingArrange/edit' //编辑
export const NEXT_TRAIN = '/training/trainingArrange/next' // 开办下一期
export const END_TRAIN = '/training/trainingArrange/end' // 结办
export const VIEW_TRAIN = '/training/trainingArrange/view' // 查看详情
// 知识库的分类管理的鉴权
export const ADD_REP_CATALOG = '/repository/catalogManagement/add' // 新增分类
export const STOP_REP_CATALOG = '/repository/catalogManagement/stop' // 停用分类
export const AUTH_REP_CATALOG = '/repository/catalogManagement/author' // 权限配置
export const EDIT_REP_CATALOG = '/repository/catalogManagement/edit' // 编辑分类
export const DELETE_REP_CATALOG = '/repository/catalogManagement/delete' // 删除分类
export const ADD_CHILD_REP_CATALOG = '/repository/catalogManagement/addNewChild' // 新建子分类
// 知识库的知识管理的鉴权
export const ADD_REP = '/repository/knowledgeManagement/add' // 创建资源
export const TOP_REP = '/repository/knowledgeManagement/top' // 置顶/取消置顶
export const PUTAWAY_REP = '/repository/knowledgeManagement/putaway' // 上架/下架
export const EDIT_REP = '/repository/knowledgeManagement/edit' // 编辑
export const DELETE_REP = '/repository/knowledgeManagement/delete' // 删除
export const MOVE_REP = '/repository/knowledgeManagement/move' // 移动
export const VIEW_REP = '/repository/knowledgeManagement/view' // 查看
// 考评管理的分类管理的鉴权
export const ADD_EXAM_CATALOG = '/examManagement/category/management/add' // 新建分类
export const STOP_EXAM_CATALOG = '/examManagement/category/management/stop' // 停用
export const AUTH_EXAM_CATALOG = '/examManagement/category/management/author' // 权限配置
export const EDIT_EXAM_CATALOG = '/examManagement/category/management/edit' // 编辑
export const DELETE_EXAM_CATALOG = '/examManagement/category/management/delete' // 删除
export const ADD_GROUNP_EXAM_CATALOG = '/examManagement/category/management/addNewChild' // 新建子分类
// 考评管理的题库管理的鉴权
export const DELETE_QUSTION = '/examManagement/question/questionList/delete' // 删除
export const EDIT_QUSTION = '/examManagement/question/questionList/edit' // 编辑
export const ADD_QUSTION = '/examManagement/question/questionList/add' // 新增
export const EXPORT_QUSTION = '/examManagement/question/questionList/export' // 新增
// 考评管理的试卷管理的鉴权
export const COPY_TESTPAPER = '/examManagement/testPaper/testPaper/copy' // 复制
export const ADD_TESTPAPER = '/examManagement/testPaper/testPaper/add' // 创建试卷
export const DELETE_TESTPAPER = '/examManagement/testPaper/testPaper/delete' // 删除
export const EDIT_TESTPAPER = '/examManagement/testPaper/testPaper/edit' // 编辑
export const PREVIEW_TESTPAPER = '/examManagement/testPaper/testPaper/preview' // 预览
// 考评管理的考试安排的鉴权
export const ADD_EXAM = '/examManagement/examSchedule/list/add' // 创建考试
export const EDIT_EXAM = '/examManagement/examSchedule/list/edit' // 编辑
export const DELETE_EXAM = '/examManagement/examSchedule/list/delete' // 删除
export const COPY_EXAM = '/examManagement/examSchedule/list/copy' // 复制
// 考评管理的手工评卷的鉴权
export const BY_PERSON = '/examManagement/mark/MarkList/byPerson' // 逐人评卷
export const BY_QUESTION = '/examManagement/mark/MarkList/byQuestion' // 逐题评卷
// 考评管理的成绩管理的鉴权
export const VIEW_GRADE = '/examManagement/grade/achievement/view' // 查看考生成绩
//考评管理的闯关竞赛
export const COMPETITION_ADD = '/examManagement/competition/list/add' // 创建闯关
export const COMPETITION_EDIT = '/examManagement/competition/list/edit' // 编辑闯关
export const COMPETITION_DEL = '/examManagement/competition/list/del' // 删除闯关

// 必修课程安排的鉴权
export const ADD_REQUIRED = '/learnPlan/CoursePlanList/add' // 新建必修课程安排
export const EDIT_REQUIRED = '/learnPlan/CoursePlanList/edit' // 编辑
export const DELETE_REQUIRED = '/learnPlan/CoursePlanList/delete' // 删除
export const VIEW_REQUIRED = '/learnPlan/CoursePlanList/view' // 查看完成率
export const ADD_GROUP_REQUIRED = '/learnPlan/CoursePlanList/addGroup' // 新建分组
export const STOP_REQUIRED = '/learnPlan/CoursePlanList/stop' // 结办
// 选修课程安排的鉴权
export const VIEW_ELECTIVE = '/learnPlan/ElectivePlanList/view' // 查看
export const DELETE_ELECTIVE = '/learnPlan/ElectivePlanList/delete' // 删除
// 积分规则管理的鉴权
export const DELETE_CREDIT = '/creditManagement/creditRule/delete' // 删除
export const EDIT_CREDIT = '/creditManagement/creditRule/edit' // 编辑
export const STOP_CREDIT = '/creditManagement/creditRule/stop' // 停用
export const ADD_CREDIT = '/creditManagement/creditRule/add' // 新建规则
// 积分规则管理的鉴权
export const STOP_SYSTEM_RULE = '/creditManagement/systemRule/stop' // 停用
// 积分明细的鉴权
export const VIEW_CREDIT = '/creditManagement/credit/view' // 查看详情
export const ADD_CREDIT_DETAIL = '/creditManagement/credit/add' // 查看详情
// 积分明细的查看详情的鉴权
export const DELETE_CREDIT_DETAIL = '/creditManagement/creditDetails/delete' // 删除
// 讲师分类的鉴权
export const ADD_LECTURER_CLASSIFY = '/lecturer/classify/add' // 添加分类
export const STOP_LECTURER_CLASSIFY = '/lecturer/classify/stop' // 启用/停用
export const EDIT_LECTURER_CLASSIFY = '/lecturer/classify/edit' // 编辑
export const DELETE_LECTURER_CLASSIFY = '/lecturer/classify/delete' // 删除
export const ADD_LECTURER_GROUNP_CLASSIFY = '/lecturer/classify/addNewGroup' // 新建子分类
// 讲师管理的鉴权
export const ADD_LECTURER = '/lecturer/lecturer/add' // 添加讲师
export const EXPORT_LECTURER = '/lecturer/lecturer/export' // 导出讲师
export const STOP_LECTURER = '/lecturer/lecturer/stop' // 停用
export const EDIT_LECTURER = '/lecturer/lecturer/edit' // 编辑
export const DELETE_LECTURER = '/lecturer/lecturer/delete' // 删除
export const ADD_LECTURER_GROUNP = '/lecturer/lecturer/addNewGroup' // 新建分组
export const IMPORT_LECTURER = '/lecturer/lecturer/import' // 导入讲师
// 证书管理的鉴权
export const ADD_CERTIFICATE = '/certificate/certificateManage/add' // 新建模板
export const STOP_CERTIFICATE = '/certificate/certificateManage/stop' // 停用
export const PREVIEW_CERTIFICATE = '/certificate/certificateManage/preview' // 预览
export const DELETE_CERTIFICATE = '/certificate/certificateManage/delete' // 删除
export const EDIT_CERTIFICATE = '/certificate/certificateManage/edit' // 编辑
// 证书发放明细的鉴权
export const EXPORT_CERTIFICATE = '/certificate/detailList/export' // 导出Excel
export const VIEW_CERTIFICATE = '/certificate/detailList/view' // 查看
// 证书发放明细的详情的鉴权
export const EXPORT_CERTIFICATE_DETAIL = '/certificate/detail/export' // 导出
export const SOURCE_CERTIFICATE_DETAIL = '/certificate/detail/source' // 查看来源
export const REVOKE_CERTIFICATE_DETAIL = '/certificate/detail/revoke' // 撤回证书
// 组织管理的鉴权
export const ADD_ORG = '/orgs/orgManagement/add' // 新建组织
export const ADD_ORG_CHILD = '/orgs/orgManagement/addChild' // 新建子组织
export const EDIT_ORG = '/orgs/orgManagement/edit' // 编辑
export const DELETE_ORG = '/orgs/orgManagement/delete' // 删除
export const IMPORT_ORGS = '/orgs/orgManagement/importOrgs' //导入
// 组织管理的组织详情的鉴权
export const EDIT_ORGDETAIL = '/orgs/orgDetail/edit' // 编辑
export const DELETE_ORGDELETE = '/orgs/orgDetail/delete' // 删除
// 用户管理的鉴权
export const ADD_USER = '/system/user/add' // 新建用户
export const EXPORT_USER = '/system/user/export' // 新建用户
export const IMPORT_USER = '/system/user/import' // 导入用户
export const SETTING_USER = '/system/user/setting' // 角色设置
export const RESET_USER = '/system/user/resetPassword' // 密码重置
export const EDIT_USER = '/system/user/edit' // 编辑
export const END_USER = '/system/user/end' // 冻结
export const DELETE_USER = '/system/user/delete' // 删除
export const BATCH_EXPORT = '/system/user/export' // 批量导出
export const BULK_DEPARTURES = '/system/user/departures' // 批量离职
export const BATCH_DEPARTMENT = '/system/user/department' // 批量修改部门
export const BATCH_DELETE_USER = '/system/user/batchDelete' // 批量删除用户
// 菜单管理的鉴权
export const STOP_MENU = '/system/menu/stop' // 启用/停用
// 新闻管理的鉴权
export const ADD_NEWS = '/system/newsCenter/newsManage/add' // 新建公告
export const DELETE_NEWS = '/system/newsCenter/newsManage/delete' // 删除
export const EDIT_NEWS = '/system/newsCenter/newsManage/edit' // 删除
export const TOP_NEWS = '/system/newsCenter/newsManage/top' // 置顶
// 角色管理的鉴权
export const ADD_ROLE = '/system/role/add' // 新建角色
export const VIEW_ROLE = '/system/role/view' // 查看用户
export const EDIT_ROLE = '/system/role/edit' // 编辑
export const DELETE_ROLE = '/system/role/delete' // 删除
export const AUTH_ROLE = '/system/role/author' // 权限配置
export const ADD_ROLE_CATALOG = '/system/role/addCatalog' // 新建分类
// 角色管理的角色权限的鉴权
export const ADD_PERMISSION = '/system/permissionConfig/add' // 新建权限
export const RANGE_PERMISSION = '/system/permissionConfig/range' // 管理范围
export const DELETE_PERMISSION = '/system/permissionConfig/delete' // 删除
// 角色管理的查看用户的鉴权
export const ADD_ROLE_USER = '/system/roleUsers/add' // 添加用户
export const DELETE_ROLE_USER = '/system/roleUsers/delete' // 删除
// 流程管理的审批流程的鉴权
export const ADD_APPROVAL = '/apprProcess/approvalList/add' // 创建审批流程
export const STOP_APPROVAL = '/apprProcess/approvalList/stop' // 启用/停用
export const EIDT_APPROVAL = '/apprProcess/approvalList/eidt' // 编辑
export const DELETE_APPROVAL = '/apprProcess/approvalList/delete' // 删除
// 直播中心的分类管理的鉴权
export const ADD_LIVE_CLASSIFY = '/live/classify/add' // 新建分类
export const STOP_LIVE_CLASSIFY = '/live/classify/stop' // 启用/停用
export const AUTH_LIVE_CLASSIFY = '/live/classify/auth' // 权限配置
export const EDIT_LIVE_CLASSIFY = '/live/classify/eidt' // 编辑
export const DELETE_LIVE_CLASSIFY = '/live/classify/delete' // 删除
export const ADD_NEW_GROUNP_LIVE_CLASSIFY = '/live/classify/addNewGroup' // 新建子分类
export const SORT_LIVE_CLASSIFY = '/live/classify/sort' // 调整排序
// 直播中心的直播安排的鉴权
export const ADD_LIVE = '/live/liveList/add' // 创建直播
export const STOP_LIVE = '/live/liveList/stop' // 禁用
export const EDIT_LIVE = '/live/liveList/edit' // 编辑
export const VIEW_LIVE = '/live/liveList/view' // 查看详情
export const DELETE_LIVE = '/live/liveList/delete' // 删除
// 直播中心的直播回放的鉴权
export const PUBLISH_LIVE_BACK = '/live/playBackListSingle/publish' // 恢复
export const PUTAWAY_LIVE_BACK = '/live/playBackListSingle/putaway' // 发布/下架
export const DELETE_LIVE_BACK = '/live/playBackListSingle/delete' // 删除
export const DOWNLOAD_LIVE_BACK = '/live/playBackListSingle/download' // 下载
// 直播中心的数据统计的鉴权
export const CONCAT_LIVE_START = '/live/live-stat-detail/concat' // 合并同一用户
// 教室管理的分类管理的鉴权
export const ADD_CLASSROOM_CLASSIFY = '/resource/classroom/classify/add' // 新建分类
export const STOP_CLASSROOM_CLASSIFY = '/resource/classroom/classify/stop' // 启用/停用
export const EDIT_CLASSROOM_CLASSIFY = '/resource/classroom/classify/eidt' // 编辑
export const DELETE_CLASSROOM_CLASSIFY = '/resource/classroom/classify/delete' // 删除
export const ADD_NEW_GROUNP_CLASSROOM_CLASSIFY = '/resource/classroom/classify/addNewGroup' // 新建子分类
// 教室管理的教室列表的鉴权
export const ADD_CLASSROOM = '/resource/classroom/list/add' // 创建教室
export const VIEW_CLASSROOM = '/resource/classroom/list/view' // 查看教室
export const STOP_CLASSROOM = '/resource/classroom/list/stop' // 启用/停用
export const EDIT_CLASSROOM = '/resource/classroom/list/eidt' // 编辑
export const DELETE_CLASSROOM = '/resource/classroom/list/delete' // 删除

// 岗位管理的鉴权
export const ADD_STATION = '/system/station/add' // 岗位新增
export const EXPORTS_STATION = '/system/station/exports' // 批量导出
export const DETAIL_STATION = '/system/station/detail' // 查看用户
export const EDIT_STATION = '/system/station/edit' // 岗位编辑
export const DELETE_STATION = '/system/station/delete' // 岗位删除
export const EXPORTS_STATIONDETAIL = '/system/stationDetail/exports' // 批量导出(查看用户)
export const IMPORT_STATION = '/system/station/import' // 岗位新增  批量导入

// 运营管理
export const DIY_EDIT_RELEASE_PC = '/diy/diyHomeEditPc/release' // 自定义案例编辑页发布（pc）
export const DIY_EDIT_SAVE_PC = '/diy/diyHomeEditPc/save' // 自定义案例编辑页保存（pc）
export const DIY_EDIT_RELEASE_MB = '/diy/diyHomeEditMb/release' // 自定义案例编辑页发布（移动端）
export const DIY_EDIT_SAVE_MB = '/diy/diyHomeEditMb/save' // 自定义案例编辑页保存（移动端）

export const DIY_HOME_ADD_PC = '/diy/diyHomePc/add' // 首页定制-新建方案（pc）
export const DIY_HOME_RELEASE_PC = '/diy/diyHomePc/release' // 首页定制-发布（pc）
export const DIY_HOME_EDIT_PC = '/diy/diyHomePc/edit' // 首页定制-编辑（pc）
export const DIY_HOME_DELETE_PC = '/diy/diyHomePc/delete' // 首页定制-删除（pc）
export const DIY_HOME_ADD_MOBILE = '/diy/diyHomeMobile/add' // 首页定制-新建方案（移动端）
export const DIY_HOME_RELEASE_MOBILE = '/diy/diyHomeMobile/release' // 首页定制-发布（移动端）
export const DIY_HOME_EDIT_MOBILE = '/diy/diyHomeMobile/edit' // 首页定制-编辑（移动端）
export const DIY_HOME_DELETE_MOBILE = '/diy/diyHomeMobile/delete' // 首页定制-删除（移动端）
export const DIY_BANNER_ADD_PC = '/diy/bannerPc/add' // 首页定制-新建banner（pc）
export const DIY_BANNER_EDIT_PC = '/diy/bannerPc/edit' // 首页定制-编辑banner（pc）
export const DIY_BANNER_DELETE_PC = '/diy/bannerPc/DELETE' // 首页定制-删除banner（pc）
export const DIY_BANNER_ADD_MOBILE = '/diy/bannerMobile/add' // 首页定制-新建banner（移动端）
export const DIY_BANNER_EDIT_MOBILE = '/diy/bannerMobile/edit' // 首页定制-编辑banner（移动端）
export const DIY_BANNER_DELETE_MOBILE = '/diy/bannerMobile/DELETE' // 首页定制-删除banner（移动端
export const DIY_ADD_APP = '/diy/appManage/add' // 发布新版本
export const DIY_EDIT_APP = '/diy/appManage/edit' // 编辑app
export const DIY_DEl_APP = '/diy/appManage/del' // 删除app

// 培训计划上报
export const TRAINING_PLAN_ADD = '/trainingPlan/submission/add' // 创建计划
export const TRAINING_PLAN_EDIT = '/trainingPlan/submission/edit' // 编辑
export const TRAINING_PLAN_CHANGE = '/trainingPlan/submission/change' // 变更
export const TRAINING_PLAN_WITHDRAW = '/trainingPlan/submission/withdraw' // 撤回
export const TRAINING_PLAN_DELETE = '/trainingPlan/submission/delete' // 删除

// 培训计划制定
export const TRAINING_DEVELOPMENT_ADD = '/trainingPlan/development/add' // 创建计划
export const TRAINING_DEVELOPMENT_EDIT = '/trainingPlan/development/edit' // 编辑
export const TRAINING_DEVELOPMENT_DELETE = '/trainingPlan/development/delete' // 删除

// 学习地图-能力词典
export const ABILITYDICTIONARY_ADD = '/studyMap/abilityDictionary/add' // 创建能力
export const ABILITYDICTIONARY_EDIT = '/studyMap/abilityDictionary/edit' // 编辑
export const ABILITYDICTIONARY_DELETE = '/studyMap/abilityDictionary/delete' // 删除
export const ABILITYDICTIONARY_BATCHDELETE = '/studyMap/abilityDictionary/batchdelete' // 批量删除

// 学习地图-岗位胜任力模型
export const COMPETENCY_MODEL_ABILITYMANAGE = '/studyMap/competencyModel/abilityManage' // 管理能力

// 学习地图-岗位晋升管理
export const POST_PROMOTION_ROUTE = '/studyMap/postPromotion/promotionRoute' // 管理晋升路线
export const POST_PROMOTION_ADD_ROUTE = '/studyMap/postPromotion/addRoute' // 添加晋升路线

// 学习地图-人才盘点
export const TALENTINVENTORY_LEARNINGSITUATION = '/studyMap/talentInventory/learningSituation' // 学习情况

// 职级管理的鉴权
export const ADD_RANK = '/system/rank/addRank' //  职级新增
export const EDIT_RANK = '/system/rank/edit' //  职级编辑
export const DELETE_RANK = '/system/rank/delete' //  职级删除

//制度清单
export const LIST_APPLY = '/system/listing/apply' //  课程管理-申请
export const UPLOAD_FORM = '/system/listing/uploadForm' //  上传业务表单
export const UPLOAD_TRAIN = '/system/listing/uploadTrain' //  上传培训制度
export const LIST_DELETE = '/system/listing/delete' //  删除

//导师管理
export const TEACH_EDIT = '/resource/teachManage/teachList/edit' // 导师编辑
export const TEACH_DEL = '/resource/teachManage/teachList/del' //  导师删除
export const TEACH_CREATE = '/resource/teachManage/teachList/create' //  导师创建

//教育经费-经费管理
export const EDUCA_MANAGE_EDIT = '/educaFund/educaList/edit' //  编辑
export const EDUCA_MANAGE_DEL = '/educaFund/educaList/del' //  删除
export const EDUCA_MANAGE_CREATE = '/educaFund/educaList/create' //  创建
//教育经费-经费明细
export const EDUCA_DETAIL_EDIT = '/educaFund/educaDetails/edit' //  编辑
export const EDUCA_DETAIL_DEL = '/educaFund/educaDetails/del' //  删除
export const EDUCA_DETAIL_CREATE = '/educaFund/educaDetails/create' //  创建
export const EDUCA_DETAIL_EXPORT = '/educaFund/educaDetails/export' //  导出
//教育经费-年度经费详情
export const EDUCA_INFO_EDIT = '/educaFund/educaInfo/edit' //  编辑
export const EDUCA_INFO_DEL = '/educaFund/educaInfo/del' //  删除
//社区管理-专区管理
export const ADD_ZONE = '/community/zone/add' // 添加
export const DEL_ZONE = '/community/zone/del' // 删除
export const EDIT_ZONE = '/community/zone/edit' // 编辑
export const STOP_ZONE = '/community/zone/stop' // 停与启
//社区管理-专家库
export const ADD_EXPERT = '/community/expert/add' // 添加
export const DEL_EXPERT = '/community/expert/del' // 删除
export const EDIT_EXPERT = '/community/expert/edit'

//系统管理-分组管理
export const ADD_GROUNP = '/system/groupManage/add' // 添加
export const DEL_GROUNP = '/system/groupManage/del' // 删除
export const EDIT_GROUNP = '/system/groupManage/edit' //编辑
export const VIEW_GROUNP = '/system/groupManage/view' //查看用户
export const ADD_GROUNPUSER = '/system/viewUsers/add' //添加用户
export const IMPORT_GROUNPUSER = '/system/viewUsers/import' //导入用户
export const DEL_GROUNPUSER = '/system/viewUsers/del' //删除用户
