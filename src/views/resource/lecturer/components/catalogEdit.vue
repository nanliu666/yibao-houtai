<template>
  <el-dialog
    v-if="visible"
    v-loading="loading"
    :title="type === 'create' ? '创建分类' : type === 'createChild' ? '创建子分类' : '编辑分类'"
    :visible="visible"
    width="800px"
    :modal-append-to-body="false"
    top="5vh"
    @close="handleClose"
  >
    <el-form
      ref="ruleForm"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="top"
      class="newOrgDailog"
    >
      <el-form-item
        label="分类名称"
        prop="name"
      >
        <el-input
          v-model.trim="form.name"
          placeholder="请输入"
          maxlength="32"
        />
      </el-form-item>
      <el-form-item label="上级分类">
        <el-col>
          <el-select
            v-model="form.parentId"
            :disabled="type === 'createChild'"
            :multiple-limit="10"
            placeholder="请选择"
          >
            <el-option
              style="height: auto; padding: 0"
              :value="form.parentId"
              :label="parentOrgIdLabel"
            >
              <el-tree
                ref="orgTree"
                :data="orgTree"
                node-key="idStr"
                :props="{
                  children: 'children',
                  label: 'name'
                }"
                @node-click="handleOrgNodeClick"
              />
            </el-option>
          </el-select>
          <div class="select-tips">
            可通过选择上级类目为其创建子分类，子分类可见范围跟随父分类
          </div>
        </el-col>
      </el-form-item>
      <!-- 可见范围 -->
      <el-form-item
        v-if="parentOrgIdLabel === '顶级' && type !== 'createChild'"
        label="可见范围"
      >
        <div>
          <OrgTree
            :id-list="form.orgIdList"
            input-placeholder="搜索组织名称"
            @selectedValue="getOrgList"
          ></OrgTree>
        </div>
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="medium"
        @click="handleClose"
      >取消</el-button>
      <el-button
        type="primary"
        size="medium"
        @click="submit()"
      >保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import OrgTree from '@/components/UserOrg-Tree/OrgTree'
import { queryTeacherCataList, addCatalog, editTeacherCatalog } from '@/api/lecturer/lecturer'
export default {
  name: 'CatalogEdit',
  components: {
    OrgTree
  },
  data() {
    return {
      type: 'create',
      form: {
        parentId: '',
        orgIds: [],
        isPublic: 0
      },
      parentOrgIdLabel: '',
      rules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      orgTree: [],
      loading: false,
      visible: false
    }
  },
  methods: {
    // 可见范围返回数据
    getOrgList(val) {
      this.form.orgIds = val.map((item) => item.id)
    },
    async loadOrgTree() {
      let res = await queryTeacherCataList({ source: 'teacher', addFlag: '1' })
      if (this.type === 'edit') this.orgTree = this.clearCurrentChildren(res)
      else this.orgTree = res
      this.parentOrgIdLabel =
        +this.form.parentId === 0 ? '顶级' : this.findOrg(this.form.parentId).name
    },
    // 过滤当前选择编辑的分类的子类
    clearCurrentChildren(res) {
      let tempTree = _.cloneDeep(res)
      const loop = (tree) => {
        _.each(tree, (item) => {
          if (!_.isEmpty(item.children)) {
            loop(item.children)
          }
          // 父级组织类型 === 当前组织的类型
          if (this.form.id === item.id) {
            item.children = []
          }
          return tree
        })
      }
      loop(tempTree)
      return tempTree
    },

    checkSameName() {
      let target = this.findOrg(this.form.parentId)
      let temp = _.isEmpty(target) ? this.orgTree : target.children
      let hasSameName = _.some(temp, (child) => {
        return child.name === this.form.name
      })
      if (hasSameName) {
        this.$message.error('该分类已存在')
      }
      return hasSameName
    },
    // 提交
    submit() {
      if (this.type === 'create' && this.checkSameName()) return
      this.$refs.ruleForm.validate((valid, obj) => {
        this.form.orgIds = this.form.orgIds.toString()
        this.form.source = 'lecturer'
        if (valid) {
          // 不是编辑，会是新增以及新建子分类
          if (this.type !== 'edit') {
            this.loading = true
            if (this.type === 'createChild') {
              this.form.id = this.form.idStr
            }
            addCatalog(this.form)
              .then(() => {
                this.$message.success('创建成功')
                this.loading = false
                this.handleClose()
                this.$emit('refresh')
              })
              .catch(() => {
                this.loading = false
              })
          } else {
            // 编辑
            this.loading = true
            this.form.id = this.form.idStr
            this.form.parentIdStr = this.form.parentId
            console.log(this.form)
            editTeacherCatalog(_.assign(this.form, { source: 'teacher' }))
              .then(() => {
                this.$message.success('修改成功')
                this.$emit('refresh')
                this.loading = false
              })
              .catch(() => {
                this.loading = false
              })
            this.handleClose()
          }
        } else {
          this.$message.error(obj[Object.keys(obj)[0]][0].message)
          return false
        }
      })
    },
    // 新建分类
    add() {
      this.visible = true
      this.$nextTick(() => {
        this.type = 'create'
        this.orgTree[0] && this.handleOrgNodeClick()
        this.$set(this.form, 'isPublic', 0)
        this.$set(this.form, 'name', '')
        this.$set(this.form, 'parentId', '')
        this.parentOrgIdLabel = '顶级'
        this.loadOrgTree()
      })
    },
    // 新建子分类
    createChild(row) {
      this.visible = true
      this.$nextTick(() => {
        this.type = 'createChild'
        this.form = _.cloneDeep(row)
        this.form.parentId = row.idStr
        this.$set(this.form, 'isPublic', 0)
        this.$set(this.form, 'name', '')
        this.loadOrgTree()
      })
    },
    edit(row) {
      this.type = 'edit'
      this.loadOrgTree()
      this.form = _.cloneDeep(row)
      if (this.form.orgIdList.length) {
        this.form.orgIdList = this.form.orgIdList.reduce((pre, cur, index) => {
          pre.push({
            orgId: cur,
            orgName: this.form.orgNames.split(',')[index]
          })
          return pre
        }, [])
      }
      this.form.parentId = this.form.parentIdStr
      this.visible = true
      this.$emit('changevisible', true)
      this.loadOrgTree()
    },
    findOrg(id) {
      let org = {}
      function deep(arr) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].idStr === id) {
            org = arr[i]
            return
          }
          if (arr[i].children && arr[i].children.length > 0) {
            deep(arr[i].children)
          }
        }
      }
      deep(this.orgTree)
      return org
    },
    handleClose() {
      this.visible = false
      this.form = {}
    },
    handleOrgNodeClick(data) {
      if (data !== undefined) {
        this.form.parentId = data.idStr
        this.parentOrgIdLabel = data.name
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.select-tips {
  font-size: 12px;
  color: #a1a8ae;
  margin-top: -8px;
  margin-bottom: -24px;
}
.newOrgDailog {
  .el-select {
    width: 100%;
  }
}
.addressLoading {
  text-align: center;
}
/deep/ .el-form-item__error {
  padding-top: 0;
}
/deep/ .el-form-item__label {
  padding: 0 0 0 0;
}
/deep/ .el-dialog__body {
  padding: 15px 20px 0;
}
/deep/ .el-form-item {
  margin-bottom: 10px;
}
</style>
