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
    </div>
    <pageHeader
      style="padding-left:32px"
      :title="`${$route.query.mode === 'phone' ? '手机' : '邮箱'}找回密码`"
      show-back
    />
    <basic-container block>
      <div class="getback-pw">
        <keep-alive>
          <div class="contens-wrapper">
            <div class="progress-bar">
              <el-steps
                align-center
                :active="step"
              >
                <el-step
                  title="验证身份"
                  :status="steps.firstStatus"
                />
                <el-step
                  title="修改密码"
                  :status="steps.secondStatus"
                />
                <el-step
                  title="完成"
                  :status="steps.finalStatus"
                />
              </el-steps>
            </div>

            <div
              v-if="step == 1"
              class="identity-test"
            >
              <div class="identity-title">
                请完成身份验证
              </div>

              <el-form
                ref="identity"
                :label-position="labelPosition"
                class="form-containner"
                status-icon
                :rules="identity.rules"
                :model="identity.form"
                label-width="0"
                size="medium"
              >
                <el-form-item
                  v-if="$route.query.mode === 'phone'"
                  label="手机号码"
                  prop="phone"
                >
                  <el-input
                    v-model="identity.form.phone"
                    class="phone-input"
                    autofocus="true"
                    size="small"
                    auto-complete="off"
                    placeholder="请输入手机号"
                    @focus="resetIdentityFields('phone')"
                  />
                </el-form-item>
                <el-form-item
                  v-if="$route.query.mode === 'email'"
                  label="邮箱"
                  prop="email"
                >
                  <el-input
                    v-model="identity.form.email"
                    class="phone-input"
                    autofocus="true"
                    size="small"
                    auto-complete="off"
                    placeholder="请输入邮箱"
                    @focus="resetIdentityFields('email')"
                  />
                </el-form-item>
                <el-form-item
                  label="图片验证码"
                  prop="captchaCode"
                >
                  <div style="display: flex">
                    <el-input
                      v-model="identity.form.captchaCode"
                      class="test-code-input"
                      size="small"
                      auto-complete="off"
                      placeholder="请输入图片验证码"
                      @focus="resetIdentityFields('captchaCode')"
                    />

                    <img
                      :src="identity.image"
                      class="login-code-img"
                      @click="refreshCode"
                    />
                  </div>
                </el-form-item>
                <el-form-item
                  :label="`${$route.query.mode === 'email' ? '邮箱' : '手机'}验证码`"
                  prop="code"
                >
                  <el-input
                    v-model="identity.form.code"
                    class="test-code-input"
                    size="small"
                    auto-complete="off"
                    :placeholder="`请输入${$route.query.mode === 'email' ? '邮箱' : '手机'}验证码`"
                    @focus="resetIdentityFields('code')"
                  />
                  <el-button
                    v-show="!identity.msgKey"
                    class="get-test-code"
                    size="medium"
                    @click="handleSend"
                  >
                    <span>获取验证码</span>
                  </el-button>
                  <el-button
                    v-show="identity.msgKey"
                    type="primary"
                    class="count-down-time"
                    size="medium"
                  >
                    {{ identity.msgText }}
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <div
              v-if="step == 2"
              class="reset-password"
            >
              <div class="resetPW-title">
                请完成密码设置
              </div>

              <el-form
                ref="password"
                :label-position="labelPosition"
                class="form-containner"
                status-icon
                :rules="password.rules"
                :model="password.form"
                label-width="0"
              >
                <el-form-item prop="newPW">
                  <div>
                    <span class="psw-label"> 新密码</span>
                    <span
                      class="psw-rule-tip"
                    >(密码包含字母，符号或数字中至少两项且长度超过6位的密码)</span>
                  </div>

                  <el-input
                    v-model="password.form.newPW"
                    class="newPW-input"
                    autofocus="true"
                    auto-complete="off"
                    :type="password.passwordType1"
                    @focus="resetPSWFields('newPW')"
                  >
                    <i
                      v-if="password.passwordType1 !== 'password'"
                      slot="suffix"
                      class="icon-basics-eyeopen-outlined eye-icon"
                      @click="() => (password.passwordType1 = 'password')"
                    />
                    <i
                      v-else
                      slot="suffix"
                      class="icon-basics-eyeblind-outlined eye-icon"
                      @click="() => (password.passwordType1 = 'text')"
                    />
                  </el-input>
                  <!-- <el-input
                    v-model="password.form.newPW"
                    class="newPW-input"
                    type="password"
                    autofocus="true"
                    show-password
                    auto-complete="off"
                    @focus="resetPSWFields('newPW')"
                  /> -->
                </el-form-item>

                <el-form-item
                  label="确认密码"
                  prop="surePW"
                >
                  <el-input
                    v-model="password.form.surePW"
                    class="surePW-input"
                    autofocus="true"
                    auto-complete="off"
                    :type="password.passwordType2"
                    @focus="resetPSWFields('surePW')"
                  >
                    <i
                      v-if="password.passwordType2 !== 'password'"
                      slot="suffix"
                      class="icon-basics-eyeopen-outlined eye-icon"
                      @click="() => (password.passwordType2 = 'password')"
                    />
                    <i
                      v-else
                      slot="suffix"
                      class="icon-basics-eyeblind-outlined eye-icon"
                      @click="() => (password.passwordType2 = 'text')"
                    />
                  </el-input>

                  <!-- <el-input
                    v-model="password.form.surePW"
                    class="surePW-input"
                    type="password"
                    autofocus="true"
                    show-password
                    auto-complete="off"
                    @focus="resetPSWFields('surePW')"
                  /> -->
                </el-form-item>
              </el-form>
            </div>

            <div
              v-if="step == 3"
              class="test-success"
            >
              <div class="success-icon">
                <i class="el-icon-success" />
              </div>
              <div class="success-text">
                <span>您的密码已修改完成</span>
              </div>
              <div class="back-login" />
            </div>

            <div
              v-if="step != 3"
              class="next-button"
            >
              <el-button
                type="primary"
                :disabled="btnDisabled"
                size="medium"
                @click="next"
              >
                {{ step === 2 ? '确认修改' : '下一步' }}
              </el-button>
            </div>
            <div
              v-if="step == 3"
              class="goback-containner"
            >
              <el-button
                type="primary"
                class="goback-login"
                size="medium"
                @click="gobackLogin"
              >
                <span>返回登录页面</span>
              </el-button>
            </div>
          </div>
        </keep-alive>
      </div>
    </basic-container>
  </div>
</template>

<script>
import { isMobile, validatePW } from '@/util/validate'
// import { isMobile, validatePW, isEmailReg } from '@/util/validate'
import { getCode, checkPhoneCode, checkPassword } from '@/api/personalInfo.js'
import md5 from 'js-md5'
import pageHeader from '@/components/page-header/pageHeader'
import { getCaptcha } from '@/api/user'
import { getStore } from '@/util/store'
export default {
  components: {
    pageHeader
  },
  data() {
    let _this = this
    const validatePhone = (rule, value, callback) => {
      if (!_this.identity.form.phone) {
        callback(new Error('请输入手机号码'))
      } else if (_this.identity.form.phone && !isMobile(value)) {
        callback(new Error('手机号码格式不正确'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (!_this.identity.form.email) {
        callback(new Error('请输入邮箱'))
      }
      //  else if (_this.identity.form.email && !isEmailReg(value)) {
      //   callback(new Error('邮箱格式不正确'))
      // }
      else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (!_this.identity.form.code) {
        callback(new Error('请输入六位验证码'))
      } else {
        callback()
      }
    }

    const validateNewPW = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码不能少于6个字符'))
      } else if (_this.password.form.newPW && value.indexOf(' ') !== -1) {
        callback(new Error('密码不能包含空格'))
      } else if (_this.password.form.newPW && !validatePW(value)) {
        callback(new Error('密码必须包含字母，符号或数字中至少两项'))
      } else {
        callback()
      }
    }

    const validateRepeatPW = (rule, value, callback) => {
      if (_this.password.form.surePW != _this.password.form.newPW) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    return {
      isOrgIdE: false,
      userId: '',
      step: 1,
      steps: {
        firstStatus: 'finish',
        secondStatus: 'wait',
        finalStatus: 'wait'
      },
      labelPosition: 'top',
      identity: {
        msgText: '',
        msgTime: '',
        msgKey: false,
        image: '',
        form: {
          captchaCode: '',
          captchaKey: '',
          phone: '',
          email: '',
          code: ''
        },
        rules: {
          phone: [
            {
              required: true,
              trigger: 'blur',
              validator: validatePhone
            }
          ],
          code: [
            {
              required: true,
              trigger: 'blur',
              validator: validateCode
            }
          ],
          captchaCode: [{ required: true, message: '请输入图片验证码', trigger: 'blur' }],
          email: [
            { required: true, validator: validateEmail, trigger: 'blur' },
            { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
          ]
        }
      },

      password: {
        passwordType1: 'password',
        passwordType2: 'password',
        form: {
          newPW: '',
          surePW: ''
        },
        rules: {
          newPW: [
            {
              required: true,
              trigger: 'blur',
              message: '请输入新密码'
            },
            {
              required: true,
              trigger: 'blur',
              validator: validateNewPW
            }
          ],
          surePW: [
            {
              required: true,
              trigger: 'blur',
              message: '请再次输入密码'
            },
            {
              required: true,
              trigger: 'blur',
              validator: validateRepeatPW
            }
          ]
        }
      }
    }
  },
  computed: {
    envVar() {
      let envC = process.env
      return envC.VUE_APP_ENV
    },
    btnDisabled() {
      let disabled = false
      if (this.step === 2) {
        const form = this.password.form
        for (const field in form) {
          if (_.isEmpty(form[field])) {
            return true
          }
        }
      }
      return disabled
    },
    config() {
      return {
        MSGINIT: '发送验证码',
        MSGSCUCCESS: '秒后重发',
        MSGTIME: 60
      }
    }
  },
  created() {
    this.refreshCode()
    this.identity.msgText = this.config.MSGINIT
    this.identity.msgTime = this.config.MSGTIME
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
    refreshCode() {
      getCaptcha().then((res) => {
        this.identity.form.captchaKey = res.key
        this.identity.image = res.image
      })
    },
    resetIdentityFields(name) {
      this.$refs['identity'].clearValidate([name])
    },
    resetPSWFields(name) {
      this.$refs['password'].clearValidate([name])
    },
    gobackLogin() {
      this.$router.push({ path: '/login' })
    },
    next() {
      if (this.step == 1) {
        this.$refs['identity'].validate((isPass) => {
          if (isPass) {
            //验证手机验证码
            let params = {
              phonenum: this.identity.form.phone,
              smsCode: this.identity.form.code,
              email: this.identity.form.email,
              captchaCode: this.identity.form.captchaCode,
              captchaKey: this.identity.form.captchaKey
            }
            checkPhoneCode(params).then((res) => {
              this.userId = res.userId
              this.step++
              this.steps.firstStatus = 'success'
              this.steps.secondStatus = 'finish'
            })
          }
        })
      } else if (this.step == 2) {
        this.$refs['password'].validate((isPass) => {
          if (isPass && this.password.form.surePW == this.password.form.newPW) {
            let newpsw = this.password.form.newPW
            let params = {
              userId: this.userId,
              newPassword: md5(newpsw),
              oldPassword: '',
              phonenum: this.identity.form.phone,
              smsCode: this.identity.form.code,
              email: this.identity.form.email
            }
            checkPassword(params).then(() => {
              this.step++
              this.steps.secondStatus = 'success'
              this.steps.finalStatus = 'success'
            })
          }
        })
      }
    },

    handleSend() {
      if (this.identity.msgKey) return
      let checkCode = this.$route.query.mode === 'email' ? 'email' : 'phone'
      this.$refs['identity'].validateField(checkCode, (errorMsg) => {
        if (!errorMsg) {
          //1.发送获取验证码的网络请求
          let params = {
            phonenum: this.identity.form.phone,
            email: this.identity.form.email
          }

          this.msgText = this.identity.msgTime + this.config.MSGSCUCCESS
          this.identity.msgKey = true
          const time = setInterval(() => {
            this.identity.msgTime--
            this.identity.msgText = this.identity.msgTime + this.config.MSGSCUCCESS
            if (this.identity.msgTime === 0) {
              this.identity.msgTime = this.config.MSGTIME
              this.identity.msgText = this.config.MSGINIT
              this.identity.msgKey = false
              clearInterval(time)
            }
          }, 1000)

          getCode(params)
            .then(() => {
              this.$message.success('验证码发送成功，请注意查收')
            })
            .catch(() => {
              clearInterval(time)
              this.identity.msgKey = false
            })
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
.brad-part {
  position: absolute;
  height: 68px;
  top: 0;
  left: 32px;
  font-family: 'PingFangSC-Semibold';
  font-size: 18px;
  color: #545b66;
  line-height: 68px;
}
.login-code-img {
  width: 100px;
  height: 34px;
  margin-right: 4px;
  background-color: #fdfdfd;
  border: 1px solid #f0f0f0;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 5px;
  line-height: 38px;
  text-indent: 5px;
  text-align: center;
  cursor: pointer !important;
}

.contens-wrapper {
  width: 40%;
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  padding-top: 78px;
}
.progress-bar {
  /deep/ .el-step__icon {
    width: 32px !important;
    height: 32px !important;
  }
}
.identity-test,
.reset-password {
  width: 78%;
  position: relative;
  left: 50%;
  -webkit-transform: translate(-50%, 0);
  transform: translate(-50%, 0);
  padding-top: 78px;
}

.identity-test .identity-title,
.reset-password .resetPW-title {
  font-family: 'PingFangSC-Regular';
  font-size: 14px;
  color: #202940;
  line-height: 14px;
  margin-bottom: 24px;
}
.identity-test .test-code-input {
  width: calc(100% - 117px);
  margin-right: 16px;
}
.form-containner {
  /deep/ .el-input__inner {
    height: 34px !important;
    line-height: 34px !important;
  }
}

.get-test-code,
.count-down-time {
  height: 34px !important;
  line-height: 34px !important;
}
.get-test-code,
.count-down-time {
  width: 100px;
  padding: 0 !important;
  font-size: 14px;
}
.get-test-code {
  color: $primaryColor;
  border: 1px solid $primaryColor;
  vertical-align: middle;
}
.count-down-time {
  width: 100px;
  color: #fff;
  background: #cecece;
}

.form-containner .el-form-item {
  margin-bottom: 16px;
}
.form-containner .el-form-item__label {
  height: 45px;
  line-height: 45px;
  padding: 0 !important;
}
.next-button {
  width: 78%;
  position: relative;
  left: 50%;
  transform: translate(-50%, 0);
  top: 24px;
}
.el-button + .el-button {
  margin-left: 0;
}
.success-icon {
  height: 72px;
  text-align: center;
  margin-top: 68px;
}
.success-icon .el-icon-success {
  color: #53c962;
  font-size: 80px;
}
.success-text {
  height: 32px;
  font-family: 'PingFangSC-Medium';
  font-size: 24px;
  color: rgba(0, 0, 0, 0.85);
  line-height: 32px;
  text-align: center;
  margin-top: 40px;
}
.goback-login {
  background: $primaryColor;
  border-radius: 4px;
  border-radius: 4px;
  width: 136px;
  height: 42px;
  margin: 0 auto;
  color: #ffffff;
}
.goback-containner {
  text-align: center;
  margin-top: 40px;
}
.psw-label {
  font-size: 14px;
  color: #606266;
  line-height: 80px;
  margin-right: 5px;
}
.psw-label:before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
.psw-rule-tip {
  font-size: 12px;
  color: #a0a8ae;
}
</style>
