<template>
  <div class="question-import fill">
    <page-header
      show-back
      title="题库导入"
    />
    <basic-container block>
      <div
        v-if="step === '0'"
        class="import-step"
      >
        <div class="section tip">
          <div class="left ">
            <p class="title">
              1.下载导入模板
            </p>
            <p class="tips">
              请先下载导入模版并按照模板填写后再上传。
            </p>
            <a
              target="_blank"
              download="题库导入模板.xsl"
              :href="templateLink"
            >
              <el-button
                size="medium"
              ><i
                class="iconimage_icon_download iconfont"
                style="margin-right: 10px"
              ></i>下载导入模板</el-button>
            </a>
          </div>
          <!-- <div class="right item">
            <div style="text-align:center">
              注意事项
            </div>
            <div>
              <span>填空题:</span>
              题目中三个英文状态下的下划线（shift+英文下三个下划线）为一个空格，多个以英文逗号分隔，例如：中国四大名著：___,___,___,___。多个答案以英文|分隔，例如：西游记|水浒传|红楼梦|三国演义。填空题正确答案可为空，因填空题需要人工评分允许不填，不填则评卷人无参考答案。
            </div>
            <div>
              <span>多选题:</span>
              多个答案以英文逗号分隔，例如：考试积分,培训积分。不能填写字母A,B代替答案。
            </div>
            <div>
              <span>简单题:</span>
              简答题的答案（分析）写到“试题分析”栏，正确答案栏为空，试题分析可不填，不填则评卷人无参考答案。
            </div>
            <div>
              <span>判断题:</span>
              可选答案和正确答案用字为：正确或错误，例如答案为：正确。
            </div>
            <div>
              <span>单选题:</span>
              至少要选择一个答案，例如答案为选项A:三国演义，在正确答案处填写：三国演义，不能填写字母A代替答案。多选题同理。
            </div>
            <div>
              <span> 题型分类:</span>
              多层级分类以英文逗号分隔，例如：消防安全/人力资源部/HR招聘
              。另注意：在批量导入前先在培训系统建好该试题分类和层级关系。
            </div>
            <div>
              <span>必填项注意:</span>
              试题类型、试题内容为所有题型必填，选项（单选、多选、判断题必填，其他类型选填）、正确答案（单选、多选、判断题必填，其他类型选填，填空题答案可为空，因为需要人工评卷，有则评卷人可参考）。其他项为选填。
            </div>
            <div>
              <span>试题分数:</span>
              试题分数选填，试题不录入分数，在组卷时需要人工设置每题分数。
            </div>
            <div>
              每个试题类型样式可参考导入模板的示例。
            </div>
          </div> -->
        </div>

        <div class="section">
          <p class="title">
            2.上传填好的表格
          </p>
          <p>
            <span class="tips">支持文件类型：xls。 </span>
            <br />
            <span class="tips"> 一次至多导入500条信息，超出信息将不予以导入。</span>
          </p>
          <el-upload
            ref="uploader"
            class="uploader"
            drag
            action=""
            :file-list.sync="uploadList"
            :limit="1"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            :http-request="httpRequest"
            :on-change="onChange"
            :before-remove="removeFile"
            :auto-upload="false"
          >
            <i class="iconimage_icon_Uploadcoursecontent1 iconfont icon-upload"></i>
            <div class="el-upload__text">
              点击或将文件拖拽到这里上传
            </div>
          </el-upload>
        </div>
        <div class="footer">
          <el-button
            type="primary"
            size="medium"
            :disabled="importDisabled"
            @click="handleSubmit"
          >
            确认导入
          </el-button>
          <el-button
            size="medium"
            @click="handleCancel"
          >
            取消
          </el-button>
        </div>
      </div>
      <div
        v-if="step === '1'"
        class="failed-step"
      >
        <div class="count">
          导入成功{{ successCount }}条, 导入失败{{ failedCount }}条
        </div>
        <div class="tip">
          <span>以下{{ failedCount }}条不符合导入要求，将不会被导入，可下载
            <el-button
              type="text"
              @click="downloadFile()"
            >错误报告</el-button>
            ，修改后重新导入。</span>
          <el-upload
            ref="uploader1"
            class="uploader1"
            action=""
            :limit="1"
            :on-exceed="handleExceed"
            :before-upload="beforeUpload"
            :http-request="httpRequest"
          >
            <el-button
              size="medium"
              type="text"
              class="import-btn"
            >
              重新导入
            </el-button>
          </el-upload>
        </div>
        <common-table
          :columns="TABLE_COLUMNS"
          :config="TABLE_CONFIG"
          :data="failedList"
        />
      </div>
      <div
        v-if="step === '2'"
        class="success-step"
      >
        <svg
          class="icon success-icon"
          aria-hidden="true"
        >
          <use xlink:href="#iconimage_icon_Correctprompt"></use>
        </svg>
        <div class="text">
          导入成功
        </div>
        <el-button
          type="primary"
          size="medium"
          @click="jumpToQuestionList"
        >
          立即查看
        </el-button>
      </div>
    </basic-container>
  </div>
</template>

<script>
import { exportToExcel } from '@/util/util'
import { QUESTION_IMPORT_URL } from './config'
import { uploadQuestionFile, exportErrorReport } from '@/api/examManage/question'
import { getTemplate } from '@/api/system/template'
const TABLE_CONFIG = {}
const TABLE_COLUMNS = [
  // { label: '行号', prop: 'tid', fixed: 'left' },
  { label: '试题类型', prop: 'type' },
  { label: '题干', prop: 'content' },
  { label: '试题分类', prop: 'son' },
  { label: '分值', prop: 'score' },
  { label: '试题分析', prop: 'analysis' },
  { label: '难度', prop: 'difficulty' },
  { label: '错误原因', prop: 'reason', fixed: 'right', width: '200px' }
]
export default {
  name: 'QuestionImport',
  data() {
    return {
      importDisabled: true,
      uploadList: [],
      successCount: 0,
      failedCount: 0,
      failedList: [],
      templateLink: '',
      step: '0' // 0 未导入，1 导入中，2 导入完成
    }
  },
  computed: {
    QUESTION_IMPORT_URL: () => QUESTION_IMPORT_URL,
    TABLE_COLUMNS: () => TABLE_COLUMNS,
    TABLE_CONFIG: () => TABLE_CONFIG
    // downloadLink(){
    //   return 'https://xlms-file.xcmg.com:11443/eln/default/20210706/14/55/0/77d0b8bbc8c98fe9d8aba4222a6d59b5.xls'
    // }
  },
  activated() {
    this.reset()
    this.downTemplate()
  },
  methods: {
    downTemplate() {
      getTemplate({ code: 't4' }).then((res) => {
        this.templateLink = res.fileUrl
      })
    },
    reset() {
      this.successCount = 0
      this.failedCount = 0
      this.failedList = 0
      this.step = '0'
      this.uploadList = []
      this.$refs.uploader && this.$refs.uploader.clearFiles()
      this.$refs.uploader1 && this.$refs.uploader1.clearFiles()
    },
    handleExceed() {
      this.$message.warning('只能选择一个文件')
    },
    beforeUpload(file) {
      const regx = /^.*\.(xls|xlsx|csv)$/
      if (!regx.test(file.name)) {
        this.$message.error('上传资料只支持xls，xlsx，csv文件')
        return false
      }
      // const isXLS = file.type === 'application/vnd.ms-excel'
      const isLt2M = file.size / 1024 / 1024 < 2
      // if (!isXLS) {
      //   this.$message.error('上传文件只能是 xls 格式!')
      // }
      if (!isLt2M) {
        this.$message.error('上传文件大小不能超过 2MB!')
      }
      return isLt2M && regx.test(file.name)
    },
    onChange() {
      this.importDisabled = false
    },
    removeFile() {
      this.importDisabled = true
    },
    httpRequest(file) {
      const loading = this.$loading({
        lock: true,
        text: '正在导入，请稍等！',
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255, 255, 0.7)'
      })
      const parmas = new FormData()
      parmas.append('file', file.file)
      uploadQuestionFile(parmas)
        .then((res) => {
          this.successCount += res.successNum
          this.failedCount = res.failedNum
          this.failedList = res.importFailDatal
          this.$refs.uploader1 && this.$refs.uploader1.clearFiles()
          if (this.failedCount == 0) {
            this.step = '2'
          } else {
            this.step = '1'
          }
        })
        .catch()
        .finally(() => {
          loading.close()
        })
    },
    downloadFile() {
      exportErrorReport().then((res) => {
        exportToExcel(res)
      })
    },
    handleSubmit() {
      this.$refs.uploader.submit()
    },
    jumpToQuestionList() {
      this.$router.push({ path: '/examManagement/question/questionList' })
    },
    handleCancel() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.question-import {
  /deep/ .basic-container--block {
    height: calc(100% - 92px);
    min-height: calc(100% - 92px);
    > .el-card {
      height: 100%;
      > .el-card__body {
        height: 100%;
        overflow: auto;
      }
    }
  }
  .import-step {
    .section {
      background: #fafafa;
      border-radius: 4px;
      padding: 24px;
      margin-bottom: 16px;
      .title {
        color: rgba(#000b15, 0.85);
        font-size: 16px;
        line-height: 22px;
        margin-top: 0;
      }
      .tips {
        color: rgba(#000b15, 0.45);
      }
    }
    .tip {
      display: flex;
      .item {
        flex: 1;
        color: red;
        div {
          line-height: 20px;
          margin: 10px 0;
          span {
            color: #000;
            font-size: 14px;
            margin-right: 10px;
          }
        }
      }
      .left {
        width: 300px;
      }
    }
    .footer {
      display: flex;
      justify-content: center;
    }
    /deep/ .el-upload {
      width: 100%;
    }
    /deep/.el-upload-dragger {
      border: none;
      border-radius: 4px;
      width: 100%;
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    /deep/.el-upload-dragger .el-upload__text {
      color: rgba(#000b15, 0.45);
    }
    .icon-upload {
      font-size: 28px;
      color: #8c9195;
      margin-bottom: 10px;
      display: inline-block;
    }
  }
  .failed-step {
    .count {
      line-height: 40px;
      padding-left: 24px;
      background: #fafafa;
      border-radius: 4px;
    }
    .tip {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      margin-bottom: 16px;
    }
    /deep/ .el-button {
      padding: 0;
    }
    .import-btn {
      // color: rgba(0, 11, 21, 0.85);
    }
  }
  .success-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    .success-icon {
      font-size: 72px;
    }
    .text {
      font-size: 24px;
      color: rgba(0, 11, 21, 0.85);
      letter-spacing: 0;
      text-align: center;
      line-height: 36px;
      font-weight: 600;
      margin: 16px 0 24px;
    }
  }
}
</style>
