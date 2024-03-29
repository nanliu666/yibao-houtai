<template>
  <el-select
    v-loadmore="loadOptionData"
    :value="value"
    :placeholder="placeholder"
    :filterable="searchable"
    :remote="searchable"
    :allow-create="allowCreate"
    :default-first-option="allowCreate"
    :remote-method="remoteMethod"
    :multiple="multiple"
    :disabled="disabled"
    @change="handleChange"
    @visible-change="visibleChange"
  >
    <el-option
      class="options"
      v-for="item in _.uniqBy(_.compact([...firstOption, ...optionList]), optionProps.value)"
      :key="optionProps.key ? `${item[optionProps.key]}${item[optionProps.value]}` : item[optionProps.value]"
      :label="optionProps.formatter ? optionProps.formatter(item) : item[optionProps.label]"
      :value="item[optionProps.value]"
    />
    <div
      v-show="loading"
      class="loading"
    >
      <i class="el-icon-loading" />
    </div>
    <div
      v-if="loading"
      slot="empty"
    >
      <div class="loading">
        <i class="el-icon-loading" />
      </div>
    </div>
    <div
      v-show="noMore"
      style="text-align:center;font-size:14px;color:#606266;line-height:34px;"
    >
      没有更多了
    </div>
  </el-select>
</template>
<script>
import Emitter from '@/mixins/elFormEmitter'
export default {
  mixins: [Emitter],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    disabled: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    multiple: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    value: {
      type: [String, Boolean, Array, Object],
      default: ''
    },
    // 允许创建条目
    allowCreate: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    /** 默认选项
     * 解决初始已选中的值没有被翻译的问题
     * 对应值的跟optionProps相匹配
     */
    firstOption: {
      type: Array,
      default: () => []
    },
    load: {
      type: Function,
      default: () => {}
    },
    payloadParams: {
      type: Object,
      default: () => {}
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    optionProps: {
      type: Object,
      default: () => ({
        label: 'label',
        value: 'value',
        key: null
      })
    },
    pageSize: {
      type: Number,
      default: 10
    },
    searchable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      optionList: [],
      loading: false,
      noMore: false,
      pageNo: 1,
      search: ''
    }
  },
  watch: {
    payloadParams: {
      handler() {
        this.loadOptionData(true)
      },
      deep: true
    }
  },
  created() {
    this.loadOptionData()
  },
  methods: {
    visibleChange(visible) {
      if (visible === false && this.searchable && this.search !== '') {
        this.search = ''
        this.loadOptionData(true)
      }
    },
    handleChange(value) {
      this.$emit('change', value)
      this.dispatch('ElFormItem', 'el.form.change', value)

      // 把当前选中的对象返回出去
      const selectItems = this.optionList.filter((it) => it[this.optionProps.value] === value)
      if (selectItems.length !== 0) {
        this.$emit('select', selectItems[0])
      } else if (this.allowCreate) {
        this.$emit('select', { [this.optionProps.label]: value })
      }
    },
    loadOptionData(refresh = false) {
      if ((this.noMore && !refresh) || this.loading) {
        return
      }
      const firstOption = this.firstOption
      if (refresh) {
        this.optionList = !_.isEmpty(firstOption) ? firstOption : []
        this.pageNo = 1
      }
      this.loading = true
      const basicParams = { pageNo: this.pageNo, pageSize: this.pageSize, search: this.search }
      const params = _.assign(basicParams, this.payloadParams)
      this.load(params)
        .then((res) => {
          this.pageNo += 1
          if (!_.isEmpty(firstOption)) {
            this.optionList = _.uniqBy(
              [...this.optionList, ...res.data, ...firstOption],
              this.optionProps.key
            )
          } else {
            this.optionList.push(...res.data)
          }
          if (res.data.length < this.pageSize) {
            this.noMore = true
          } else {
            this.noMore = false
          }
          
          this.$emit('update:optionList', this.optionList)
        })
        .finally(() => {
          this.loading = false
        })
    },
    remoteMethod(search) {
      this.search = search
      this.loadOptionData(true)
    }
  }
}
</script>

<style lang="scss" scoped>
.loading {
  padding: 12px 0;
  text-align: center;
}
.options{
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
</style>
