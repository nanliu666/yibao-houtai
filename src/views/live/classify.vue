<template>
  <div class="fill">
    <page-header title="直播分类">
      <el-button
        slot="rightMenu"
        v-p="ADD_LIVE_CLASSIFY"
        type="primary"
        size="medium"
        @click="$refs.orgEdit.create()"
      >
        创建分类
      </el-button>
    </page-header>

    <basic-container block>
      <common-table
        id="demo"
        ref="table"
        :columns="columnsVisible | columnsFilter"
        :config="tableConfig"
        :data="tableData"
        :loading="tableLoading"
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
                  v-if="false"
                  class="search-sort-box"
                  @click="toSort"
                >
                  <i class="el-icon-sort" />
                  <span class="sort-text">调整排序</span>
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
                      :disabled="item.prop === 'orgName'"
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
        <!-- <template
          slot="multiSelectMenu"
          slot-scope="{ selection }"
        >
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="deleteSelected(selection)"
          >
            批量删除
          </el-button>
        </template> -->
        <template
          #status="{row}"
          v-p="STOP_LIVE_CLASSIFY"
        >
          {{ row.status == '0' ? '已停用' : '已启用' }}
        </template>
        <template #handler="{row}">
          <div class="menuClass">
            <el-button
              v-p="STOP_LIVE_CLASSIFY"
              type="text"
              :disabled="row.disabled"
              @click="handleStatus(row)"
            >
              {{ row.status == '1' ? '停用' : '启用' }}
            </el-button>
            <!-- <el-button
              v-p="AUTH_LIVE_CLASSIFY"
              type="text"
              @click="handleAuth(row)"
            >
              权限配置
            </el-button> -->
            <el-dropdown @command="handleCommand($event, row)">
              <el-button
                type="text"
                style="margin-left: 10px"
              >
                <i class="el-icon-arrow-down el-icon-more" />
              </el-button>
              <el-dropdown-menu
                slot="dropdown"
                v-p="EDIT_LIVE_CLASSIFY"
              >
                <el-dropdown-item command="edit">
                  编辑
                </el-dropdown-item>
                <el-dropdown-item
                  v-p="DELETE_LIVE_CLASSIFY"
                  command="delete"
                >
                  删除
                </el-dropdown-item>
                <el-dropdown-item
                  v-p="ADD_NEW_GROUNP_LIVE_CLASSIFY"
                  command="addChild"
                >
                  创建子分类
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </common-table>
    </basic-container>
    <catalog-edit
      ref="orgEdit"
      :visible="createOrgDailog"
      @refresh="resetList"
      @changevisible="changevisible"
    />
  </div>
</template>

<script>
import {
  ADD_LIVE_CLASSIFY,
  STOP_LIVE_CLASSIFY,
  EDIT_LIVE_CLASSIFY,
  DELETE_LIVE_CLASSIFY,
  ADD_NEW_GROUNP_LIVE_CLASSIFY,
  AUTH_LIVE_CLASSIFY,
  SORT_LIVE_CLASSIFY
} from '@/const/privileges'
import { mapGetters } from 'vuex'
import SearchPopover from '@/components/searchPopOver/index'
import CatalogEdit from './components/catalogEdit'
import { getCategoryTree, deleteCategory, updateCategoryStatus, getCreatorList } from '@/api/live'
const TABLE_COLUMNS = [
  {
    label: '分类名称',
    prop: 'name',
    slot: true,
    minWidth: 150
  },
  {
    label: '所属组织',
    prop: 'orgScopeName',
    minWidth: 150
  },
  {
    label: '状态',
    prop: 'status',
    slot: true,
    minWidth: 120
  },
  {
    label: '创建人',
    prop: 'creatorName',
    minWidth: 120
  },
  {
    label: '更新时间',
    slot: true,
    prop: 'updateTime',
    minWidth: 120
  }
]
const TABLE_CONFIG = {
  rowKey: 'id',
  showHandler: true,
  defaultExpandAll: false,
  showIndexColumn: false,
  enablePagination: true,
  // enableMultiSelect: true, // TODO：树无法做批量选择   //先不做批量删除
  handlerColumn: {
    minWidth: 100,
    fixed: false
  }
}
export default {
  name: 'CatelogManager',
  components: { SearchPopover, CatalogEdit },
  filters: {
    // 过滤不可见的列
    columnsFilter: (visibleColProps) =>
      _.filter(TABLE_COLUMNS, ({ prop }) => _.includes(visibleColProps, prop))
  },
  data() {
    return {
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
            field: 'name',
            label: '',
            data: '',
            options: [],
            config: { placeholder: '请输入分类名称搜索', 'suffix-icon': 'el-icon-search' }
          }
        ],
        popoverOptions: [
          {
            type: 'select',
            field: 'status',
            label: '状态',
            data: '',
            options: [
              { value: '', label: '全部' },
              { value: 1, label: '启用' },
              { value: 0, label: '停用' }
            ]
          },
          {
            placeholder: '请选择',
            type: 'select',
            field: 'id',
            data: '',
            label: '创建人',
            options: [],
            config: { optionLabel: 'name', optionValue: 'id', placeholder: '请选择' }
          }
        ]
      },
      data: [],
      createOrgDailog: false,
      searchParams: {
        parentId: 0,
        type: '0',
        name: ''
      }
    }
  },
  computed: {
    ADD_LIVE_CLASSIFY: () => ADD_LIVE_CLASSIFY,
    STOP_LIVE_CLASSIFY: () => STOP_LIVE_CLASSIFY,
    EDIT_LIVE_CLASSIFY: () => EDIT_LIVE_CLASSIFY,
    DELETE_LIVE_CLASSIFY: () => DELETE_LIVE_CLASSIFY,
    ADD_NEW_GROUNP_LIVE_CLASSIFY: () => ADD_NEW_GROUNP_LIVE_CLASSIFY,
    SORT_LIVE_CLASSIFY: () => SORT_LIVE_CLASSIFY,
    AUTH_LIVE_CLASSIFY: () => AUTH_LIVE_CLASSIFY,
    ...mapGetters(['privileges'])
  },
  watch: {
    // 鉴权注释：当前用户无所有的操作权限，操作列表关闭
    privileges: {
      handler() {
        this.tableConfig.showHandler = this.$p([
          AUTH_LIVE_CLASSIFY,
          STOP_LIVE_CLASSIFY,
          EDIT_LIVE_CLASSIFY,
          DELETE_LIVE_CLASSIFY,
          ADD_NEW_GROUNP_LIVE_CLASSIFY
        ])
      },
      deep: true
    }
  },
  activated() {
    this.getCreatorList()
    this.loadTableData()
  },
  methods: {
    // 查询创建人列表
    getCreatorList() {
      getCreatorList({ source: 'live' }).then((res) => {
        this.searchConfig.popoverOptions[1].options = res
      })
    },
    // 去重
    arrayUnique(arr, name) {
      var hash = {}
      return arr.reduce(function(item, next) {
        hash[next[name]] ? '' : (hash[next[name]] = true && item.push(next))
        return item
      }, [])
    },
    // 树状结构数组扁平化
    flag(arr) {
      let result = []
      for (let item of arr) {
        var res = JSON.parse(JSON.stringify(item))
        delete res['children']
        result.push(res)
        if (item.children instanceof Array && item.children.length > 0) {
          result = result.concat(this.flag(item.children))
        }
      }
      return result
    },
    // 如果父级停用，子级的启用按钮需要置灰处理
    getButtonDisabled(row) {
      let target = {}
      const loop = function(data) {
        _.each(data, (item) => {
          if (row.parentIdStr == item.idStr) {
            target = item
          }
          if (!_.isEmpty(item.children)) {
            loop(item.children)
          }
        })
      }
      loop(this.tableData)
      const isDisabled = !_.isEmpty(target) && target.status == '1' ? true : false
      return isDisabled
    },
    // 权限配置窗口
    handleAuth() {
      this.$message.warning('正在开发中...')
    },
    // 多种操作
    async handleCommand($event, row) {
      const TYPE_COMMAND = {
        delete: this.handleDelete,
        edit: this.handleOrgEdit,
        addChild: this.handleAddChild
      }
      TYPE_COMMAND[$event](row)
    },
    // 具体的删除函数
    deleteFun(id) {
      deleteCategory({ id: id + '' }).then(
        () => {
          this.loadTableData()
          this.$refs.table.clearSelection()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }
        // ,
        // (err) => {
        //   this.$confirm('您选择分类下含有直播，无法删除该分类', '提示', {
        //     confirmButtonText: '我知道了',
        //     type: 'warning',
        //     showCancelButton: false,
        //     center: false
        //   })
        // }
      )
    },
    // 单个删除
    handleDelete(row) {
      let hasChildren = !_.isEmpty(row.children)
      if (hasChildren) {
        this.$message.error('很抱歉，您选中的分类下存在子分类，请先将子分类调整后再删除!')
      } else {
        this.$confirm('您确定要删除选中的分类吗？', '提醒', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteFun(row.idStr || row.id)
        })
      }
    },
    // 批量删除
    deleteSelected(selected) {
      // console.log(selected)

      let someOneHasChilren = _.some(selected, (row) => {
        return !_.isEmpty(row.children)
      })
      if (someOneHasChilren) {
        this.$message.error('很抱歉，您选中的分类下存在子分类，请先将子分类调整后再删除!')
      } else {
        let selectedIds = []
        _.each(selected, (item) => {
          selectedIds.push(item.id)
        })
        this.deleteFun(selectedIds.join(','))
        // console.log(selectedIds);
      }
    },
    // 加载函数
    async loadTableData() {
      if (this.tableLoading) {
        return
      }
      try {
        const params = this.searchParams
        params.source = 'live'
        this.tableLoading = true
        getCategoryTree(params).then((res) => {
          this.tableData = this.setDisableStatus(res)
          this.getTableData(this.tableData)
          this.tableLoading = false
        })
        this.$refs.orgEdit.loadOrgTree()
      } catch (error) {
        this.$message.error(error.message)
      } finally {
        this.tableLoading = false
      }
    },
    setDisableStatus(list = [], parent) {
      list.forEach((item) => {
        if (parent && parent.status == '0') {
          item.disabled = true
        }
        this.setDisableStatus(item.children, item)
      })
      return list
    },
    // 递归改变hasChildren的值
    getTableData(list = []) {
      list.forEach((item) => {
        if (item) {
          item.hasChildren = false
          this.getTableData(item.children)
        }
      })
    },
    changevisible(data) {
      this.createOrgDailog = data
    },
    // 搜索
    handleSearch(params) {
      params.creatorId = params.id
      delete params.id
      this.searchParams = params
      this.loadTableData()
    },
    // 添加子分类
    handleAddChild(row) {
      this.$refs.orgEdit.createChild(row)
    },
    // 编辑分类
    handleOrgEdit(row) {
      this.$refs.orgEdit.edit(row)
    },
    /**
     * 处理停用启用
     */
    handleStatus(row) {
      // 停启用当前分类是否存在子分类
      const hasChildren = !_.isEmpty(row.children)
      const statusText = row.status == '0' ? '启用' : '停用'
      const stopContent = `您确定要停用该分类吗？停用后，该分类${
        hasChildren ? '及其子分类' : ''
      }将暂停使用。`
      // 获取到当前分类以及子分类的id集合
      const params = { id: row.idStr + '', status: row.status == '0' ? '1' : '0' }
      const startContent = `您确定要启用该分类${hasChildren ? '及其子分类' : ''}吗？`
      this.$confirm(`${row.status == '0' ? startContent : stopContent}`, '提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateCategoryStatus(params).then(() => {
          this.loadTableData()
          this.$message({
            type: 'success',
            message: `${statusText}成功!`
          })
          this.$forceUpdate()
        })
      })
    },
    // 递归获取所有的停启用的id集合
    getDeepIds(row) {
      let ids = []
      const deep = function(row) {
        ids.push(row.id)
        if (!_.isEmpty(row.children)) {
          _.each(row.children, (item) => {
            deep(item)
          })
        }
      }
      deep(row)
      return ids
    },
    // 跳转排序
    toSort() {
      this.$router.push({ path: '/live/classifySort', query: { type: 'catalog' } })
    },
    resetList() {
      // this.searchParams = {}
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
</style>
