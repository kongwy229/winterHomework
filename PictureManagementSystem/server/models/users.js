/*创建一个模型，建立对象与数据库中集合的一个映射*/
var mongoose = require('mongoose');

var Schema = mongoose.Schema; //概要计划，计划往数据库中准备存放哪些信息
let userSchema = new Schema({
    user_name: String,
    user_id: String,
    password: String,
    create_time: Date,
    token: {
      type: String,
      default: ""
    }
  })
  

module.exports = mongoose.model('User', userSchema); 