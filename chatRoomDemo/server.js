var http = require('http');// HTTP服务器和客户端功能
var fs = require('fs') // 内置的path模块提供了与文件系统路径相关的功能
var path = require('path')
var mime = require('mime') // 附加的mime模块有根据文件扩展名得出MIME类型的能力
var cache = {} // 用来缓存文件内容的对象

// 请求的文件不存在时发送404错误
function send404(response){
    response.writeHead(404,{'Content-Type':'text/plain'});
    response.write('Error 404:resource not found.');
    response.end()
}

// 提供文件数据服务
function sendFile(response,filePath,fileContents){
    response.writeHead(200,{'Content-Type':mime.lookup(path.basename(filePath))});
    response.end(fileContents)
}

// 提供静态文件服务
function serverStatic(response,cache,absPath){
    if(cache[absPath]){ // 检查文件是否缓存在内存中
        sendFile(response,absPath,cache[absPath])
    }else{
        fs.exists(absPath,function(exists){// 检查文件是否存在
            if(exists){// 存在
                fs.readFile(absPath,function(err,data){// 从硬盘中读取文件
                    if(err){
                        send404(response)
                    }else{
                        cache[absPath] = data
                        sendFile(response,absPath,data)
                    }
                })
            }else{
                send404(response)// 不存在
            }
        })
    }
}

// 创建HTTP服务器
var server = http.createServer(function(request,response){
    var filePath = false
    if(request.url == '/'){
        filePath = 'public/index.html'
    }else{
        filePath = 'public'+request.url
    }
    var absPath = './'+filePath;
    serverStatic(response,cache,absPath)
});

// 启动HTTP服务器
server.listen(3000,function(){
    console.log('Server running at http://localhost:3000/')
})

var chatServer = require('./lib/chat_server');
// 启动Socket.IO服务器，提供HTTP服务器以便Socket.IO服务器能跟HTTP服务器共享同一个TCP/IP端口：
chatServer.listen(server);