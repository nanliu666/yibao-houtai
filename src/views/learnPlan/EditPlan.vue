<template>
  <div class="page">
    <header class="page__header">
      <div class="page-actions">
        <div
          style="border-right: 1px solid #c5c5c5; cursor: pointer"
          @click="exit"
        >
          <i class="el-icon-arrow-left" /> 返回
        </div>
      </div>
      <div class="step-tab">
        <div
          v-for="(item, index) in steps"
          :key="index"
          class="step"
          :class="[activeStep === index ? 'active' : '']"
          @click="changeStep(index)"
        >
          <span class="step-index">
            <i
              class="iconfont"
              :class="[item.icon]"
            />
          </span>
          {{ item.label }}
        </div>
        <div
          class="ghost-step step"
          :style="{ transform: translateX }"
        />
      </div>

      <div class="page-right">
        <el-button
          v-if="!id"
          size="medium"
          @click="handleSubmit(1)"
        >
          存草稿
        </el-button>
        <el-button
          v-if="activeStep !== 0"
          size="medium"
          @click="handlePreviousStep"
        >
          上一步
        </el-button>
        <el-button
          v-if="activeStep !== 2"
          size="medium"
          type="primary"
          @click="handleNextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="activeStep === 2"
          size="medium"
          type="primary"
          @click="handleSubmit(0)"
        >
          发布
        </el-button>
      </div>
    </header>
    <el-row
      type="flex"
      justify="center"
      class="page__content"
    >
      <el-col
        v-loading="loading"
        :xl="16"
        :lg="16"
        :md="18"
        :sm="20"
        :xs="22"
        class="page__content--inner"
      >
        <EditBasicInfo
          v-show="activeStep === 0"
          ref="editBasicInfo"
          :model="formData"
        />
        <EditCourse
          v-show="activeStep === 1"
          ref="editCourse"
          :plan-time-range="formData.timeRange"
          :plan-id="id"
          :model="formData"
        />
        <EditPerson
          v-show="activeStep === 2"
          ref="editPerson"
          :plan-id="id"
          :model="formData"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import EditBasicInfo from './components/EditBasicInfo' // 基本信息
import EditCourse from './components/EditCourse' // 添加课程
import EditPerson from './components/EditPerson' // 人员信息
import {
  addPlan,
  updatePlan,
  planDetail,
  participantOrgs,
  participantPositions,
  participantUsers
} from '@/api/learnPlan'
import { mapGetters } from 'vuex'
import moment from 'moment'
const REFS_LIST = ['editBasicInfo', 'editCourse', 'editPerson']
const defaultFormData = {
  automaticIntegralCount: true,
  categoryId: null,
  categoryName: null,
  coursePlanName: '',
  coursePlanNo: '',
  endDate: '',
  endTime: '',
  sponsor: '',
  creatorName: '',
  createTime: null,
  startTime: '',
  participantsList: [],
  courseList: [],
  timeRange: [], // 时间范围
  groupPos: [], //机构
  groupIds: [],
  positionIds: [],
  orgIds: [],
  projectManagerId: '',
  knowledgeSystemId: '',
  score: '',
  coverUrl: '',
  // eslint-disable-next-line no-dupe-keys
  groupIds: []
}
export default {
  name: 'EditPlan',
  components: {
    EditBasicInfo,
    EditCourse,
    EditPerson
  },

  data() {
    return {
      loading: false,
      activeStep: 0,
      steps: [
        {
          label: '填写基本信息',
          icon: 'icon-approval-info-outlined'
        },
        {
          label: '添加课程',
          icon: 'icon-approval-form-outlined'
        },
        {
          label: '人员信息',
          icon: 'icon-approval-flow-outlined'
        }
      ],
      timer: null,
      formData: _.cloneDeep(defaultFormData)
    }
  },
  beforeRouteEnter(to, from, next) {
    let callback
    if (from.path !== '/examManagement/examSchedule/preview') {
      callback = (vm) => vm.init()
    }
    next(callback)
  },
  beforeRouteLeave(to, from, next) {
    // 离开时重置课程编辑数据
    if (to.path !== '/examManagement/examSchedule/preview') {
      this.activeStep = 0
      this.$refs.editCourse.reset()
    }
    next()
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    translateX() {
      return `translateX(${this.steps.findIndex((item, index) => index === this.activeStep) *
        100}%)`
    },
    ...mapGetters(['userInfo'])
  },
  provide() {
    return {
      parentObj: this
    }
  },
  watch: {
    'formData.timeRange': {
      handler(data) {
        this.$store.commit('SET_TRAIN_TIME', data)
      },
      deep: true
    }
  },
  methods: {
    init() {
      if (this.id) {
        this.getPlanDetail()
      } else {
        this.setupDefaultFields()
      }
    },
    setupDefaultFields() {
      this.formData = _.cloneDeep(defaultFormData)

      this.formData.creatorName = this.userInfo.nick_name
      this.formData.coursePlanNo =
        moment().format('YYYYMMDDHHmmss') + this.userInfo.user_id.slice(0, 2)
    },
    exit() {
      this.$confirm('离开此页面您的修改将会丢失, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$router.go(-1)
          this.resetData()
        })
        .catch(() => {})
    },
    handlePreviousStep() {
      this.activeStep = this.activeStep === 0 ? 0 : this.activeStep - 1
    },
    async changeStep(i) {
      if (i > this.activeStep) {
        let num = 0
        while (num < i) {
          await this.$refs[REFS_LIST[num]]
            .getData()
            .then(() => {
              this.activeStep = num + 1
              num++
            })
            .catch(() => {
              if (num === 0) {
                this.$message.error('请先完善基本信息')
              }
              if (num === 1) {
                this.$message.error('请先完善课程信息')
              }
              num = 5 //跳出循环
            })
        }
      } else {
        this.activeStep = i
      }
    },
    handleNextStep() {
      if (this.activeStep !== 2) {
        this.$refs[REFS_LIST[this.activeStep]]
          .getData()
          .then(() => {
            this.activeStep++
          })
          .catch(() => {
            if (this.activeStep === 1) {
              this.$message.error('请先完善课程信息')
            }
          })
      } else {
        this.activeStep = 0
      }
    },
    // 0-发布，1-草稿箱
    async handleSubmit(type) {
      let data = JSON.parse(JSON.stringify(this.formData))
      const participantsList = data.participantsList
      data.positionIds = data.positionIds.map((item) => item.positionId)
      data.orgIds = data.orgIds.map((item) => item.id)

      const studyPlanId = this.id
      data.participantsList = participantsList.map((item) => {
        return {
          department: item.orgName,
          departmentId: item.orgId ? (Array.isArray(item.orgId) ? item.orgId[0] : item.orgId) : '',
          name: item.bizName,
          phonenum: item.phoneNum,
          workNo: item.workNo,
          id: item.bizId,
          studyPlanId,
          userId: item.bizId
        }
      })
      data.startTime = _.get(data, 'timeRange[0]')
      data.endTime = _.get(data, 'timeRange[1]')
      data.type = type
      data.courseList = await this.$refs['editCourse'].getData()
      data.courseList.forEach((c) => {
        c.studyExam.forEach((s) => {
          s.integral = +s.integral
          s.publishTime = +s.publishTime
        })
      })
      let func
      if (this.id) {
        data.createTime = moment().format('yyyy-MM-DD HH:mm:ss')
        func = updatePlan
      } else {
        data.creatorId = this.userInfo.user_id
        data.creatorName = this.userInfo.nick_name
        data.phonenum = data.phoneNum
        data.createTime = moment().format('yyyy-MM-DD HH:mm:ss')
        func = addPlan
      }
      func(data)
        .then(() => {
          const tips = type === 1 ? '已发布草稿' : '已成功发布课程安排'
          this.$message.success(`${tips}，1秒后将自动返回课程安排列表`)
          this.activeStep = 0
          setTimeout(() => {
            this.activeStep = 0
            this.$router.push({ path: '/learnPlan/CoursePlanList' })
            this.resetData()
          }, 1000)
        })
        .catch()
    },
    resetData() {
      this.formData = _.cloneDeep(defaultFormData)
    },
    getPlanDetail() {
      this.loading = true
      // 获取学习计划详情
      planDetail({ id: this.id })
        .then((res) => {
          if (res.startTime && res.endTime) {
            res.timeRange = [res.startTime.replace(/\//g, '-'), res.endTime.replace(/\//g, '-')]
          } else {
            res.timeRange = []
          }
          //如果课程有时间，回显时间

          if (res.courseList.length > 0) {
            _.forEach(res.courseList, (x) => {
              if (x.startTime && x.endTime) {
                x.timeRange = [x.startTime, x.endTime]
              } else {
                x.timeRange = []
              }

              if (x.timeList.length > 0) {
                _.forEach(x.timeList, (y) => {
                  if (y.startTime && y.endTime) {
                    y.list = [y.startTime, y.endTime]
                  } else {
                    y.list = []
                  }
                })
              }
            })
          }
          this.getPersonData().then((data) => {
            let [orgIds = [], positionIds = [], participantsList = []] = data
            orgIds = orgIds.map((item) => {
              const { orgId, orgName, userNum } = item
              return {
                name: orgName,
                id: orgId,
                workNum: userNum
              }
            })
            positionIds = positionIds.map((item) => {
              const { positionId, positionName, userNum } = item
              return {
                positionName,
                positionId,
                workNum: userNum
              }
            })
            participantsList = participantsList.map((item) => {
              const { department, name, phonenum, userId, workNo, departmentId } = item
              return {
                bizName: name,
                bizId: userId,
                phoneNum: phonenum,
                orgId:[departmentId],
                positionName: department,
                workNo
              }
            })
            this.formData = Object.assign(res, { orgIds, positionIds, participantsList })
            this.$forceUpdate()
            this.headTeacherOptions = [
              {
                userId: res.projectManagerId,
                name: this.userInfo.nick_name
              }
            ]
          })
        })
        .catch()
        .finally(() => {
          this.loading = false
        })
    },
    getPersonData() {
      return Promise.all([
        participantOrgs({ studyPlanId: this.id }).then((data) => {
          return Promise.resolve(data)
        }),
        participantPositions({ studyPlanId: this.id }).then((data) => {
          return Promise.resolve(data)
        }),
        participantUsers({ studyPlanId: this.id }).then((data) => {
          return Promise.resolve(data)
        })
      ]).then((data) => {
        return Promise.resolve(data)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$header-height: 54px;
.page {
  width: 100vw;
  height: 100vh;
  padding: 0;
  padding-top: $header-height;
  box-sizing: border-box;

  .page__header {
    width: 100%;
    height: $header-height;
    justify-content: space-between;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    background: #fff;
    color: #757c85;
    font-size: 14px;
    position: fixed;
    top: 0;
    .page-actions {
      height: 100%;
      text-align: center;
      line-height: $header-height;

      > div {
        height: 100%;
        padding-left: 20px;
        padding-right: 20px;
        display: inline-block;
      }

      i {
        font-size: 22px;
        vertical-align: middle;
      }
    }

    .step-tab {
      display: flex;
      justify-content: space-between;
      height: 100%;
      position: relative;
      width: 50%;
      > .step {
        font-size: 16px;
        line-height: $header-height;
        text-align: center;
        cursor: pointer;
        position: relative;

        &.ghost-step {
          position: absolute;
          height: $header-height;
          left: 0;
          z-index: -1;
          /*background: #4483f2;*/
          background: #fff;
          transition: transform 0.5s;

          &::after {
            content: '';
            border-width: 6px 6px 6px;
            border-style: solid;
            border-color: transparent transparent white;
            position: absolute;
            bottom: 0;
            left: 50%;
            margin-left: -6px;
          }
        }

        &.active {
          font-size: 16px;
          color: #202940;
          border-bottom: 2px solid $primaryColor;
        }

        &.active > .step-index {
          background: white;
          color: #202940;
        }

        &.disable {
          opacity: 0.5;
        }

        > .step-index {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 1px solid #fff;
          border-radius: 8px;
          line-height: 18px;
          text-align: center;
          box-sizing: border-box;
        }
      }
    }
    .page-right {
      padding-right: 20px;
    }
  }
  .page__content {
    width: 100%;
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
    background: #f5f5f7;
    .page__content--inner {
      margin-top: 20px;
      padding-bottom: 10px;
    }
  }
}
</style>
