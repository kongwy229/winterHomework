<template>
    <div v-if="isOpen" class="w-screen h-screen fixed top-0 left-0 bg-gray-700 flex justify-center items-center">
        <Panel :class="'shadow dialog-'+size">
            <template v-slot:header>
            <div class="flex w-full h-full justify-between items-center">
                <span>设置</span>
                <button @click="handleClose">
                  <icon :w="20" :h="20"  name="close" class="text-gray-800 cursor-pointer"/>
                </button>
            </div>
            </template>
            <div class="flex flex-col items-center">
              <slot></slot>
            </div>
            <template v-slot:footer>
                <Button size="md" plain @click="handleCancel">{{cancelText ? cancelText : '取消'}}</Button>
                <Button size="md" @click="handleConfirm">{{confirmText ? confirmText : '确定'}}</Button>
            </template>
        </Panel>
    </div>
</template>
<script>
import Panel from '@/components/Panel.vue'
import Button from '@/components/Button.vue'

export default {
  props: {
    size: String,
    isOpen: Boolean,
    confirmText: String,
    cancelText: String
  },
  name: 'Dialog',
  components: {
    Panel,
    Button
  },
  data () {
    return {

    }
  },
  methods: {
    handleClose () {
      this.$emit('close')
    },
    handleCancel () {
      this.$emit('cancel')
    },
    handleConfirm () {
      this.$emit('confirm')
    }
  }
}
</script>
<style scoped>
  .dialog-sm{
    width:480px;
    height:221px;
  }
  .dialog-md{
    width:480px;
    height: 530px;
  }
</style>
