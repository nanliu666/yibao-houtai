<template>
  <el-dialog
    class="user-select"
    :title="title"
    :visible.sync="innerVisible"
    width="800px"
    append-to-body
    :before-close="close"
  >
    <div class="content-wr">
      <div
        v-loading="loading"
        class="left"
      >
        <div>
          <el-tabs v-model="activeTab">
            <el-tab-pane
              v-if="selectTypes.includes('Org')"
              label="组织架构"
              name="Org"
            />
            <el-tab-pane
              v-if="selectTypes.includes('OuterUser')"
              label="外部联系人"
              name="OuterUser"
            >
            </el-tab-pane>
          </el-tabs>
          <div
            v-if="selectTypes.includes('Org')"
            v-show="activeTab === 'Org'"
          >
            <el-input
              v-model="orgSearch"
              placeholder="搜索组织部门或成员姓名"
            />
            <div class="tree">
              <el-tree
                ref="tree"
                :load="lazyLoadOrgTree"
                :data="orgSearchData"
                :props="treeProps"
                node-key="userId"
                lazy
                show-checkbox
                @check="handleCheckItem"
              />
            </div>
          </div>
          <div
            v-show="activeTab === 'OuterUser'"
            v-if="selectTypes.includes('OuterUser')"
            class="outer-user"
          >
            <el-input
              v-model.trim="outerParams.search"
              placeholder="搜索姓名或手机号码"
            />
            <div v-if="!_.isEmpty(usersNameList)">
              <el-checkbox
                v-model="checkAll"
                class="total-check"
                :indeterminate="isIndeterminate"
                @change="handleCheckAllChange"
              >
                全选
              </el-checkbox>
              <el-checkbox-group
                v-model="checkedUsers"
                class="check-ul"
                @change="handleCheckedUserChange"
              >
                <el-checkbox
                  v-for="(item, index) in usersNameList"
                  :key="item.bizId"
                  class="check-li"
                  :label="item"
                  @change="handleSelectUser(outerData[index])"
                >
                  {{ outerData[index].bizName
                  }}{{ outerData[index].phonenum ? `(${outerData[index].phonenum})` : '' }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <com-empty
              v-if="_.isEmpty(usersNameList)"
              height="31vh"
            />
          </div>
        </div>
      </div>
      <div class="right">
        <div>
          <span class="title">已选：</span>
        </div>

        <div
          v-for="item in selected"
          :key="item.userId"
          class="info flex flex-justify-between flex-items"
        >
          <div class="flex flex-justify-between flex-items">
            <i class="iconfont  icon-approval-checkin-bicolor imgs" />
            {{ getSelectedName(item) }}
          </div>
          <div class="icon">
            <i
              class="el-icon-error pointer"
              @click="() => handleUncheckItem(item)"
            />
          </div>
        </div>
      </div>
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="medium"
        @click="handleClose"
      >取 消</el-button>
      <el-button
        size="medium"
        type="primary"
        @click="handleSubmit"
      >
        确 定
      </el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getOrgUserChild, getOuterUser } from '@/api/system/user'
import ComEmpty from '@/components/common-empty/empty'
import _ from 'lodash'
import { getUserList as getUserByOrgId } from '@/api/examManage/schedule'

const SEARCH_DELAY = 200
const NODE_TYPE = {
  All: 'All',
  Org: 'Org',
  User: 'User'
}
const SELECT_TYPE = ['Org', 'OuterUser']

const loadOrgTree = async ({ parentId, parentPath, search, orgName }) => {
  search = _.trim(search)
  // 只能传入一个参数 当传入search的时候不使用parentId
  const data = await getOrgUserChild(_.pick({ parentId, search }, search ? 'search' : 'parentId'))
  // 在这里处理两个数组为树形组件需要的结构
  const { orgs, users } = data
  const ORG_PROPS = { type: NODE_TYPE.Org }
  const USER_PROPS = { isLeaf: true, type: NODE_TYPE.User }
  return _.concat(
    _.map(orgs, (item) =>
      _.assign(
        { path: `${parentPath || '0'}_${item.id}`, bizId: item.id, bizName: item.name },
        item,
        ORG_PROPS
      )
    ),
    _.map(users, (item) =>
      _.assign(
        {
          path: `${parentPath || '0'}_${item.userId}`,
          bizId: item.userId,
          bizName: item.name,
          orgName,
          orgId: parentId
        },
        item,
        USER_PROPS
      )
    )
  )
}
export default {
  name: 'UserPicker',
  components: {
    ComEmpty
  },
  props: {
    // 只选人，选了组织在右侧会显示人
    onlyUser: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    },
    // 是否为单选，默认为多选
    isSingle: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: () => {
        return '请选择'
      }
    },
    // 选择类型，用逗号分隔，可选项包括 Org(组织机构),OuterUser(外部联系人)
    selectType: {
      type: String,
      default: 'Org'
    }
  },
  data() {
    const activeTab = this.selectType.split(',')[0] || 'Org'
    return {
      isClear: false, // 当前外部人员是否加载完毕
      checkAll: false,
      checkedUsers: [],
      usersNameList: [],
      isIndeterminate: false,
      activeTab,
      loading: false,
      orgSearch: '',
      orgSearchData: [],
      outerParams: {
        pageNo: 1,
        pageSize: 500,
        search: '',
        loaded: false
      },
      outerData: [],
      // 存放node对象
      selected: [],
      debounceOuterScrollHandler: _.debounce(this.handleOuterScroll, SEARCH_DELAY),
      debounceOuterSearchFn: _.debounce(this.handleSearchOuterUser, SEARCH_DELAY)
    }
  },

  computed: {
    // 树形组件的props属性
    treeProps() {
      return {
        disabled: 'disabled',
        label: function(data) {
          let { name, phoneNum, phonenum } = data
          // name = name || bizName
          phoneNum = phoneNum || phonenum
          if (!phoneNum) return name
          return name + '(' + phoneNum + ')'
        },
        isLeaf: 'isLeaf',
        children: 'children'
      }
    },
    selectTypes() {
      return this.selectType.split(',').filter((item) => SELECT_TYPE.includes(item))
    },
    innerVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },

  watch: {
    innerVisible(val) {
      if (val) {
        this.$nextTick(() => {
          const nodes = this.selected.map((node) => node.userId)
          this.$refs.tree.setCheckedNodes(nodes)
          this.$refs.tree.setCheckedKeys(nodes)
        })
      }
    },
    value(val) {
      this.selected = val.slice()
      const temp = _.map(this.checkedUsers, (item) => {
        return { name: item }
      })
      const diffName = _.differenceBy(temp, val, 'name')
      const diffIndex = _.findIndex(this.checkedUsers, (item) => {
        return item === _.get(diffName, '[0].name', '')
      })
      if (diffIndex !== -1) {
        this.checkedUsers.splice(diffIndex, 1)
        this.checkAll = false
        this.isIndeterminate = true
      }
    },

    // 在组织架构下使用查询参数
    orgSearch: _.debounce(function(search) {
      if (!search) return
      this.loading = true
      loadOrgTree({ search })
        .then((res) => {
          this.orgSearchData = _.map(this.thruHandler(res), (item) =>
            _.assign({ isLeaf: true }, item)
          )
        })
        .finally(() => (this.loading = false))
    }, SEARCH_DELAY),
    'outerParams.search'() {
      this.debounceOuterSearchFn()
    }
  },
  mounted() {
    if (_.includes(this.selectType, 'OuterUser')) {
      this.loadOuterUser()
    }
    this.listenerScroll()
  },
  beforeDestroy() {
    //移除监听滚动条事件
    window.removeEventListener('scroll', this.listenerScroll)
  },
  methods: {
    getSelectedName(item) {
      const { name, phoneNum, phonenum } = item
      const phone = phoneNum || phonenum
      if (phone) {
        return name + '(' + phone + ')'
      }
      return name
    },
    listenerScroll() {
      window.addEventListener('scroll', this.debounceOuterScrollHandler, true)
    },
    handleOuterScroll(e) {
      if (this.isClear) return
      const refTarget = e.target
      if (refTarget.scrollTop + refTarget.offsetHeight >= refTarget.scrollHeight) {
        this.loadOuterUser()
      }
    },
    // 切换全选与全删
    handleCheckAllChange(val) {
      this.checkedUsers = val ? _.cloneDeep(this.usersNameList) : []
      this.isIndeterminate = false
      // 全删除需要过滤组织选的人,组织
      if (_.isEmpty(this.checkedUsers)) {
        _.pullAllBy(this.selected, this.outerData, 'userId')
      } else {
        // 半选换全选需要把未选上的加入
        if (_.size(this.checkedUsers) === _.size(this.usersNameList)) {
          this.selected = _.uniqBy([..._.cloneDeep(this.outerData), ...this.selected], 'userId')
        } else {
          // 全选需要去重
          _.each(this.outerData, (item) => {
            this.handleSelectUser(item)
          })
          this.selected = _.uniqBy(this.selected, 'userId')
        }
      }
    },
    // 当前是否切换为半选状态
    handleCheckedUserChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.usersNameList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.usersNameList.length
    },
    /**
     * 处理选中单个项
     * @param {object} node 树形组件的node结节
     */
    handleCheckItem(node) {
      if (node.type === 'Org') {
        getUserByOrgId({ orgId: node.id }).then((res = []) => {
          res.forEach((item) => {
            this.handleCheckItem(item)
          })
        })
        return
      }
      const index = this.selected.findIndex((item) => item.userId === node.userId)
      if (index >= 0) {
        this.selected.splice(index, 1)
      } else {
        this.selected.push(node)
      }
    },
    handleUncheckItem(node) {
      const index = this.selected.findIndex((item) => item.userId === node.userId)
      this.selected.splice(index, 1)
      this.$refs.tree.setChecked(node.userId, false)
    },
    // 过滤掉已勾选的父节点下的所有子节点
    getCheckedNodes(checkedNodes) {
      const orgs = _.filter(checkedNodes, { type: NODE_TYPE.Org })
      orgs.forEach((org) => {
        checkedNodes = _.filter(
          checkedNodes,
          (node) => node.path === org.path || !_.includes(node.path, org.path)
        )
      })
      return checkedNodes
    },
    close() {
      this.innerVisible = false
    },
    handleClose() {
      this.selected = this.value.slice()
      this.close()
    },

    handleSubmit() {
      const res = []
      this.selected.forEach((s) => {
        let { name, orgName, department, phoneNum, phonenum, userId, workNo } = s

        department = orgName || department
        phonenum = phoneNum || phonenum
        const item = {
          name,
          department,
          phonenum,
          userId,
          workNo
        }
        res.push(item)
      })
      this.$emit('input', res)
      this.close()
    },
    handleSelectUser(user) {
      const index = _.findIndex(this.selected, { userId: user.userId })
      if (index > -1) {
        this.selected = _.filter(this.selected, (item, i) => i != index)
      } else {
        this.selected.push(user)
      }
    },

    handleSearchOuterUser() {
      this.outerParams.loaded = false
      this.outerParams.pageNo = 1
      this.loadOuterUser(true)
    },
    async loadOuterUser(isRefresh) {
      if (this.outerParams.loaded) {
        return
      }
      const { pageNo, pageSize, search } = this.outerParams
      this.loading = true
      getOuterUser({ pageNo, search, pageSize })
        .then((res) => {
          const { totalPage } = res
          if (_.size(res.data) > 0) {
            const data = _.map(res.data, (item) =>
              _.assign(item, {
                path: item.userId,
                bizId: item.userId,
                bizName: item.name,
                type: NODE_TYPE.User
              })
            )
            if (isRefresh) {
              this.outerData = data
            } else {
              this.outerData = _.concat(this.outerData, data)
            }
            this.usersNameList = _.map(this.outerData, 'name')
          } else {
            this.usersNameList = []
            this.outerParams.loaded = true
          }
          this.outerParams.pageNo = pageNo + 1
          this.isClear = totalPage < pageNo + 1
        })
        .finally(() => {
          this.loading = false
        })
    },
    /**
     * 懒加载组织树形组件数据
     * @param {string} [parentId="0"] 父级id
     * @returns {void}
     */
    lazyLoadOrgTree(node, resolve) {
      const parentId = node.level > 0 ? node.data.bizId : '0'
      if (parentId === '0') this.loading = true
      let orgName = {}
      if (node) {
        orgName = node.data && node.data.type === NODE_TYPE.Org ? node.data.bizName : ''
      }
      loadOrgTree({
        parentId,
        parentPath: node.level > 0 ? node.data.path : '0',
        orgName
      })
        .then((res) => resolve(this.thruHandler(res)))
        .finally(() => (this.loading = false))
    },
    // 数据处理中间函数
    thruHandler(arr) {
      if (this.isDepartmentOnly) {
        // 只可以选择部门, 过滤所有的User类型
        arr = _.reject(arr, { type: NODE_TYPE.User })
      }
      return arr
    }
  }
}
</script>

<style lang="scss" scoped>
.user-select {
  .tree {
    // 隐藏disabled属性的树形组件的checkbox输入框。
    >>> .el-checkbox.is-disabled {
      display: none;
    }
  }
}
.content-wr {
  display: flex;
  border: 1px solid #efefef;
  .left {
    width: 60%;
    padding-right: 20px;
    padding: 20px;
  }
  .right {
    border-left: 1px solid #f2f2f2;
    width: 40%;
    padding-left: 20px;
    height: 470px;
    overflow-y: auto;
    .title {
      line-height: 40px;
    }
    .el-tag {
      margin-right: 12px;
      margin-bottom: 8px;
    }
  }
}
.outer-user {
  .total-check {
    padding: 6px;
    padding-top: 8px;
  }
  .check-ul {
    overflow-y: auto;
    height: 350px;
    .check-li {
      display: block;
      &:hover {
        background-color: $lightGray;
      }
      padding: 6px;

      label {
        margin-right: 4px;
      }
    }
  }
}
.tree {
  height: 340px;
  overflow-y: auto;
  padding-top: 10px;
}
.info {
  width: 98%;
  margin: 10px 0;
  .icon:hover {
    color: $primaryColor;
  }
}
.imgs {
  height: 30px;
  width: 30px;
  display: inline-block;
  border-radius: 48px;
  margin-right: 10px;
  line-height: 30px;
  text-align: center;
  font-size: 18px;
  background: $primaryColor;
  color: #fff;
}
.imgss {
  height: 30px;
  width: 30px;
  display: inline-block;
  border-radius: 48px;
  margin-right: 10px;
  line-height: 30px;
  text-align: center;
  font-size: 30px;
  background: #fff;
  color: $primaryColor;
}
.company {
  color: $primaryColor;
}
</style>