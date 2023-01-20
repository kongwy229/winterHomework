<template>
  <div class="px-2 h-[50px] border border-gray-400  text-base rounded-md flex justify-between items-center focus:border-primary-500">
      <input
      :value="value"
      type="text"
      :placeholder="placeholder"
      class="flex-grow h-full inline-block rounded-md border-0 focus:outline-none placeholder-gray-500"
      @input="inputCb"
      />
      <span class="px-2 text-gray-500">{{count}} / {{limit}}</span>
  </div>
</template>
<script>

export default {
  props: {
    placeholder: String,
    limit: Number,
    value: String
  },
  name: 'Input',
  data () {
    return {
    }
  },
  computed: {
    count () {
      return this.value.length
    }
  },
  methods: {
    inputCb (event) {
      event.stopPropagation()
      const value = event.target.value
      if (value.length > this.limit) {
        this.$emit('error', '超出规定长度')
      } else {
        this.$emit('input', event.target.value)
      }
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
