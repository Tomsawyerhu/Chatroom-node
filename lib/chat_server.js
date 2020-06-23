/*
  socket服务器
*/

var socket_io = require("socket.io")

var io;
var guestNumber = 1;
var nickNames = [];
var nameUsed = [];
var currentRoom = [];

var listen=function(server) {
    io = socket_io.listen(server); //启动socketio监听
    io.set("log level", 1);
    io.sockets.on("connection", function (socket) {
        //用户连接时赋予一个访客名
        guestNumber = assignGuestNumber(socket, guestNumber, nickNames, nameUsed)
        //将用户加入默认的聊天室Lobby内
        joinRoom(socket, 'Lobby')
        //处理用户发送的消息
        handleMessageBroadcasting(socket, nickNames);
        //处理更名请求
        handleNameChangeAttempts(socket, nickNames, nameUsed)
        //聊天室变更和创建
        handleRoomJoining(socket)

        //用户提出请求时返回已被占用聊天室列表
        socket.on('rooms', function(){
            socket.emit('rooms', io.sockets.adapter.rooms);
        })

        //处理断开连接
        handleDisconnection(socket, nickNames, nameUsed)

    })
}

function assignGuestNumber(socket, guestNumber, nickNames, nameUsed) {
    var name = "Guest" + guestNumber
    nickNames[socket.id] = name
    socket.emit('nameResult', {
        success: true,
        name: name
    })
    nameUsed.push(name)
    return guestNumber+1
}

function joinRoom(socket, room) {
    socket.join(room)
    currentRoom[socket.id]=room
    socket.emit('joinResult',{room:room})
    socket.broadcast.to(room).emit('message',{
        text:nickNames[socket.id]+" has joined "+room+'.'
    })
    var usersInRoom=io.sockets.adapter.rooms[room]
    if(usersInRoom.length>1){
        let usersInRoomSummary="Users currently in "+room+": "
        for(var index in usersInRoom){
            var userSocketId=usersInRoom[index].id
            if(userSocketId!=socket.id){
                if(index>0){
                    usersInRoomSummary+=', '
                }
                usersInRoomSummary+=nickNames[userSocketId]
            }
        }
        usersInRoomSummary+='.'
        socket.emit('message',{text:usersInRoomSummary})
    }
}

function handleMessageBroadcasting(socket, nickNames) {
    socket.on('message',function(msg){
        socket.broadcast.to(currentRoom[socket.id]).emit('message',{
            text:nickNames[socket.id]+": "+msg.text
        })

    })


}

function handleNameChangeAttempts(socket, nickNames, nameUsed) {
    socket.on('nameAttempt',function(name){
        //名字不能以Guest开头
        if(name.indexOf("Guest")==0){
            socket.emit('nameResult',{
                success:false,
                message:'Name cannot begin with "Guest".'
            })
        }
        //名字已被使用
        else if(nameUsed.indexOf(name)!=-1){
            socket.emit('nameResult',{
                success:false,
                message:'Name is already taken.'
            })
        }
        //可以更换
        else{
            //替换之前使用的名称
            var previousName=nickNames[socket.id]
            nickNames[socket.id]=name
            //删除旧名称的已使用记录,将新名称加入已被使用的名称中
            var previousIndex=nameUsed.indexOf(previousName)
            delete nameUsed[previousIndex]
            nameUsed.push(name)

            socket.emit('nameResult',{
                success:success,
                name:name
            })

            socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                text:previousName+" is known as "+name+" ."
            })
        }

    })

}

function handleRoomJoining(socket) {
    socket.on('join',function(room){
        socket.leave(currentRoom[socket.id])
        joinRoom(socket,room)
    })

}

function handleDisconnection(socket, nickNames, nameUsed) {
    socket.on('disconnect',function(){
        var nameIndex=nameUsed.indexOf(nickNames[socket.id])
        delete nameUsed[nameIndex]
        delete nickNames[socket.id]    
    })

}

module.exports={
    'listen':listen
}