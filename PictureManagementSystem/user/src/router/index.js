
import UploadPage from '@/view/UploadPage'
import HelloWorld from '@/view/HelloWorld'
const routes = [
  {
    path: '/',
    name: 'list',
    navName: '首页',
    component: HelloWorld
  },
  {
    path: '/upload',
    name: 'uploadPage',
    navName: '上传页',
    component: UploadPage
  }
]

export default routes
