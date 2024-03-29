<template>
  <div>
    <pageHeader title="商户管理">
      <template slot="rightMenu">
        <el-button
          size="medium"
          type="primary"
          @click="createTenant"
        >
          新建商户
        </el-button>
      </template>
    </pageHeader>
    <basic-container block>
      <common-table
        style="width: 100%"
        :data="data"
        :config="tableConfig"
        :columns="columns"
        :loading="loading"
        :page="page"
        @current-page-change="handleCurrentPageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template slot="topMenu">
          <div class="flex flex-flow flex-justify-between flex-items">
            <el-input
              v-model="form.tenantName"
              placeholder="商户名称"
              clearable
              style="width:200px;margin-right:12px;"
              @input="loadData"
            />
            <div>
              <!--            <span-->
              <!--              class="addUser"-->
              <!--              @click="jumpAddUser"-->
              <!--            ></span>-->
              <i
                class="icon  el-icon-refresh-right"
                @click="loadData"
              />
            </div>
          </div>
        </template>
        <template
          slot="status"
          slot-scope="scope"
        >
          {{ statusWord[scope.row.status] }}
        </template>
        <template
          slot="handler"
          slot-scope="scope"
        >
          <div style="width:300px">
            <el-button
              type="text"
              size="medium"
              @click="handleWatch(scope.row)"
            >
              查看
            </el-button>
            <el-button
              type="text"
              size="medium"
              @click.stop="handleEdit(scope.row, scope.index)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="medium"
              @click.stop="handleStatus(scope.row, scope.index)"
            >
              <span v-if="scope.row.status === 'Normal'">停用</span>
              <span v-else>启用</span>
            </el-button>
            <el-button
              type="text"
              size="medium"
              @click.stop="handleWorkNo(scope.row, scope.index)"
            >
              工号
            </el-button>
            <el-button
              type="text"
              size="medium"
              @click.stop="handleSuperAdmin(scope.row, scope.index)"
            >
              超级管理员
            </el-button>
          </div>
        </template>
      </common-table>
    </basic-container>
    <tenant-dialog
      v-if="dialogVisible"
      :dialog-visible.sync="dialogVisible"
      :row="row"
      :title="title"
      @updataData="loadData"
    />
    <watch-dialog
      v-if="watchDialog"
      :row="rowData"
      :dialog-visible.sync="watchDialog"
    />
    <workno-dialog
      v-if="worknoDialog"
      :row="rowData"
      :dialog-visible.sync="worknoDialog"
    />
    <super-dialog
      v-if="superDialog"
      :row="rowData"
      :dialog-visible.sync="superDialog"
    />
  </div>
</template>

<script>
import { getTenant, putTenant } from '@/api/system/tenant'
import tenantDialog from './components/tenantDialog'
import watchDialog from './components/watchTenantDialog'
import worknoDialog from './components/worknoDialog'
import superDialog from './components/superAdminDialog'
export default {
  name: 'Tenant',
  components: {
    tenantDialog,
    watchDialog,
    worknoDialog,
    superDialog
  },
  data() {
    return {
      // 表格配置

      statusWord: {
        Normal: '正常',
        Forbid: '禁用'
      },
      superDialog: false,
      title: '',
      watchDialog: false,
      worknoDialog: false,
      row: {},
      rowData: {},
      dialogVisible: false,
      form: {
        tenantName: ''
      },
      data: [],
      page: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      loading: false,
      params: {
        pageSize: 10,
        pageNo: 1,
        pagerCount: 1
      },
      tableConfig: {
        showHandler: true,
        showIndexColumn: false,
        rowKey: 'id',
        enableMultiSelect: false,
        handlerColumn: {
          minWidth: 240
        }
      },
      columns: [
        {
          label: '租户ID',
          prop: 'tenantId'
        },
        {
          label: '租户名称',
          prop: 'tenantName'
        },
        {
          label: '绑定的域名',
          prop: 'domain',
          width: 150
        },
        {
          label: '版权',
          prop: 'copyright'
        },
        {
          label: '租户状态',
          prop: 'status',
          slot: true
        },
        {
          label: '创建时间',
          prop: 'createTime'
        }
      ]
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    handleSuperAdmin(row) {
      this.rowData = JSON.parse(JSON.stringify(row))
      this.superDialog = true
    },
    createTenant() {
      this.dialogVisible = true
      this.title = '创建商户'
      this.row = {}
    },
    jumpAddUser() {},
    loadData() {
      this.getData()
    },
    getData() {
      let params = {
        pageNo: this.params.pageNo,
        pageSize: this.params.pageSize,
        tenantName: this.form.tenantName
      }
      getTenant(params).then((res) => {
        this.data = res.data
        this.page.total = res.totalNum
      })
    },
    handleCurrentPageChange(val) {
      this.params.pageNo = val
      this.getData()
    },
    handlePageSizeChange(val) {
      this.params.pageSize = val
      this.params.pageNo = 1
      this.page.pagerCount = 1
      this.getData()
    },
    handleEdit(row) {
      this.row = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
      this.title = '编辑商户'
    },
    handleWorkNo(row) {
      this.rowData = JSON.parse(JSON.stringify(row))
      this.worknoDialog = true
    },
    handleStatus(row) {
      let params = {
        tenantId: row.tenantId,
        status: row.status === 'Normal' ? 'Forbid' : 'Normal'
      }
      putTenant(params).then(() => {
        let text = row.status === 'Normal' ? '停用成功' : '启用成功'
        this.$message.success(text)
        this.getData()
      })
    },
    /**
     *  @author guanfenda
     *  @desc 查看
     * */
    handleWatch(row) {
      this.watchDialog = true
      this.rowData = JSON.parse(JSON.stringify(row))
      this.rowData = JSON.parse(JSON.stringify(row))
    }
  }
}
</script>

<style lang="scss" scoped></style>
