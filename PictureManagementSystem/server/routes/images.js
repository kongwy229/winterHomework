const router = require('koa-router')()
const multer = require('koa-multer')
const imageController = require('../controllers/images')
//上传文件存放路径、及文件命名
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        let type = file.originalname.split('.')[1]
        cb(null, `${file.fieldname}-${Date.now().toString(16)}.${type}`)
    }
  })
  //文件上传限制
  const limits = {
    fields: 10,//非文件字段的数量
    files: 1//文件数量
  }
  const upload = multer({storage,limits})
  
router.post('/images',upload.single('file'),imageController.addImages);
router.get('/images',imageController.getImages);

module.exports = router