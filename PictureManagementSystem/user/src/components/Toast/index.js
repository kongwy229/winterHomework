import showToast from './toast.vue'

let Toast = {
  install: function (Vue) {
    const ShowToastConstructor = Vue.extend(showToast)
    const instance = new ShowToastConstructor()
    Vue.prototype.$toast = (options = {}) => {
      return new Promise((resolve, reject) => {
        Object.assign(instance, options, {isShow: true})
        instance.toastTimer && clearTimeout(instance.toastTimer)
        instance.toastTimer = setTimeout(function () {
          clearTimeout(instance.toastTimer)
          Object.assign(instance, {isShow: false})
        }, instance.duration)
        resolve(true)
      })
    }
    instance.$mount(document.createElement('div'))
    document.body.appendChild(instance.$el)
  }
}

export default Toast
