// 图片上传服务
const express = require('express');
const app = express();

const cors = require('cors') // 允许跨域
app.use(cors())

var formidable = require("formidable");// 处理图片文件中间件
fs = require("fs");

const imgDirPath = '/public';
app.use(imgDirPath, express.static('public')); // 暴露静态资源

// 上传图片服务
app.post('/upload', function (req, res) {
    let info = {}; // 用于返回的信息
    let form = new formidable.IncomingForm(); //创建解析对象
    form.keepExtensions = true//保留后缀名
    form.parse(req, function(error, fields, files) {
        // fields 除了图片外的表单信息  files 图片信息
        if(error) {
            info.status = '-100';
            info.message = '上传图片失败';
            res.send(info);
        }
        const fullFileName = files.file.newFilename + files.file.originalFilename;// 拼接图片名称
        fs.writeFileSync(`public/${fullFileName}`, fs.readFileSync(files.file.filepath)); // 存储图片到public静态资源文件夹下
        info.status = '0';
        info.message = 'success';
        info.srcUrl = imgDirPath+ '/' + fullFileName; // 返回路径
        res.send(info);
    });
});

const server = app.listen(3007, function () {
    const  host = server.address().address;
    const  port = server.address().port;
    console.log('Example app listening at http://localhost:%s', port);
});