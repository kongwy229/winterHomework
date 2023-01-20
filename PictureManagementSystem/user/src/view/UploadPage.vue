<template>
   <div class="uploadPage">
      <Panel>
         <template v-slot:header>
          发布图片
        </template>
        <div class="w-full px-4 flex space-x-4 items-center">
            <label class="w-20 flex-none text-lg ">标题：</label>
            <Input  class="flex-grow" placeholder="请输入标题" :limit="30" v-model="title"/>
        </div>
        <div class="w-full px-4 flex space-x-4 items-center">
            <label class="w-20 flex-none text-lg ">图片介绍：</label>
            <Input  class="flex-grow" placeholder="请输入图片介绍" :limit="300" v-model="desc"/>
        </div>
        <div class="w-full px-4 flex space-x-4 items-center">
            <label class="w-20 flex-none text-lg ">上传图片:</label>
            <Upload/>
        </div>
        <template v-slot:footer>
          <Button size="xl" @click="submit" >发 布</Button>
        </template>
      </Panel>
   </div>
</template>

<script>
import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'
import Input from '../components/Input.vue'
import Upload from '../components/Upload'
export default {
  name: 'UploadPage',
  components: {
    Panel,
    Button,
    Input,
    Upload
  },
  data () {
    return {
      title: '',
      desc: ''
    }
  },
  methods: {
    submit (e) {
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
