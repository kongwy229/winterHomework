// directive/loading/load.js
import Vue from 'vue'
import Loading from './loading.vue'

const Mask = Vue.extend(Loading)

const toggleLoading = (el, binding) => {
  if (binding) {
    Vue.nextTick(() => {
      el.instance.visible = true// 控制loading组件显示
      insertDom(el, el, binding)// 插入到目标元素
    })
  } else {
    el.instance.visible = false
  }
}

const insertDom = (parent, el) => {
  parent.appendChild(el.mask)
}

export default {
  // 当绑定指令的时候 el:要绑定的父元素真实dom binding: load本身 vnode 父元素的虚拟dom
  bind: function (el, binding, vnode) {
    const mask = new Mask({
      el: document.createElement('div'),
      data () { }
    })
    el.instance = mask
    el.mask = mask.$el
    el.maskStyle = {}
    binding && toggleLoading(el, binding)
  },
  // 当数据更新时
  update: function (el, binding) {
    if (binding.oldValue !== binding.value) {
      toggleLoading(el, binding)
    }
  },
  // 解绑的时
  unbind: function (el, binding) {
    el.instance && el.instance.$destroy()
  }
}
