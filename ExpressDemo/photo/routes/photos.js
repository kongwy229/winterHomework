var express = require('express');
var router = express.Router();
let photos = [];
photos.push({
    name: 'test1',
    path:'https://webstatic.mihoyo.com/upload/op-public/2021/10/03/58574b8c47e058787cc24049413b7cea_7872872512863208275.png'
},{
    name:'test',
    path:"https://webstatic.mihoyo.com/upload/op-public/2021/10/03/663fe95dff54044d7cd5d3a355f61bf7_6089937633900261947.png"
})
router.get('/', function(req, res, next) {
    res.render('photos', { title: 'Photos', photos: photos });
});
  
module.exports = router;
  