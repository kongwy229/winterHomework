import axios from 'axios'
import store from '../store'
import router from '../router'

// 全局设置
axios.defaults.timeout = 10000 // 时间超时设置10s
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
axios.defaults.baseURL = 'http://localhost:3000/api/'
// 创建一个axios的实列
const instance = axios.create()
instance.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

axios.interceptors.request.use = instance.interceptors.request.use

// request拦截器，每次发送请求的时候拦截下来
instance.interceptors.request.use(
  config => {
    // 每次发送请求，检查 vuex 中是否有token,如果有放在headers中
    if (store.state.token) {
      config.headers.Authorization = store.state.token
    }
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// response拦截器
instance.interceptors.response.use(
  response => {
    return response.data
  },
  // 除了200以外的请求到这里来
  error => {
    let { response } = error
    if (response != null) {
      if (response.status === 401) {
        let msg = response.data || '请重新登录!'
        alert(msg)
        store.commit('LOGOUT') // token过期,清除
        router.replace({ // 跳转到登录页面
          path: '/login',
          // 添加一个重定向后缀
          query: { redirect: router.currentRoute.fullPath }
        })
        return Promise.reject(error.response)
      }
    } else {
      console.log(error)
    }
  }
)
export async function userLogin (data) {
  return instance.post('login', data)
}
export async function userRegister (data) {
  return instance.post('register', data)
}
export async function getUser () {
  return instance.get('user')
}
export async function delUser (data) {
  return instance.delete('user', data)
}
export async function getList (params) {
  console.log(params)
  return instance.get('list', {params})
}
export async function updateList (data) {
  return instance.put('list', data)
}
export async function deleteList (params) {
  return instance.delete('list', {params})
}
