<template>
  <div class="fill">
    <page-header title="试卷管理">
      <el-dropdown
        slot="rightMenu"
        v-p="ADD_TESTPAPER"
        @command="handleCommand"
      >
        <el-button
          type="primary"
          size="medium"
        >
          创建试卷<i class="el-icon-arrow-down el-icon--right"></i>
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
                      :disabled="item.prop === 'name'"
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
        <template
          slot="multiSelectMenu"
          slot-scope="{ selection }"
        >
          <el-button
            v-p="DELETE_TESTPAPER"
            type="text"
            size="medium"
            icon="el-icon-delete"
            @click="deleteSelected(selection)"
          >
            批量删除
          </el-button>
        </template>
        <template #name="{row}">
          <el-link
            v-if="$p(PREVIEW_TESTPAPER)"
            type="primary"
            style="line-height: 22px"
            @click="handleDetails(row)"
          >
            {{ row.name }}
          </el-link>
          <div
            v-else
            style="line-height: 22px"
          >
            {{ row.name }}
          </div>
        </template>
        <template #categoryName="{row}">
          {{ row.categoryName ? row.categoryName : '未分类' }}
        </template>
        <template #expiredTime="{row}">
          {{ row.expiredTime ? row.expiredTime : '--' }}
        </template>
        <template #handler="{row}">
          <div class="menuClass">
            <el-button
              v-p="EDIT_TESTPAPER"
              type="text"
              @click="handleLookUp(row)"
            >
              编辑
            </el-button>
            <el-button
              v-p="DELETE_TESTPAPER"
              type="text"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
            <el-button
              v-p="COPY_TESTPAPER"
              type="text"
              @click="handleCope(row)"
            >
              复制
            </el-button>
          </div>
        </template>
      </common-table>
    </basic-container>
    <div>
      <tipDialog
        v-if="visible"
        :visible.sync="visible"
        :table-data.sync="selectData"
      >
      </tipDialog>
    </div>
  </div>
</template>

<script>
import { getTestPaperList, deleteTestPaper, getCreatUsers } from '@/api/examManagement/achievement'
import SearchPopover from '@/components/searchPopOver/index'
import { getcategoryTree } from '@/api/examManage/category'
import tipDialog from './components/tipDialog'
const TABLE_COLUMNS = [
  {
    label: '试卷名称',
    prop: 'name',
    slot: true,
    // fixed: true,
    minWidth: 150
  },
  {
    label: '状态',
    prop: 'status',
    width: 90,
    formatter: (row) => {
      return (
        {
          normal: '正常',
          expired: '已过期'
        }[row.status] || ''
      )
    }
  },
  {
    label: '试卷分类',
    prop: 'categoryName',
    slot: true,
    minWidth: 120
  },
  {
    label: '关联考试数',
    prop: 'examNum',
    slot: true,
    minWidth: 120
  },
  {
    label: '创建人',
    prop: 'creatorName',
    minWidth: 120
  },
  {
    label: '过期时间',
    slot: true,
    prop: 'expiredTime',
    minWidth: 170
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
    minWidth: 150,
    fixed: false
  }
}
import {
  COPY_TESTPAPER,
  ADD_TESTPAPER,
  DELETE_TESTPAPER,
  EDIT_TESTPAPER,
  PREVIEW_TESTPAPER
} from '@/const/privileges'
import { mapGetters } from 'vuex'
export default {
  name: 'TestPaper',
  components: { SearchPopover, tipDialog },
  filters: {
    // 过滤不可见的列
    columnsFilter: (visibleColProps) =>
      _.filter(TABLE_COLUMNS, ({ prop }) => _.includes(visibleColProps, prop))
  },
  data() {
    return {
      selectData: [],
      visible: false,
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: true,
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
            field: 'search',
            label: '',
            data: '',
            options: [],
            config: { placeholder: '试卷名称', 'suffix-icon': 'el-icon-search' }
          }
        ],
        popoverOptions: [
          {
            type: 'treeSelect',
            // data多选是数组单选是字符串
            data: '',
            label: '试卷分类',
            field: 'categoryId',
            config: {
              multiple: true,
              selectParams: {
                placeholder: '试卷分类'
              },
              treeParams: {
                data: [],
                'check-strictly': true,
                'default-expand-all': false,
                'expand-on-click-node': false,
                clickParent: true,
                filterable: false,
                props: {
                  children: 'children',
                  label: 'name',
                  disabled: 'disabled',
                  value: 'id'
                }
              }
            }
          },
          {
            type: 'select',
            field: 'status',
            label: '状态',
            data: '',
            options: [
              { value: '', label: '全部' },
              { value: 'normal', label: '正常' },
              { value: 'expired', label: '已过期' }
            ]
          },
          {
            type: 'select',
            field: 'creatorId',
            label: '创建人',
            config: { optionLabel: 'name', optionValue: 'userId' },
            data: '',
            options: []
          },
          {
            type: 'dataPicker',
            label: '过期时间',
            data: '',
            field: 'endTime',
            placeholder: '过期时间',
            config: {
              type: 'datetime',
              'value-format': 'yyyy-MM-dd HH:mm:ss'
            }
          }
        ]
      },
      data: [],
      createOrgDailog: false,
      searchParams: {}
    }
  },
  computed: {
    COPY_TESTPAPER: () => COPY_TESTPAPER,
    ADD_TESTPAPER: () => ADD_TESTPAPER,
    DELETE_TESTPAPER: () => DELETE_TESTPAPER,
    EDIT_TESTPAPER: () => EDIT_TESTPAPER,
    PREVIEW_TESTPAPER: () => PREVIEW_TESTPAPER,
    ...mapGetters(['privileges'])
  },
  watch: {
    // 鉴权注释：当前用户无所有的操作权限，操作列表关闭
    privileges: {
      handler() {
        this.tableConfig.showHandler = this.$p([EDIT_TESTPAPER, DELETE_TESTPAPER, COPY_TESTPAPER])
      },
      deep: true
    }
  },
  activated() {
    this.getCategory()
    this.getCreatUsers()
    this.loadTableData()
  },
  methods: {
    /**
     * @author guanfenda
     * @desc 跳转试卷详情
     *
     * */
    async handleDetails(row) {
      let query = {
        paperId: row.id,
        paperType: row.type,
        isManaged: true // 从此处进去预览不显示删除
      }
      this.$router.push({
        path: '/examManagement/examSchedule/preview',
        query
      })
    },
    // 批量删除
    deleteSelected(selection) {
      let selectData = selection.filter((it) => it.examNum > 0)
      if (selectData.length > 0) {
        this.$confirm('您选中试卷有正在关联的考试，请调整后再进行删除！', '提醒', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        return
      }
      // 批量删除
      let params = []
      selection.forEach((item) => {
        params.push(item.id)
      })
      this.$confirm('此操作将删选中, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$refs.table.clearSelection()
          deleteTestPaper({ id: params.join(',') }).then(() => {
            this.loadTableData()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    /**
     * @author guanfenda
     * @获取试卷分类
     *
     * */
    getCategory() {
      let params = {
        type: '1'
      }
      getcategoryTree(params).then((res) => {
        this.searchConfig.popoverOptions[0].config.treeParams.data = res
        // this.searchConfig.popoverOptions[0].config.treeParams.data = [
        //   { id: '0', name: '未分类' },
        //   ...res
        // ]
      })
    },
    /**
     * @author guanfenda
     * @desc 获取创建人
     * */
    getCreatUsers() {
      getCreatUsers().then((res) => {
        this.searchConfig.popoverOptions.find((it) => it.field == 'creatorId').options = res
      })
    },
    /**
     * @author guanfenda
     * @desc 跳转到创建页面
     * */
    handleCommand(data) {
      this.$router.push({
        path: '/examManagement/testPaper/randomTestPaper',
        query: { tagName: `创建${data === 'random' ? '随机' : '手工'}试卷`, paperType: data }
      })
    },
    /**
     * @author guanfenda
     * @desc 编辑试卷
     * @params row 试卷数据
     * */
    handleLookUp(row) {
      this.$router.push({
        path: '/examManagement/testPaper/randomTestPaper',
        query: {
          id: row.id,
          tagName: `编辑${row.type === 'random' ? '随机' : '手工'}试卷`,
          paperType: row.type
        }
      })
    },
    /**
     * @author guanfenda
     * @desc  复制试卷
     * @params row 试卷数据
     * */
    handleCope(row) {
      this.$router.push({
        path: '/examManagement/testPaper/randomTestPaper',
        query: {
          id: row.id,
          copy: 'copy',
          paperType: row.type,
          tagName: `复制${row.type === 'random' ? '随机' : '手工'}试卷`
        }
      })
    },
    /**
     * @author guanfenda
     * @desc 删除试卷
     * @params row 试卷数据
     * */
    handleDelete(row) {
      this.selectData = []
      this.selectData.push(row)
      if (row.examNum > 0) {
        this.visible = true
        return
      }
      this.$confirm('您确定要删除选中的试卷吗？', '提醒', {
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
    /**
     * @author guanfenda
     * @desc 加载第几页方法
     * @params param 页数
     * */
    handleCurrentPageChange(param) {
      this.page.currentPage = param
      this.loadTableData()
    },
    /**
     * @author guanfenda
     * @desc 加载数据一次多少条
     * @params 加载一次的数量
     * */
    handlePageSizeChange(param) {
      this.page.pageSize = param
      this.loadTableData()
    },
    // 加载函数
    /**
     * @author guanfenda
     * @desc 加载table数据
     *
     * */
    async loadTableData() {
      if (this.tableLoading) {
        //防抖
        return
      }
      try {
        const params = this.searchParams
        this.tableLoading = true
        getTestPaperList(_.assign(params, this.page, { pageNo: this.page.currentPage })).then(
          (res) => {
            this.tableData = res.data
            this.page.total = res.totalNum
            this.tableLoading = false
          }
        )
      } catch (error) {
        this.$message.error(error.message)
      } finally {
        this.tableLoading = false
      }
    },
    // 搜索
    /**
     * @author guanfenda
     *@desc 搜索
     * */
    handleSearch(params) {
      this.searchParams = params
      this.page.currentPage = 1
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
    .refresh-container {
      cursor: pointer;
    }
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
/deep/.el-table__fixed::before {
  position: relative;
}
</style>
