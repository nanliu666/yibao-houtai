<template>
  <div class="Menu fill">
    <basic-container block>
      <common-table
        ref="table"
        :columns="columnsVisible | columnsFilter"
        :config="tableConfig"
        :data="tableData"
        :loading="tableLoading"
        :page-config="tablePageConfig"
        :page="page"
        @current-page-change="handleCurrentPageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #topMenu>
          <div class="operations">
            <SearchPopover
              ref="searchPopover"
              :popover-options="searchPopoverConfig.popoverOptions"
              :require-options="searchPopoverConfig.requireOptions"
              @submit="handleSearch"
            />
            <div class="operations-right">
              <div
                class="refresh-container"
                @click="loadTableData"
              >
                <i class="el-icon-refresh-right" />
                <span>刷新</span>
              </div>
              <el-popover
                placement="bottom"
                width="40"
                trigger="click"
              >
                <i
                  slot="reference"
                  style="cursor: pointer"
                  class="el-icon-setting"
                />
                <!-- 设置表格列可见性 -->
                <div class="operations__column--visible">
                  <el-checkbox-group v-model="columnsVisible">
                    <el-checkbox
                      v-for="item of tableColumns"
                      :key="item.prop"
                      :disabled="item.prop === 'resName'"
                      :label="item.prop"
                      class="operations__column--item"
                    >
                      {{ item.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </el-popover>
            </div>
          </div>
        </template>
        <template #progress="{ row }">
          <el-progress :percentage="row.progress || 0"></el-progress>
        </template>
        <template #uploadType="{ row }">
          {{ row.uploadType === 0 ? '本地文件' : '链接文件' }}
        </template>
        <template
          slot="multiSelectMenu"
          slot-scope="{ selection }"
        >
          <el-button
            type="text"
            size="medium"
            icon="el-icon-delete"
            @click="multipleDeleteClick(selection)"
          >
            批量导出
          </el-button>
        </template>
        <template #handler="{ row }">
          <el-button
            type="text"
            @click="jumpDetail(row)"
          >
            查看附件材料
          </el-button>
        </template>
        <template #jobTimes="{ row }">
          {{ row.jobTimes }}/{{ row.totalJob }}次
        </template>
      </common-table>
    </basic-container>
  </div>
</template>

<script>
import { getStudyList, exportStudyList } from '@/api/course/course'
import SearchPopover from '@/components/searchPopOver/index'
import { getorganizationNew } from '@/api/org/org'
import { exportToExcel } from '@/util/util'
// 表格属性
const TABLE_COLUMNS = [
  {
    label: '姓名',
    minWidth: 150,
    slot: true,
    prop: 'name',
    fixed: 'left'
  },
  {
    label: '手机号',
    prop: 'phonenum',
    maxWidth: 100
  },
  {
    label: '所属部门',
    prop: 'deptName',
    minWidth: 100
  },
  {
    label: '学习进度',
    slot: true,
    prop: 'progress',
    minWidth: 100
  },
  {
    label: '课程通过状态',
    prop: 'isPassCourse',
    minWidth: 100,
    formatter: (row) =>
      row.isPassCourse === 0 ? '未通过' : row.isPassCourse === 1 ? '已通过' : '--'
  },
  {
    label: '作业提交次数',
    prop: 'jobTimes',
    slot: true,
    minWidth: 110
  }
  // {
  //   label: '用户岗位',
  //   minWidth: 100,
  //   prop: 'position'
  // },
  // {
  //   label: '学习开始时间',
  //   minWidth: 150,
  //   prop: 'startTime'
  // },
  // {
  //   label: '学习结束时间',
  //   minWidth: 150,
  //   prop: 'endTime'
  // }
]
const TABLE_CONFIG = {
  enablePagination: true,
  showHandler: true,
  enableMultiSelect: true,
  showIndexColumn: false,
  handlerColumn: {
    minWidth: 150
  },
  rowKey: 'stuId',
  treeProps: { hasChildren: 'hasChildren', children: 'children' }
}
const TABLE_PAGE_CONFIG = {}

// 搜索配置
const SEARCH_POPOVER_REQUIRE_OPTIONS = [
  {
    config: { placeholder: '输入学员姓名搜索', 'suffix-icon': 'el-icon-search' },
    data: '',
    field: 'name',
    label: '',
    type: 'input'
  }
]
let SEARCH_POPOVER_POPOVER_OPTIONS = [
  {
    label: '部门',
    disabled: false,
    field: 'orgId',
    data: '',
    placeholder: '请选择部门',
    type: 'lazycascader',
    filterMethod: () => {},
    filterProps: {},
    options: [],
    change: () => {},
    props: {}
  },
  {
    type: 'select',
    field: 'progress',
    label: '学习进度',
    data: '',
    options: [
      { value: 0, label: '未完成' },
      { value: 100, label: '已完成' }
    ]
  },
  {
    type: 'select',
    field: 'jobSubmitRate',
    label: '作业提交情况',
    data: '',
    options: [
      { value: 0, label: '未完成' },
      { value: 100, label: '全部提交' }
    ]
  },
  {
    type: 'select',
    field: 'isPassCourse',
    label: '课程通过状态',
    data: '',
    options: [
      { value: 1, label: '已通过' },
      { value: 0, label: '未通过' }
    ]
  }
]
let SEARCH_POPOVER_CONFIG = {
  popoverOptions: SEARCH_POPOVER_POPOVER_OPTIONS,
  requireOptions: SEARCH_POPOVER_REQUIRE_OPTIONS
}
const FORM_COLUMNS = [
  {
    label: '移动到新目录',
    itemType: 'treeSelect',
    prop: 'catalogId',
    required: true,
    span: 24,
    props: {
      selectParams: {
        placeholder: '请选择所在目录',
        multiple: false
      },
      treeParams: {
        'check-strictly': true,
        'default-expand-all': false,
        'expand-on-click-node': false,
        clickParent: true,
        data: [],
        filterable: false,
        props: {
          children: 'children',
          label: 'name',
          value: 'id'
        },
        required: true
      }
    }
  }
]
export default {
  name: 'KnowledgeManagement',
  components: {
    SearchPopover
  },
  filters: {
    // 过滤不可见的列
    columnsFilter: (visibleColProps) =>
      _.filter(TABLE_COLUMNS, ({ prop }) => _.includes(visibleColProps, prop))
  },
  data() {
    return {
      moveKnowledgeRow: {},
      orgOption: [],
      formColumns: FORM_COLUMNS,
      formData: {
        catalogId: ''
      },
      dialogTableVisible: false,
      // 默认选中所有列
      columnsVisible: _.map(TABLE_COLUMNS, ({ prop }) => prop),
      page: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      // 请求参数
      queryInfo: {
        pageNo: 1,
        pageSize: 10,
        resName: '',
        catalogId: '',
        uploadType: '',
        // tagId: '',
        status: ''
      },
      searchPopoverConfig: SEARCH_POPOVER_CONFIG,
      tableColumns: TABLE_COLUMNS,
      tableConfig: TABLE_CONFIG,
      tableData: [],
      tableLoading: false,
      tablePageConfig: TABLE_PAGE_CONFIG
    }
  },

  activated() {
    this.refreshTableData()
    this.$refs.searchPopover.resetForm()
  },
  created() {
    this.refreshTableData()
  },
  mounted() {
    const org = (this.orgOption = this.searchPopoverConfig.popoverOptions[0])
    org.filterMethod = this.loadOrgData
    org.filterProps = {
      size: {
        key: 'pageSize',
        value: 1000
      },
      page: {
        key: 'pageNo',
        value: 0
      },
      search: {
        key: 'orgName',
        value: ''
      }
    }
    org.props = {
      checkStrictly: true,
      label: 'orgName',
      value: 'orgId',
      // moreLoad: this.loadOrgData,
      lazy: true,
      lazyLoad: this.orgLazyLoad,
      loadProps: {
        size: {
          key: 'pageSize',
          value: 10
        },
        page: {
          key: 'pageNo',
          value: 1
        },
        value: {
          key: 'parentId',
          value: ''
        }
      }
    }
    this.loadOrgData()
  },
  methods: {
    orgLazyLoad(node, resolve) {
      if (!node.data) return []
      this.loadOrgData({ parentId: node.data.id }, resolve)
    },
    loadOrgData(query, resolve) {
      if (query && typeof query === 'object') {
        if (!query.pageSize) {
          Object.assign(query, { pageSize: 10, pageNo: 1 })
        } else {
          if (query.name) {
            delete query.parentId
          } else {
            delete query.name
          }
        }
      } else {
        query = { name: query }
      }
      if (!query.name) {
        query.parentId = query.parentId || '0'
      }
      // 接口
      getorganizationNew(query).then((res) => {
        const data = res
        if (resolve) {
          resolve(data)
        } else {
          this.orgOption.options = data
        }
      })
    },

    // 批量操作
    async multipleDeleteClick(selected) {
      let selectedIds = []
      _.each(selected, (item) => {
        selectedIds.push(item.courseId)
      })
      await exportStudyList({ courseId: this.$route.query.id }).then((res) => {
        exportToExcel(res)
      })
      this.$message.success('操作成功')
      this.$refs.table.clearSelection()
      this.loadTableData()
    },

    /**
     * 处理页码改变
     */
    handleCurrentPageChange(param) {
      this.queryInfo = _.assign(this.queryInfo, { pageNo: param })
      this.loadTableData()
    },
    /**
     * 处理页码大小更改
     */
    handlePageSizeChange(param) {
      this.queryInfo = _.assign(this.queryInfo, { pageSize: param })
      this.loadTableData()
    },
    /**
     * 搜索
     */
    handleSearch(searchParams) {
      this.queryInfo = _.assign(this.queryInfo, searchParams)
      this.queryInfo.pageNo = 1
      this.page.currentPage = 1
      this.loadTableData()
    },
    // 跳去详情
    jumpDetail(row) {
      this.$router.push({
        path: '/course/materials',
        query: { row: JSON.stringify(row), courseId: this.$route.query.id }
      })
    },
    // 去用户详情
    toUserInfo(row) {
      console.log(row)
      this.$router.push({
        path: '/system/userDetail',
        query: {
          userId: row.stuId
        }
      })
    },
    // 刷新列表数据
    refreshTableData() {
      //  因为只加载了最外层的数据，children仍然是旧的，清空数据
      this.tableData = []
      this.loadTableData()
    },
    // 加载表格数据
    async loadTableData() {
      if (this.tableLoading) return
      this.tableLoading = true
      try {
        this.queryInfo.courseId = this.$route.query.id
        let { totalNum, data } = await getStudyList(this.queryInfo)
        this.tableData = data
        this.page.total = totalNum
      } catch (error) {
        // window.console.log(error)
      } finally {
        this.tableLoading = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.handle__button {
  display: flex;
  justify-content: space-between;
  .top__button {
    width: 30px;
  }
}
.operations-right {
  i {
    margin-left: 12px;
    font-size: 18px;
    color: #a0a8ae;
    cursor: pointer;
  }
  display: flex;
  align-items: center;
  .refresh-container {
    position: relative;
    display: flex;
    align-items: center;
    color: #a0a8ae;
    padding: 0 10px;
    cursor: pointer;
    span {
      padding-left: 6px;
    }
    &::before {
      position: absolute;
      content: '';
      top: 3px;
      right: 0px;
      width: 0.5px;
      height: 80%;
      background-color: #a0a8ae;
    }
  }
}
/deep/.el-card {
  border: none;
}
</style>
<style lang="sass" scoped>
$color_icon: #A0A8AE
.status-span
  padding: 4px
  border-radius: 2px
.basic-container--block
  height: calc(100% - 92px)
  min-height: calc(100% - 92px)
.title
  color: $primaryColor
  cursor: pointer
.operations
  align-items: center
  display: flex
  justify-content: space-between
  &__column--item
    height: 25px
  &__column--visible
    height: 200px
    overflow: scroll
  &__btns
    align-items: center
    display: flex
    height: 24px
    justify-content: flex-start
  &__btns--item
    margin: 0
    margin-right: 4px
    padding: 0
    height: 24px
    width: 24px
    line-height: 24px
    &:last-child
      margin: 0
    // margin-bottom: 8px
    // margin-right: 8px
  .iconfont
    color: $color_icon
    font-weight: bold
    font-size: 16px

.Menu
  // 添加一个分隔号 "｜"
  .table__handler
    display: flex
    justify-content: flex-end
    > .el-button--text
      text-align: center
      padding: 0 8px
      margin-left: 0px
      position: relative
      &:not(:last-child)::after
        background-color: #e3e7e9
        content: ''
        height: 10px
        position: absolute
        right: 0
        top: 50%
        transform: translateY(-50%)
        width: 1px
</style>
