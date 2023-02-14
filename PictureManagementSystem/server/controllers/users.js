const User = require('../models/users')
const sha1 = require('sha1') // 用于密码加密
const { PWD_ENCODE_STR } = require('../utils/config')
const { create_token } = require('../utils/token')
const xss = require('xss')
//下面这两个包用来生成时间
const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')

//根据用户名查找用户
const findUser = (name) => {
  return new Promise((resolve, reject) => {
    User.findOne({ user_name: name }, (err, doc) => {
      if (err) {
        reject(err)
      }
      resolve(doc)
    })
  })
}

//删除某个用户
const delUser = function (id) {
  return new Promise((resolve, reject) => {
    User.findOneAndRemove({ _id: id }, (err) => {
      if (err) {
        reject(err)
      }
      console.log('删除用户成功')
      resolve()
    })
  })
}

// 用户注册
const register = async (ctx) => {
  console.log('注册：：：，', ctx.request.body);
  let { name = '', pass = '' } = ctx.request.body
  try {
    if (name === '' || pass === '') {
      ctx.body = {
        code: 401,
        msg: '注册失败，请填写完整表单!'
      }
      return
    }
    if (pass.length < 3) {
      ctx.body = {
        code: 401,
        msg: '注册失败，密码最少为3位！'
      }
      return
    }

    let doc = await findUser(name)
    console.log('doc::', doc);
    if (doc) {
      ctx.body = {
        code: 409,
        msg: '注册失败，该用户名已经存在！'
      }
      return
    } else {
      pass = sha1(sha1(pass + PWD_ENCODE_STR))
      // 防止xss攻击， 转义
      name = xss(name)
      console.log('pass;::', pass);
      console.log('name;::', name);
      let token = create_token(name)
      let user = new User({
        user_name: name,
        password: pass,
        token //创建token并存入数据库
      })
      user.create_time = moment(objectIdToTimestamp(user._id)).format('YYYY-MM-DD HH:mm:ss') // 将objectid转换为用户创建时间
      console.log('user;::', user);
      await new Promise((resolve, reject) => {
        user.save((err) => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      })
      console.log('注册成功')
      ctx.status = 200
      ctx.body = {
        status: true,
        data: {
          id: user._id,
          token,
          user_name: name
        }
      }
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: 500,
      msg: '注册失败，服务器异常！'
    }
  }
}
// 用户登录
const login = async (ctx) => {
  let { name = '', pass = '' } = ctx.request.body
  try {
    if (name === '' || pass === '') {
      ctx.body = {
        code: 401,
        msg: '登录失败，请输入登录账号或密码!'
      }
      return
    }
    // 解密
    pass = sha1(sha1(pass + PWD_ENCODE_STR))
    console.log('pass1::', pass);
    let res = await findUser(name)
    if (!res) {
      ctx.body = {
        code: 401,
        msg: '登录失败，用户名或者密码错误!'
      }
      return
    } else if (pass === res.password) {
      let token = create_token(name)
      res.token = token
      await new Promise((resolve, reject) => {
        res.save((err) => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      })
      console.log('pass2::', res);
      ctx.status = 200
      ctx.body = {
        status: true,
        data: {
          id: res._id,
          token,
          user_name: name
        }
      }
    } else {
      ctx.status = 200
      ctx.body = {
        success: false
      }
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      code: 500,
      msg: '登录失败，服务器异常!'
    }
  }
}

const deleteUser = async (ctx) => {
  //拿到要删除的用户id
  let id = ctx.request.body.id
  await delUser(id)
  ctx.status = 200
  ctx.body = {
    success: '删除成功'
  }
}
module.exports = {
  register,
  login,
  deleteUser
}
