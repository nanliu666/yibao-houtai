<template>
  <div>
    <page-header
      title="教室详情"
      show-back
    />
    <basic-container class="details-container">
      <div class="details-top">
        <div class="container__box">
          <div>
            <header class="top-title">
              <div
                v-if="!_.isEmpty(classroomDetail)"
                class="title-left"
              >
                <span class="title-text">{{ classroomDetail.roomName }}</span>
                <el-tag
                  v-if="classroomDetail.status !== ''"
                  :type="getStatusType(classroomDetail.status).color"
                >
                  {{ getStatusType(classroomDetail.status).text }}
                </el-tag>
              </div>
            </header>
            <ul class="details-ul">
              <li
                class="details-li"
                style="width: 100%"
              >
                <span class="li-label">教室分类：</span>
                <span class="li-value">{{ classroomDetail.categoryName }}</span>
              </li>
              <li class="details-li">
                <span class="li-label">最大容纳人数：</span>
                <span class="li-value">
                  <span>{{
                    `${
                      classroomDetail.maxCapacity === 0
                        ? '不限制'
                        : `${classroomDetail.maxCapacity}人`
                    }`
                  }}</span>
                </span>
              </li>
              <li class="details-li">
                <span class="li-label">面积：</span>
                <span
                  v-if="classroomDetail.roomArea"
                  class="li-value"
                >{{ classroomDetail.roomArea }} m²</span>
                <span
                  v-else
                  class="li-value"
                >--</span>
              </li>
              <li class="details-li">
                <span class="li-label">地址：</span>
                <span class="li-value">{{ classroomDetail.roomAddr }}</span>
              </li>
              <li class="details-li">
                <span class="li-label">投影仪：</span>
                <span class="li-value">{{
                  classroomDetail.hasProjector === 1 ? '有' : '没有'
                }}</span>
              </li>
            </ul>
          </div>
          <common-image-view
            v-if="_.get(classroomDetail, 'photoPath', null)"
            :url="_.get(classroomDetail, 'photoPath', null)"
            :file-name="_.get(classroomDetail, 'photoPathme', null)"
            :preview-src-list="[_.get(classroomDetail, 'photoPath', null)]"
            :is-delete="false"
          />
        </div>
      </div>
    </basic-container>
    <basic-container>
      <el-menu
        :default-active="activeIndex"
        style="margin-top: -20px"
        class="el-menu-demo"
        :active-text-color="activeColor"
        mode="horizontal"
      >
        <el-menu-item index="0">
          使用情况
        </el-menu-item>
      </el-menu>
      <div style="padding: 20px; min-height:32vh">
        <common-table
          id="demo"
          ref="table"
          :columns="tableColumns"
          :config="tableConfig"
          :data="tableData"
          :loading="tableLoading"
          :page-config="tablePageConfig"
          :page="page"
          @current-page-change="handleCurrentPageChange"
          @page-size-change="handlePageSizeChange"
        >
          <template #topMenu>
            <search-popover
              ref="searchPopover"
              :require-options="searchConfig.requireOptions"
              :popover-options="searchConfig.popoverOptions"
              @submit="handleSearch"
              @reset="handelReset"
            >
              <template #creatorId>
                <el-select
                  v-model="queryInfo.creatorId"
                  v-el-select-loadmore="loadmoreSubject"
                  clearable
                  filterable
                  remote
                  reserve-keyword
                  :loading="remoteLoading"
                  placeholder="请输入"
                  :remote-method="(query) => remoteMethod(query)"
                  @change="applicantChange"
                  @focus="() => remoteMethod('')"
                >
                  <el-option
                    v-for="item in subjectOptions"
                    :key="item.creatorId"
                    :label="item.creatorName"
                    :value="item.creatorId"
                  >
                  </el-option>

                  <div
                    v-if="subjectLoading"
                    style="color: #9c9c9c; line-height: 34px;text-align: center;"
                  >
                    加载中...
                  </div>
                  <div
                    v-if="noMoreSubject && !subjectLoading"
                    style="color: #9c9c9c;line-height: 34px;text-align: center;"
                  >
                    没有更多了
                  </div>
                </el-select>
              </template>
            </search-popover>
          </template>
          <template #useTime="{row}">
            {{ row.startTime }} - {{ row.endTime }}
          </template>
        </common-table>
      </div>
    </basic-container>
  </div>
</template>

<script>
const TABLE_COLUMNS = [
  {
    label: '申请人',
    prop: 'creatorName',
    slot: true,
    minWidth: 150
  },
  {
    label: '联系方式',
    prop: 'creatorPhone',
    slot: true,
    minWidth: 120
  },
  {
    label: '使用目的',
    prop: 'usedPurpose',
    minWidth: 120
  },
  {
    label: '占用时间',
    slot: true,
    prop: 'useTime',
    minWidth: 120
  }
]
const TABLE_CONFIG = {
  rowKey: 'id',
  showHandler: false,
  showIndexColumn: false,
  enablePagination: true,
  handlerColumn: {
    minWidth: 150
  }
}
const SEARCH_CONFIG = {
  requireOptions: [
    {
      type: 'input',
      field: 'usedPurpose',
      label: '',
      data: '',
      options: [],
      config: { placeholder: '请输入使用目的搜索', 'suffix-icon': 'el-icon-search' }
    }
  ],
  popoverOptions: [
    {
      type: 'slot',
      field: 'creatorId',
      label: '申请人',
      data: '',
      config: {
        filterable: true
      },
      options: []
    },
    {
      type: 'dataPicker',
      label: '占用时间',
      data: '',
      field: 'startTime,endTime',
      config: {
        'default-time': ['00:00:00', '23:59:59'],
        type: 'datetimerange',
        'range-separator': '至',
        'value-format': 'yyyy-MM-dd HH:mm:ss'
      }
    }
  ]
}
import SearchPopover from '@/components/searchPopOver/index'
import {
  queryClassroomInfo,
  getBookList,
  getClassroomApplicantList
} from '@/api/resource/classroom'
import CommonImageView from '@/components/common-image-viewer/viewer'
import styles from '@/styles/variables.scss'
export default {
  name: 'ClassroomDetail',
  components: { SearchPopover, CommonImageView },
  filters: {
    textFilter(key) {
      const TEXT = {
        0: '完全正确得分',
        1: '按正确选项个数计分',
        2: '每项得扣分',
        3: '每项答错扣分',
        4: '每正确项得分'
      }
      return TEXT[key]
    }
  },
  directives: {
    'el-select-loadmore': {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
        SELECTWRAP_DOM.addEventListener('scroll', () => {
          /**
           * scrollHeight 获取元素内容高度(只读)
           * scrollTop 获取或者设置元素的偏移值,常用于, 计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
           * clientHeight 读取元素的可见高度(只读)
           * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
           * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
           */
          const condition =
            SELECTWRAP_DOM.scrollHeight - SELECTWRAP_DOM.scrollTop <= SELECTWRAP_DOM.clientHeight
          if (condition) {
            binding.value()
          }
        })
      }
    }
  },
  data() {
    return {
      subjectLoading: false,
      remoteLoading: false,
      noMoreSubject: false,
      subjectQuery: {
        pageNo: 1,
        pageSize: 20,
        creatorName: '',
        id: ''
      },
      activeColor: styles.primaryColor,
      activeIndex: '0',
      page: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      // 请求参数
      queryInfo: {
        pageNo: 1,
        pageSize: 10,
        usedPurpose: '', //课程,培训,活动
        creatorId: '' // 申请人id
      },
      subjectOptions: [],
      classroomDetail: {},
      tableLoading: false,
      tableData: [],
      tablePageConfig: {},
      tableConfig: TABLE_CONFIG,
      tableColumns: TABLE_COLUMNS,
      searchConfig: SEARCH_CONFIG
    }
  },
  computed: {
    id() {
      return _.get(this.$route, 'query.id')
    }
  },
  activated() {
    this.initData()
    this.loadTableData()
  },
  methods: {
    applicantChange(val) {
      let v = _.filter(this.subjectOptions, { creatorId: val })
      this.queryInfo.creatorId = v[0].creatorId
    },
    loadmoreSubject() {
      if (this.subjectLoading) return
      this.subjectQuery.pageNo++
      this.remoteMethod(true)
    },
    remoteMethod(query) {
      this.subjectLoading = true
      if (typeof query != 'boolean') {
        this.subjectQuery.creatorName = query
        this.subjectQuery.pageNo = 1
        this.subjectOptions = []
        this.remoteLoading = true
      }
      this.subjectQuery.id = this.id
      getClassroomApplicantList(this.subjectQuery)
        .then((res) => {
          const { records = [] } = res
          if (typeof query != 'boolean') {
            this.noMoreSubject = true
          } else {
            this.noMoreSubject = !records.length
          }
          this.subjectOptions = this.subjectOptions.concat(records)
        })
        .finally(() => {
          this.subjectLoading = false
          this.remoteLoading = false
        })
    },
    /**
     * 处理页码改变
     */
    handleCurrentPageChange(param) {
      this.queryInfo.pageNo = param
      this.loadTableData()
    },
    /**
     * 处理页码大小更改
     */
    handlePageSizeChange(param) {
      this.queryInfo.pageSize = param
      this.loadTableData()
    },
    handelReset() {
      this.queryInfo.creatorId = ''
    },
    // 搜索
    handleSearch(params) {
      delete params.creatorId
      this.queryInfo = _.assign(this.queryInfo, params)
      this.loadTableData()
    },
    /**
     * 标识状态
     */
    getStatusType(status) {
      const TYPE_STATUS = {
        1: {
          color: 'success',
          text: '已启用'
        },
        0: {
          color: 'danger',
          text: '已停用'
        }
      }
      return TYPE_STATUS[status]
    },
    /**
     * 初始数据
     */
    initData() {
      queryClassroomInfo({ id: this.id }).then((res) => {
        this.classroomDetail = res
      })
    },
    async loadTableData() {
      if (this.tableLoading) return
      try {
        this.tableData = []
        this.tableLoading = true
        let { totalNum, data } = await getBookList(_.assign(this.queryInfo, { id: this.id }))
        this.tableData = data
        this.page.total = totalNum
      } catch (error) {
        this.$message.error(error.message)
      } finally {
        this.tableLoading = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
/deep/ .el-form-item__content {
  width: 270px;
}
/deep/ .el-menu--horizontal {
  border-bottom: 1px solid #cccccc !important;
}
/deep/ .image-li,
.el-image {
  height: 140px;
}
.details-container {
  background-color: #fff;
  margin-bottom: 16px;
  .details-top {
    .top-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      .title-left {
        display: flex;
        align-items: center;
      }
      .title-text {
        font-size: 18px;
        font-weight: 550;
        margin-right: 10px;
      }
    }
    .container__box {
      display: flex;
      justify-content: space-between;
    }
    .details-ul {
      display: flex;
      flex-wrap: wrap;
      flex-direction: row;
      .details-li {
        width: 50%;
        display: flex;
        margin-bottom: 10px;
        .li-label {
          min-width: 100px;
          display: inline-block;
          color: rgba(0, 11, 21, 0.45);
        }
        .li-value {
          color: rgba(0, 11, 21, 0.85);
        }
      }
    }
  }
  .details-bottom {
    .bottom-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        font-size: 16px;
        font-weight: 550;
      }
      .handle {
        cursor: pointer;
        margin-left: 4px;
        color: #000b15;
      }
    }
    .extend-ul {
      padding-top: 24px;
      .extend-li {
        padding-bottom: 24px;
        &:last-child {
          padding-bottom: 0;
        }
        .li-title {
          font-family: PingFangSC-Medium;
          font-size: 14px;
          color: #000b15;
          position: relative;
          padding-left: 12px;
          margin-bottom: 16px;
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 10%;
            width: 4px;
            height: 80%;
            background-color: $primaryColor;
          }
        }
        .li-content {
          display: flex;
          flex-wrap: wrap;
          .content {
            width: 50%;
            margin-bottom: 16px;
            span {
              &:first-child {
                color: rgba(0, 11, 21, 0.45);
              }
              &:last-child {
                color: rgba(0, 11, 21, 0.85);
              }
            }
          }
        }
      }
    }
  }
}
.image-ul {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  .image-li {
    margin-right: 10px;
    border: 1px solid #ccc;
  }
}
.file-title {
  cursor: pointer;
  margin-bottom: 10px;
}
</style>
