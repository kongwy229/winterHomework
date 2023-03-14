<template>
  <div class="home">
    <!-- <el-button @click="toSortPage" type="primary">开启排序</el-button> -->
    <span class="home_tool"> 审核状态：</span>
    <el-select v-model="checkResult" placeholder="请选择状态" @change="handleCheckResultChange">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
    <span v-show="checkResult === 'approve'" class="home_tool"> 是否开启排序：</span>
    <el-switch v-show="checkResult === 'approve'" v-model="sortable"></el-switch>
    <el-button v-show="sortable" @click="()=>handleConfirm()" type="primary">保存排序结果</el-button>
    <el-table ref="table" :data="tableData" current-row-key="_id" height="80vh" v-loading="loading" :row-class-name="tableRowClassName">
        <el-table-column label="拖拽" v-if="sortable">
          <template>
            <div class="draggable">
              <i class="el-icon-s-operation"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="序号" v-if="sortable">
          <template slot-scope="scope">
            <span v-if="scope.row.sort === Number.MAX_SAFE_INTEGER">首图</span>
            <span v-else>{{scope.row.sort}}</span>
          </template>
        </el-table-column>
        <el-table-column label="图片">
          <template slot-scope="scope">
            <img :src="scope.row.url" width="50px" height="50px"/>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column label="审核状态">
          <template slot-scope="scope">
            <el-tag
            v-for="item in Object.keys(status)"
            :key="item" v-show="scope.row.checkResult === item"
            :type="status[item].type">
              {{status[item].desc}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkTime" label="审核时间">
          <template slot-scope="scope">
            {{scope.row.checkTime !== '' ? scope.row.checkTime : '暂未审核'}}
          </template>
        </el-table-column>
        <el-table-column
        label="操作"
        width="100">
        <template slot-scope="scope">
          <div v-show="sortable">
          <el-button
            @click="handleCancelTop()"
            type="text" size="small"
            v-if="scope.row.sort === Number.MAX_SAFE_INTEGER">
            取消置顶
          </el-button>
          <el-button
            v-else
            @click="handleTop({_id:scope.row._id, sort:scope.row.sort})"
            type="text" size="small">
              置顶
            </el-button>
          </div>
          <div v-show="!sortable">
            <el-button
              @click="handleClick(scope.row)"
              type="text" size="small">
                查看
            </el-button>
            <el-button
              v-show="scope.row.checkResult !== 'approve'"
              type="text"
              size="small"
              @click="handleCheck(scope.row._id, 'approve')">
                通过
            </el-button>
            <el-button
              v-show="scope.row.checkResult === 'none'"
              type="text"
              size="small"
              @click="handleCheck(scope.row._id, 'refused')">
                拒绝
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="handleDel(scope.row._id, scope.row.name)">
                删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      class="home-page"
      layout="prev, pager, next"
      @current-change="handleChange"
      :current-page="page"
      :page-size="pageSize"
      :total="total">
    </el-pagination>
    <el-dialog
      title="查看详情"
      :visible.sync="dialogVisible">
      <div class="dialog-content" v-if="currentData && currentData._id">
        <p>标题：{{currentData && currentData.title ? currentData.title : "暂无数据"}}</p>
        <p>描述：{{currentData && currentData.desc ? currentData.desc : "暂无数据"}}</p>
        <p v-if="currentData && currentData.checkResult">状态：{{status[currentData.checkResult].desc}}</p>
        <div class="dialog-container">
          <el-button
            :disabled="preData === null"
            @click="()=>{currentData = preData}"
            icon="el-icon-arrow-left"
            circle
            class="dialog-button">
          </el-button>
          <img :src="currentData && currentData.url ? currentData.url : ''" width="80%"/>
          <el-button
            :disabled="nextData === null"
            @click="()=>{currentData = nextData}"
            icon="el-icon-arrow-right"
            circle
            class="dialog-button">
          </el-button>
        </div>
      </div>
      <span slot="footer" class="dialog-footer" v-if="currentData && currentData._id">
        <el-button
          type="success"
          icon="el-icon-check"
          circle
          v-show="currentData && currentData.checkResult !== 'approve'"
          @click="handleCheck(currentData._id, 'approve')">
        </el-button>
        <el-button
        type="danger"
        icon="el-icon-close"
        circle
        v-show="currentData.checkResult === 'none'"
        @click="handleCheck(currentData._id, 'refused')">
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import {getList, updateList, deleteList, getSortList, updateSortList, setTop, cancelTop} from '@/apis/index.js'
export default {
  data () {
    return {
      tableData: [],
      sortable: false,
      checkResult: 'all',
      options: [{
        value: 'none',
        label: '未处理'
      }, {
        value: 'approve',
        label: '已通过'
      }, {
        value: 'refused',
        label: '已拒绝'
      }, {
        value: 'all',
        label: '全部'
      }],
      status: {
        none: {
          desc: '未处理',
          type: 'info'
        },
        approve: {
          desc: '已通过',
          type: 'success'
        },
        refused: {
          desc: '已拒绝',
          type: 'danger'
        }
      },
      dialogVisible: false,
      currentData: {},
      page: 1,
      total: 0,
      pageSize: 20,
      loading: false,
      sortList: [],
      isSort: false
    }
  },
  mounted () {
    this.getListData({page: 1})
  },
  computed: {
    preData () {
      let res
      for (let j = 0; j < this.tableData.length && res === undefined; j++) {
        if (this.tableData[j]._id === this.currentData._id) {
          res = (j === 0 ? null : this.tableData[j - 1])
        }
      }
      return res
    },
    nextData () {
      let res
      for (let j = 0; j < this.tableData.length && res === undefined; j++) {
        if (this.tableData[j]._id === this.currentData._id) {
          res = (j === this.tableData.length - 1 ? null : this.tableData[j + 1])
        }
      }
      return res
    }
  },
  watch: {
    sortable (val) {
      if (val) {
        this.getSortList({page: 1})
        this.initSort()
      } else {
        this.getListData({page: 1})
      }
    }
  },
  methods: {
    tableRowClassName ({row}) {
      if (row.sort === Number.MAX_SAFE_INTEGER) {
        return 'top'
      }
      return ''
    },
    toSortPage () {
      this.$router.push('/sort')
    },
    initSort () {
      const _this = this
      const el = document.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      // eslint-disable-next-line no-new
      new Sortable(el, {
        animation: 500,
        sort: _this.sortable,
        handle: '.draggable',
        draggable: '.el-table__row', // 被选择拖拽的元素
        filter: '.top',
        onFilter: function () {
          _this.$message.warning('置顶的图片不能拖动')
        },
        onMove: function (evt) {
          if (evt.related && evt.related.classList.contains('top')) {
            return false
          }
        },
        onEnd: ({oldIndex, newIndex}) => { // 监听拖动结束事件
          const temp = _this.tableData[oldIndex]
          if (oldIndex < newIndex) { // 向下移动调整顺序
            for (let i = oldIndex; i < newIndex; i++) {
              _this.tableData[i] = _this.tableData[i + 1]
            }
          } else if (oldIndex > newIndex) { // 向上移动时调整顺序
            for (let i = oldIndex; i > newIndex; i--) {
              _this.tableData[i] = _this.tableData[i - 1]
            }
          }
          _this.tableData[newIndex] = temp
          if (!_this.isSort) {
            _this.isSort = true
          }
        }
      })
    },
    getSortList (query) {
      this.loading = true
      this.tableData = []
      getSortList({...query, pageSize: this.pageSize})
        .then((res) => {
          const {data, page, count} = res.data
          this.tableData = data
          this.page = page
          this.total = count
          // 原始数据做一个备份 用于局部更新数据
          this.sortList = this.tableData.map((item) => item.sort)
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleTop (data) {
      setTop(data)
        .then((res) => {
          this.$message.success('置顶成功')
          this.getSortList({page: this.page})
        })
    },
    handleCancelTop () {
      cancelTop()
        .then((res) => {
          this.$message.success('取消置顶成功')
          this.getSortList({page: this.page})
        })
    },
    handleConfirm (pageData) {
      if (this.isSort === false) {
        return
      }
      const newData = []
      this.tableData.forEach((item, index) => {
        const newSort = this.sortList[index]
        if (item.sort !== newSort) {
          newData.push({_id: item._id, sort: newSort})
        }
      })
      updateSortList(newData)
        .then(() => {
          this.$message.success('更新成功')
          this.isSort = false
          this.getSortList(pageData || {page: this.page})
        })
    },
    handleCheckResultChange (value) {
      if (value !== 'approve') {
        this.sortable = false
      }
      this.getListData({page: 1})
    },
    handleClick (row) {
      this.currentData = row
      this.dialogVisible = true
    },
    handleDel (_id, name) {
      deleteList({ _id, name })
        .then(() => {
          this.getListData({page: this.page})
        })
    },
    handleChange (page) {
      if (this.sortable) {
        if (this.isSort) {
          this.$confirm('当前图片排序未保存，是否保存？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.handleConfirm({page})
          }).catch(() => {
            this.isSort = false
            this.getSortList({page})
          })
        } else {
          this.getSortList({page})
        }
      } else {
        this.getListData({page})
      }
    },
    getListData (query) {
      this.loading = true
      const checkResult = this.checkResult !== 'all' ? this.checkResult : ''
      getList({...query, pageSize: this.pageSize, checkResult: checkResult})
        .then((res) => {
          const {data, page, count} = res.data
          this.tableData = data
          if (this.currentData && this.currentData._id) {
            this.currentData = data.filter((item) => item._id === this.currentData._id)[0]
          }
          this.page = page
          this.total = count
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleCheck (_id, checkResult) {
      updateList({_id, checkResult})
        .then((res) => {
          console.log(res)
          if (res.code === 200) {
            this.getListData({page: this.page})
          }
        })
    }
  }
}
</script>
<style scoped lang="less">
.home{
  .home_tool{
    margin-left:10px;
  }
  .home-page{
    margin-top:10px;
  }
  .draggable{
    cursor: move;
  }
  .dialog-content{
    text-align: center;
    p{
      text-align:left;
    }
  }
  .dialog-container{
    display: flex;
    justify-content: center;
    align-items: center;
    img{
      margin:0px 5px;
    }
    .dialog-button{
      width:36px;
      height:36px;
    }
  }
  .dialog-footer{
    display: flex;
    justify-content: center;
  }
}

</style>
