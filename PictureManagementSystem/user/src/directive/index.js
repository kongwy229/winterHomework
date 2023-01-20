import loading from './Loading/index'
export default {
  install (Vue) {
    Vue.directive('loading', loading)
  }
}
