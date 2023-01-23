
const imagesModel = require('../models/images');

const uploadImages = async(ctx, body) => {
  console.log(ctx)
  //console.log(ctx.req.file, ctx.req.body) // { title: '111', desc: '22222222' },
  const data = {
    url: `http://localhost:3000/images/${ctx.req.file.filename}`,
    title: ctx.req.body.title || '',
    desc: ctx.req.body.desc || '',
    checkTime:0,
    checkResult:'none',
    createTime: Date.now()
  }
  const res = await imagesModel.create(data)
  ctx.body = {
    code: 200,
    message: '插入成功',
    data:res
  }
  // {
  //   fieldname: 'file',
  //   originalname: '企业微信截图_16530536474967.png',
  //   encoding: '7bit',
  //   mimetype: 'image/png',
  //   destination: './public/images',
  //   filename: 'file-185df697b10.png',
  //   path: 'public\\images\\file-185df697b10.png',
  //   size: 685191

  // http://localhost:3000/images/file-185df697b10.png
  // }
}

const getImages = async(ctx, body) => {
  const res = await imagesModel.find({});
  ctx.body = {
    code: 200,
    message: '查询成功',
    data:res
  }
}

module.exports = {
  getImages,
  uploadImages
}