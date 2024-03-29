<template>
  <div class="workArea-wrap">
    <!-- 代办事项 -->
    <el-card
      v-loading="todoLoading"
      class="todolist-wrap"
    >
      <tagCom
        v-model="toDoActiveName"
        title="待办事项"
        :label-array="toDoList"
        class="todolist"
        @click="goTodoCenter"
      >
        <!-- 待处理 -->
        <div
          v-if="toDoActiveName === 'Pending'"
          slot="Pending"
        >
          <el-tooltip
            v-for="(item, index) in toDoListData"
            :key="index"
            class="item-row"
            :open-delay="500"
            :enterable="false"
            :content="item.title"
            placement="top"
          >
            <div>
              <div class="text-box">
                <p @click="jumpToDetail(item)">
                  【{{ item.type | filterType }}】{{ item.title }}
                </p>
                <span v-if="ifShowWarn(item)">滞留{{ getWarnText(item) }}天</span>
              </div>
              <div class="time-box">
                {{ item.createTime | filterDate }}
              </div>
            </div>
          </el-tooltip>
        </div>
        <div
          v-else
          slot="Pending"
        >
          <div class="placeholder-box">
            您当前没有待办事项，前往
            <el-button
              type="text"
              size="medium"
              @click="goTodoCenter"
            >
              代办中心
            </el-button>
          </div>
        </div>
        <!-- 预警 -->
        <div
          v-if="toDoActiveName === 'Warning'"
          slot="Warning"
        >
          <el-tooltip
            v-for="(item, index) in warningList"
            :key="index"
            class="item-row"
            :open-delay="500"
            :enterable="false"
            :content="item.title"
            placement="top"
          >
            <div>
              <div class="text-box">
                <p @click="jumpToDetail(item)">
                  【{{ item.type | filterType }}】{{ item.title }}
                </p>
                <span v-if="ifShowWarn(item)">滞留{{ getWarnText(item) }}天</span>
              </div>
              <div class="time-box">
                {{ item.createTime | filterDate }}
              </div>
            </div>
          </el-tooltip>
        </div>
        <div
          v-else
          slot="Warning"
        >
          <div class="placeholder-box">
            您当前没有待办事项，前往
            <el-button
              type="text"
              size="medium"
              @click="goTodoCenter"
            >
              代办中心
            </el-button>
          </div>
        </div>
      </tagCom>
    </el-card>
    <!-- 消息通知 -->
    <el-card
      v-loading="warnLoading"
      class="news-wrap"
    >
      <tagCom
        v-model="newActiveName"
        title="消息通知"
        :label-array="newList"
        class="new"
      >
        <div
          v-if="msgWorkList.length"
          slot="workNews"
        >
          <el-tooltip
            v-for="(item, index) in msgWorkList"
            :key="index"
            :open-delay="500"
            :enterable="false"
            :content="item.content"
            placement="top"
          >
            <div
              class="item-row new-item-tips"
              :class="item.isRead === 0 ? 'new-item-tips' : 'new-item'"
              @click="handelRead(item)"
            >
              <div class="detail">
                <div
                  v-if="item.isRead === 0"
                  class="icon"
                  :class="item.isRead === 0 ? '' : 'no-read'"
                />
                {{ item.content }}
              </div>
              <div class="time">
                {{ item.createTime | filterDate }}
              </div>
            </div>
          </el-tooltip>
        </div>
        <div
          v-else
          slot="workNews"
        >
          <div class="no-msg-box">
            暂时没有工作消息通知
          </div>
        </div>
        <div
          v-if="msgSystemList.length"
          slot="systemNews"
        >
          <el-tooltip
            v-for="(item, index) in msgSystemList"
            :key="index"
            :open-delay="500"
            :enterable="false"
            effect="dark"
            :content="item.content"
            placement="top"
          >
            <div @click="handelRead(item)">
              <div
                class="item-row new-item-tips"
                :class="item.isRead === 0 ? 'new-item-tips' : 'new-item'"
              >
                <div class="detail">
                  <div
                    v-if="item.isRead === 0"
                    class="icon"
                    :class="item.isRead === 0 ? '' : 'no-read'"
                  />
                  {{ item.content }}
                </div>
                <div class="time">
                  {{ item.createTime | filterDate }}
                </div>
              </div>
            </div>
          </el-tooltip>
        </div>
        <div
          v-else
          slot="systemNews"
        >
          <div class="no-msg-box">
            暂时没有工作消息通知
          </div>
        </div>
      </tagCom>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment'
import { todoTypeCN } from '@/const/todo'
import { getTodoList } from '@/api/todo/todo'
import { getMsgList, creatSignReadMsg } from '@/api/msg/msg'
import tagCom from './components/tagCom'
import { mapGetters } from 'vuex'
export default {
  name: 'MainContent',
  components: {
    tagCom
  },
  filters: {
    filterType(value) {
      if (!value) return
      return todoTypeCN[value]
    },
    filterDate(createTime) {
      if (!createTime) return
      let m = moment(createTime)
      let now = moment()
      if (m.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) {
        return m.format('HH:mm')
      } else if (m.format('YYYY-MM-DD') === now.subtract(1, 'days').format('YYYY-MM-DD')) {
        return `昨天 ${m.format('HH:mm')}`
      } else if (m.get('year') === now.get('year')) {
        return m.format('MM-DD HH:mm')
      } else {
        return m.format('YYYY-MM-DD HH:mm')
      }
    }
  },
  data() {
    return {
      // 代办事项
      toDoList: [
        {
          label: '待处理',
          name: 'Pending'
        },
        {
          label: '预警',
          name: 'Warning'
        }
      ],
      toDoActiveName: 'Pending',
      // 请求参数
      todoQuery: {
        userId: this.userId,
        pageNo: 1,
        pageSize: 6,
        isWarn: '',
        status: 'UnFinished'
      },
      // 列表数据
      toDoListData: [],
      warningList: [],
      todoLoading: false,
      // 消息通知
      newList: [
        {
          label: '工作消息',
          name: 'workNews'
        },
        {
          label: '系统消息',
          name: 'systemNews'
        }
      ],
      newActiveName: 'workNews',
      workMsgQuery: {
        pageNo: '1',
        pageSize: 6,
        userId: '',
        type: 'Work',
        isRead: null
      },
      systemMsgQuery: {
        pageNo: '1',
        pageSize: '10',
        userId: '',
        type: 'System',
        isRead: null
      },
      msgWorkList: [],
      msgSystemList: [],
      warnLoading: false
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  created() {
    this.loadingToDoData()
    this.loadingMsgData()
  },
  methods: {
    getTodoListFun() {
      getTodoList(this.todoQuery).then((res) => {
        let { data, totalNum } = res
        this.toDoListData = data
        this.toDoList[0].label = `待处理(${totalNum})`
      })
    },
    getWarnList() {
      let params = _.assign(this.todoQuery, { isWarn: 1 })
      getTodoList(params).then((res) => {
        let { data, totalNum } = res
        this.warningList = data
        this.toDoList[1].label = `预警(${totalNum})`
        this.todoLoading = false
      })
    },
    // 获取todoData
    loadingToDoData() {
      this.todoQuery.userId = this.userId
      this.todoLoading = true
      this.getTodoListFun()
      setTimeout(() => {
        this.getWarnList()
      }, 1)
    },
    // 处理滞留按钮
    ifShowWarn(row) {
      return (
        row.status === 'UnFinished' &&
        moment()
          .startOf('day')
          .diff(moment(row.endDate)) > 0
      )
    },
    getWarnText(row) {
      return moment().diff(moment(row.endDate), 'days')
    },
    // 点击查看代办事项全部，跳到代办中心
    goTodoCenter() {
      // Pending  isWarn参数为空  Warning isWarn参数为1
      let isWarn = null
      if (this.toDoActiveName === 'Warning') {
        isWarn = 1
      }
      this.$router.push({
        path: '/todo/todoList',
        query: {
          status: 'UnFinished',
          isWarn
        }
      })
    },
    // 跳去详情
    jumpToDetail({ type, bizId, bizId2 }) {
      if (type === 'Interview') {
        // 面试
        this.$router.push({
          path: '/todo/interviewDetail',
          query: { id: bizId }
        })
      } else if (type === 'Approve') {
        // 审批
        this.$router.push({
          path: '/apprProcess/apprDetail',
          query: {
            apprNo: bizId,
            toDoList: true
          }
        })
      } else if (type === 'Recruitment') {
        // 招聘
        this.$router.push({
          path: '/personnel/recruit/details',
          query: {
            id: bizId
          }
        })
      } else if (type === 'ResumeReview') {
        // 简历审核
        this.$router.push({
          path: '/todo/resumeReview',
          query: {
            id: bizId
          }
        })
      } else if (type === 'LeaveListOrg') {
        // 离职事项（部门）
        this.$router.push({
          path: '/todo/leaveListOrg',
          query: {
            leaveUserId: bizId,
            groupId: bizId2
          }
        })
      } else if (type === 'LeaveListUser') {
        // 离职事项（员工）
        this.$router.push({
          path: '/todo/LeaveListUser',
          query: {
            leaveUserId: bizId
          }
        })
      } else if (type === 'InterviewRegister') {
        // 面试登记表
        this.$router.push({
          path: '/personnel/candidate/registrationForm',
          query: {
            personId: bizId,
            recruitmentId: bizId2,
            isInterview: 1
          }
        })
      } else if (type === 'Entry') {
        // 入职办理
        // this.$router.push(`/personnel/entry/entryPersonDetail?applyId=${bizId}`)
        this.$router.push({
          path: '/personnel/entry/entryPersonDetail',
          query: {
            applyId: bizId2,
            personId: bizId
          }
        })
      } else if (type === 'EntryRegister') {
        // 入职登记表
        this.$router.push({
          path: '/personnel/candidate/registrationForm',
          query: {
            personId: bizId,
            recruitmentId: bizId2,
            entry: 1,
            tagName: '入职登记表详情',
            isUser: 1
          }
        })
      }
    },
    async loadingMsgData() {
      try {
        this.warnLoading = true
        this.workMsgQuery.userId = this.userId
        this.systemMsgQuery.userId = this.userId
        let workRes = await getMsgList(this.workMsgQuery)
        this.newList[0].label = `工作消息(${workRes.totalNum})`
        this.msgWorkList = workRes.data
        this.msgWorkList.sort((a, b) => {
          return a.isRead - b.isRead
        })
        let systemRes = await getMsgList(this.systemMsgQuery)
        this.msgSystemList = systemRes.data
        this.newList[1].label = `系统消息(${systemRes.totalNum})`
        this.msgSystemList.sort((a, b) => {
          return a.isRead - b.isRead
        })
        this.warnLoading = false
      } catch (error) {
        this.warnLoading = false
      }
    },
    // 确定已读信息
    async handelRead({ id, isRead }) {
      if (isRead === 1) {
        return
      }
      try {
        let params = {
          id,
          userId: this.userId
        }
        await creatSignReadMsg(params)
        this.loadingMsgData()
        // this.$message.success('标记已读成功')
      } catch (error) {
        if (error !== 'cancel') {
          throw error
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 代办事项
.workArea-wrap {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  /deep/.el-tabs__item {
    font-size: 16px;
    color: #757c85;
    height: 22px;
    line-height: 22px;
    margin-bottom: 8px;
  }

  /deep/.el-tabs__item:hover {
    font-size: 16px;
    color: #73b9ff;
  }
  /deep/.el-tabs__item:active {
    font-size: 16px;
    color: #115fd4;
  }
  /deep/.is-active {
    font-size: 16px;
    color: #202940;
    font-weight: 600;
  }
  /deep/.el-tabs__content {
    min-height: 215px;
  }
}

.todolist-wrap {
  width: calc(50% - 8px);
  box-shadow: 0px 8px 24px 4px rgba(0, 0, 0, 0.05), 0px 4px 16px 0px rgba(0, 0, 0, 0.03),
    0px 2px 5px -4px rgba(0, 0, 0, 0.08);
  height: 375px;
  background: #ffffff;
  position: relative;
  overflow-y: hidden;
  .view-all {
    position: absolute;
    bottom: 12px;
    left: 24px;
  }
  // 没有代办数据时显示
  .placeholder-box {
    width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    text-align: center;
    transform: translate(-50%, -50%);
  }
  .item-row {
    display: flex;
    justify-content: space-between;
    border-bottom: solid 1px #eeeeee;
    height: 42px;
    &:last-child {
      border-bottom: 0px;
    }
    .text-box {
      display: flex;
      justify-self: start;
      align-items: center;
      width: 70%;
      margin-right: 12px;
      p {
        cursor: pointer;

        font-size: 14px;
        color: #13141a;
        line-height: 43px;
        height: 43px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 0 16px 0 0px;
      }
      span {
        display: flex;
        align-items: center;
        min-width: 63px;
        justify-content: center;
        background: #ff8b8a;
        border-radius: 4px;
        color: #ffffff;
        width: 63px;
        height: 26px;
      }
    }

    .time-box {
      vertical-align: text-bottom;
      font-family: ArialMT;
      font-size: 14px;
      color: #718199;
      line-height: 43px;
      min-width: 80px;
    }
  }
}

// 消息中心
.news-wrap {
  width: calc(50% - 8px);
  box-shadow: 0px 8px 24px 4px rgba(0, 0, 0, 0.05), 0px 4px 16px 0px rgba(0, 0, 0, 0.03),
    0px 2px 5px -4px rgba(0, 0, 0, 0.08);
  height: 375px;
  background: #ffffff;
  overflow-y: auto;
  position: relative;
  .item-row {
    &:last-child {
      border-bottom: 0px;
    }
  }
  .view-all {
    position: absolute;
    bottom: 12px;
    left: 24px;
  }
  .time {
    margin-left: 24px;
    font-size: 14px;
    font-family: ArialMT;
    line-height: 43px;
    display: inline-block;
    min-width: 80px;
  }
  .detail {
    font-size: 14px;
    line-height: 43px;
    display: inline-block;
    text-align: start;
    width: 70%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .new-item-tips {
    border-bottom: solid 1px #eeeeee;
    .detail {
      color: #202940;
      .icon {
        margin-right: 8px;
        width: 6px;
        height: 6px;
        border-radius: 100%;
        background: #ff6464 100%;
        display: inline-block;
        vertical-align: middle;
      }
    }
    .time {
      color: #000000;
    }
  }
  .new-item {
    border-bottom: solid 1px #eeeeee;
    .detail {
      color: #a0a8ae;
      .no-read {
        background: #ffffff 100%;
      }
    }
    .time {
      color: #718199;
    }
  }
  .item-row {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    border-bottom: solid 1px #eeeeee;
    height: 42px;
  }
  .no-msg-box {
    text-align: center;
    line-height: 215px;
  }
}
</style>
