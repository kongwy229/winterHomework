<template>
  <div class="home">
    <el-table ref="table" :data="tableData" current-row-key="_id" height="80vh" v-loading="loading">
        <el-table-column label="图片">
          <template slot-scope="scope">
            <img :src="scope.row.url" width="50px" height="50px"/>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间"></el-table-column>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="desc" label="描述"></el-table-column>
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
        <el-table-column prop="checkTime" label="审核时间"></el-table-column>
        <el-table-column
        fixed="right"
        label="操作"
        width="100">
        <template slot-scope="scope">
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
import {getList, updateList, deleteList} from '@/apis/index.js'
export default {
  data () {
    return {
      tableData: [],
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
      pageSize: 10,
      loading: false
    }
  },
  mounted () {
    this.getListData({page: 1})
    // this.initSort();
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
  methods: {
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
      this.$refs.table.bodyWrapper.scrollTop = 0
      this.getListData({page})
    },
    getListData (query) {
      this.loading = true
      getList({...query, pageSize: this.pageSize})
        .then((res) => {
          const {data, page, count} = res.data
          this.tableData = data
          if (this.currentData._id) {
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

  .home-page{
    margin-top:10px;
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
