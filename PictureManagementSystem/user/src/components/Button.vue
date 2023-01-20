<template>
    <button
    :class="size"
    class="inline-block bg-primary-500 text-white rounded-full hover:bg-primary-600"
    @click="clickCb"
    >
        <slot></slot>
    </button>
</template>
<script>

export default {
  props: {
    size: String
  },
  name: 'Button',
  methods: {
    clickCb (event) {
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
</style>
