<template>
  <div class="fill">
    <page-header title="试卷管理">
      <el-dropdown
        slot="rightMenu"
        @command="handleCommand"
      >
        <el-button
          type="primary"
          size="medium"
        >
          新建试卷<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="random">
            随机试卷
          </el-dropdown-item>
          <el-dropdown-item command="manual">
            手工试卷
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </page-header>

    <basic-container block>
      <common-table
        id="demo"
        ref="table"
        :columns="columnsVisible | columnsFilter"
        :config="tableConfig"
        :page="page"
        :data="tableData"
        :loading="tableLoading"
        @current-page-change="handleCurrentPageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #topMenu>
          <div class="transitionBox">
            <div class="searchBox">
              <div class="search-box">
                <search-popover
                  ref="searchPopover"
                  :require-options="searchConfig.requireOptions"
                  :popover-options="searchConfig.popoverOptions"
                  @submit="handleSearch"
                />
                <div
                  class="refresh-container"
                  @click="loadTableData"
                >
                  <span class="icon  el-icon-refresh-right" />
                  <span class="refresh-text">刷新</span>
                </div>
                <el-popover
                  placement="bottom"
                  width="40"
                  trigger="click"
                  style="margin-left:10px"
                >
                  <el-checkbox-group
                    v-model="columnsVisible"
                    style="display: flex;flex-direction: column;"
                  >
                    <el-checkbox
                      v-for="item in tableColumns"
                      :key="item.prop"
                      :label="item.prop"
                      :disabled="item.prop === 'examName'"
                      class="originColumn"
                    >
                      {{ item.label }}
                    </el-checkbox>
                  </el-checkbox-group>
                  <i
                    slot="reference"
                    class="el-icon-setting"
                    style="cursor: pointer;"
                  />
                </el-popover>
              </div>
            </div>
          </div>
        </template>
        <template slot="multiSelectMenu">
          <!--          <el-button-->
          <!--            type="text"-->
          <!--            icon="el-icon-delete"-->
          <!--          >-->
          <!--            批量导出-->
          <!--          </el-button>-->
        </template>
        <template #name="{row}">
          <el-link
            type="primary"
            style="line-height: 22px"
          >
            {{ row.name }}
          </el-link>
        </template>
        <template #handler="{row}">
          <div class="menuClass">
            <el-button
              type="text"
              @click="handleLookUp(row)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
            <el-button
              type="text"
              @click="handleCope(row)"
            >
              复制
            </el-button>
          </div>
        </template>
      </common-table>
    </basic-container>
  </div>
</template>

<script>
import { getTestPaperList, deleteTestPaper } from '@/api/examManagement/achievement'
import SearchPopover from '@/components/searchPopOver/index'
const TABLE_COLUMNS = [
  {
    label: '考试名称',
    prop: 'name',
    slot: true,
    fixed: true,
    minWidth: 150
  },
  {
    label: '状态',
    prop: 'status',
    minWidth: 150,
    formatter: (row) => {
      return (
        {
          '1': '正常',
          '2': '禁用'
        }[row.status] || ''
      )
    }
  },
  {
    label: '试卷分类',
    prop: 'categoryId',
    minWidth: 120
  },
  {
    label: '关联考试数',
    prop: 'testNum',
    slot: true,
    minWidth: 120
  },
  {
    label: '创建人',
    prop: 'founder',
    minWidth: 120
  },
  {
    label: '有效时间',
    slot: true,
    prop: 'effectiveTime',
    minWidth: 320
  }
]
const TABLE_CONFIG = {
  rowKey: 'id',
  showHandler: true,
  defaultExpandAll: false,
  showIndexColumn: false,
  enablePagination: false,
  enableMultiSelect: true, // TODO：关闭批量删除
  handlerColumn: {
    minWidth: 150
  }
}
export default {
  name: 'TestPaper',
  components: { SearchPopover },
  filters: {
    // 过滤不可见的列
    columnsFilter: (visibleColProps) =>
      _.filter(TABLE_COLUMNS, ({ prop }) => _.includes(visibleColProps, prop))
  },
  data() {
    return {
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      tableLoading: false,
      tableData: [],
      tableConfig: TABLE_CONFIG,
      tableColumns: TABLE_COLUMNS,
      columnsVisible: _.map(TABLE_COLUMNS, ({ prop }) => prop),
      checkColumn: ['name', 'status', 'creatorName', 'updateTime'],
      searchConfig: {
        requireOptions: [
          {
            type: 'input',
            field: 'examName',
            label: '',
            data: '',
            options: [],
            config: { placeholder: '题干内容', 'suffix-icon': 'el-icon-search' }
          }
        ],
        popoverOptions: [
          {
            type: 'select',
            field: 'paperType',
            label: '试卷分类',
            data: '',
            options: [
              { value: '', label: '全部' },
              { value: 0, label: '启用' },
              { value: 1, label: '停用' }
            ]
          },
          {
            type: 'select',
            field: 'status',
            label: '状态',
            data: '',
            options: [
              { value: '', label: '全部' },
              { value: 0, label: '启用' },
              { value: 1, label: '停用' }
            ]
          },
          {
            type: 'select',
            field: 'paperMaker',
            label: '创建人',
            data: '',
            options: [
              { value: '', label: '全部' },
              { value: 0, label: '启用' },
              { value: 1, label: '停用' }
            ]
          },
          {
            type: 'dataPicker',
            label: '有效时间',
            data: '',
            field: 'beginEntryDate,endEntryDate',
            config: { type: 'daterange', 'range-separator': '至' }
          }
        ]
      },
      data: [],
      createOrgDailog: false,
      searchParams: {}
    }
  },
  activated() {
    this.loadTableData()
  },
  methods: {
    handleCommand(data, id, copy) {
      if (data === 'manual') {
        this.handleManual(id, copy)
      } else {
        this.handleRandom(id, copy)
      }
    },
    handleRandom(id, copy) {
      let query = {}
      id && (query.id = id)
      copy && (query.copy = copy)
      this.$router.push({
        path: '/examManagement/testPaper/randomTestPaper',
        query
      })
    },
    handleManual(id, copy) {
      let query = {}
      id && (query.id = id)
      copy && (query.copy = copy)
      this.$router.push({
        path: '/examManagement/testPaper/handmadeTestPaper',
        query
      })
    },
    handleLookUp(row) {
      this.handleCommand(row.type, row.id)
      this.$store.dispatch('setTestPaper', row)
    },
    handleCope(row) {
      this.handleCommand(row.type, row.id, 'copy')
    },
    handleDelete(row) {
      this.$confirm('您确定要删除该条信息吗？', '提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {
          id: row.id
        }
        deleteTestPaper(params).then(() => {
          this.$message.success('删除成功')
          this.loadTableData()
        })
      })
    },

    handleCurrentPageChange(param) {
      this.page.currentPage = param
      this.loadTableData()
    },
    handlePageSizeChange(param) {
      this.page.pageSize = param
      this.loadTableData()
    },
    // 加载函数
    async loadTableData() {
      if (this.tableLoading) {
        return
      }
      try {
        const params = this.searchParams
        this.tableLoading = true
        getTestPaperList(_.assign(params, this.page)).then((res) => {
          this.tableData = res.data
          this.page.total = res.totalNum
          this.tableLoading = false
        })
      } catch (error) {
        this.$message.error(error.message)
      } finally {
        this.tableLoading = false
      }
    },
    // 搜索
    handleSearch(params) {
      this.searchParams = params
      this.loadTableData()
    }
  }
}
</script>

<style lang="scss" scoped>
.basic-container--block {
  height: calc(100% - 92px);
  min-height: calc(100% - 92px);
}

.originColumn {
  height: 25px;
}

.transitionBox {
  position: relative;
  height: 50px;
}

.searchBox {
  position: absolute;
  width: 100%;

  i {
    color: #a0a8ae;
    font-size: 18px;
  }

  .search-box {
    display: flex;
    align-items: center;

    .search-sort-box {
      position: relative;
      display: flex;
      align-items: center;
      padding: 0 10px;
      cursor: pointer;

      .sort-text {
        color: #a0a8ae;
        margin-left: 6px;
        font-size: 14px;
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

  > div {
    display: flex;

    :first-child {
      flex: 1;
    }

    > button {
      height: 34px;
    }
  }
}

/deep/ .avue-crud__pagination {
  height: 0px;
}

.newOrgDailog {
  .el-select {
    width: 100%;
  }
}

/deep/ .avue-crud__pagination {
  display: none;
}

.refresh-text {
  padding-left: 6px;
  display: inline-block;
  height: 18px;
  color: #a0a8ae;
}
</style>