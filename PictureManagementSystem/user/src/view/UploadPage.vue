<template>
   <div class="uploadPage">
      <Panel>
         <template v-slot:header>
          发布图片
        </template>
        <div class="w-full px-4 flex space-x-4 items-start">
            <label class="w-20 flex-none text-lg ">上传图片:</label>
            <Upload ref="upload" :imgList="list"/>
        </div>
        <template v-slot:footer>
          <Button size="xl" class="mb-4" @click="submit" >发 布</Button>
        </template>
      </Panel>
      <Dialog
        :isOpen="showTip"
        size="sm"
        @close="()=> showTip = false"
        @cancel="handleCancelTip"
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
import {upload} from '@/apis/index'
import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import Upload from '../components/Upload'
import Dialog from '@/components/Dialog'
export default {
  name: 'UploadPage',
  components: {
    Panel,
    Button,
    Upload,
    Dialog
  },
  data () {
    return {
      showTip: false,
      list: [],
      reqs: {}
    }
  },
  methods: {
    handleCancelTip () {
      this.$router.push('/')
      this.showTip = false
    },
    handleConfirmTip () {
      this.showTip = false
    },
    submitImgList () {
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
              this.$refs.upload.handleSuccess(res, rawFile)
              delete this.reqs[uid] // 把uid到req的映射删除掉
              resolve()
            },
            onError: err => {
              this.$refs.upload.handleError(err, rawFile)
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
    },
    submit () {
      this.$refs.upload.preSubmit()
      this.submitImgList()
        .then(() => {
          this.showTip = true
        })
        .catch((err) => {
          this.$toast({
            message: `上传出错: ${err}`,
            duration: 1500
          })
        })
    }
  }
}
</script>
<style scoped>

 .uploadPage{
    width: 80%;
    margin: 0px auto;
 }
</style>
