<template>
  <Transition>
    <div
    v-show="isShow"
    class="z-50 fixed inset-x-1/2 -translate-x-2/4 top-[50px] flex justify-center items-center rounded-full w-[300px] p-4 bg-warn-500 text-white">
      <icon :w="20" :h="20"  name="info"/>
      <div class="ml-2">{{message}}</div>
    </div>
  </Transition>
</template>

<script>
export default {
  data () {
    return {
      isShow: false,
      message: '',
      type: 'info',
      duration: 2000
    }
  },
  mounted () {},
  methods: {}
}
</script>

<style scoped>
  .v-enter-active,
  .v-leave-active {
    transition: all 0.5s ease;
  }

  .v-enter-to,
  .v-leave-from {
    opacity: 1;
    top:50px;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
    top:0px;
  }
</style>
