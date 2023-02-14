/*创建一个模型，建立对象与数据库中集合的一个映射*/
var mongoose = require('mongoose');

var Schema = mongoose.Schema; //概要计划，计划往数据库中准备存放哪些信息
var obj = {
  title: String,
  desc: String,
  url: String,
  name: String,
  createTime: String,
  showTime: Number,
  checkTime: String,
  checkResult: String
}

//建立一个模型，能访问数据库中Image这张表的内容
//参数Image表示数据库中集合名称，不存在会创建
let ImageModel = mongoose.model('Image', new Schema(obj)); 

module.exports = ImageModel;