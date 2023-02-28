
const imagesModel = require('../models/images');
const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')

const addImages = async(ctx, body) => {
  //console.log(ctx.req.file, ctx.req.body) // { title: '111', desc: '22222222' },

  let image = new imagesModel({
    url: `http://localhost:3000/images/${ctx.req.file.filename}`,
    name: ctx.req.file.filename,
    title: ctx.req.body.title || '',
    desc: ctx.req.body.desc || '',
    checkTime:'',
    sort: -1, // 未审核通过时初始化为-1
    showTime: -1,
    checkResult:'none'
  })
  image.createTime = moment(objectIdToTimestamp(image._id)).format('YYYY-MM-DD HH:mm:ss') // 将objectid转换为创建时间

  await new Promise((resolve, reject) => {
    image.save((err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })

  ctx.body = {
    code: 200,
    message: '上传成功'
  }
}

const getImages = async(ctx, body) => {
  const { pageSize = 5, sort} = ctx.query
  const params = {checkResult : "approve" }
  if(sort){
    params.sort = { '$lt': sort}
  }
  const res = await imagesModel
  .find(
    params,
    null, 
    {sort:{sort:-1}, limit:pageSize}
  )
  ctx.body = {
    code: 200,
    message: '查询成功',
    data:{
      pageSize,
      data:res
    }
  }
}

module.exports = {
  getImages,
  addImages
}