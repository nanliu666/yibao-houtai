<template>
  <el-dialog
    :title="dialogTitle"
    :visible="visible"
    width="550px"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    @close="handleClose"
  >
    <el-row
      type="flex"
      justify="center"
    >
      <el-col :span="24">
        <common-form
          ref="form"
          :model="form"
          :columns="columns"
        >
          <div slot="parentId">
            <el-form-item label="上级岗位">
              <postion-page
                ref="myPos"
                title="上级岗位"
                :position-breadcrumb="positionBreadcrumb"
                :pos-name="rowData"
                @getPosData="getPosData"
              />
            </el-form-item>
          </div>
        </common-form>
      </el-col>
    </el-row>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        size="medium"
        :loading="saveLoading"
        @click="onClickSave"
      >
        保存
      </el-button>
      <el-button
        v-if="!type"
        size="medium"
        :loading="saveContinue"
        @click="onContinue"
      >
        保存并继续添加
      </el-button>
      <el-button
        v-else
        size="medium"
        @click="handleClose"
      >
        取消
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
// getStationTree,
import { addStation, editStation, deleteStation } from '@/api/system/station'
import PostionPage from '@/components/el-postion-page'
export default {
  name: 'JobsForm',
  components: {
    PostionPage
  },
  props: {
    rowData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    positionBreadcrumb: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      dialogTitle: '',
      visible: false,
      form: {},
      columns: [
        {
          prop: 'name',
          label: '岗位名称',
          itemType: 'input',
          required: true,
          rules: [
            { required: true, message: '请输入岗位名称', trigger: 'blur' },
            // 只允许汉字、中英文和下划线
            { pattern: /^[\u4E00-\u9FA5a-zA-Z0-9_]+$/, message: '不允许输入空格等特殊符号' }
          ],
          span: 24,
          maxlength: 10,
          placeholder: ' 请输入名称，建议不超过10个字'
        },
        {
          // prop: 'parentId',
          // itemType: 'treeSelect',
          // label: '上级岗位',
          // span: 24,
          // props: {
          //   selectParams: {
          //     placeholder: '请选择',
          //     multiple: false
          //   },
          //   treeParams: {
          //     data: [],
          //     'check-strictly': true,
          //     'default-expand-all': false,
          //     'expand-on-click-node': false,
          //     clickParent: true,
          //     filterable: false,
          //     props: {
          //       children: 'children',
          //       label: 'name',
          //       disabled: 'disabled',
          //       value: 'id'
          //     }
          //   }
          // }
          prop: 'parentId',
          span: 24,
          itemType: 'slot'
        },
        {
          prop: 'remark',
          label: '岗位描述',
          placeholder: '请输入岗位描述,最多100字',
          itemType: 'input',
          type: 'textarea',
          maxlength: 100,
          showWordLimit: true,
          span: 24,
          rows: 4
        }
      ],
      type: '',
      treeData: [],
      saveLoading: false,
      saveContinue: false
    }
  },
  watch: {
    rowData: {
      handler: function(newVal) {
        this.rowData = newVal
        this.commonWatch(this.rowData, this.type)
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    // this.loadOrgData()
  },
  methods: {
    getPosData(val) {
      this.form.parentId = val.value
    },
    // 关闭模态框
    handleClose() {
      this.visible = false
      this.$nextTick(() => {
        this.$refs.form.resetFields()
      })
    },
    // 打开模态框
    openDialog(title, type) {
      this.type = type
      this.dialogTitle = title
      this.commonWatch(this.rowData, this.type)
      this.columns.forEach((v) => {
        if (v.prop == 'parentId') this.$set(v, 'disabled', type == 'create')
      })
      this.visible = true
      this.$nextTick(() => {
        this.$refs.myPos.isEditPos = false
        if (this.type == 'edit') {
          this.$refs.myPos.editPosition()
        } else if (this.type == 'create') {
          this.$refs.myPos.isEditPos = true
          this.$refs.myPos.createPosition()
        } else {
          this.$refs.myPos.pName = ''
        }
      })
    },
    // 初始化数据
    // async loadOrgData() {
    //   await getStationTree().then((res) => {
    //     // 递归循环删除层级数5层以下的节点
    //     const loop = (tree) => {
    //       _.each(tree, (item) => {
    //         if (item.fullName.split('|').length > 3 && item.children) {
    //           delete item.children
    //         }
    //         loop(item.children)
    //       })
    //     }
    //     loop(res)
    //     this.treeData = res
    //   })
    //   this.columns.find((item) => item.prop === 'parentId').props.treeParams.data = this.treeData
    // },
    // 保存并继续添加
    onContinue() {
      this.$refs.form.validate().then(async (valid) => {
        if (!valid) return
        let fullPath = '|'
        let params = _.cloneDeep(this.form)
        this.saveContinue = true
        // 处理当前节点完整路径,完整路径=父级完整路径+父级ID
        if (params.parentId) {
          let flatObj = this.getParentId(this.treeData, params.parentId)
          if (flatObj && flatObj.length) {
            let idArr = []
            flatObj.map((v) => {
              idArr.push(v.id)
            })
            fullPath += idArr.reverse().join('|')
          }
        } else {
          params.parentId = 0
        }
        if (!params.remark) params.remark = ''
        params.fullName = fullPath
        params.sort = 1
        await addStation(params)
          .then(() => {
            // this.loadOrgData()
            this.$nextTick(() => {
              this.form = {}
            })
            this.$emit('initData')
            this.$message({
              type: 'success',
              message: '保存成功，请继续添加!'
            })
          })
          .finally(() => {
            this.saveContinue = false
          })
      })
    },
    // 点击保存
    onClickSave() {
      this.$refs.form.validate().then(async (valid) => {
        if (!valid) return
        let fullPath = '|'
        let params = _.cloneDeep(this.form)
        this.saveLoading = true
        // 处理当前节点完整路径,完整路径=父级完整路径+父级ID
        if (params.parentId) {
          let flatObj = this.getParentId(this.treeData, params.parentId)
          if (flatObj && flatObj.length) {
            let idArr = []
            flatObj.map((v) => {
              idArr.push(v.id)
            })
            fullPath += idArr.reverse().join('|')
          }
        } else {
          params.parentId = 0
        }
        if (!params.remark) params.remark = ''
        params.fullName = fullPath
        params.sort = 1
        if (this.type == 'edit') {
          params.id = this.rowData.id
          editStation
          await editStation(params)
            .then(() => {
              this.handleClose()
              // this.loadOrgData()
              this.$emit('initData', { parentId: this.rowData.parentId, isInitData: true })
              this.$message({
                type: 'success',
                message: '保存成功!'
              })
              this.$refs.form.resetFields()
            })
            .finally(() => {
              this.saveLoading = false
            })
          return
        }
        await addStation(params)
          .then(() => {
            this.handleClose()
            // this.loadOrgData()
            this.$emit('initData', { parentId: this.rowData.parentId, isInitData: true })
            this.$message({
              type: 'success',
              message: '保存成功!'
            })
            this.$refs.form.resetFields()
          })
          .finally(() => {
            this.saveLoading = false
          })
      })
    },
    // 删除操作
    deleteOpe(row) {
      let params = {
        ids: row.id
      }
      this.$confirm('您确定要删除选中的岗位吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        //   判断删除行是否包含子级
        if (row.hasChildren) {
          this.$message({
            type: 'error',
            message: '删除失败，本岗位含有下级岗位，请先将下级岗位调整后再删除!'
          })
        } else {
          await deleteStation(params).then(() => {
            this.$emit('initData')
            // this.loadOrgData()
            this.$message({
              type: 'success',
              message: '已成功删除该岗位!'
            })
          })
        }
      })
    },
    // 监听公共方法,根据不同情况进行不同的操作，1、创建下级岗位，2、编辑
    commonWatch(data, type) {
      let { name, parentId, remark } = data
      this.form = {
        name,
        parentId,
        remark
      }
      // 创建下级岗位，只保留父级
      if (type == 'create') {
        this.form.name = ''
        this.form.remark = ''
        this.form.parentId = data.id
      }
      // 编辑，JSON递归寻找父级ID
      if (type == 'edit') {
        let faltTree = this.findPnodeId(this.treeData)
        faltTree.map((v) => {
          if (parentId == v.parentId) {
            this.form.parentId = v.parentId == '0' ? null : v.parentId
          }
        })
      }
    },
    //先把属性结构扁平化，再根据id找到父级ID
    findPnodeId(data) {
      let res = []
      data.forEach((item) => {
        res.push(item)
        if (item.children) {
          res.push(...this.findPnodeId(item.children))
        }
      })
      return res
    },
    getParentId(list, id) {
      for (let i in list) {
        if (list[i].id == id) {
          return [list[i]]
        }
        if (list[i].children) {
          let node = this.getParentId(list[i].children, id)
          if (node !== undefined) {
            return node.concat(list[i])
          }
        }
      }
    }
  }
}
</script>

<style></style>
