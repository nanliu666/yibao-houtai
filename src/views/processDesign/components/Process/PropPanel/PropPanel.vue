<template>
  <div>
    <el-drawer
      v-if="properties"
      size="360px"
      class="drawer"
      :visible.sync="visible"
      :show-close="true"
      :wrapper-closable="false"
      style="text-align: left"
      @close="cancel"
    >
      <!-- 标题 -->
      <!-- 标题 -->
      <!-- 标题 -->
      <header
        v-if="value && value.type == 'start' && properties.title"
        slot="title"
        class="header"
      >
        {{ properties.title }}
      </header>
      <header
        v-else
        slot="title"
        class="header"
      >
        <span
          v-show="!titleInputVisible"
          style="cursor: pointer; color: #202940; font-size: 16px"
          @click="titleInputVisible = true"
        >
          {{ properties.title }}
          <i class="el-icon-edit" />
        </span>
        <el-input
          v-show="titleInputVisible"
          v-model="properties.title"
          v-clickoutside="(_) => (titleInputVisible = false)"
          size="mini"
          style="z-index: 9; max-width: 200px"
        />
      </header>
      <!-- 审批人 -->
      <section
        v-if="value && isApproverNode()"
        class="approver-pane"
        style="height: 100%;padding-left: 24px;"
      >
        <div class="apprTypeC">
          <el-radio-group v-model="apprType">
            <el-radio :label="'user'">
              指定人员
            </el-radio>
            <el-radio :label="'position'">
              指定岗位
            </el-radio>
          </el-radio-group>
        </div>
        <h3 v-if="apprType == 'position'">
          选择岗位
        </h3>
        <fc-org-select
          v-if="apprType == 'user'"
          ref="approver-org"
          v-model="orgCollection"
          button-type="button"
          title="指定成员"
          :is-range="true"
          :tab-list="['user']"
        />
        <!-- <el-tree-select
          v-if="apprType == 'position'"
          :select-params="positionSelectParams"
          :tree-params="positionTreeParams"
          @searchFun="searchFun"
          @node-click="nodeClickFn"
        >
        </el-tree-select> -->
        <!-- 下拉搜索 岗位-->
        <lazy-select
           v-if="apprType == 'position'"
          :ref="positionConfig.field"
          v-model="positionConfig.data"
          :load="positionConfig.load"
          :option-list.sync="positionConfig.optionList"
          :placeholder="positionConfig.placeholder"
          :option-props="positionConfig.optionProps"
          :searchable="positionConfig.searchable"
          @select="positionChange"
        >
        
        </lazy-select>


        <br />
        <p>多人审批时采用的审批方式</p>
        <el-radio
          v-model="approverForm.counterSign"
          :label="true"
          class="radio-item"
        >
          会签（须所有审批人同意）
        </el-radio>
        <br />
        <el-radio
          v-model="approverForm.counterSign"
          :label="false"
          class="radio-item"
        >
          或签（一名审批人同意或拒绝即可）
        </el-radio>
      </section>

      <section
        v-if="value && isCopyNode()"
        style="padding-left: 24px"
      >
        <fc-org-select
          ref="copy-org"
          v-model="members"
          :tab-list="['copy']"
          button-type="button"
          :is-range="true"
          title="抄送人"
        />
      </section>

      <div class="actions">
        <div class="flex flex-align-items flex-center">
          <el-button
            class="btn"
            size="small"
            type="primary"
            @click="confirm"
          >
            保存
          </el-button>
          <el-button
            class="btn"
            size="small"
            @click="cancel"
          >
            取消
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { getStationParent } from '@/api/system/station'
import { mapGetters } from 'vuex'
import { NodeUtils } from '../FlowCard/util.js'
import Clickoutside from 'element-ui/src/utils/clickoutside'
import { queryStation, positionUserList } from '@/api/system/station'
// 审批人类型枚举
const ASSIGNEE_TYPE = {
  // competentBusiness: 'competentBusiness', // 业务主管
  // departmentHeads: 'departmentHeads', // 部门领导
  // multiCompetentBusiness: 'multiCompetentBusiness', // 多级业务主管
  // multiDepartmentHeads: 'multiDepartmentHeads', // 多级部门领导
  // optional: 'optional', // 发起人自选
  // role: 'role', // 指定角色
  // tag: 'tag', // 指定标签
  user: 'user' // 指定成员
}
const positionConfig = {
      data: '',
      field: 'positionId',
      label: '岗位',
      type: 'lazySelect',
      optionList: [],
      placeholder: '请选择岗位',
      optionProps: {
        formatter: (item) => `${item.name}(${item.fullOrg?item.fullOrg:'暂无'})`,
        key: 'name',
        value: 'id'
      },
      load: (p)=>{
        p.name = p.search
        return getStationParent(p)
      },
      remote:true,
      searchable: true,
      config: { optionLabel: 'name', optionValue: 'id' }
  }
// 默认表单模版
const defaultApproverForm = {
  approvers: [], // 审批人集合
  assigneeType: 'user', // 指定审批人
  counterSign: true, //是否为会签
  // 审批类型为自选 出现 optionalMultiUser optionalRange
  optionalMultiUser: false,
  infoForm: {
    roleId: [],
    orgId: null, //部门
    jobId: null, //职位
    positionId: '', //岗位
    tagId: '' //标签
  },
  optionalRange: 'USER' // USER<最多十个> / ALL / ROLE
}

export default {
  name: 'PropPanel',
  directives: {
    Clickoutside
  },
  components: {
    elTreeSelect: () => import('@/components/elTreeSelect/elTreeSelect'), //
    lazySelect: () => import('@/components/lazy-select/lazySelect')
  },
  props: {
    /*当前节点数据*/
    value: {
      type: Object,
      default: null
    },
    /*整个节点数据*/
    processData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      positionConfig:positionConfig,
      positionSelectParams: {
        // 岗位下拉配置
        placeholder: '请选择岗位',
        multiple: true
      },
      positionTreeParams: {
        // 岗位下拉配置
        data: [],
        'check-strictly': true,
        'default-expand-all': false,
        'expand-on-click-node': false,
        clickParent: true,
        filterable: true,
        props: {
          children: 'children',
          label: 'name',
          disabled: 'disabled',
          value: 'id'
        }
      },
      type: {
        istag: true,
        isposition: true
      },
      isValid: false,
      infoForm: {
        roleId: [],
        orgId: null,
        jobId: null,
        positionId: '',
        tagId: ''
      },
      formConf: {
        fields: []
      },
      fcOrgTabList: ['user'],
      visible: false, // 控制面板显隐
      titleInputVisible: false, // 是否显示标题输入框  startNode 不显示
      activeName: 'config', // or formAuth/config Tab面板key
      dialogVisible: false, // 控制流程条件选项Dialog显隐
      // 当前节点数据
      properties: {},
      apprType: 'user', // 指定审批人类型：是岗位还是某个人
      positionData: '', //当前选中的岗位的数据
      // 发起人  start节点和condition节点需要
      orgCollection: {
        user: []
      },
      useDirectorProxy: true, // 找不到主管时 上级主管代理审批
      approverForm: JSON.parse(JSON.stringify(defaultApproverForm)),
      members: {
        //抄送节点
        dep: [],
        copy: []
      },
      dictionary: {}
    }
  },
  computed: {
    assigneeTypeObect: () => ASSIGNEE_TYPE,
    ...mapGetters(['fieldList'])
  },
  watch: {
    processData: {
      handler() {
        this.apprType =
          (this.processData.childNode &&
            this.processData.childNode.properties &&
            this.processData.childNode.properties.apprType) ||
          'position'
      },
      deep: true
    },
    value(newVal) {
      this.positionData = ''
      if (newVal && newVal.properties) {
        this.visible = true
        this.properties = newVal.properties
      }
    },
    visible(val) {
      if (!val) {
        this.approverForm = JSON.parse(JSON.stringify(defaultApproverForm)) // 重置数据为默认状态
        return
      }
      this.isApproverNode() && this.initApproverNodeData()
      this.isCopyNode() && this.initCopyNodeData()
      //岗位替换为下拉加载    --------    如果面板显示，初始化岗位数据,不回显
      if(val){
        this.positionConfig.data = ''
      }
    }
  },
   mounted() {
    // this.getStationFn()
  },
  methods: {
    copyNodeConfirm() {
      let attribute = []
      this.members['copy'].map((it) => {
        attribute.push(it.bizId)
      })
      attribute = attribute.join(',')
      this.properties.attribute = attribute
      this.properties.members = this.members['copy']
      this.$emit('confirm', this.properties, this.getOrgSelectLabel('copy') || '请选择抄送人')
      this.visible = false
    },

    getOrgSelectLabel(type) {
      return this.$refs[type + '-org'] ? this.$refs[type + '-org']['selectedLabels'] : ''
    },
    //选择了岗位回调
    async positionChange(val){
        this.positionData = val
    },
    searchFun(val) {
      //岗位搜索
      this.getStationFn(val)
    },
    nodeClickFn(backData, node) {
      //选中岗位后回调
      this.positionData = node
    },
    async getStationFn(name) {
      //获取岗位
      let sendData = { name: name }
      await queryStation(sendData).then((res) => {
        this.positionTreeParams.data = res
      })
    },
    /**
     * 审批节点确认保存
     */
    async approverNodeComfirm() {
      let positionDatas = this.positionData
      const assigneeType = this.approverForm.assigneeType
      // let content =
      //   positionDatas && this.apprType == 'position'
      //     ? positionDatas.data.name
      //     : this.getOrgSelectLabel('approver')
      //岗位替换为下拉加载岗位----单层（徐工没有tree）
      let content =
        positionDatas && this.apprType == 'position'
          ? positionDatas.name
          : this.getOrgSelectLabel('approver')
      this.approverForm.apprType = this.apprType

      this.approverForm.approvers = this.orgCollection[assigneeType] //这里处理发起人自选和发起人及抄送人姓名等
      let attribute = []
      this.orgCollection[assigneeType] &&
        this.orgCollection[assigneeType].map((it) => {
          attribute.push(it.bizId)
        })
      attribute = attribute.join()

      this.properties.attribute = attribute // 获取值（抄送人姓名等）

      Object.assign(this.properties, this.approverForm)
      this.$emit('confirm', this.properties, content || '请选择审批人')
      this.visible = false
    },

    // 保存回调
    async confirm() {
      let positionDatas = this.positionData
      if (this.positionData && this.apprType == 'position') {
        
        // var resData = await positionUserList({ positionId: positionDatas.data.id })
        //选择岗位替换为下拉选择
        var resData = await positionUserList({ positionId: positionDatas.id })
        //如果该岗位下没有用户  终止
        if(resData.length<=0){
          this.$message({type:'info',message:'该岗位下暂无数据'})
          return false
        }
        resData.forEach((item, i) => {
          let backData = {
            isLeaf: true,
            disabled: true,
            _nodeKey: `1_${item.userId}`,
            bizId: `${item.userId}`,
            bizName: `${item.name}`,
            type: 'Position'
          }
          resData[i] = { ...item, ...backData }
        })
        
        this.orgCollection.user = resData
      }
      this.isCopyNode() && this.copyNodeConfirm()
      this.isApproverNode() && this.approverNodeComfirm()
    },
    // 关闭抽屉
    cancel() {
      setTimeout(() => {
        this.$emit('cancel')
        this.visible = false
      }, 0)
    },

    /** 判断是否是审批节点*/
    isApproverNode() {
      return this.value ? NodeUtils.isApproverNode(this.value) : false
    },

    isStartNode() {
      return this.value ? NodeUtils.isStartNode(this.value) : false
    },

    isCopyNode() {
      return this.value ? NodeUtils.isCopyNode(this.value) : false
    },

    /**
     * 初始化审批节点所需数据
     */
    initApproverNodeData() {
      for (const key in this.approverForm) {
        if (this.value.properties.hasOwnProperty(key)) {
          this.approverForm[key] = this.value.properties[key]
        }
        if (key === 'infoForm') {
          this.infoForm = Object.assign(this.infoForm, this.value.properties[key])
        }
      }
      this.approverForm.counterSign =
        this.approverForm.counterSign === null ? true : this.approverForm.counterSign
      const approvers = this.approverForm.approvers
      if (Array.isArray(this.approverForm.approvers)) {
        this.orgCollection[this.approverForm.assigneeType] = approvers
      } else {
        this.orgCollection[this.approverForm.assigneeType] = []
      }
    },
    /**
     * @author guanfenda
     * @desc 初始发送人节点数据
     * */
    initCopyNodeData() {
      this.members.copy = []
      this.value.properties.members &&
        this.value.properties.members.length > 0 &&
        (this.members.copy = this.value.properties.members)
    }
  }
}
</script>

<style lang="stylus">
.condition-dialog {
  .el-dialog__header {
    border-bottom: 1px solid #eee;
  }
}
</style>
<style lang="stylus" scoped>
.drawer {
  font-size: 14px;
  color: #202940;

  >>> .el-drawer__header {
    margin-bottom: 0;
    /*border-bottom: 1px solid #c5c5c5;*/
    /*padding-bottom: 8px;*/
    padding: 24px;
  }

  >>> .el-drawer__body {
    padding-bottom: 0px;
    overflow: hidden;
    overflow-y: auto;
    margin-bottom: 60px;
  }

  .pane-tab {
    height: 100%;
  }

  .pane-tab >>> .el-tabs__item.is-top:nth-child(2) {
    padding-left: 20px;
  }

  >>> .el-tabs__item:focus {
    box-shadow: none !important;
  }

  >>> .el-tabs__header {
    margin-bottom: 0;
  }
}

.header {
  line-height: 28px;
}

.actions {
  position: absolute;
  bottom: 20px;
  left: 0;
  padding: 6px 12px;
  width: 100%;
  box-sizing: border-box;
  text-align: right;

  .btn {
    width: 84px;
  }
}

.radio-item {
  width: 110px;
  padding: 6px;
}

.priority-select {
  width: 118px;
  position: absolute;
  right: 26px;
}

.form-auth-table {
  font-size: 14px;
  padding: 10px 24px;
  .auth-table-header {
    border-bottom: 1px solid #E3E7E9;
    line-height: 40px;
    font-size: 14px;
    font-weight: 550;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .header-title {
      flex: 1;
    }
    .header-ul {
      display: flex;
      width: 70%;
      align-items: center;
      justify-content: space-between;
    }
  }

  .row {
    display: flex;
    align-items: center;
    line-height: 32px;
    padding: 8px 0px;
    border-bottom: 1px solid #efefef;

    &:hover {
      background: #f5f7fa;
    }

    .label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .required {
        color: #f2725e;
      }
    }

    .radio-group {
      flex: 2;
      width: 70%;
      display: flex;
      justify-content: space-between;
    }
  }
}

.approver-pane {
  //  overflow-y: scroll;
  // overflow-x: hidden;

  .option-box {
    font-size 14px
    padding-left 24px
  }
}
.approver-pane h3{padding:0 0 5px 0;margin:0;font-size:14px}
.approver-pane .apprTypeC{padding:0 0 50px 0}
.condition-pane {
  height: calc(100% -50px)
  ///*overflow scroll*/
}

.flex {
  display: flex;
  display: -webkit-flex;
  display: -ms-flex;
  display: -moz-flex;
  flex-flow: row nowrap;
}

.flex-center {
  justify-content: center;

}

.flex-align-items {
  align-items: center;
}

.tabs_div {
  /*margin: 0 auto;*/
  text-align center;
  border: 1px solid #C6CBCE;
  border-radius: 4px;
  /*width: 312px;*/
    width :312px;
  margin-left :24px;
  > div {
    width: 312px;
    height: 34px;
    font-size: 14px;
    color: #202940;
    line-height: 34px;
    cursor: pointer;
  }

  .active {
    background: $primaryColor;
    color: #FFFFFF;
  }
}

/deep/ .el-radio {
  color: #202940;
  cursor: pointer;
  margin-right: 30px;
}

.formAuth {
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100% - 100px)
}
</style>
