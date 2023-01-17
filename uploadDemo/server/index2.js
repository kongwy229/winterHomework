// Koa的图片上传服务
const Koa = require('koa') // 引入koa
const Router = require('koa-router') // 引入koa-router
const { koaBody }  = require('koa-body') //可以解析网络请求里的请求参数
const cors = require('koa2-cors') // 处理跨域
const serve = require('koa-static') //处理静态文件
const multer = require('koa-multer') //处理表单数据
const path = require('path')

const app = new Koa();
app.use(cors())//配置要在router前使用不然不生效
app.use(serve(path.join(__dirname, './public'),{maxAge:10 * 24 * 60 * 60}))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public')
    },
    filename: function (req, file, cb) {
        const fileFormat = (file.originalname).split('.')
        cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1]) // 重命名
    }
})
const upload = multer({ storage })
const router = new Router();

router.post('/upload', upload.single('file'), async (ctx) => {
    console.log('ctx.request.body', ctx.request.body)
    ctx.body = 'done'
})

app.use(router.routes())
    .use(koaBody())

// 启动服务监听本地3000端口
app.listen(3000, () => {
    console.log('应用已经启动，http://localhost:3000')
})



