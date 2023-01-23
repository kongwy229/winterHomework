<template>
    <div v-show="visible" class=" absolute top-0 left-0 w-full h-full select-none flex flex-col justify-center items-center bg-gray-700">
      <icon name="loading" class="animate-spin text-primary-500" :w="25" :h="25"/>
      <span class="text-base text-white">拼命加载中...</span>
    </div>
</template>

<script>
export default {
  data () {
    return {
      visible: false
    }
  }
}
</script>
