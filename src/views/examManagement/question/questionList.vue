<template>
  <div class="question-list  fill">
    <page-header title="题库管理">
      <el-button
        slot="rightMenu"
        v-p="EXPORT_QUSTION"
        style="margin-right: 10px"
        type="primary"
        size="medium"
        :disabled="_.isEmpty(tableData)"
        @click="exportData"
      >
        导出
      </el-button>
      <el-dropdown
        slot="rightMenu"
        v-p="ADD_QUSTION"
        @command="handleCommand"
      >
        <el-button
          type="primary"
          size="medium"
        >
          创建试题<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="single">
            单个创建
          </el-dropdown-item>
          <el-dropdown-item command="batch">
            批量导入
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </page-header>
    <el-row
      style="height: calc(100% - 92px);"
      :gutter="8"
    >
      <el-col class="fill sidebar">
        <basic-container
          v-loading="treeLoading"
          block
        >
          <el-input
            v-model="treeSearch"
            clearable
            placeholder="分类名称"
            style="margin-bottom:10px;"
          />
          <el-tree
            ref="categoryTree"
            :filter-node-method="filterNode"
            :data="treeData"
            node-key="id"
            :props="treeProps"
            :expand-on-click-node="false"
            :default-expand-all="false"
            :current-node-key="_.get(activeCategory, 'id')"
            @node-click="nodeClick"
          >
            <span
              slot-scope="{ data }"
              class="custom-tree-node"
            >
              <span>{{ data.name }}</span><span>{{ data.relatedNum ? ` (${data.relatedNum})` : ' (0)' }}</span>
            </span>
          </el-tree>
        </basic-container>
      </el-col>
      <el-col
        class="content"
        style="height:100%"
      >
        <basic-container block>
          <common-table
            ref="table"
            :config="tableConfig"
            :loading="loading"
            :data="tableData"
            :page="page"
            :columns="columns"
            @current-page-change="currentChange"
            @page-size-change="sizeChange"
          >
            <template #multiSelectMenu="{ selection }">
              <el-button
                v-p="DELETE_QUSTION"
                type="text"
                style="margin-bottom:0;"
                @click="handleDelete(selection)"
              >
                批量删除
              </el-button>
            </template>
            <template #topMenu>
              <div class="flex flex-justify-between align-center">
                <search-popover
                  ref="searchPopover"
                  :require-options="searchConfig.requireOptions"
                  :popover-options="searchConfig.popoverOptions"
                  @submit="handleSubmitSearch"
                />
                <div class="operations-right">
                  <div
                    class="refresh-container"
                    @click="handleRefresh"
                  >
                    <i class="el-icon-refresh-right" />
                    <span>刷新</span>
                  </div>
                </div>
              </div>
            </template>
            <template #content="{row}">
              <div class="question-content">
                <div class="ellipsis">
                  {{
                    deleteHTMLTag(_.unescape(row.content)).length > 200
                      ? deleteHTMLTag(_.unescape(row.content)).slice(0, 200) + '...'
                      : deleteHTMLTag(_.unescape(row.content))
                  }}
                </div>
                <div>
                  {{ QUESTION_TYPE_MAP[row.type] || '' }}<span class="divider">|</span>状态：{{
                    QUESTION_STATUS_MAP[row.status] || ''
                  }}<span class="divider">|</span>关联试卷数：{{ row.examNum }}
                </div>
              </div>
            </template>
            <template #handler="{row}">
              <el-button
                v-p="EDIT_QUSTION"
                size="medium"
                type="text"
                @click="handleEdit(row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-p="DELETE_QUSTION"
                size="medium"
                type="text"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </common-table>
        </basic-container>
      </el-col>
    </el-row>
    <export-dialog
      :visible.sync="isShowExportDialog"
      :total-num="page.total"
      :export-api="exportQuestionList"
      :export-params="queryListParams"
    />
  </div>
</template>

<script>
import {
  getQuestionList,
  delQuestion,
  getQuestionCategory,
  exportQuestionList
} from '@/api/examManage/question'
import { QUESTION_TYPE_MAP, QUESTION_STATUS_MAP } from '@/const/examMange'
import { deleteHTMLTag } from '@/util/util'
const COLUMNS = [
  {
    prop: 'content',
    label: '题目名称',
    slot: true
  }
]
import { DELETE_QUSTION, EDIT_QUSTION, ADD_QUSTION, EXPORT_QUSTION } from '@/const/privileges'
import { mapGetters } from 'vuex'
import { relatedKnowledgeList } from '@/api/knowledge/knowledge'
export default {
  name: 'QuestionList',
  components: {
    SearchPopover: () => import('@/components/searchPopOver/index'),
    exportDialog: () => import('@/components/common-export/exportDialog.vue')
  },
  data() {
    return {
      queryListParams: {}, // 剥离请求题库列表的入参，因为导出弹窗亦需要此入参
      isShowExportDialog: false, // 是否展示导出弹窗
      query: {},
      loading: false,
      treeData: [], // 组织架构数据
      treeProps: {
        labelText: '标题',
        label: 'name',
        value: 'id',
        children: 'children'
      },
      activeCategory: {},
      parentOrgId: 0,
      treeSearch: '',
      treeLoading: false,
      tableConfig: {
        showHandler: true,
        enableMultiSelect: true,
        enablePagination: true,
        showIndexColumn: false,
        rowKey: 'id',
        handlerColumn: {
          width: 120,
          fixed: false
        }
      },
      page: {
        currentPage: 1,
        size: 10,
        total: 0
      },
      tableData: [],
      searchConfig: {
        requireOptions: [
          {
            type: 'input',
            field: 'search',
            label: '',
            data: '',
            options: [],
            config: { placeholder: '输入题干内容搜索', 'suffix-icon': 'el-icon-search' }
          }
        ],
        popoverOptions: [
          {
            data: '',
            type: 'select',
            field: 'type',
            label: '类型',
            options: _.map(QUESTION_TYPE_MAP, (val, key) => ({ label: val, value: key }))
          },
          {
            data: '',
            type: 'select',
            field: 'status',
            label: '状态',
            options: _.map(QUESTION_STATUS_MAP, (val, key) => ({ label: val, value: key }))
          },
          {
            label: '知识体系',
            type: 'treeSelect',
            field: 'knowledgeSystemId',
            config: {
              selectParams: {
                placeholder: '请选择知识体系',
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
                }
              }
            }
          }
        ]
      }
    }
  },
  computed: {
    exportQuestionList: () => exportQuestionList,
    columns: () => COLUMNS,
    QUESTION_STATUS_MAP: () => QUESTION_STATUS_MAP,
    QUESTION_TYPE_MAP: () => QUESTION_TYPE_MAP,
    DELETE_QUSTION: () => DELETE_QUSTION,
    EDIT_QUSTION: () => EDIT_QUSTION,
    ADD_QUSTION: () => ADD_QUSTION,
    EXPORT_QUSTION: () => EXPORT_QUSTION,
    ...mapGetters(['privileges'])
  },
  watch: {
    treeSearch(val) {
      this.$refs.categoryTree.filter(val)
    },
    // 鉴权注释：当前用户无所有的操作权限，操作列表关闭
    privileges: {
      handler() {
        this.tableConfig.showHandler = this.$p([DELETE_QUSTION, EDIT_QUSTION])
      },
      deep: true
    }
  },
  activated() {
    this.loadTree()
    this.initRelatedKnowledgeList()
  },
  methods: {
    exportData() {
      this.isShowExportDialog = true
    },
    //   初始化知识体系列表
    async initRelatedKnowledgeList() {
      let knowledgeSystemId = _.find(this.searchConfig.popoverOptions, {
        field: 'knowledgeSystemId'
      })
      await relatedKnowledgeList({ name: '' }).then((res) => {
        res.unshift({ id: '', name: '全部' })
        knowledgeSystemId.config.treeParams.data = res
      })
    },
    deleteHTMLTag(...args) {
      return deleteHTMLTag(...args)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    nodeClick(data) {
      this.activeCategory = data
      this.page.currentPage = 1
      this.loadData()
    },
    loadTree() {
      this.treeLoading = true
      getQuestionCategory({ parentId: '0', type: '0' })
        .then((data) => {
          this.treeData = data
          if (_.isEmpty(this.treeData)) return
          setTimeout(() => {
            this.$refs.categoryTree.setCurrentKey(_.get(this.treeData, '[0].id'))
          })
          this.activeCategory = this.treeData[0]
          this.loadData()
        })
        .catch(() => {})
        .finally(() => {
          this.treeLoading = false
        })
    },
    currentChange(currentPage) {
      this.page.currentPage = currentPage
      this.loadData()
    },
    async handleDelete(data) {
      let id = null

      if (Array.isArray(data)) {
        if (_.some(data, (item) => item.examNum > 0)) {
          id = _.map(data, (item) => item.id).join(',')
        } else {
          id = _.map(data, 'id').join(',')
        }
      } else {
        id = data.id
      }
      if (id === '') {
        this.$message.warning('您选择的试题中没有无关联的试卷，请调整后再进行删除！')
        return
      }
      this.$confirm('您确定要删除选中的试题吗？', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          delQuestion({ id }).then(() => {
            this.$refs.table.clearSelection()
            this.loadTree()
            this.loadData()
            this.$message.success(`已成功删除${Array.isArray(data) ? _.size(data) : '1'}条试题`)
          })
        })
        .catch()
    },
    handleSubmitSearch(params) {
      this.query = { ...this.query, ...params }
      this.page.currentPage = 1
      this.loadData()
    },
    handleRefresh() {
      this.loadData()
      this.loadTree()
    },
    sizeChange(pageSize) {
      this.page.size = pageSize
      this.loadData()
    },
    handleCommand(data) {
      if (data === 'single') {
        //单个创建
        this.$router.push({ path: '/examManagement/question/questionEdit' })
      } else {
        //批量创建
        this.$router.push({ path: '/examManagement/question/questionImport' })
      }
    },
    handleEdit(id) {
      this.$router.push({
        path: '/examManagement/question/questionEdit',
        query: { id, tagName: '编辑试题' }
      })
    },
    loadData() {
      this.loading = true
      this.queryListParams = {
        pageNo: this.page.currentPage,
        pageSize: this.page.size,
        categoryId: this.activeCategory.id,
        ...this.query
      }
      getQuestionList(this.queryListParams)
        .then((res) => {
          this.page.total = res.totalNum
          this.tableData = res.data
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.question-list {
  .el-tree {
    overflow: auto;
    max-height: calc(100% - 44px);
  }
}
/deep/ .basic-container--block {
  height: 100%;
  min-height: 100%;
  > .el-card {
    height: 100%;
    > .el-card__body {
      height: 100%;
      overflow: auto;
    }
  }
}
.question-content {
  line-height: 22px;
  padding: 12px 0;
}
.sidebar {
  width: 350px;
}
.content {
  width: calc(100% - 350px);
}
.operations {
  align-items: center;
  display: flex;
  justify-content: space-between;
  &-right {
    display: flex;
    align-items: center;
    .refresh-container {
      position: relative;
      display: flex;
      align-items: center;
      color: #a0a8ae;
      padding: 0 10px;
      cursor: pointer;
      span {
        padding-left: 6px;
      }
    }
  }
}
.divider {
  margin: 0 10px;
}
</style>
