<template>
  <div
    v-loading="loading"
    class="fill"
  >
    <page-header
      title="离职事项详情"
      show-back
    />
    <basic-container block>
      <div class="header">
        <div class="name-row">
          <div class="name-box">
            {{ personData.userName }} 的离职交接事项
          </div>
          <div
            v-if="!isFinish"
            class="btn-box"
          >
            <el-button
              size="medium"
              @click="urgeleaveNote"
            >
              催办
            </el-button>
          </div>
        </div>
        <div class="info-row">
          <div>
            发起人: <span>{{ personData.userName }}</span>
          </div>
          <div>
            发起时间: <span>{{ personData.createTime }}</span>
          </div>
          <div>
            状态:
            <span class="status-box">{{ isFinish ? '已确认' : '待确认' }}</span>
          </div>
        </div>
      </div>
      <div class="main-wrap">
        <div class="tips-row">
          您的离职申请已通过，请在离职前尽快与相关部门办理以下离职交接事项：
        </div>
        <div
          v-for="group in groupList"
          :key="group.groupId"
        >
          <div>{{ group.groupName }}</div>
          <div
            v-for="(item, index) in group"
            :key="index"
          >
            <div
              v-for="category in item"
              :key="category.categoryId"
              class="category-box"
            >
              <div class="categoryName-row">
                {{ category.categoryName }}
              </div>
              <div
                v-for="detail in category.details"
                :key="detail.detailId"
                class="detail-box"
              >
                {{ detail.detailName }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </basic-container>
  </div>
</template>

<script>
import { checkTime } from './common'
import { getLeaveNote, postUrgeleaveNote } from '@/api/todo/todo'
import { mapGetters } from 'vuex'
export default {
  name: 'LeaveListUser',
  data() {
    return {
      loading: false,
      leaveUserId: '',
      groupId: '',
      personData: {},
      groupList: [],
      isFinish: true,
      // 催促时间
      urgeTime: ''
    }
  },
  computed: {
    ...mapGetters(['userId'])
  },
  created() {
    this.loadingData()
  },
  methods: {
    loadingData() {
      this.loading = true
      this.leaveUserId = this.$route.query.leaveUserId
      let params = {
        userId: this.userId,
        leaveUserId: this.leaveUserId
      }
      getLeaveNote(params)
        .then((res) => {
          let { userName, workNo, createTime, data } = res
          this.personData = {
            userName,
            workNo,
            createTime
          }
          this.groupList = data
          this.urgeTime = data[0].urgeTime
          data.forEach((item) => {
            if (item.status === 'UnConfirm') {
              this.isFinish = false
            }
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 催办
    async urgeleaveNote() {
      if (checkTime(this.urgeTime)) {
        return this.$message.info('今天已经催办过了')
      }
      await postUrgeleaveNote({
        groupId: '',
        userId: this.userId,
        type: 'C2B'
      })
      this.$message.success('催办成功')
      this.loadingData()
    }
  }
}
</script>

<style lang="scss" scoped>
.basic-container--block {
  height: calc(100% - 92px);
  min-height: calc(100% - 92px);
}

// 头部
.header {
  border-bottom: 1px solid #e3e7e9;
  .name-row {
    display: flex;
    justify-content: space-between;
    .name-box {
      font-family: PingFangSC-Medium;
      font-size: 18px;
      color: #202940;
      line-height: 23px;
      font-weight: bold;
    }
  }
  .info-row {
    margin: 16px 0 30px 0;
    display: flex;
    justify-content: flex-start;
    line-height: 14px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #202940;
    div {
      margin-right: 48px;
      span {
        margin-left: 20px;
      }
    }
  }
}
// 主要内容区
// 主要内容区
.main-wrap {
  margin-top: 30px;
  margin-left: 20px;
  .tips-row {
    font-size: 14px;
    color: #0e001c;
    line-height: 20px;

    margin-bottom: 16px;
  }

  .category-box {
    margin-left: 20px;
    .categoryName-row {
      font-size: 14px;
      color: #202940;
      font-weight: bold;

      margin-bottom: 16px;
    }
    .detail-box {
      font-size: 14px;
      color: #718199;

      margin-bottom: 16px;
    }
  }
}
</style>
