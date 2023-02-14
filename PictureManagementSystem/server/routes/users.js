const router = require('koa-router')({ 
  //设置管理端接口前缀
  prefix: '/api'
})
const userController = require('../controllers/users')
const listController = require('../controllers/list')

router
  .post("/login", userController.login) // 用户登录
  .post("/register", userController.register)  //用户注册
  .delete('/user',userController.deleteUser) // 删除用户

router
  .get("/list", listController.getList) //获取列表数据
  .put('/list', listController.updateList) //修改列表数据
  .delete('/list', listController.deleteList) // 删除列表数据
module.exports = router
