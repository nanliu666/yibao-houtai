<template>
  <div class="fill">
    <page-header title="操作日志" />
    <basic-container block>
      <common-table
        ref="table"
        :columns="columns"
        :data="data"
        :page="page"
        @current-page-change="currentChange"
        @page-size-change="sizeChange"
      >
        <template slot="topMenu">
          <search-pop-over
            :require-options="requireOptions"
            :popover-options="popoverOptions"
            @submit="submit"
          />
          <el-popover
            placement="bottom"
            width="40"
            trigger="click"
            style="margin-left: 10px"
          >
            <el-checkbox-group
              v-model="checkColumn"
              style="display: flex; flex-direction: column"
              @change="columnChange"
            >
              <el-checkbox
                v-for="item in originColumn"
                :key="item.prop"
                :label="item.prop"
                :disabled="item.prop === 'orgName'"
                class="originColumn"
              >
                {{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
            <!-- <el-button slot="reference" icon="el-icon-setting" size="medium" /> -->
            <i
              slot="reference"
              class="el-icon-setting setting-box"
            />
          </el-popover>
        </template>
        <template
          slot="status"
          slot-scope="{ row }"
        >
          {{ row.status === 'Success' ? '成功' : '失败' }}
        </template>
      </common-table>
    </basic-container>
  </div>
</template>

<script>
import moment from 'moment'
import { getActionLog } from '@/api/system/user'
import searchPopOver from '@/components/searchPopOver'
import { tableOptions } from '../../util/constant'
const column = [
  {
    label: '操作时间',
    prop: 'createTime',
    width: 180
  },
  {
    label: '操作人',
    prop: 'name',
    display: false
  },
  {
    label: '模块',
    prop: 'model',
    display: false
  },
  {
    label: '状态',
    prop: 'status',
    display: false,
    slot: true
  },
  {
    label: '操作内容',
    prop: 'content',
    display: false
  },
  {
    label: 'IP',
    prop: 'ip',
    display: false
  }
]
export default {
  components: {
    searchPopOver
  },
  data() {
    return {
      checkColumn: ['createTime', 'name', 'model', 'status', 'content', 'ip'],
      originColumn: column,
      data: [],
      ajaxData: {
        pageNo: 1, //请求页码
        pageSize: 10, //每页数据
        model: '', //模糊搜索
        userName: '', //用户名
        beginTime: `${moment().format('YYYY-MM-DD')} 00:00:00`, //查询开始时间
        endTime: `${moment().format('YYYY-MM-DD')} 23:59:59`, //查询结束时间
        status: '' //状态
      },
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      requireOptions: [
        {
          type: 'dataPicker',
          field: 'beginTime,endTime',
          data: [
            `${moment().format('YYYY-MM-DD')} 00:00:00`,
            `${moment().format('YYYY-MM-DD')} 23:59:59`
          ],
          label: '操作时间',
          config: {
            type: 'datetimerange',
            'range-separator': '至',
            'value-format': 'yyyy-MM-dd HH:mm:ss',
            'default-time': ['00:00:00', '23:59:59']
          }
        },
        {
          type: 'input',
          field: 'userName',
          label: '操作人',
          config: { 'suffix-icon': 'el-icon-search' }
        }
      ],
      popoverOptions: [
        { type: 'input', field: 'model', label: '模块', config: {} },
        {
          type: 'select',
          field: 'status',
          data: '',
          label: '状态',
          options: [
            { value: 'Success', label: '成功' },
            { value: 'Fail', label: '失败' }
          ],
          config: {}
        }
      ],
      columns: column,
      option: {
        ...tableOptions,
        refreshBtn: true,
        calcHeight: 80,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        border: true,
        index: true,
        selection: true,
        menu: false,
        size: 'medium',
        column: column
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    columnChange() {
      this.columns = column.filter((item) => {
        return this.checkColumn.indexOf(item.prop) > -1
      })
    },
    initData() {
      getActionLog(this.ajaxData).then((res) => {
        this.data = res.data
        this.page.total = res.totalNum
      })
    },
    currentChange(currentPage) {
      this.ajaxData.pageNo = currentPage
      this.initData()
      this.page.currentPage = currentPage
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize
      this.ajaxData.pageSize = pageSize
      this.initData()
    },
    refreshChange() {
      this.initData()
    },
    submit(params) {
      this.ajaxData.pageNo = 1
      this.page.currentPage = 1
      let { pageNo, pageSize } = this.ajaxData
      this.ajaxData = { pageNo, pageSize, ...params }
      this.initData()
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-form-item__label {
  line-height: 40px;
}
/deep/ .top-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .setting-box {
    font-size: 18px;
    color: #a0a8ae;
    cursor: pointer;
  }
}
.basic-container--block {
  height: calc(100% - 92px);
  min-height: calc(100% - 92px);
}
/deep/.el-date-editor {
  width: 400px !important;
}
</style>
