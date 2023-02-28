// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Router from 'vue-router'
import routes from './router'
import './styles/index.css'
import Toast from './components/Toast/index'
import setting from './directive/index'
import Icon from 'vue2-svg-icon/Icon'
Vue.component('icon', Icon)
Vue.use(setting)
Vue.use(Toast)
Vue.use(Router)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router: new Router({
    routes,
    mode: 'history'
  }),
  components: { App },
  template: '<App/>'
})
