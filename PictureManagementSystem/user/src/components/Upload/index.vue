<template>
  <div>
    <div class="grid gap-x-2 gap-y-2 grid-cols-3">
      <div
        class=" w-full h-[190px] bg-gray-300 rounded-lg overflow-hidden relative group"
        v-for="img in imgList"
        :key="img.uid"
        @click="handleClick(img)"
        >
          <div
          @click="handleRemove(img)"
          class=" group-hover:invisible visible absolute w-[18px] h-[18px] bg-gray-700 top-1 right-1 text-white flex justify-center items-center">
            <icon :w="12" :h="12"  name="close" class="cursor-pointer"/>
          </div>
          <!-- <img v-if="img.status === 'ready'" class="filter blur-[2px] object-cover w-full h-full" :src="img.url"/> -->
          <img class="object-cover w-full h-full" :src="img.url"/>
          <div class="group-hover:visible  invisible absolute w-full h-full bg-gray-700 bottom-0 left-0 text-white flex justify-center items-center cursor-pointer">
           <icon name="edit" :w="30" :h="30" class="mr-4"/> 编辑图片信息
          </div>
      </div>
      <UploadButton
      ref="uploadButton"
      :list="imgList"
      :limit="limit"
      @start="handleStart"
      @error="handleError"
      @success="handleSuccess"/>
  </div>
  <Dialog
   :isOpen="showDialog"
   size="md"
   @close="handleCloseDialog"
   @cancel="handleCloseDialog"
   @confirm="handleConfirm"
   confirmText="编辑"
   >
    <div class=" w-[250px] h-[190px] bg-gray-300 rounded-lg overflow-hidden">
      <img class="object-cover w-full h-full" :src="editImg.url"/>
    </div>
    <div class="w-full px-8 flex space-x-4 items-center my-4">
        <label class="w-20 flex-none text-lg ">标题：</label>
        <Input  class="flex-grow" placeholder="请输入标题" :limit="30" v-model="editImg.title"/>
    </div>
    <div class="w-full px-8 flex space-x-4 items-center">
        <label class="w-20 flex-none text-lg ">图片介绍：</label>
        <Input  class="flex-grow" placeholder="请输入图片介绍" :limit="300" v-model="editImg.desc"/>
    </div>
  </Dialog>
  <Dialog
   :isOpen="showTip"
   size="sm"
   @close="()=> showTip = false"
   @cancel="()=>showTip = false"
   @confirm="handleConfirmTip"
   confirmText="继续上传"
   cancelText="返回列表"
   >
   <div class="flex items-center space-x-2">
      <icon name="success" :w="40" :h="40" class="text-primary-500"/>
      <span>发布成功,请等待审核</span>
   </div>
  </Dialog>
  </div>
</template>
<script>
import UploadButton from './uploadButton.vue'
import Dialog from '@/components/Dialog'
import Input from '@/components/Input'
export default {
  props: {
    size: String
  },
  name: 'Upload',
  components: {
    UploadButton,
    Dialog,
    Input
  },
  computed: {
  },
  data () {
    return {
      tempIndex: 1,
      limit: 50,
      editImg: {url: '', title: '', desc: ''},
      showDialog: false,
      imgList: [],
      showTip: false
    }
  },
  methods: {
    handleConfirmTip () {
      console.log('confirm')
      this.showTip = false
    },
    submitImgList () {
      console.log('准备提交')
      this.$refs.uploadButton.post().then((value) => {
        console.log(value, 'ok')
        this.showTip = true
      })
    },
    getFile (rawFile) {
      const {uid} = rawFile
      return this.imgList.filter((item) => item.uid === uid)[0]
    },
    handleConfirm () {
      let target = this.imgList.find((img) => img.uid === this.editImg.uid)
      target.title = this.editImg.title
      target.desc = this.editImg.desc
      console.log('confirm')
      this.handleCloseDialog()
    },
    handleCloseDialog () {
      this.showDialog = false
      this.editImg = {url: ''}
    },
    handleClick (img) {
      this.editImg = img
      this.showDialog = true
    },
    // 上传组件 文件获取到之后触发的钩子
    handleStart (rawFile) {
      rawFile.uid = Date.now() + this.tempIndex++
      let file = {
        status: 'ready', // 初始状态是ready
        name: rawFile.name,
        size: rawFile.size,
        uid: rawFile.uid, // 自带的UID
        rawFile: rawFile,
        title: '', // 标题
        desc: '' // 图片描述
      }
      // 生成特定格式的对象
      try {
        file.url = URL.createObjectURL(rawFile) // 需要预览的时候就生成 blob://
      } catch (err) {
        console.error('[Element Error][Upload]', err)
        return
      }
      this.imgList.push(file) // 加入到文件列表
    },
    handleRemove (file) {
      this.imgList.splice(this.imgList.indexOf(file), 1)
    },
    handleError ({rawFile}) {
      console.log(rawFile)
      const file = this.getFile(rawFile)
      file.status = 'fail'
      // this.handleRemove(file)
    },
    handleSuccess ({res, rawFile}) {
      const file = this.getFile(rawFile)
      if (file) {
        // 释放内存
        URL.revokeObjectURL(file.url)
        file.status = 'success'
      }
      this.handleRemove(file)
      console.log(res, rawFile, file, this.imgList)
    }
  }
}
</script>
<style scoped>
</style>
