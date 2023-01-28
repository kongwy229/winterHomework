import loading from './Loading/index'
import image from './Image/index'
export default {
  install (Vue) {
    Vue.directive('loading', loading)
    Vue.directive('src', image)
  }
}
