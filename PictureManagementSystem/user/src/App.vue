<template>
  <div class=" w-full h-full bg-gray-400 pb-8">
    <Header/>
    <div class="container">
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
.container{
  width:100%;
  padding-top:40px;
  margin-top:62px;
  background: url("/static/mhy-bg.png") no-repeat 0 62px;
  background-size:100%;
}
</style>
