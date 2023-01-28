
import UploadPage from '@/view/UploadPage'
import Home from '@/view/Home'
const routes = [
  {
    path: '/',
    name: 'home',
    navName: '首页',
    component: Home
  },
  {
    path: '/upload',
    name: 'uploadPage',
    navName: '上传页',
    component: UploadPage
  }
]

export default routes
