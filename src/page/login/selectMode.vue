<template>
  <div class="fill page">
    <div class="logo">
      <img
        v-if="envVar === 'zehui' && isOrgIdE"
        src="../../assets/images/logoE.png"
      />
      <img
        v-else-if="envVar === 'xugong'"
        src="../../assets/images/logo.png"
      />
      <img
        v-else-if="envVar === 'zehui'"
        src="../../assets/images/logoZeHui.png"
      />
      <img
        v-else
        src="../../assets/images/logo_yb.png"
      />
      <!-- <img src="../../assets/images/logo.png" /> -->
    </div>
    <page-header
      style="padding-left:32px"
      :title="'选择密码找回方式'"
      show-back
    />
    <basic-container block>
      <div class="select-mode-style">
        <div class="select-mode">
          <div class="page-des">
            你可以通过员工账号绑定的手机或者邮箱找回密码：
          </div>
          <el-radio
            v-model="mode"
            class="select-radio"
            label="phone"
          >
            通过手机找回
          </el-radio>
          <el-radio
            v-model="mode"
            label="email"
          >
            通过邮箱找回
          </el-radio>
          <div>
            <el-button
              class="bt"
              type="primary"
              size="medium"
              @click="forgetPW"
            >
              下一步
            </el-button>
          </div>
        </div>
      </div>
    </basic-container>
  </div>
</template>

<script>
import { getStore } from '@/util/store'
export default {
  components: {},
  data() {
    return {
      mode: 'phone',
      isOrgIdE: false
    }
  },
  computed: {
    envVar() {
      let envC = process.env
      return envC.VUE_APP_ENV
    }
    // orgId() {
    //   let userInfo = getStore({ name: 'userInfo' })
    //   return userInfo.org_id
    // }
  },
  mounted() {
    this.isOrgIdEFn()
  },
  methods: {
    isOrgIdEFn() {
      // 判断是否是挖机组织
      // 获取用户的组织id（包括当前和当前以上的），存放在localstore，vuex
      let orgIdsVuex = this.orgIds
      this.orgIdsD = orgIdsVuex || getStore({ name: 'orgIds' })
      this.isOrgIdE = this.orgIdsD.indexOf('5263') !== -1 ? true : false
    },
    forgetPW() {
      this.$router.push({
        path: '/getBackPW',
        query: {
          mode: this.mode
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
  height: 56px;
  background: #fff;
  display: flex;
  align-items: center;
  padding-left: 32px;
}
.page {
  background-color: #f2f5f7;
}
.basic-container--block {
  margin: 0 32px;
  height: calc(100% - 68px - 56px - 24px);
  min-height: calc(100% - 68px - 56px - 24px);
}
.select-mode-style {
  position: relative;
  .select-mode {
    width: 400px;
    margin: 0 auto;
    padding-top: 40px;
    display: flex;
    flex-direction: column;
    font-size: 16px;
    .select-radio {
      margin-bottom: 24px;
    }
    /deep/ .el-radio__label {
      font-size: 16px;
    }
    .page-des {
      color: #202940;
      margin-bottom: 24px;
    }
    .bt {
      margin-top: 24px;
    }
  }
}
</style>
