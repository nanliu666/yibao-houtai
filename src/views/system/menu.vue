<template>
  <div class="Menu fill">
    <page-header title="菜单管理" />
    <basic-container block>
      <el-menu
        :default-active="activeIndex"
        class="el-menu"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item index="0">
          Web端菜单
        </el-menu-item>
        <el-menu-item index="1">
          Mobile菜单
        </el-menu-item>
        <el-menu-item index="2">
          后台系统菜单
        </el-menu-item>
      </el-menu>
      <common-table
        ref="table"
        :columns="columnsVisible | columnsFilter"
        :config="tableConfig"
        :data="tableData"
        :loading="tableLoading"
        :page-config="tablePageConfig"
      >
        <template #topMenu>
          <div class="operations">
            <div class="operations__left">
              <el-select
                v-model="statusValue"
                style="width: 100px; margin-right: 20px"
                placeholder="请选择"
                @change="statusChange"
              >
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              <seach-popover
                :require-options="searchPopoverConfig.requireOptions"
                @submit="handleSearch"
              />
            </div>
            <div class="operations__btns">
              <div class="operations-right">
                <div
                  class="refresh-container"
                  @click="refreshTableData"
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
                    style="cursor: pointer;"
                    class="el-icon-setting"
                  />
                  <!-- 设置表格列可见性 -->
                  <div class="operations__column--visible">
                    <el-checkbox-group v-model="columnsVisible">
                      <el-checkbox
                        v-for="item of tableColumns"
                        :key="item.prop"
                        :disabled="item.prop === 'name'"
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
          </div>
        </template>

        <template #icon="{row}">
          <i :class="_.get(row, 'icon', '')" />
        </template>
        <template #isEnabled="{row}">
          {{ row.isEnabled === 1 ? '已启用' : '已停用' }}
        </template>
        <!-- 系统管理,菜单管理停用不显示 -->
        <template #handler="{row}">
          <div class="table__handler">
            <el-button
              v-if="row.isEnabled === 1"
              v-p="STOP_MENU"
              size="medium"
              type="text"
              :disabled="
                row.menuId === '1329663243401719810' || row.menuId === '1329665694339067905'
              "
              @click.stop="() => handleMenuEnable(row)"
            >
              停用
            </el-button>
            <el-button
              v-else
              v-p="STOP_MENU"
              size="medium"
              type="text"
              @click.stop="() => handleMenuEnable(row)"
            >
              启用
            </el-button>
          </div>
        </template>
      </common-table>
    </basic-container>
  </div>
</template>

<script>
import { getMenuInfo, putMenuInfo } from '@/api/system/menu'
const CLIENT_TYPE = [
  {
    type: 'OAMobile',
    text: 'Web端菜单'
  },
  {
    type: 'Mobile',
    text: 'Mobile菜单'
  },
  {
    type: 'Admin',
    text: '后台系统菜单'
  }
]
// 表格属性
const TABLE_COLUMNS = [
  {
    label: '菜单名称',
    minWidth: 150,
    prop: 'name'
  },
  {
    label: '菜单图标',
    prop: 'icon',
    slot: true,
    minWidth: 150
  },
  {
    // 格式化菜单类型
    formatter: (row, column, text = '') => {
      switch (text) {
        case 'Dir':
          text = '目录'
          break
        case 'Menu':
          text = '菜单'
          break
        case 'Button':
          text = '按钮'
          break
        default:
      }
      return text
    },
    label: '菜单类型',
    prop: 'menuType',
    minWidth: 150
  },
  {
    label: '状态',
    prop: 'isEnabled',
    slot: true,
    minWidth: 150
  }
]
const TABLE_CONFIG = {
  handlerColumn: {
    width: 60
  },
  enableMultiSelect: false,
  enablePagination: false,
  showHandler: true,
  showIndexColumn: false,
  // 树形结构懒加载
  lazy: true,
  load: async (row, treeNode, resolve) => {
    try {
      let items = await getMenuInfo(row.menuId)
      resolve(_.map(items, (i) => ({ ...i, hasChildren: i.menuType !== 'Button' })))
    } catch (err) {
      resolve([])
    }
  },
  rowKey: 'menuId',
  treeProps: { hasChildren: 'hasChildren', children: 'children' }
}
const TABLE_PAGE_CONFIG = {}

// 搜索配置
const SEARCH_POPOVER_REQUIRE_OPTIONS = [
  {
    config: { placeholder: '请输入菜单名称' },
    data: '',
    field: 'name',
    label: '',
    type: 'input'
  }
]

const SEARCH_POPOVER_CONFIG = {
  requireOptions: SEARCH_POPOVER_REQUIRE_OPTIONS
}
import { STOP_MENU } from '@/const/privileges'
import { mapGetters } from 'vuex'
export default {
  name: 'Menu',
  components: {
    SeachPopover: () => import('@/components/searchPopOver')
  },
  filters: {
    // 过滤不可见的列
    columnsFilter: (visibleColProps) =>
      _.filter(TABLE_COLUMNS, ({ prop }) => _.includes(visibleColProps, prop))
  },
  data() {
    return {
      copyTableData: [],
      clientTypeList: CLIENT_TYPE,
      statusOptions: [
        {
          value: '',
          label: '全部'
        },
        {
          value: 1,
          label: '启用'
        },
        {
          value: 0,
          label: '禁用'
        }
      ],
      statusValue: '',
      activeIndex: '2',
      // 默认选中所有列
      columnsVisible: _.map(TABLE_COLUMNS, ({ prop }) => prop),
      menuEditVisible: false,
      parentId: '0',
      page: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      searchPopoverConfig: SEARCH_POPOVER_CONFIG,
      query: {},
      tableColumns: TABLE_COLUMNS,
      tableConfig: TABLE_CONFIG,
      tableData: [],
      tableLoading: false,
      tablePageConfig: TABLE_PAGE_CONFIG
    }
  },
  computed: {
    STOP_MENU: () => STOP_MENU,
    ...mapGetters(['privileges'])
  },
  watch: {
    // 鉴权注释：当前用户无所有的操作权限，操作列表关闭
    privileges: {
      handler() {
        this.tableConfig.showHandler = this.$p([STOP_MENU])
      },
      deep: true
    }
  },
  created() {
    this.refreshTableData()
  },
  methods: {
    statusChange() {
      let searchParams = { isEnabled: this.statusValue }
      this.loadTableData(searchParams)
    },
    handleSelect(key) {
      this.activeIndex = key
      this.statusValue = ''
      let searchParams = { clientId: this.clientTypeList[Number(key)].type }
      this.handleSearch(searchParams)
    },
    // 启用停用按钮
    handleMenuEnable(row) {
      let type = row.menuType === 'Button' ? '按钮' : '菜单'
      const TEXT =
        row.isEnabled === 1
          ? `您确定要停用该${type}吗停用后，该${type}将不能出现在系统中`
          : `您确定要启用该${type}吗`
      this.$confirm(TEXT, {
        type: 'warning'
      }).then(() => {
        putMenuInfo({ isEnabled: row.isEnabled === 1 ? 0 : 1, menuId: row.menuId }).then(() => {
          this.refreshTableData()
          if (this.activeIndex === '2') {
            this.$nextTick(() => {
              this.$store.dispatch('GetUserPrivilege', this.$store.getters.userId).then((menu) => {
                this.$router.$avueRouter.formatRoutes(menu, true)
              })
            })
          }
        })
      })
    },
    handleSearch(searchParams) {
      this.loadTableData(_.pickBy(searchParams))
    },
    // 刷新列表数据
    refreshTableData() {
      //  因为只加载了最外层的数据，children仍然是旧的，清空数据
      this.tableData = []
      this.loadTableData({ parentId: '0' })
    },

    // 加载表格数据
    // TODO: 分页还未实现
    async loadTableData(param = {}, page) {
      if (this.tableLoading) {
        return
      }
      this.tableLoading = true
      try {
        const query = _.assign(null, _.omit(param, 'parentId'), page)
        const tableData = await getMenuInfo(param.parentId || '0', query)
        this.tableData = _.map(tableData, (t) => ({
          children: [],
          hasChildren: true,
          ...t
        }))
        this.copyTableData = _.clone(this.tableData)
        // 更新分页器数据
        this.page.total = _.size(tableData)
      } catch (error) {
        window.console.log(error)
      } finally {
        this.tableLoading = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.basic-container--block {
  .el-menu {
    margin-bottom: 20px;
    margin-top: -10px;
  }
  /deep/ .el-menu--horizontal {
    border-bottom: 1px solid #cccccc !important;
  }
  .operations {
    i {
      margin-left: 12px;
      font-size: 18px;
      color: #a0a8ae;
      cursor: pointer;
    }
    &-right {
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
  }
}
</style>
<style lang="sass" scoped>
$color_icon: #A0A8AE

.basic-container--block
  height: calc(100% - 92px)
  min-height: calc(100% - 92px)
.operations
  align-items: center
  display: flex
  justify-content: space-between
  &__left
    display: flex
    align-items: center
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
    i
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
