const jwt = require('jsonwebtoken') // 用于签发、解析 token
const { TOKEN_ENCODE_STR, URL_YES_PASS } = require('./config')
const User = require('../models/users')
module.exports = {
  // 生成登录 token
  create_token (str) {
    const token = jwt.sign({ str }, TOKEN_ENCODE_STR, {
      expiresIn: '1h'
    })
    console.log("生成token",token)
    return token
  },
  /*  
    验证登录 token 是否正确  => 写成中间件
    get 请求与设置的请求不拦截验证，其余均需登录
  */
  async check_token (ctx, next) {
    let url = ctx.url
    console.log('ctx.url:::', ctx.url);
    if (ctx.method != 'GET' && !URL_YES_PASS.includes(url)) {
      let token = ctx.get('Authorization')
      console.log(token)
      if (token === '') {
        ctx.response.status = 401
        ctx.response.body = '你还没有登录，快去登录吧!'
        return
      }
      try {
        // 验证token是否过期
        let { str = '' } = await jwt.verify(token, TOKEN_ENCODE_STR)
        // 验证token与账号是否匹配
        let res = await User.find({ user_name: str, token })
        console.log(res)
        if (res.length === 0) {
          ctx.response.status = 401
          ctx.response.body = '登录过期，请重新登录!'
          return
        }
        // 保存用户的_id
        ctx._id = res[0]._id
      } catch (e) {
        ctx.response.status = 401
        ctx.response.body = '登录已过期请重新登录!'
        return
      }
    }
    await next()
  }
}