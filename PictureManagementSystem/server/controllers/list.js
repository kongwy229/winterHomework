
const imagesModel = require('../models/images');
const fs = require("fs");
const moment = require('moment')
const updateList = async(ctx, body) => {
  const { _id, checkResult} = ctx.request.body
  const now = Date.now();
  const res = await imagesModel.findOneAndUpdate({
    _id:_id
  },{
    $set:{
        checkResult:checkResult,
        showTime: now,
        checkTime:moment(now).format('YYYY-MM-DD HH:mm:ss')
    }
  })
  ctx.body = {
    code: 200,
    message: '更新成功',
    data:res
  }
}

const getList = async(ctx, body) => {
  const { pageSize = 5, page = 1, status} = ctx.query
  const count = await imagesModel.find(status?{status}:{}).count();
  const res = await imagesModel
  .find(
    status?{status}:{},
    null, 
    {skip: pageSize * (page - 1), limit:pageSize}
  )
  ctx.body = {
    code: 200,
    message: '查询成功',
    data:{
      pageSize: Number(pageSize),
      page:Number(page),
      count,
      data:res
    }
  }
}

const deleteList = async(ctx, body) => {
    const { _id, name} = ctx.query
    fs.unlinkSync('./public/images/' + name);
    const res = await imagesModel.deleteOne({_id:_id})
    ctx.body = {
        code: 200,
        message: '删除成功',
        data:res
      }
}
module.exports = {
  getList,
  updateList,
  deleteList
}