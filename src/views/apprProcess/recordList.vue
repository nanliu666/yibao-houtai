<template>
  <div class="Recordlist fill">
    <page-header title="审批记录" />
    <basic-container block>
      <common-table
        id="demo"
        ref="table"
        :columns="tableColumns | columnsFilter(columnsVisible)"
        :config="tableConfig"
        :data="tableData"
        :loading="tableLoading"
        :page="page"
        @current-page-change="handleCurrentPageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #topMenu>
          <div class="operations">
            <seach-popover
              :popover-options="searchConfigLocal.popoverOptions"
              :require-options="searchConfigLocal.requireOptions"
              @submit="handleSearch"
            />
            <div class="operations__right">
              <el-tooltip
                class="operations__btns--tooltip"
                content="刷新"
                effect="dark"
                placement="top"
              >
                <el-button
                  class="operations__btns--item"
                  size="mini"
                  type="text"
                  @click="refresh"
                >
                  <i class="iconfont iconicon_refresh" />
                </el-button>
              </el-tooltip>
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
                      :disabled="item.prop === 'apprNo'"
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
        <template
          slot="multiSelectMenu"
          slot-scope="{ selection }"
        >
          <el-button
            type="text"
            size="medium"
            icon="el-icon-delete"
            @click="exportFn(selection)"
          >
            批量导出
          </el-button>
        </template>
        <template #status="{row}">
          <span
            class="status-span"
            :style="{
              color: statusToText(row.status).color,
              backgroundColor: statusToText(row.status).backgroundColor
            }"
            v-text="statusToText(row.status).text"
          />
        </template>

        <template #apprNo="{row}">
          <span
            class="table__link"
            @click="jumpToDetail(row)"
          >{{ row.apprNo }}</span>
        </template>

        <template #handler="{row}">
          <el-button
            type="text"
            @click="jumpToDetail(row)"
          >
            查看
          </el-button>
        </template>
      </common-table>
    </basic-container>
  </div>
</template>

<script>
import { STATUS_TO_TEXT, STATUS_DICTS } from '@/const/approve'
import { categoryOptions, baseFormKey } from '@/const/approve'
import { getUserWorkList } from '@/api/org/org'
import { getRecordList, exportAppr } from '@/api/apprProcess/apprProcess'
import { mapGetters } from 'vuex'
import { exportToExcel } from '@/util/util'
const TABLE_COLUMNS = [
  {
    label: '审批编号',
    prop: 'apprNo',
    slot: true,
    minWidth: 150
  },
  {
    label: '审批类型',
    prop: 'formKey',
    formatter: (row) => baseFormKey[row.formKey] || '',
    minWidth: 120
  },
  {
    label: '申请人',
    prop: 'userName',
    minWidth: 120
  },
  {
    label: '申请时间',
    prop: 'applyTime',
    minWidth: 120
  },
  {
    label: '完成时间',
    minWidth: 100,
    prop: 'completeTime',
    formatter: (record) => record.completeTime || '--'
  },
  {
    label: '当前状态',
    prop: 'status',
    slot: true
  },
  {
    label: '当前审批人',
    minWidth: 100,
    prop: 'approveUser',
    formatter(record) {
      return record.approveUser.map((item) => item.userName).join('+') || '--'
    }
  }
]

const TABLE_CONFIG = {
  rowKey: 'apprNo',
  showHandler: true,
  enableMultiSelect: true,
  showIndexColumn: false,
  enablePagination: true,
  handlerColumn: {
    minWidth: 50,
    fixed: false
  }
}

const SEARCH_CONFIG = {
  requireOptions: [
    {
      type: 'input',
      field: 'search',
      label: '',
      data: '',
      config: {
        'suffix-icon': 'el-icon-search',
        placeholder: '审批编号、审批标题'
      }
    }
  ],
  popoverOptions: [
    {
      type: 'select',
      data: '',
      field: 'status',
      label: '审批状态',
      arrField: 'positionId',
      config: { optionLabel: 'dictValue', optionValue: 'dictKey' },
      options: []
    },
    {
      type: 'select',
      data: '',
      field: 'categoryId',
      label: '审批类型',
      options: categoryOptions
    },
    {
      data: '',
      field: 'userId',
      label: '申请人',
      type: 'lazySelect',
      optionList: [],
      placeholder: '请选择申请人',
      optionProps: {
        key: 'userId',
        label: 'name',
        value: 'userId'
      },
      load: getUserWorkList,
      searchable: true
    }
  ]
}

export default {
  name: 'Recordlist',
  components: {
    SeachPopover: () => import(/* webpackChunkName: "views" */ '@/components/searchPopOver')
  },
  filters: {
    // 过滤不可见的列
    columnsFilter: (columns, visibleColProps) =>
      _.filter(columns, ({ prop }) => _.includes(visibleColProps, prop))
  },
  data() {
    return {
      columnsVisible: _.map(TABLE_COLUMNS, ({ prop }) => prop),
      menuEditVisible: false,
      parentId: '0',
      page: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      searchConfigLocal: SEARCH_CONFIG,
      searchParams: null,
      tableColumns: TABLE_COLUMNS,
      tableConfig: TABLE_CONFIG,
      tableData: [],
      tableLoading: false,

      dictionary: {
        status: STATUS_DICTS
      }
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  activated() {
    this.refresh()
  },
  mounted() {
    // searchConfig 加载数据
    let fieldStatus = _.find(this.searchConfigLocal.popoverOptions, { field: 'status' })

    if (fieldStatus) {
      fieldStatus.options = _.concat(
        [
          {
            dictKey: '',
            dictValue: '全部'
          }
        ],
        STATUS_DICTS
      )
    }
  },

  methods: {
    async exportFn(selection) {
      // 批量下载
      if (selection && selection.length > 0) {
        let apprNoS = selection.map((item) => {
          return item.apprNo
        })

        let sendData = {
          fileType: 'excel',
          apprNo: apprNoS.join(',')
        }
        exportAppr(sendData).then((res) => {
          exportToExcel(res)
        })
      }
    },
    statusToText(status) {
      return STATUS_TO_TEXT[status]
    },
    // 处理跳转
    jumpToDetail(row) {
      this.$router.push({
        path: '/apprProcess/apprDetail',
        query: { formId: row.formId, formKey: row.formKey, apprNo: row.apprNo }
      })
    },

    handleCurrentPageChange(page) {
      this.page.currentPage = page
      this.loadTableData()
    },
    handlePageSizeChange(pageSize) {
      this.page.size = pageSize
      this.loadTableData()
    },
    handleSearch(searchParams) {
      this.searchParams = _.pickBy(searchParams)
      this.page.currentPage = 1
      this.loadTableData()
    },

    refresh() {
      this.loadTableData()
    },

    // 翻译字典
    translator({ value, dictKey, $config: config }) {
      if (!(dictKey = dictKey || _.get(config, 'dictKey'))) {
        return value
      }

      const dicts = this.dictionary[dictKey]
      // 如果字典为 undefined 时候加载字典
      if (!dicts) this.loadDictionary(dictKey)
      let result = value
      _.each(dicts, (item) => {
        if (item.dictKey === _.trim(value)) {
          result = item.dictValue
          return false
        }
      })
      return result
    },
    async loadDictionary(dictKey) {
      const dict = await this.$store.dispatch('CommonDict', dictKey)
      this.$set(this.dictionary, dictKey, dict)
      return dict
    },
    async loadTableData() {
      if (this.tableLoading) {
        return
      }
      try {
        const params = this.searchParams
        this.tableLoading = true
        const page = {
          pageNo: this.page.currentPage,
          pageSize: this.page.size
        }
        const { data, totalNum } = await getRecordList(_.assign(null, page, params))
        this.tableData = data
        this.page.total = totalNum
        // eslint-disable-next-line no-useless-catch
      } catch (error) {
        throw error
      } finally {
        this.tableLoading = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.basic-container--block {
  height: 0;
  min-height: calc(100% - 92px);
}
.operations {
  align-items: center;
  display: flex;
  justify-content: space-between;
  &__right {
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
}
</style>
