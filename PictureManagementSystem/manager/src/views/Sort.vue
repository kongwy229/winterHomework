<template>
  <div class="sort">
    <el-button @click="toHomePage">返回首页</el-button>
    <el-button @click="()=>handleConfirm()" type="primary">保存排序结果</el-button>
    <el-table ref="table" :data="tableData" row-key="_id" height="80vh" v-loading="loading" :row-class-name="tableRowClassName">
        <el-table-column label="拖拽">
          <template>
            <div class="draggable">
              <i class="el-icon-s-operation"></i>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="序号">
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
        <el-table-column
        label="操作"
        width="100">
        <template slot-scope="scope">
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
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import {getSortList, updateSortList, setTop, cancelTop} from '@/apis/index.js'
export default {
  data () {
    return {
      tableData: [],
      sortList: [],
      currentData: {},
      isSort: false,
      page: 1,
      total: 0,
      pageSize: 20,
      loading: false
    }
  },
  mounted () {
    this.getSortList({page: 1})
    this.initSort()
  },
  beforeRouteLeave (to, from, next) {
    if (this.isSort) {
      this.$confirm('当前图片排序未保存，是否保存？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleConfirm()
      }).catch(() => {
        next()
      })
    } else {
      next()
    }
  },
  methods: {
    toHomePage () {
      this.$router.push('/home')
    },
    tableRowClassName ({row}) {
      if (row.sort === Number.MAX_SAFE_INTEGER) {
        return 'top'
      }
      return ''
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
    handleChange (page) {
      this.$refs.table.bodyWrapper.scrollTop = 0
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
    initSort () {
      const _this = this
      const el = document.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      // eslint-disable-next-line no-new
      new Sortable(el, {
        animation: 500,
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
    }
  }
}
</script>
<style scoped>
  .draggable{
    cursor: move;
  }
</style>
