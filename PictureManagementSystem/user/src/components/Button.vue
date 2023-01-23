<template>
    <button
    :class="{
      'xl':size === 'xl',
      'md': size === 'md',
      'bg-primary-500 text-white hover:bg-primary-600':!plain,
      'bg-white border-gray-600 border text-gray-600':plain,
      }"
    class="inline-block rounded-full"
    @click="handleClick"
    >
        <slot></slot>
    </button>
</template>
<script>

export default {
  props: {
    size: String,
    plain: Boolean
  },
  name: 'Button',
  methods: {
    handleClick (event) {
      event.stopPropagation()
      this.$emit('click', event)
    }
  }
}
</script>
<style scoped>
  .xl{
    width:241px;
    height:50px;
  }
  .md{
    width:100px;
    height:30px;
  }
</style>
