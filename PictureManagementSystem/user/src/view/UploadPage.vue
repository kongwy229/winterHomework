<template>
   <div class="uploadPage">
      <Panel>
         <template v-slot:header>
          发布图片
        </template>
        <div class="w-full px-4 flex space-x-4 items-start">
            <label class="w-20 flex-none text-lg ">上传图片:</label>
            <Upload ref="upload"/>
        </div>
        <template v-slot:footer>
          <Button size="xl" class="mb-4" @click="submit" >发 布</Button>
        </template>
      </Panel>
   </div>
</template>

<script>
import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import Upload from '../components/Upload'
export default {
  name: 'UploadPage',
  components: {
    Panel,
    Button,
    Upload
  },
  data () {
    return {
    }
  },
  methods: {
    submit (e) {
      this.$refs.upload.submitImgList()
      console.log(this.msg)
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
