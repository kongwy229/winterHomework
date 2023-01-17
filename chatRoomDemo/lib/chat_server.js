var socketio = require('socket.io');
var io;
var guestNumber = 1;// 用户昵称上的递增数字
var nickNames = {};// 用户socket ID和昵称的映射
var namesUsed = [];// 用户列表
var currentRoom = {};// 记录用户当前所在房间

// 聊天服务器函数listen
exports.listen = function(server) {
  io = socketio.listen(server);// 启动Socket.IO服务器
  io.set('log level', 1);// 限定Socket.IO向控制台输出的日志的详细程度
  io.sockets.on('connection', function (socket) {// 处理连接
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);//在用户连接上来时赋予其一个访客名
    joinRoom(socket, 'Lobby');// 在用户连接上来时把他放入聊天室Lobby里
    handleMessageBroadcasting(socket, nickNames);//处理用户的消息
    handleNameChangeAttempts(socket, nickNames, namesUsed);// 更名
    handleRoomJoining(socket);// 聊天室的创建和变更
    socket.on('rooms', function() {// 用户发出请求时，向其提供已经被占用的聊天室的列表
      socket.emit('rooms', io.sockets.manager.rooms);
    });
    handleClientDisconnection(socket, nickNames, namesUsed);// 定义用户断开连接后的清除逻辑
  });
};

// 分配昵称
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  var name = 'Guest' + guestNumber;
  nickNames[socket.id] = name;
  socket.emit('nameResult', {// 让用户知道他们的昵称
    success: true,
    name: name
  });
  namesUsed.push(name);
  return guestNumber + 1;
}

// 进入聊天室
function joinRoom(socket, room) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('joinResult', {room: room});// 让用户知道他们进入了新的房间
  socket.broadcast.to(room).emit('message', {// 让房间里的其他用户知道有新用户进入了房间
    text: nickNames[socket.id] + ' has joined ' + room + '.'
  });

  var usersInRoom = io.sockets.clients(room);
  if (usersInRoom.length > 1) {//如果不止一个用户在这个房间里，汇总下都是谁
    var usersInRoomSummary = 'Users currently in ' + room + ': ';
    for (var index in usersInRoom) {
      var userSocketId = usersInRoom[index].id;
      if (userSocketId != socket.id) {
        if (index > 0) {
          usersInRoomSummary += ', ';
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('message', {text: usersInRoomSummary});// 将房间里其他用户的汇总发送给这个用户
  }
}

//  处理昵称变更请求
function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  socket.on('nameAttempt', function(name) {// 当客户端更名时，会发送nameAttempt事件，服务器将监听
    if (name.indexOf('Guest') == 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest".'
      });
    } else {
      if (namesUsed.indexOf(name) == -1) {
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNameIndex];
        socket.emit('nameResult', {
          success: true,
          name: name
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: previousName + ' is now known as ' + name + '.'
        });
      } else {// 昵称已经存在
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use.'
        });
      }
    }
  });
}

// 发送聊天消息
function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    socket.broadcast.to(message.room).emit('message', {// 转发消息
      text: nickNames[socket.id] + ': ' + message.text
    });
  });
}

//  创建房间
function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

// 用户断开连接
function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}
