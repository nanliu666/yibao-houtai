<template>
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
    <template #title="{ row }">
      <span
        class="table__link"
        @click="() => handleItemLinkClick(row)"
      >
        {{ row.title }}
      </span>
    </template>
    <template #publishColumn="{ row }">
      {{ format(row) }}
    </template>
    <template #handler="{ row }">
      <div class="table__handler">
        <el-button
          v-if="status === 'Published'"
          v-p="TOP_NEWS"
          type="text"
          size="medium"
          @click="() => handleTopItemBtnClick(row)"
        >
          {{ row.top ? '已置顶' : '置顶' }}
        </el-button>

        <!-- 在新闻管理页面不支持编辑,在已发布的新闻页面编辑(参考低保真)  v-if="status === STATUS['Draft']" -->

        <el-button
          v-p="EDIT_NEWS"
          type="text"
          size="medium"
          @click="() => handleEditItemBtnClick(row)"
        >
          编辑
        </el-button>

        <el-button
          v-p="DELETE_NEWS"
          type="text"
          size="medium"
          @click="() => handleRemoveItemBtnClick(row)"
        >
          删除
        </el-button>
      </div>
    </template>
  </common-table>
</template>

<script>
import { getV1News, delV1News, postNewsTop, getPublishUser } from '@/api/newsCenter/newCenter'
import { mapGetters } from 'vuex'
// 表格属性
const ENUMS_STATUS = {
  Published: 'Published',
  Draft: 'Draft'
}
const TABLE_CONFIG = {
  enablePagination: true,
  showHandler: true,
  handlerColumn: {
    width: 150,
    fixed: false
  },
  enableMultiSelect: false,
  rowKey: 'id',
  treeProps: { hasChildren: 'hasChildren', children: 'children' }
}

const TABLE_COLUMNS = [
  {
    label: '编号',
    prop: 'noticeNumber',
    width: 180
  },
  {
    label: '新闻标题',
    minWidth: 150,
    slot: true,
    prop: 'title'
  },
  {
    label: '发布栏目',
    prop: 'publishColumn',
    slot: true,
    minWidth: 100
  },
  {
    label: '发布范围',
    prop: 'publishScope',
    minWidth: 100
  },
  {
    label: '发布人',
    prop: 'publishUserName',
    maxWidth: 100
  },
  {
    label: '时间',
    prop: 'publishTime',
    minWidth: 100
  }
]
const TABLE_PAGE_CONFIG = {}

const SEARCH_POPOVER_POPOVER_OPTIONS = [
  {
    data: '',
    field: 'publishUserId',
    label: '发布人',
    type: 'lazySelect',
    optionList: [],
    placeholder: '请选择发布人',
    optionProps: {
      formatter: (item) => `${item.name}(${item.workNo})`,
      key: 'userId',
      value: 'userId'
    },
    load: (params) => {
      return getPublishUser(params)
    },
    config: { optionLabel: 'name', optionValue: 'id' }
  },
  {
    data: '',
    label: '发布日期',
    type: 'dataPicker',
    field: 'beginPublishTime,endPublishTime',
    config: { type: 'daterange', 'range-separator': '至' }
  }
]
const SEARCH_POPOVER_REQUIRE_OPTIONS = [
  {
    config: { placeholder: '新闻标题', 'suffix-icon': 'el-icon-search' },
    data: '',
    field: 'title',
    label: '',
    type: 'input'
  }
]
const SEARCH_CONFIG = {
  popoverOptions: SEARCH_POPOVER_POPOVER_OPTIONS,
  requireOptions: SEARCH_POPOVER_REQUIRE_OPTIONS
}
import { DELETE_NEWS, EDIT_NEWS, TOP_NEWS } from '@/const/privileges'
export default {
  name: 'NewTable',
  filters: {
    // 过滤不可见的列
    columnsFilter: (visibleColProps) =>
      _.filter(TABLE_COLUMNS, ({ prop }) => _.includes(visibleColProps, prop))
  },
  props: {
    typeList: {
      type: Array,
      default: () => {
        return []
      }
    },
    status: {
      type: String,
      default: ''
    },
    number: {
      type: Number,
      default: 0
    },
    search: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      STATUS: ENUMS_STATUS,
      // 默认选中所有列
      columnsVisible: _.map(TABLE_COLUMNS, ({ prop }) => prop),
      page: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      searchParams: {},
      sidebarLoading: false,
      searchConfig: SEARCH_CONFIG,
      tableColumns: TABLE_COLUMNS,
      tableData: [],
      tableLoading: false,
      tablePageConfig: TABLE_PAGE_CONFIG
    }
  },
  computed: {
    tableConfig: () => TABLE_CONFIG,
    DELETE_NEWS: () => DELETE_NEWS,
    EDIT_NEWS: () => EDIT_NEWS,
    TOP_NEWS: () => TOP_NEWS,
    ...mapGetters(['userId', 'privileges'])
  },
  watch: {
    // 鉴权注释：当前用户无所有的操作权限，操作列表关闭
    privileges: {
      handler() {
        this.tableConfig.showHandler = this.$p([DELETE_NEWS, EDIT_NEWS, TOP_NEWS])
      },
      deep: true
    },
    search: {
      handler: function(data) {
        // let name = Number(data.name)
        // if (name) {
        //   data.noticeNumber = data.name
        // } else {
        //   data.title = data.name
        // }
        this.searchParams = _.cloneDeep(data)
      },
      deep: true
    }
  },
  mounted() {
    this.loadTableData()
  },
  methods: {
    format(row) {
      let name = ''
      this.typeList.map((it) => {
        it.id === row.publishColumn && (name = it.dictValue)
      })
      return name
    },
    handlePublishBtnClick() {
      this.$router.push({
        path: '/system/newsCenter/newsEdit'
      })
    },
    handlePublishedBtnClick() {
      this.$router.push({
        path: '/system/newsCenter/newsPublished'
      })
    },
    handleDraftBtnClick() {
      this.$router.push({
        path: '/system/newsCenter/newsDrafts'
      })
    },
    handleTopItemBtnClick({ id, top, title }) {
      const ACTION_NAME = top ? '取消置顶' : '置顶'
      this.$confirm(`确认${ACTION_NAME}标题为《${title}》的新闻吗？`, {
        title: `是否${ACTION_NAME}新闻`,
        type: 'info'
      }).then(async () => {
        try {
          this.tableLoading = true
          await postNewsTop({ id, isTop: top ? 0 : 1 })
          this.$message.success(ACTION_NAME + '成功')
        } catch (error) {
          this.$message.error(error.message)
        } finally {
          this.tableLoading = false
          this.refresh()
        }
      })
    },

    handleEditItemBtnClick({ id, outsideLink }) {
      var type = outsideLink && outsideLink.length > 0 ? 'link' : 'inside'
      this.$router.push({
        path: '/system/newsCenter/newsEdit',
        query: { id, tagName: '编辑公告', type: type }
      })
    },

    handleRemoveItemBtnClick({ id, title }) {
      this.$confirm(`确认删除标题为《${title}》的新闻吗？`, {
        title: '是否删除新闻',
        type: 'warning'
      }).then(async () => {
        try {
          this.tableLoading = true
          await delV1News({ id })
          this.$message.success('删除成功')
        } catch (error) {
          this.$message.error(error.message)
        } finally {
          this.tableLoading = false
          this.refresh()
        }
      })
    },
    // handleRemoveItems(selection) {
    //   // TODO: 暂时不支持批量删除
    // },
    handleCurrentPageChange(param) {
      this.page.currentPage = param
      this.loadTableData()
    },
    handlePageSizeChange(param) {
      this.page.pageSize = param
      this.loadTableData()
    },
    handleSearch() {
      // 查询的时候重置页码为1
      this.page.currentPage = 1
      // FIXED: 修复查询时候失去categoryId
      // this.searchParams = _.pickBy({ ...searchParams })
      this.loadTableData()
    },
    // 跳转新闻详情
    handleItemLinkClick({ id, outsideLink }) {
      if (outsideLink && outsideLink.length > 0) {
        window.open(outsideLink)
        return
      }
      this.$router.push({
        path: '/system/newsCenter/newsDetail',
        query: {
          id,
          userId: this.userId
        }
      })
      // this.$router.push({
      //   path: '/noticeCenter/noticeDetail',
      //   query: { id }
      // })
    },
    // 刷新列表数据
    refresh() {
      this.loadTableData()
    },

    // 加载表格数据
    async loadTableData(params) {
      if (this.tableLoading) {
        return
      }
      try {
        this.tableLoading = true
        const page = {
          pageNo: this.page.currentPage,
          pageSize: this.page.pageSize
        }
        const searchParams = { status: ENUMS_STATUS[this.status], ...this.searchParams }
        const { data, totalNum } = await getV1News(_.assign(null, params, searchParams, page))
        this.tableData = data
        this.page.total = totalNum
        this.$emit('update:number', totalNum)
      } catch (error) {
        this.$message.error(error.message)
      } finally {
        this.tableLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$color_danger: #ff6464;
$color_icon: #757c85;
.table__link {
  color: $primaryColor;
  &:hover {
    cursor: pointer;
    color: $primaryColor;
  }
  .status-span {
    padding: 4px;
  }
}

.operations {
  align-items: center;
  display: flex;
  justify-content: space-between;
  &__column--item {
    height: 25px;
  }

  &__column--visible {
    height: 200px;
  }

  &__btns {
    align-items: center;
    display: flex;
    height: 24px;
    justify-content: flex-start;
  }

  &__btns--item {
    margin: 0;
    margin-right: 4px;
    padding: 0;
    height: 24px;
    width: 24px;
    line-height: 24px;
  }

  &:last-child {
    margin: 0;
  }
}

.iconfont {
  color: $color_icon;
  font-weight: bold;
  font-size: 16px;
}

.container__grid {
  height: 0;
  min-height: calc(100% - 92px) &--aside, &--main {
    height: 100%;
  }

  &--aside {
    width: 250px;
  }

  &--main {
    width: calc(100%);
  }
}

.table__handler {
  i {
    color: $color_icon;
  }

  i.font__color--active {
    color: $primaryColor;
    display: flex;
    justify-content: flex-end;
    > .el-button--text {
      text-align: center;
      padding: 0 8px;
      margin-left: 0px;
      position: relative;

      &:not(:last-child)::after {
        background-color: #e3e7e9;
        content: '';
        height: 10px;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 1px;
      }
    }
  }
}
</style>
