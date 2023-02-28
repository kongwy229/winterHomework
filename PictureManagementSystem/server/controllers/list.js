
const imagesModel = require('../models/images');
const globalController = require('./global');
const fs = require("fs");
const moment = require('moment')

const updateTop = async(ctx, body) => {  
  const {_id, sort} = ctx.request.body
  let topPreSort = await globalController.getGlobalTop();
  if(topPreSort !== null){
    await imagesModel.findOneAndUpdate({
      _id:topPreSort._id
    },{
      $set:{sort: topPreSort.sort}
    })
  }
  topPreSort = {_id:_id, sort:sort};
  await globalController.setGlobalTop(topPreSort);
  const data = await imagesModel.findOneAndUpdate({
    _id:_id
  },{
    $set:{sort: Number.MAX_SAFE_INTEGER}
  })

  ctx.body = {
    code: 200,
    message: '置顶成功'
  }
}

const cancelTop = async(ctx, body) => {  
  let topPreSort = await globalController.getGlobalTop();
  if(topPreSort !== null){
    await imagesModel.findOneAndUpdate({
      _id:topPreSort._id
    },{
      $set:{sort: topPreSort.sort}
    })
  }
  await globalController.setGlobalTop(null);
  ctx.body = {
    code: 200,
    message: '取消置顶成功'
  }
}

const updateList = async(ctx, body) => {
  const { _id, checkResult} = ctx.request.body
  let sort = -1;
  if(checkResult === "approve"){
    let count = await globalController.getGlobalCount();
    count = count + 1;
    sort = count;
    await globalController.setGlobalCount(count);
  }
  const now = Date.now();
  const res = await imagesModel.findOneAndUpdate({
    _id:_id
  },{
    $set:{
        checkResult:checkResult,
        sort: sort,
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

// 管理端获取所有数据
const getList = async(ctx, body) => {
  const { pageSize = 5, page = 1, checkResult} = ctx.query
  const count = await imagesModel.find(checkResult?{checkResult}:{}).count();
  const res = await imagesModel
  .find(
    checkResult?{checkResult}:{},
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

const updateSortList = async(ctx, body) => {
  // 只传 _id ,sort 在前端过滤
  const data = ctx.request.body
  console.log(data)
  for(let i = 0 ; i < data.length; i++){
    await imagesModel.findOneAndUpdate({
      _id:data[i]._id
    },{
      $set:{sort: data[i].sort,}
    })
  }
  ctx.body = {
    code: 200,
    message: '更新成功'
  }
}
// 管理端获得排序数据
const getSortList = async(ctx, body) =>{
  const { pageSize = 5, page = 1} = ctx.query
  const count = await imagesModel.find({checkResult:"approve"}).count();
  const res = await imagesModel
  .find(
    {checkResult:"approve"},
    null, 
    {sort:{sort:-1}, skip: pageSize * (page - 1), limit:pageSize}
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

// 管理端删除数据
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
  updateTop,
  cancelTop,
  updateList,
  deleteList,
  getSortList,
  updateSortList
}