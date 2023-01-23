<template>
  <div class=" w-full h-full bg-gray-400 min-h-screen">
    <Header/>
    <div class="mhy-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
export default {
  name: 'App',
  components: {Header}
}
</script>

<style scoped>
.mhy-container{
  width:100%;
  padding-top:100px;
  background: url("/static/mhy-bg.png") no-repeat 0 62px;
  background-size:100%;
}
</style>
