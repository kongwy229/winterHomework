<template>
  <div class=" w-[250px] h-[190px] bg-gray-300 rounded-lg">
    <input type="file" ref="input" @change="handleChange" multiple/>
  </div>
</template>
<script>
import ajax from './ajax'
export default {
  props: {
    list: Array,
    limit: Number
  },
  name: 'Upload',
  data () {
    return {
      reqs: {}
    }
  },
  methods: {
    handleChange (e) {
      const files = e.target.files
      if (!files) return
      this.uploadFiles(files)
    },

    uploadFiles (files) {
      const len = this.limit - this.list.length
      // 判断文件选择的个数 todo 做一个全局弹窗 提示只上传前50个
      if (this.limit && len < files.length) {
        alert('超出限制')
      }
      // 转化为待传文件数组
      let postFiles = Array.prototype.slice.call(files, 0, len)
      if (postFiles.length === 0) { return }
      postFiles.forEach(rawFile => {
        this.$emit('start', rawFile)
        this.post(rawFile)
      })
    },
    post (rawFile) {
      this.$refs.input.value = null // 把input dom 的value置空
      const { uid } = rawFile
      const options = { // 组装上传需要的参数
        file: rawFile,
        onSuccess: res => {
          this.$emit('success', {res, rawFile})
          delete this.reqs[uid] // 把uid到req的映射删除掉
        },
        onError: err => {
          this.$emit('error', {err, rawFile})
          delete this.reqs[uid]
        }
      }
      const req = ajax(options) // 发送上传到服务器的请求
      this.reqs[uid] = req // 文件UID 与请求的映射
      if (req && req.then) { // 如果请求有then 就触发then函数传入成功和失败的回调函数
        req.then(options.onSuccess, options.onError)
      }
    }
  }
}
</script>
<style scoped>
</style>
