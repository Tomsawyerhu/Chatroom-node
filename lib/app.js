var http=require('./http_server')
var chat=require('./chat_server')

var server=http.server
http.listen(server,3001)
chat.listen(server)