/*创建一个模型，建立对象与数据库中集合的一个映射*/
var mongoose = require('mongoose');

var Schema = mongoose.Schema; //概要计划，计划往数据库中准备存放哪些信息
var obj = {
    id:String,
    content:Object
}
// 存放两个全局数据
// 1. count: approve的次数，用于设置排序字段
// 2. topPreSort: 置顶的数据原来的sort
let GlobalModel = mongoose.model('Global', new Schema(obj)); 

module.exports = GlobalModel;