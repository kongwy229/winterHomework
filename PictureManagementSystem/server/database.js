let mongoose = require('mongoose');
let db = mongoose.connection;

mongoose.connect('mongodb://localhost:27017/mhy');
db.once('open', function() {
  console.log('连接数据库成功')
})