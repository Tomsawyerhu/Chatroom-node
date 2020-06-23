var Chat = function (socket) {
    this.socket = socket
}

Chat.prototype.sendMessage = function (room, text) {
    var msg = {
        room: room,
        text: text
    }
    this.socket.emit('message', msg)
}

Chat.prototype.changeRoom = function (room) {
    this.socket.emit('join', room)
}

Chat.prototype.nameAttempt = function (newName) {
    this.socket.emit('nameAttempt', name)
}

Chat.prototype.processCommand = function (command) {
    var words = command.split('')
    //先解析第一个单词
    var command = words[0]
        .substring(1, words[0].length)
        .toLowerCase()
    var message = false
    switch (command) {
        case 'join':
            words.shift()
            var room = words.join(' ')
            this.changeRoom(room)
            break
        case 'nick':
            words.shift()
            var name = words.join(' ')
            this.nameAttempt(name)
            break
        default:
            message = "cannot recognize command"
            break
    }
    return message

}