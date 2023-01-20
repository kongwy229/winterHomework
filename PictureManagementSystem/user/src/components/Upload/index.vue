<template>
  <div class="grid gap-x-2 gap-y-2 grid-cols-3">
    <div class=" w-[250px] h-[190px] bg-gray-300 rounded-lg overflow-hidden" v-for="img in imgList" :key="img.uid">
        <img v-loading v-if="img.status === 'ready'" class="filter blur-[2px] object-cover w-full h-full" :src="img.url"/>
        <img v-else class="object-cover w-full h-full" :src="img.response.url"/>
    </div>
    <UploadButton
    :list="imgList"
    :limit="limit"
    @start="handleStart"
    @error="handleError"
    @success="handleSuccess"/>
  </div>
</template>
<script>
import UploadButton from './uploadButton.vue'

export default {
  props: {
    size: String
  },
  name: 'Upload',
  components: {
    UploadButton
  },
  computed: {
  },
  data () {
    return {
      tempIndex: 1,
      limit: 50,
      imgList: [
      ]
    }
  },
  methods: {
    getFile (rawFile) {
      const {uid} = rawFile
      return this.imgList.filter((item) => item.uid === uid)[0]
    },
    // 上传组件 文件获取到之后触发的钩子
    handleStart (rawFile) {
      rawFile.uid = Date.now() + this.tempIndex++
      let file = {
        status: 'ready', // 初始状态是ready
        name: rawFile.name,
        size: rawFile.size,
        uid: rawFile.uid, // 自带的UID
        raw: rawFile
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
    handleError ({rawFile}) {
      const file = this.getFile(rawFile)
      const fileList = this.uploadFiles
      file.status = 'fail'
      fileList.splice(fileList.indexOf(file), 1)
    },
    handleSuccess ({res, rawFile}) {
      const file = this.getFile(rawFile)
      if (file) {
        file.status = 'success'
        file.response = res
      }
      console.log(res, rawFile, file, this.imgList)
    }
  }
}
</script>
<style scoped>
</style>
