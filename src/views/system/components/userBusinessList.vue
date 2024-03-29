<template>
  <basic-container
    block
    style="padding-top:0;"
  >
    <common-table
      ref="crud"
      :config="tableConfig"
      :columns="columns"
      :loading="loading"
      :data="data"
      :page="page"
      @current-page-change="currentChange"
      @page-size-change="sizeChange"
    >
      <template
        slot="multiSelectMenu"
        slot-scope="{ selection }"
      >
        <el-button
          type="text"
          style="margin-bottom:0;"
          @click="handleReset(selection)"
        >
          批量重置密码
        </el-button>
      </template>
      <template slot="topMenu">
        <div class="flex flex-flow flex-justify-between flex-items">
          <el-input
            v-model="query.name"
            placeholder="姓名/工号"
            clearable
            style="width:200px;margin-right:12px;"
            @input="searchLoadData"
          />
        </div>
      </template>
      <template
        slot="handler"
        slot-scope="{ row }"
      >
        <el-button
          size="medium"
          type="text"
          @click="handleEditRole(row)"
        >
          角色设置
        </el-button>
        <el-button
          size="medium"
          type="text"
          @click="handleReset(row)"
        >
          密码重置
        </el-button>
        <el-dropdown
          style="float:right;"
          @command="(command) => handleCommand(command, row)"
        >
          <el-button
            type="text"
            class="el-dropdown-link"
            style="padding:0;"
          >
            <i class="el-icon-more" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-if="row.userStatus === '1'"
              command="suspend"
            >
              冻结
            </el-dropdown-item>
            <el-dropdown-item
              v-if="row.userStatus === '2'"
              command="unsuspend"
            >
              解冻
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </common-table>
    <user-role-edit
      ref="userRoleEdit"
      :visible.sync="editVisible"
      :user="editingUser"
      @after-submit="handleAfterSubmit"
    />
  </basic-container>
</template>

<script>
import { getBusinessUserList, modifyUserStatus, resetPwd } from '@/api/system/user'

export default {
  name: 'User',
  components: {
    // 员工角色编辑
    userRoleEdit: () => import('./userRoleEdit')
  },
  props: {
    activeOrg: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      query: {
        name: ''
      },
      loading: false,
      page: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      tableConfig: {
        showHandler: true,
        enableMultiSelect: true,
        enablePagination: true,
        showIndexColumn: false,
        rowKey: 'userId',
        handlerColumn: {
          width: '180'
        }
      },
      columns: [
        {
          label: '姓名',
          prop: 'name'
        },
        {
          label: '工号',
          prop: 'workNo'
        },
        //状态，1-正常，2-禁用
        {
          label: '状态',
          prop: 'userStatus',
          filters: [
            {
              text: '正常',
              value: '1'
            },
            {
              text: '禁用',
              value: '2'
            }
          ],
          filterMethod: (value, row) => {
            return row.userStatus == value
          },
          formatter(record) {
            return (
              {
                '1': '正常',
                '2': '禁用'
              }[record.userStatus] || ''
            )
          }
        },
        {
          label: '部门',
          prop: 'orgName'
        },
        {
          label: '职位',
          prop: 'jobName'
        },
        {
          label: '角色',
          prop: 'roles',
          width: 100,
          formatter(record) {
            return record.roles.map((role) => role.roleName).join(';')
          }
        },
        {
          label: '电话',
          prop: 'phonenum'
        }
      ],
      data: [],
      editVisible: false,
      editingUser: {}
    }
  },
  watch: {
    activeOrg: function() {
      this.page = {
        currentPage: 1,
        size: 10,
        total: 0
      }
      this.loadData()
    }
  },
  created() {
    this.loadData()
  },
  activated() {
    this.loadData()
  },
  methods: {
    searchLoadData: _.debounce(function() {
      this.loadData()
    }, 500),
    handleAfterSubmit() {
      this.loadData()
    },
    handleEditRole(user) {
      this.$refs['userRoleEdit'].init(user)
    },
    currentChange(currentPage) {
      this.page.currentPage = currentPage
      this.loadData()
    },
    sizeChange(pageSize) {
      this.page.size = pageSize
      this.loadData()
    },
    handleReset(data) {
      let ids
      if (Array.isArray(data)) {
        ids = data.map((item) => item.userId).join(',')
      } else {
        ids = data.userId
      }
      this.$confirm('确定将选择账号密码重置为xcmg123456?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.resetPwd(ids, data)
        })
        .then(() => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
        })
    },
    resetPwd(ids, data) {
      resetPwd(ids).then(() => {
        Array.isArray(data) ? (data.length = 0) : ''
        this.loadData()
      })
    },
    handleCommand(command, row) {
      let status = null
      switch (command) {
        case 'suspend':
          status = '2'
          break
        case 'unsuspend':
          status = '1'
          break
      }
      this.modifyUserStatus(row.userId, status)
    },
    modifyUserStatus(userId, status) {
      let msg = ''
      if (status === '2') {
        msg = '您确定要将该用户设置为“离职”状态吗？\n离职后，该用户将不能登录系统'
      } else {
        msg = '您确定要将该用户设置为“在职”状态吗？'
      }
      this.$confirm(msg, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => modifyUserStatus(userId, status))
        .then(() => {
          this.$message({
            type: 'success',
            message: '操作成功!'
          })
          this.loadData()
        })
    },
    loadData() {
      this.loading = true
      getBusinessUserList({
        pageNo: this.page.currentPage,
        pageSize: this.page.size,
        orgId: this.activeOrg ? this.activeOrg.orgId : '0',
        search: this.query.name
      })
        .then((res) => {
          this.page.total = res.totalNum
          this.data = res.data
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.addUser {
  font-size: 14px;
  display: inline-block;
  color: #757c85;
  line-height: 14px;
  cursor: pointer;
  padding-right: 12px;
  border-right: 0.5px solid #e9e9e9;
}
.icon {
  margin-left: 12px;
  font-size: 18px;
  color: #a0a8ae;
  cursor: pointer;
}
</style>
