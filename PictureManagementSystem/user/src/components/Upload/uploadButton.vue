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
export default {
  props: {
    list: Array,
    limit: Number
  },
  name: 'Upload',
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
      if (len < postFiles.length) {
        this.$toast({
          message: '超出限制,本次上传前50张图片',
          duration: 1500
        })
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
    }
  }
}
</script>
<style scoped>
</style>
