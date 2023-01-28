<template>
  <div
  class=" md:w-[250px] md:h-[190px] bg-gray-300 rounded-lg flex flex-col justify-center items-center space-y-2 cursor-pointer"
  @click="handleClick">
    <icon name="upload" :w="40" :h="40" class="text-primary-500"/>
    <p class="text-gray-700 text-xl">点击添加照片</p>
    <p class="text-gray-500 text-base">最多可同时上传50张</p>
    <input class="hidden" type="file" ref="input" accept="image/gif,image/jpeg,image/jpg,image/png" @change="handleChange" multiple/>
  </div>
</template>
<script>
import {upload} from '@/apis/index'
export default {
  props: {
    list: Array,
    limit: Number
  },
  name: 'Upload',
  components: {
  },
  data () {
    return {
      reqs: {}
    }
  },
  methods: {
    handleClick () {
      this.$refs.input.value = null
      this.$refs.input.click()
    },
    handleChange (e) {
      const files = e.target.files
      if (!files) return
      this.uploadFiles(files)
    },

    uploadFiles (files) {
      const len = this.limit - this.list.length
      // 限制格式
      let postFiles = Array.from(files).filter((item) => {
        return /\.(jpg|jpeg|png|JPG|PNG)$/.test(item.name)
      })
      // 判断文件选择的个数 todo 做一个全局弹窗 提示只上传前50个
      if (len < postFiles.length) {
        alert('超出限制')
      }
      // 转化为待传文件数组
      postFiles = postFiles.slice(0, len)
      if (postFiles.length === 0) { return }
      postFiles.forEach(rawFile => {
        this.$emit('start', rawFile)
      })
    },
    post () {
      this.$refs.input.value = null // 把input dom 的value置空
      const promises = this.list.map((file) => {
        return new Promise((resolve, reject) => {
          const {rawFile, desc, title} = file
          const { uid } = rawFile
          const options = { // 组装上传需要的参数
            file: rawFile,
            data: {
              title,
              desc
            },
            onSuccess: res => {
              this.$emit('success', {res, rawFile})
              delete this.reqs[uid] // 把uid到req的映射删除掉
              resolve()
            },
            onError: err => {
              this.$emit('error', {err, rawFile})
              delete this.reqs[uid]
              reject(err)
            }
          }
          const formData = new FormData()
          Object.keys(options.data).forEach(key => {
            formData.append(key, options.data[key])
          })
          formData.append('file', options.file, options.file.name)
          const req = upload(formData)
          this.reqs[uid] = req // 文件UID 与请求的映射
          if (req && req.then) { // 如果请求有then 就触发then函数传入成功和失败的回调函数
            req.then(options.onSuccess, options.onError)
          }
        })
      })
      return Promise.allSettled(promises)
    }
  }
}
</script>
<style scoped>
</style>
