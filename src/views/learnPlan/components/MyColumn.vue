<template>
  <div style="height: 100%;">
    <div class="issue_l">
      <div class="issue_l_tree">
        <el-input
          v-model="filterText"
          placeholder="分类名称"
          suffix-icon="el-icon-search"
          maxlength="32"
        >
        </el-input>

        <!-- <div class="ungrouped">
              未分类
            </div> -->

        <el-tree
          ref="tree"
          :data="data"
          node-key="id"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          :props="props"
          lazy
          :load="loadNode"
          class="tree"
          :default-expanded-keys="expandedKeysData"
          :current-node-key="currentKey"
          @node-click="treeClickNode"
        >
          <span
            slot-scope="{ node, data }"
            class="custom-tree-node"
          >
            <span
              v-show="!isEdit || data.id !== isEditId"
              :class="node.label == '未分类' ? 'paddingRight' : ''"
              class="custom-tree-node-text"
            >{{ node.label }}&nbsp;
              <span class="custom-tree-node-text-num"> &nbsp; {{ `(${data.count || 0})` }}</span>
            </span>

            <span
              v-show="isEdit && data.id === isEditId"
              class="tree_input"
            >
              <el-input
                v-model="dataAddCatalog.input"
                placeholder="请输入分类名称"
                maxlength="20"
              ></el-input>
              &nbsp;<el-button
                type="text"
                @click="isaddCatalog(data)"
              >确认</el-button>
              <span @click="isEditFn(data)"> 取消</span>
              <!-- <span @click="isEdit = false"> 取消</span> -->
            </span>
            <span>
              <!-- 编辑&删除 -->

              <el-dropdown
                v-show="data.label !== '未分类'"
                trigger="hover"
                style="color: #a0a8ae"
                class="right-content"
                @command="handleCommandSide($event, data, node)"
              >
                <span class="el-dropdown-link more-column">
                  <i class="el-icon-more" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-show="data.btnshow"
                    command="add"
                  >
                    新增分类
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-show="!data.btnshow"
                    command="move"
                  >
                    移动
                  </el-dropdown-item>
                  <el-dropdown-item command="edit"> 编辑 </el-dropdown-item>
                  <el-dropdown-item command="del"> 删除 </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </span>
        </el-tree>

        <div
          v-show="isShowinput"
          class="isShowinput"
        >
          <el-input
            id="/lecturer/lecturer"
            v-model="dataAddCatalog.input"
            class="isShowinput_input"
            placeholder="请输入分类名称"
            maxlength="20"
          ></el-input>
          <span
            class="isShowinput_yes"
            @click="isaddCatalog(data)"
          >确认</span>
          <span
            class="isShowinput_no"
            @click="isShowinputFn"
          > 取消</span>
          <!-- <span @click="isShowinput = false"> 取消</span> -->
        </div>
        <div class="btn_bottom_box">
          <div
            v-show="!isShowinput"
            class="btn_bottom"
          >
            <a
              class="btn1"
              href="#/learnPlan/CoursePlanList"
              @click="adddata"
            >
              <i class="el-icon-plus btn_icon"></i> 创建分类</a>
            <!-- <span class="btn2">创建分类</span> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 移动选择框 -->
    <el-dialog
      title="移动"
      :visible.sync="dialogFormVisible"
      :modal-append-to-body="false"
    >
      <el-form :model="form">
        <el-form-item
          label="分类名称"
          label-width="120px"
        >
          <el-input
            v-model="form.name"
            autocomplete="off"
            maxlength="32"
            disabled
          ></el-input>
        </el-form-item>
        <el-form-item
          label="上级分类"
          label-width="120px"
        >
          <el-select
            v-model="form.region"
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in data"
              v-show="item.label !== '未分类'"
              :key="index"
              :label="item.label"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogFormVisible = false">
          取 消
        </el-button>
        <el-button
          type="primary"
          @click="ismove"
        >
          确 定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    columnInterface: {
      type: Object,
      default: () => {
        return {
          listTeacherCategory: Promise.reject(), //查询讲师分类列表
          addCatalog: Promise.reject(), //新增分组/分类
          deleteTeacherCatalog: Promise.reject(), //删除分组/分类
          move: Promise.reject(), //移动
          editTeacherCatalog: Promise.reject() //编辑
        }
      }
    }
  },
  data() {
    return {
      currentKey: 99999,
      // 侧栏数据
      filterText: '',
      data: [],
      props: {
        lazy: true,
        isLeaf: (data, node) => {
          if (node.level === 2 || data.label == '未分类') {
            return true
          }
        }
      },
      expandedKeysData: [], //是否展开
      dataAddCatalog: { input: '' }, //输入框
      dialogFormVisible: false,
      form: {
        name: '',
        region: '',
        optionData: ''
      },
      inputAddMark: false,
      addSonInputData: '',
      compileNewly: '',
      isShowinput: false, //显示分组——输入框
      isEdit: false, //显示分类——输入框
      isEditId: '', //显示分类——输入框id
      btnshow: 'false' //新增分类&移动
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.islistTeacherCategory()
    this.defaultSelect()
  },
  activated() {
    this.islistTeacherCategory()
  },
  methods: {
    // 默认选中
    defaultSelect() {
      this.$nextTick(() => {
        this.$refs['tree'].setCurrentKey(99999)
      })
    },
    // tree
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    // 树数据懒加载
    async loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve([{ name: 'region' }])
      }
      if (node.level > 1) return resolve([])

      let res = await this.columnInterface.listTeacherCategory({
        parentId: node.data.id
      })
      let filterArr = res.son.map((item) => {
        return {
          id: item.idStr,
          parent_id: item.parentStr,
          label: item.name,
          btnshow: 0,
          count: item.count
        }
      })

      node.data.children = filterArr
      resolve(filterArr)

      if (this.inputAddMark) {
        this.inputAddMark = false
        this.addSonInput(this.addSonInputData)
      }
    },
    //   tree节点点击 返回ID拿右侧list
    treeClickNode(data) {
      let myId = data.id
      if (myId === 99999) myId = ''
      this.clickId = myId
      // if (data.num === 1) {
      // }
      //   拿右侧list
      this.$emit('treeClick', myId)
    },
    // 新增分组/分类&编辑
    isaddCatalog(node) {
      if (this.compileNewly == 1) {
        // 编辑
        let params = {
          id: '',
          name: ''
        }
        params.id = node.id
        params.name = this.dataAddCatalog.input
        if (params.name.trim() == '') {
          this.$message({
            message: '名称不能为空',
            type: 'warning'
          })
          return
        }
        // 做一个判断二级否有重名的
        let ifReturn = false
        this.data.map((item) => {
          if (item.id == node.parent_id) {
            item.children.map((item) => {
              if (item.label == params.name) {
                this.$message({
                  message: '该名称已存在，请重新编辑',
                  type: 'warning'
                })
                ifReturn = true
                return
              }
            })
          }
        })
        // 做一个判断一级否有重名的
        if (node.btnshow) {
          if (params.name == '未分类') {
            this.$message({
              message: '该名称已存在，请重新编辑',
              type: 'warning'
            })
            ifReturn = true
            return
          }
          this.data.map((item) => {
            if (item.label == params.name) {
              this.$message({
                message: '该名称已存在，请重新编辑',
                type: 'warning'
              })
              ifReturn = true
              return
            }
          })
        }

        if (ifReturn) return
        this.columnInterface.editTeacherCatalog(params).then(() => {
          // this.islistTeacherCategory()

          if (node.btnshow) {
            this.data.map((item, index) => {
              if (item.id == node.id) {
                this.data[index].label = params.name
              }
            })
          } else {
            this.data.map((item, index) => {
              if (node.parent_id == item.id) {
                item.children.map((itemi, indexi) => {
                  if (node.id == itemi.id) {
                    this.data[index].children[indexi].label = params.name
                  }
                })
              }
            })
          }
          this.compileNewly = ''
          this.isEdit = false
          this.dataAddCatalog.input = ''
          this.$message({
            message: '保存成功',
            type: 'success'
          })
        })
      } else {
        // 新增
        let params = {
          // creatorId: '', //	分组id	query	false
          name: '', //	名称	query	false
          parentId: '' //	类id	query	false
        }
        if (node) {
          params.id = node.myid
          // params.parentId = node.parentId
        }
        params.name = this.dataAddCatalog.input
        if (params.name.trim() == '') {
          this.$message({
            message: '名称不能为空',
            type: 'warning'
          })
          return
        }
        // 判断一级是不是有未分类
        if (params.name == '未分类') {
          this.$message({
            message: '该名称已存在，请重新编辑',
            type: 'warning'
          })
          return
        }
        this.columnInterface.addCatalog(params).then(() => {
          // this.islistTeacherCategory()
          // 不再收起BUG
          // 再请求回来数据
          this.columnInterface
            .listTeacherCategory({ test: '123', parentId: params.id })
            .then((res) => {
              // 去找到相应的数据push进去
              this.compileNewly = ''
              if (params.id) {
                this.data.map((item) => {
                  if (item.id == params.id) {
                    item.children[item.children.length - 1].id = res.son[res.son.length - 1].idStr
                    item.children[item.children.length - 1].parent_id =
                      res.son[res.son.length - 1].parentStr
                    item.children[item.children.length - 1].label = res.son[res.son.length - 1].name
                    item.children[item.children.length - 1].btnshow = 0
                    item.children[item.children.length - 1].count =
                      res.son[res.son.length - 1].count
                  }
                })
                this.isEdit = false
                this.dataAddCatalog.input = ''
              } else {
                this.data.push({
                  label: res.group[res.group.length - 1].name,
                  btnshow: 1,
                  id: res.group[res.group.length - 1].idStr,
                  myid: res.group[res.group.length - 1].idStr,
                  count: res.group[res.group.length - 1].count,
                  children: []
                })
                this.dataAddCatalog.input = ''
                this.isShowinput = false
              }

              this.$message({
                message: '新增成功',
                type: 'success'
              })
            })
        })
      }
    },
    // 输入框取消按钮
    isShowinputFn() {
      this.isShowinput = false
      this.dataAddCatalog.input = ''
      this.compileNewly = 0
    },
    isEditFn(data) {
      this.compileNewly = 0
      this.isEdit = false
      this.dataAddCatalog.input = ''
      // this.expandedKeysData = []
      // this.expandedKeysData.push(data.myid)
      this.expandedKeysData = []
      if (data.parent_id) this.expandedKeysData.push(data.parent_id)
      this.islistTeacherCategory()
    },
    // 增删改查
    handleCommandSide($event, data, node) {
      //   编辑
      if ($event === 'edit') {
        this.isEdit = true
        this.isEditId = data.id
        this.compileNewly = 1
        this.dataAddCatalog.input = data.label
      }
      //   新增
      if ($event === 'add') {
        this.addSonInputData = data
        this.compileNewly = 0
        // 展开
        this.expandedKeysData = []
        this.expandedKeysData.push(data.id)
        this.inputAddMark = true
        this.addSonInput(data)
      }
      //移动
      if ($event === 'move') {
        this.compileNewly = ''
        this.dialogFormVisible = true
        this.form.name = data.label
        this.form.optionData = data
      }
      // 删除
      if ($event === 'del') {
        this.compileNewly = ''
        if (data.count) {
          this.$message({
            message: `您选择的${data.btnshow ? '分组' : '分类'}下存在数据，请调整后再删除！`,
            type: 'error'
          })
          return
        }

        this.$confirm(`确定要删除选中的${data.btnshow ? '分组' : '分类'}么?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.iddeleteTeacherCatalog(data, node)
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '已取消删除'
            })
          })
      }
    },
    // 底部btn
    adddata() {
      this.isShowinput = true
    },
    // 移动
    ismove() {
      this.dialogFormVisible = false
      this.form
      let params = {
        id: '', //讲师所属分类ID
        parentId: '' //讲师所属分组ID
      }
      params.id = this.form.optionData.id
      params.parentId = this.form.region
      this.columnInterface.move(params).then(() => {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        this.islistTeacherCategory()
      })
    },
    // 新增子类输入框
    addSonInput(data) {
      this.compileNewly = 0
      let i = this.data.indexOf(data)
      let idNum = Math.floor(Math.random() * 10000)
      if (i == '-1') return
      this.data[i].children.push({
        label: '- -',
        btnshow: 0,
        id: idNum,
        myid: data.id
      })
      this.isEdit = true
      this.isEditId = idNum
    },
    // 查询讲师分类列表
    islistTeacherCategory(id) {
      let params = {}
      if (id) {
        params = {
          test: '123',
          parentId: '' // 父ID
        }
        params.parentId = id
      } else {
        params = {
          test: '123'
        }
      }
      return this.columnInterface.listTeacherCategory(params).then((res) => {
        this.data = []
        res.group.forEach((item) => {
          let i = {
            id: 1,
            label: '一级 1',
            btnshow: 1,
            children: [],
            num: 1,
            count: 0
          }
          i.id = item.idStr
          i.label = item.name
          i.btnshow = 1
          i.children = []
          i.count = item.count
          this.data.push(i)
        })
        this.data.forEach((item) => {
          let filterArr = res.son.filter((list) => list.parentStr == item.id) || []
          filterArr = filterArr.map((item) => {
            return {
              id: item.idStr,
              parent_id: item.parentStr,
              label: item.name,
              btnshow: 0,
              count: item.count
            }
          })
          filterArr.length > 0 ? (item.children = filterArr) : ''
        })

        this.clickId = this.data[0].id
        this.data[0].id = 99999
      })
    },
    // 删除分组/分类
    iddeleteTeacherCatalog(data) {
      let treeNode = this.$refs.tree.getNode(data.parent_id)
      this.columnInterface.deleteTeacherCatalog({ id: data.id }).then(() => {
        this.$message({
          message: '删除成功',
          type: 'success'
        })

        if (data.btnshow) {
          this.data = this.data.filter(function(item) {
            if (data.id != item.id) {
              return item
            }
          })
        } else {
          this.data.map((item, index) => {
            if (data.parent_id == item.id) {
              item.children.map((itemi, indexi) => {
                if (data.id == itemi.id) {
                  this.data[index].children.splice(indexi, 1)
                  treeNode.setData(treeNode.data)
                }
              })
            }
          })
          // this.islistTeacherCategory()
          // this.expandedKeysData = []
          // if (data.parent_id) this.expandedKeysData.push(data.parent_id)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.issue_l {
  position: relative;
  width: 16.5vw;
  // min-width: 317px;
  height: 100%;
  .issue_l_tree {
    padding: 20px;
    // padding: 0 25px;
    width: 100%;
    height: 100%;
    padding-bottom: 200px;
    overflow: auto;
    // &::-webkit-scrollbar {
    //   display: none;
    // }
    /deep/.el-input {
      margin-bottom: 15px;
    }
    .ungrouped {
      color: #606266;
      margin: 0 0 5px 22px;
      font-size: 14px;
      cursor: pointer;
    }
  }
  .btn_bottom_box {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    border-top: 1px solid #d9dbdc;
    .btn_bottom {
      position: relative;
      bottom: 0;
      left: 0;
      height: 50px;
      width: 100%;
      .btn1 {
        display: block;
        background-color: #fff;
        cursor: pointer;
        line-height: 50px;
        height: 100%;
        width: 100%;
        text-align: center;
        color: #1677ff;
      }
    }
  }
}

.custom-tree-node {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  overflow: hidden;
  .paddingRight {
    padding-right: 25px !important;
  }

  .custom-tree-node-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    position: relative;
    padding-right: 28px;
    .custom-tree-node-text-num {
      display: inline-block;
      width: 24px;
      margin-right: 10px;
      position: absolute;
      top: 0;
      right: 0;
    }
  }
  // /deep/ .el-icon-more {
  //   transform: rotate(-90deg);
  // }
  .right-content {
    display: none;
  }

  &:hover {
    .right-content {
      display: inline-block;
    }
  }
  .more-column {
    display: inline-block;
    transform: rotate(90deg);
    -ms-transform: rotate(90deg); /* IE 9 */
    -moz-transform: rotate(90deg); /* Firefox */
    -webkit-transform: rotate(90deg); /* Safari 和 Chrome */
    -o-transform: rotate(90deg);
  }
}
.tree_input {
  width: 60%;
  font-size: 14px;
  margin-top: 8px;
  /deep/ input {
    height: 25px;
    z-index: 999;
  }
  /deep/.el-input__inner {
    padding: 10px;
  }
}
/deep/ .el-tree-node__content {
  margin-top: 10px;
}
.btn_icon {
  font-weight: 700;
}
.isShowinput {
  margin-top: 5px;
  display: flex;
  line-height: 35px;
  display: flex;
  .isShowinput_input {
    flex: 1;
  }

  .isShowinput_yes {
    color: #2092fb;

    margin-left: 10px;
    width: 40px;
    font-size: 14px;
    cursor: pointer;
  }
  .isShowinput_no {
    cursor: pointer;
    width: 40px;
    font-size: 14px;
  }
  /deep/ input {
    height: 25px;
  }
}
</style>
