<template>
  <div class="NewsEdit wrapper">
    <page-header
      :title="pageTitle"
      :back="() => handleBack()"
      show-back
    />
    <basic-container block>
      <common-form
        ref="form"
        :columns="formColumns"
        :model="formData"
      >
        <template #basicTitle>
          <div class="title-box">
            基础信息
          </div>
        </template>
        <template #expendTitle>
          <div class="title-box">
            扩展信息
          </div>
        </template>

        <template #roomArea>
          <el-input
            v-model="formData.roomArea"
            placeholder="请输入"
          >
            <template slot="append">
              m²
            </template>
          </el-input>
        </template>
        <template #imageTitle>
          <div>
            场地照片
            <el-tooltip
              class="item"
              effect="dark"
              content="仅支持上传1张场地照片"
              placement="top-start"
            >
              <i class="el-icon-question" />
            </el-tooltip>
          </div>
        </template>
        <template #picReqList>
          <common-upload
            v-if="!_.get(formData.picReqList, '[0].fileUrl', null)"
            v-model="formData.picReqList"
            :multiple="false"
            drag
            :before-upload="beforeUpload"
          >
            <div
              slot="default"
              class="upload__wrapper"
            >
              <i class="el-icon-picture-outline wrapper__icon" />
              <div class="wrapper__title">
                点击或者拖拽附件到此区域
              </div>
              <div class="wrapper__tips">
                上传的图片格式要求jpg，jpeg，bmp，png，大小不超过10M
              </div>
            </div>
          </common-upload>
          <common-image-view
            v-if="_.get(formData.picReqList, '[0].fileUrl', null)"
            :image-width="360"
            :url="_.get(formData.picReqList, '[0].fileUrl', null)"
            :file-name="_.get(formData.picReqList, '[0].localName', null)"
            :preview-src-list="[_.get(formData.picReqList, '[0].fileUrl', null)]"
            :is-delete="true"
            @deleteFile="deleteFile"
          />
        </template>
      </common-form>

      <div class="container__buttons">
        <el-button
          :loading="submitting"
          size="medium"
          type="primary"
          @click="() => handlePublishBtnClick()"
        >
          保存
        </el-button>
        <el-button
          size="medium"
          @click="cancel"
        >
          取消
        </el-button>
      </div>
    </basic-container>
  </div>
</template>

<script>
import {
  addClassroom,
  editClassroom,
  queryClassroomInfo,
  queryCategoryOrgList,
  checkClassroomName
} from '@/api/resource/classroom'
import { mapGetters } from 'vuex'
import CommonUpload from '@/components/common-upload/commonUpload'
import CommonImageView from '@/components/common-image-viewer/viewer'
export default {
  name: 'ClassroomEdit',
  components: {
    CommonImageView,
    CommonUpload
  },
  data() {
    return {
      pageTitle: '创建教室',
      formColumns: [
        {
          prop: 'basicTitle',
          itemType: 'slotout',
          span: 24,
          label: ''
        },
        {
          itemType: 'input',
          label: '教室名称',
          maxLength: 300,
          prop: 'roomName',
          rules: [
            {
              required: true,
              validator: this.validateRoomName,
              trigger: ['blur', 'change']
            },
            { validator: this.checkClassroomName, trigger: ['blur'] }
          ],
          span: 11
        },
        {
          label: '所在分类',
          itemType: 'treeSelect',
          prop: 'categoryId',
          required: true,
          span: 11,
          offset: 1,
          props: {
            selectParams: {
              placeholder: '请选择所在分类',
              multiple: false
            },
            treeParams: {
              'check-strictly': true,
              'default-expand-all': false,
              'expand-on-click-node': false,
              clickParent: true,
              data: [],
              filterable: false,
              props: {
                children: 'children',
                label: 'name',
                value: 'id'
              },
              required: true
            }
          }
        },
        {
          itemType: 'input',
          label: '地址',
          rules: [
            {
              required: true,
              validator: this.validateRoomAddr,
              trigger: ['blur', 'change']
            }
          ],
          maxLength: 300,
          prop: 'roomAddr',
          span: 11
        },
        {
          itemType: 'inputNumber',
          label: '最大容纳人数',
          prop: 'maxCapacity',
          max: 100000,
          min: 0,
          precision: 0,
          offset: 1,
          span: 11
        },
        {
          prop: 'expendTitle',
          itemType: 'slotout',
          span: 24,
          label: ''
        },
        {
          itemType: 'select',
          label: '投影仪',
          prop: 'hasProjector',
          placeholder: '请选择',
          options: [
            { label: '有', value: 1 },
            { label: '没有', value: 0 }
          ],
          span: 11,
          offset: 0
        },
        {
          itemType: 'slot',
          label: '面积',
          prop: 'roomArea',
          rules: [
            {
              validator: (rule, value, callback) => {
                const numberValue = Number(value)
                if (_.isNaN(numberValue)) {
                  return callback(new Error('面积必须填数字'))
                } else {
                  if (!_.isInteger(numberValue)) {
                    if (value.split('.')[1].length > 1) {
                      return callback(new Error('面积最多存在一位小数点'))
                    }
                  }
                  if (value > 100000) {
                    return callback(new Error('面积最大限制输入值 100000'))
                  } else if (value <= 100000 && value >= 0) {
                    callback()
                  } else {
                    return callback(new Error('面积必须为正整数'))
                  }
                }
              },
              trigger: ['blur', 'change']
            }
          ],
          span: 11,
          offset: 1
        },
        {
          prop: 'imageTitle',
          itemType: 'slotout',
          span: 24,
          label: ''
        },
        {
          itemType: 'slot',
          label: '',
          prop: 'picReqList',
          required: false,
          span: 11
        }
      ],
      formData: {
        roomName: '',
        categoryId: '',
        roomAddr: '',
        hasProjector: 0, // 是否有投影仪：0：没有；1：有
        maxCapacity: null,
        roomArea: 0,
        picReqList: []
      },
      submitting: false
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.$keepAlive = false // 禁用页面缓存
    next()
  },
  beforeRouteLeave(to, from, next) {
    this.$store.commit('DEL_TAG', this.$store.state.tags.tag)
    next()
  },
  computed: {
    categoryId() {
      return this.$route.query.categoryId || null
    },
    id() {
      return _.get(this.$route, 'query.id')
    },
    ...mapGetters(['tag'])
  },
  mounted() {
    this.initSetting()
    this.initData()
  },
  methods: {
    validateRoomName(rule, value, callback) {
      const target = value.trim()
      if (!target) {
        return callback(new Error('请输入课室名称'))
      } else {
        callback()
      }
    },
    validateRoomAddr(rule, value, callback) {
      const target = value.trim()
      if (!target) {
        return callback(new Error('请输入地址'))
      } else {
        callback()
      }
    },
    initSetting() {
      this.pageTitle = this.id ? '编辑教室' : '创建教室'
      if (this.categoryId) {
        this.formData.categoryId = this.categoryId
      }
    },
    // 最大字数限制
    checkClassroomName(rule, value, callback) {
      checkClassroomName({ id: this.id, roomName: value })
        .then(() => {
          callback()
        })
        .catch(() => {
          callback(new Error('该教室名称已被使用'))
        })
    },
    // 删除上传文件
    deleteFile() {
      this.formData.picReqList = []
    },
    // 上传格式校验
    beforeUpload(file) {
      const fileTypeIndex = file.name.lastIndexOf('.')
      const fileType = file.name.substring(fileTypeIndex + 1, file.length)
      const IMAGE_TYPE = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'GIF', 'BMP']
      const isImage = _.some(IMAGE_TYPE, (item) => {
        return item === fileType
      })
      let isLtFileSize = file.size / 1024 / 1024 < 10
      if (!isImage) {
        this.$message.error('不能上传图片类型以外的文件!')
        return false
      }
      if (!isLtFileSize) {
        this.$message.error('上传图片大小不能超过10M!')
        return false
      }
      return isImage && isLtFileSize
    },
    /**
     * 初始选择数据
     */
    async initData() {
      let categoryId = _.find(this.formColumns, { prop: 'categoryId' })
      queryCategoryOrgList({ source: 'classroom' }).then(
        (res) => (categoryId.props.treeParams.data = res)
      )
      if (this.id) {
        const data = await queryClassroomInfo({ id: this.id })
        this.formData = data
        //场景： 添加没有图片的教室，后期编辑添加图片，图片不显示问题    方案：返回值图片为空，删除
        this.formData.picReqList = _.filter(data.picReqList, 'fileUrl')
      }
    },
    // 点击完成
    handlePublishBtnClick() {
      this.$refs.form.validate().then(async () => {
        try {
          this.submitting = true
          // 区分是编辑还是新增
          !this.id
            ? await await addClassroom(this.formData)
            : await await editClassroom(this.formData)
          this.$message.success('发布成功')
          this.handleBack()
        } catch (error) {
          window.console.log(error)
          window.console.log(JSON.stringify(this.formData))
        } finally {
          this.submitting = false
        }
      })
    },
    cancel() {
      this.$message.info(`${!this.id ? '创建' : '编辑'}教室已取消`)
      this.handleBack()
    },
    handleBack() {
      this.$router.back()
      this.$store.commit('DEL_TAG', this.tag)
    }
  }
}
</script>

<style lang="scss" scoped>
$color_active: #368afa;
$color_border: #e3e7e9;
$color_placeholder: #757c85;
$color_font_uploader: #a0a8ae;
/deep/ .el-upload-dragger {
  padding: 20px;
  height: 200px;
  width: 380px;
}
.upload__wrapper {
  .wrapper__icon {
    font-size: 100px;
  }
  .wrapper__title {
    font-size: 18px;
    color: rgba(0, 11, 21, 0.85);
    font-weight: 500;
  }
  .wrapper__tips {
    font-size: 10px;
    color: #999999;
  }
}
.title-box {
  font-size: 18px;
  color: rgba(0, 11, 21, 0.85);
  font-weight: 550;
  margin-top: 8px;
}
.wrapper {
  .basic-container--block {
    height: 0;
    min-height: calc(100% - 92px);
    .editor__title {
      margin-bottom: 10px;
    }
  }
}
.container__buttons {
  margin-top: 1rem;
}
</style>
