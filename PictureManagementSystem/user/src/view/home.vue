<template>
<div
    style="height:calc(100vh - 120px);width:80%; margin: 0px auto; overflowY:auto;"
    @touchstart="handlerStart"
    @touchend="handlerEnd"
    @touchmove="handlerMove"
    @scroll="handlerScroll"
    class="home-container"
    ref="listWrapRef">
    <div class="top-refresh" :style="{height: refresh.height + 'px'}">
      <div v-show="refresh.height > 30">
          {{refreshLoading ? '刷新中' : '松开刷新'}}
      </div>
  </div>
  <div class="overflow-auto grid gap-x-1 gap-y-4 grid-cols-2 md:grid-cols-4 w-full">
    <div
      v-for="(item,index) in list"
      :key="item._id"
      @click="handleClick(index)"
      class="md:w-[250px] md:h-[250px] rounded-lg overflow-hidden bg-white group cursor-pointer">
      <div class="w-full h-[190px] overflow-hidden">
        <img
         src="@/assets/loading.png"
         v-src="item.url"
         class="w-full h-full object-cover transform duration-500 ease-in-out group-hover:scale-150"/>
      </div>
      <div class="w-full overflow-hidden px-2">
        <h3 class="mt-2 w-full whitespace-nowrap overflow-hidden overflow-ellipsis">
          {{item.title}}
        </h3>
        <p class="text-gray-700 w-full whitespace-nowrap overflow-hidden overflow-ellipsis">
          {{item.desc}}
        </p>
      </div>
    </div>
  </div>
  <p class="h-[40px] flex items-center justify-center text-primary-500 w-full" v-show="bottomLoading">已经加载全部数据了~</p >
  <div v-show="!showDialog"
    class="w-[50px] h-[50px] fixed bottom-10 right-10 z-10  cursor-pointer transform duration-500 ease-in-out hover:translate-y-4" @click="handlerBackTop">
    <img src="@/assets/top.png"/>
  </div>
  <Dialog
   :isOpen="showDialog"
   size="lg"
   title="查看详情"
   @close="handleCloseDialog"
   hiddenButton
   >
   <div class="flex justify-between items-center text-primary-500 space-x-2">
    <button @click="handleUp" >
      <icon name="left" :w="40" :h="40" class="cursor-pointer"/>
    </button>
    <div class=" w-[500px] h-[280px] bg-gray-300 rounded-lg overflow-hidden">
      <img class="object-cover w-full h-full" v-src="editImg.url" src="@/assets/loading.png"/>
    </div>
    <button @click="handleDown">
      <icon name="right" :w="40" :h="40" class="cursor-pointer"/>
    </button>
   </div>
  </Dialog>
</div>
</template>

<script>
import Dialog from '@/components/Dialog'
import {getList} from '@/apis/index.js'
let timer = null
export default {
  name: 'Home',
  components: {
    Dialog
  },
  data () {
    return {
      list: [],
      uniqueList: new Set(), // 用于去重
      bottomLoading: false,
      position: 0,
      startInit: 0,
      refreshLoading: false,
      refresh: {
        height: 0
      },
      editImg: {
        url: '',
        title: '',
        desc: ''
      },
      editIndex: -1,
      showDialog: false
    }
  },
  computed: {
  },
  mounted () {
    this.getImages()
  },
  methods: {
    handleCloseDialog () {
      this.showDialog = false
    },
    handleUp () {
      if (this.editIndex === 0) {
        this.$toast({
          message: `已经是第一张了~`,
          duration: 1500
        })
        return
      }
      this.handleClick(this.editIndex - 1)
    },
    async handleDown () {
      if (this.editIndex === this.list.length - 1) {
        await this.getImages()
      } else {
        this.handleClick(this.editIndex + 1)
      }
    },
    handleClick (index) {
      this.editImg = this.list[index]
      this.editIndex = index
      this.showDialog = true
    },
    getImages () {
      const length = this.list.length - 1
      return getList({sort: length === -1 ? null : this.list[length].sort})
        .then((res) => {
          const resData = res.data.data
          this.list = length === -1 ? [] : this.list
          for (let i = 0; i < resData.data.length; i++) {
            if (!this.uniqueList.has(resData.data[i]._id)) {
              this.list.push(resData.data[i])
              this.uniqueList.add(resData.data[i]._id)
            }
          }
        })
        .catch((err) => {
          this.$toast({
            message: `获取数据出错: ${err}`,
            duration: 1500
          })
        })
        .finally(() => {
          this.refreshLoading = false
          this.refresh.height = 0
        })
    },
    handlerScroll (e) {
      const eDom = e.target
      const scrollTop = e.target.scrollTop
      // 判断是否到底了
      let scrollPosition = eDom.scrollHeight - e.target.offsetHeight
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        this.bottomLoading = true
        if (scrollPosition - scrollTop <= 50) {
          this.getImages()
        }
      }, 200)
      this.position = scrollTop
    },
    // 返回顶部
    handlerBackTop () {
      const dom = this.$refs.listWrapRef
      dom.scrollTop = 0
    },
    // 触摸开始
    handlerStart (e) {
      this.startInit = parseInt(e.touches[0].clientY)
    },
    // 滑动中,下拉
    handlerMove (e) {
      if (this.position === 0 && !this.refreshLoading) {
        const Y = parseInt(e.touches[0].clientY)
        const range = Y - this.startInit
        this.refresh.height = range
      }
    },
    // 滑动结束
    async handlerEnd () {
      if (this.refresh.height >= 30) {
        this.refresh.height = 40
        this.list = []
        this.refreshLoading = true
        await this.getImages()
      } else {
        this.refresh.height = 0
      }
      this.startInit = 0
      this.refreshLoading = false
      this.position = 0
    }
  }
}
</script>

<style scoped>
.top-refresh {
    background-color: #ccc;
    height: 0;
    width: 100%;
    transition: height 0.1s linear;
    overflow: hidden;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
}
.home-container::-webkit-scrollbar {
    width: 10px;
  }

.home-container::-webkit-scrollbar-track {
    background: #fff;
    border-radius: 10px;
}

.home-container::-webkit-scrollbar-thumb {
    background: rgb(130 198 255);
    border-radius: 10px;
  }

.home-container::-webkit-scrollbar-thumb:hover {
    background: rgb(106 164 226);
    border-radius: 10px;
  }

.home-container::-webkit-scrollbar-thumb:active {
    background: rgb(106 164 226);
    border-radius: 10px;
  }
</style>
