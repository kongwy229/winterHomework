<template>
    <div class="bg-white flex flex-col rounded-lg">
        <div class="p-4 h-lg flex-none border-gray-300 border-b text-gray-1000">
            <slot name="header">这是header</slot>
        </div>
        <div class="flex-grow space-y-8 my-8">
            <slot>这是content</slot>
        </div>
        <div class="h-lg flex-none flex justify-around py-2">
            <slot name="footer">这是footer</slot>
        </div>
    </div>
</template>
<script>

export default {
  name: 'Panel',
  data () {
    return {
    }
  }
}
</script>
