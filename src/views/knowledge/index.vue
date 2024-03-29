<template>
  <div class="knowledge">
    <page-header title="知识体系管理">
      <el-button
        slot="rightMenu"
        v-p="ADD_KNOWLEDGE"
        type="primary"
        size="medium"
        @click="() => handleUpdate()"
      >
        创建知识体系
      </el-button>
    </page-header>

    <div class="body">
      <div class="filter-container">
        <div class="operate-wrapper">
          <div class="operate-left">
            <div class="input-wrapper">
              <el-input
                v-model="query.name"
                clearable
                size="medium"
                placeholder="输入知识体系名称进行搜索"
                suffix-icon="el-icon-search"
                :maxlength="32"
              ></el-input>
            </div>
          </div>

          <div class="operate-right">
            <el-dropdown
              :hide-on-click="false"
              trigger="click"
            >
              <el-button
                type="text"
                icon="el-icon-setting"
                class="set-btn"
              >
                列项显示
              </el-button>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(_, key) in columns"
                  :key="key"
                >
                  <el-checkbox v-model="columns[key]">
                    {{ key }}
                  </el-checkbox>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </div>

      <div class="table-container">
        <el-table
          ref="table"
          v-loading="loading"
          :data="data"
          row-key="id"
          height="60vh"
          default-expand-all
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column
            v-if="columns['知识体系名称']"
            fixed="left"
            align="left"
            prop="name"
            :show-overflow-tooltip="true"
            label="知识体系名称"
            min-width="220"
          >
          </el-table-column>

          <el-table-column
            v-if="columns['描述']"
            align="left"
            :show-overflow-tooltip="true"
            label="描述"
            width="260"
          >
            <template slot-scope="scope">
              {{ scope.row.description || '--' }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns['创建时间']"
            sortable
            align="left"
            :show-overflow-tooltip="true"
            prop="updateTime"
            label="创建时间"
            min-width="180"
          >
          </el-table-column>
          <el-table-column
            v-if="columns['创建人']"
            align="left"
            :show-overflow-tooltip="true"
            prop="creatorName"
            label="创建人"
            min-width="120"
          >
          </el-table-column>
          <el-table-column
            align="center"
            label="操作"
            fixed="right"
            width="280"
          >
            <template slot-scope="scope">
              <el-button
                v-p="EDIT_KNOWLEDGE"
                type="text"
                size="medium"
                @click="toDetail(scope.row)"
              >
                查看详情
              </el-button>
              <el-button
                v-p="EDIT_KNOWLEDGE"
                type="text"
                size="medium"
                @click="handleUpdate(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-p="DELETE_KNOWLEDGE"
                type="text"
                size="medium"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
              <el-button
                v-p="CHILD_KNOWLEDGE"
                type="text"
                size="medium"
                @click="handleAddChild(scope.row)"
              >
                新增子级
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="750px"
      @open="onDialogOpen"
    >
      <el-form
        ref="form"
        :model="form"
        label-position="top"
        :rules="formRules"
      >
        <el-form-item
          label="知识体系名称"
          prop="name"
          min-width="180"
        >
          <el-input
            v-model="form.name"
            placeholder="请输入"
            clearable
          ></el-input>
        </el-form-item>

        <el-form-item
          label="上级知识体系"
          prop="parentId"
        >
          <el-cascader
            ref="cascader"
            v-model="form.parentId"
            clearable
            filterable
            filter
            style="width: 100%"
            placeholder="请选择"
            :options="treeData"
            :props="{ checkStrictly: true, label: 'name', value: 'id' }"
            :show-all-levels="false"
            @change="handleCascaderChange"
          ></el-cascader>
        </el-form-item>

        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="form.description"
            placeholder="请输入"
            type="textarea"
            :rows="3"
            :maxlength="200"
            clearable
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="confirmLoading"
          @click="handleUpdateConfirm"
        >完 成</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCategoryTree,
  addCategory,
  deleteCategory,
  editCategory,
  checkCategory
} from '@/api/live'
import TreeSelector from '@/components/tree-selector'
import { ADD_KNOWLEDGE, EDIT_KNOWLEDGE, DELETE_KNOWLEDGE, CHILD_KNOWLEDGE } from '@/const/knowledge'
const ORIGIN_FORM = {
  id: '',
  name: '',
  parentId: '',
  description: '',
  source: 'knowledgeSystem'
}
const ORIGIN_QUERY = {
  name: '',
  source: 'knowledgeSystem'
}
export default {
  name: 'Knowledge',
  components: {
    TreeSelector
  },
  data() {
    return {
      dialogTitle: '',
      selectorProps: {
        value: 'id',
        label: 'name',
        children: 'children'
      },
      treeData: [],
      columns: {
        知识体系名称: true,
        描述: true,
        创建人: true,
        创建时间: true
      },
      query: { ...ORIGIN_QUERY },
      form: { ...ORIGIN_FORM },
      formRules: {
        name: [{ required: true, trigger: 'blur', message: '请输入知识体系名称' }]
      },
      loading: false,
      dialogVisible: false,
      confirmLoading: false,
      data: []
    }
  },
  computed: {
    ADD_KNOWLEDGE: () => ADD_KNOWLEDGE,
    EDIT_KNOWLEDGE: () => EDIT_KNOWLEDGE,
    DELETE_KNOWLEDGE: () => DELETE_KNOWLEDGE,
    CHILD_KNOWLEDGE: () => CHILD_KNOWLEDGE
  },
  watch: {
    columns: {
      handler() {
        this.$nextTick(() => {
          this.$refs.table.doLayout()
          this.$refs.table.$forceUpdate()
        })
      },
      deep: true
    },
    'query.name': _.debounce(function() {
      this.getList()
    }, 1000)
  },
  activated() {
    this.getData()
  },
  methods: {
    handleCascaderChange(data) {
      if (!data) return
      this.form.parentId = data[data.length - 1]
      if (this.$refs.cascader) {
        this.$refs.cascader.dropDownVisible = false
      }
    },
    onDialogOpen() {
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    getData() {
      this.getCategoryData()
      this.getList()
    },
    getCategoryData() {
      getCategoryTree({ source: 'knowledgeSystem', addFlag: '1' }).then((res) => {
        this.treeData = res
      })
    },
    handleAddChild({ id }) {
      this.form = { ...ORIGIN_FORM, parentId: id, id }
      this.dialogTitle = '新建子知识体系'
      this.dialogVisible = true
    },
    toDetail({ id }) {
      this.$router.push({
        path: '/resource/knowledge/detail',
        query: {
          id
        }
      })
    },
    handleUpdate(item) {
      if (item) {
        let { idStr: id, name, parentId } = item
        if (parentId === '0') {
          parentId = ''
        }
        Object.assign(this.form, { id, name, parentId })
        this.dialogTitle = '编辑知识体系'
      } else {
        this.form = { ...ORIGIN_FORM }
        this.dialogTitle = '创建知识体系'
      }
      this.dialogVisible = true
    },
    handleUpdateConfirm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        const api = this.dialogTitle === '编辑知识体系' ? editCategory : addCategory
        this.confirmLoading = true
        api(this.form)
          .then((res) => {
            const { resMsg } = res
            if (typeof res === 'boolean') {
              this.$message.success('新建成功')
              this.dialogVisible = false
              this.getData()
            } else {
              this.$message.error(resMsg)
            }
          })
          .finally(() => {
            this.confirmLoading = false
          })
      })
    },
    beforeDelete(id) {
      return new Promise((resolve) => {
        checkCategory({ id })
          .then((res) => {
            resolve(res)
          })
          .catch(() => {
            resolve(false)
          })
      })
    },
    async handleDelete(target) {
      const id = target.id
      target.delLoading = true
      this.$forceUpdate()
      const result = await this.beforeDelete(id)
      target.delLoading = false
      this.$forceUpdate()
      const message = result
        ? `#${target.name}#下有关联内容，确定要删除吗？删除之后所关联的相关内容不再包含此知识体系？`
        : '您确定要删除选中的知识体系吗？'
      this.$confirm(message, '提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteCategory({ id }).then(() => {
            this.$message.success('操作成功')
            this.getList()
          })
        })
        .catch(() => {})
    },
    getList() {
      if (this.loading) return
      this.loading = true
      getCategoryTree(this.query)
        .then((res = []) => {
          this.data = res.map((item) => {
            const { id, name, children = [], description, updateTime, creatorName, parentId } = item
            return {
              id,
              name,
              children,
              description,
              updateTime,
              creatorName,
              parentId
            }
          })
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
<style lang="scss">
.knowledge {
  .el-table__row .expanded .el-table_1_column_1 {
    color: #01aafc;
    cursor: pointer;
  }
  .column-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .el-table th.gutter {
    display: table-cell !important;
  }

  .el-table colgroup.gutter {
    display: table-cell !important;
  }

  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
  .el-form-item {
    margin-right: 20px;
  }
  .operate-wrapper .operate-left .input-wrapper {
    .el-input__inner {
      height: 34px;
      line-height: 34px;
    }
  }
  .icon-basics-filter-outlined {
    font-size: 14px;
  }

  .filter-form {
    .el-form-item__label {
      text-align: center;
    }
  }
}
</style>
<style lang="scss" scoped>
.knowledge {
  .body {
    background-color: #fff;
    padding: 24px;
    margin-bottom: 24px;
    .filter-container {
      .operate-wrapper {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        .operate-left {
          display: flex;
          align-items: center;
          .input-wrapper {
            width: 235px;
            margin-right: 10px;
          }
          .filter-btn {
            width: 85px;
          }
        }
        .operate-right {
          display: flex;
          align-items: center;
          height: 36px;
          margin-right: 10px;
          color: #a0a8ae;
          .fresh-wrap {
            padding-right: 10px;
            border-right: 1px solid #a0a8ae;
            .fresh-btn {
              cursor: pointer;
            }
          }
          .set-btn {
            cursor: pointer;
            margin-left: 10px;
            margin-top: 2px;
          }
        }
      }
    }
    .table-container {
    }
  }
}
</style>
