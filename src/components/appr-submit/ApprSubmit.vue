<template>
  <el-dialog
    title="审批流程"
    :visible.sync="visible"
    class="appr-submit-dialog"
    append-to-body
    @close="dialogClose"
  >
    <common-form
      ref="form"
      :columns="COLUMNS"
    >
      <template #processId>
        <el-select
          v-model="processId"
          placeholder="请选择您要执行的审批流程"
          popper-class="appr-submit-dialog-select"
        >
          <el-option
            v-for="item in processList"
            :key="item.processId"
            :value="item.processId"
            :label="item.processName"
          >
            <div>
              <span>{{ item.processName }}</span>
              <br />
              <span style="white-space: break-spaces">{{ item.line }}</span>
            </div>
          </el-option>
        </el-select>
      </template>
    </common-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="medium"
        @click="handleClose"
      >取 消</el-button>
      <el-button
        type="primary"
        size="medium"
        @click="handleSubmit"
      >确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getCourseProcessList, submitApprApply } from '@/api/apprProcess/apprProcess'
import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
const COLUMNS = [
  {
    itemType: 'slot',
    label: '',
    prop: 'processId',
    span: 24
  }
]
export default {
  name: 'ApprSubmit',
  props: {
    categoryId: {
      type: String,
      default: '1'
    }
  },
  data() {
    return {
      COLUMNS,
      processList: [],
      visible: false,
      processId: null,
      process: null
    }
  },
  computed: {
    ...mapGetters(['userId', 'userInfo']),
    showSelect() {
      return this.processList.length > 1
    }
  },
  watch: {
    processId(val) {
      this.process = _.find(this.processList, { processId: val })
    }
  },
  activated() {
    this.getProcessList()
  },
  created() {
    this.getProcessList()
  },
  deactivated() {
    this.clearData()
  },
  methods: {
    clearData() {
      // 清除缓存
      this.processId = ''
      this.process = null
    },
    async getProcessList() {
      await getCourseProcessList({ categoryId: this.categoryId }).then((res) => {
        this.processList = res
        _.forEach(this.processList, this.resolveData)
        if (res.length === 1) {
          this.process = res[0]
          // const processMap = this.createProcessMap()
          // const nodeData = this.createNodeLine()
          // console.log({ processMap, nodeData })
        }
      })
    },
    // 添加流程的展示数据
    resolveData(process) {
      let data = JSON.parse(Base64.decode(process.baseJson))
      let processLine = '',
        node = data.processData
      while (node) {
        if (node.type === 'approver') {
          processLine += _.map(node.properties.approvers, 'name').join(',')
        } else if (node.type === 'copy') {
          processLine += _.map(node.properties.members, 'name').join(',')
        }
        if (node.childNode && processLine) {
          processLine += ' -> '
        }
        node = node.childNode
      }
      this.$set(process, 'line', processLine)
    },
    // 校验是否只有一个流程
    validate() {
      return new Promise((resolve, reject) => {
        // 只有有符合的流程才需要发布审批,如果没有任何审批可选则不需要经过审批
        if (!this.process && this.processList.length > 0) {
          this.visible = true
          reject()
        } else {
          // 返回process用于判断是否需要发布审批,不需要时process为null
          resolve(this.process)
        }
      })
    },
    handleClose() {
      this.visible = false
      this.process = null
      this.processId = null
    },
    // 弹窗的确定回调
    handleSubmit() {
      this.$refs.form.validate().then(() => {
        this.visible = false
        this.$emit('submit', this.currentProcess)
      })
    },
    // 提交方法
    submit(data) {
      const processMap = this.createProcessMap()
      const nodeData = JSON.stringify(this.createNodeLine())
      return submitApprApply({
        ...data,
        userId: this.userId,
        processId: this.process.processId,
        title: this.userInfo.nick_name + '发起的' + data.processName,
        processMap,
        nodeData
      })
    },
    dialogClose() {
      this.$emit('apprCancel')
    },
    /**
     * 组装审批流程数组
     */
    createNodeLine() {
      const keys = ['type', 'properties', 'nodeId', 'prevId', 'content', 'variable']
      const processData = JSON.parse(Base64.decode(this.process.baseJson)).processData
      const nodeLine = [
        {
          ..._.pick(processData, keys),
          userList: [
            {
              name: this.userInfo.nick_name,
              userId: this.userId,
              workNo: this.userInfo.work_no,
              type: 'user'
            }
          ]
        }
      ]
      let node = processData.childNode
      while (node) {
        let userList = []
        if (node.type === 'approver') {
          userList = node.properties.approvers
        } else if (node.type === 'copy') {
          userList = node.properties.members
        }
        nodeLine.push({
          ..._.pick(node, keys),
          userList
        })

        node = node.childNode
      }
      return nodeLine
    },
    // 生成流程变量对象
    createProcessMap() {
      if (!this.process) {
        return {}
      }
      const processData = JSON.parse(Base64.decode(this.process.baseJson)).processData
      let node = processData
      const map = {}
      while (node) {
        let userList = []
        if (node.type === 'approver') {
          userList = node.properties.approvers
        } else if (node.type === 'copy') {
          userList = node.properties.members
        }
        if (userList.length === 0) {
          node = node.childNode
          continue
        }
        if (node.variable) {
          if (userList.length > 1) {
            map[node.variable] = [...new Set(userList.map((item) => 'taskUser_' + item.userId))]
          } else {
            map[node.variable] = 'taskUser_' + _.head(userList).userId
          }
        }
        node = node.childNode
      }
      return map
    }
  }
}
</script>

<style lang="scss">
.appr-submit-dialog {
}
.appr-submit-dialog-select {
  max-width: 514px;
  .el-select-dropdown__item {
    height: unset;
    line-height: 24px;
    padding-top: 6px;
    padding-bottom: 6px;
  }
}
</style>
