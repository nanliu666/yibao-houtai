<template>
  <el-form
    ref="loginForm"
    class="login-form"
    status-icon
    :rules="loginRules"
    :model="loginForm"
    label-width="0"
  >
    <el-form-item prop="phone">
      <el-input
        v-model="loginForm.phone"
        size="small"
        auto-complete="off"
        placeholder="请输入手机号"
        @keyup.enter.native="handleLogin"
      >
        <i
          slot="prefix"
          class="icon-shouji"
        />
      </el-input>
    </el-form-item>
    <el-form-item prop="code">
      <el-input
        v-model="loginForm.code"
        size="small"
        auto-complete="off"
        placeholder="请输入验证码"
        @keyup.enter.native="handleLogin"
      >
        <i
          slot="prefix"
          class="icon-yanzhengma"
          style="margin-top:6px;"
        />
        <template slot="append">
          <span
            class="msg-text"
            :class="[{ display: msgKey }]"
            @click="handleSend"
          >{{
            msgText
          }}</span>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-button
        size="small"
        type="primary"
        class="login-submit"
        @click.native.prevent="handleLogin"
      >
        登录
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { isvalidatemobile } from '@/util/validate'
import { mapGetters } from 'vuex'
export default {
  name: 'Codelogin',
  props: [],
  data() {
    const validatePhone = (rule, value, callback) => {
      if (isvalidatemobile(value)[0]) {
        callback(new Error(isvalidatemobile(value)[1]))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (value.length !== 4) {
        callback(new Error('请输入4位数的验证码'))
      } else {
        callback()
      }
    }
    return {
      msgText: '',
      msgTime: '',
      msgKey: false,
      loginForm: {
        phone: '',
        code: ''
      },
      loginRules: {
        phone: [{ required: true, trigger: 'blur', validator: validatePhone }],
        code: [{ required: true, trigger: 'blur', validator: validateCode }]
      }
    }
  },
  computed: {
    ...mapGetters(['tagWel']),
    config() {
      return {
        MSGINIT: '发送验证码',
        MSGSCUCCESS: '秒后重发',
        MSGTIME: 60
      }
    }
  },
  created() {
    this.msgText = this.config.MSGINIT
    this.msgTime = this.config.MSGTIME
  },
  mounted() {},

  methods: {
    handleSend() {
      if (this.msgKey) return
      this.msgText = this.msgTime + this.config.MSGSCUCCESS
      const time = setInterval(() => {
        this.msgKey = true
        this.msgTime--
        this.msgText = this.msgTime + this.config.MSGSCUCCESS
        if (this.msgTime === 0) {
          this.msgTime = this.config.MSGTIME
          this.msgText = this.config.MSGINIT
          this.msgKey = false
          clearInterval(time)
        }
      }, 1000)
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$store.dispatch('LoginByPhone', this.loginForm).then(() => {
            this.$router.push({ path: this.tagWel.value })
          })
        }
      })
    }
  }
}
</script>

<style>
.msg-text {
  display: block;
  width: 60px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
}
.msg-text.display {
  color: #ccc;
}
</style>
