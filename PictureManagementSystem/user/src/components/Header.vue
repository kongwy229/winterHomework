<template>
  <div class=" z-10 header fixed w-full h-md bg-gray-1000 flex flex-start items-center text-lg text-white space-x-4">
      <div>
        <img class="h-md" src="@/assets/mys-logo.png"/>
      </div>
      <router-link  v-for="router in routes" :key="router.path" :to="router.path">
            {{router.navName}}
      </router-link>
  </div>
</template>

<script>
import routes from '@/router/index'

export default {
  name: 'Header',
  data () {
    return {
      routes: routes
    }
  }
}
</script>
<style scoped>
.header{
  top:0px
}
</style>
