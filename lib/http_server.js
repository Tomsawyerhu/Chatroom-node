/*
  http服务器
*/

var http = require("http");
var util = require("./utils");
var cache = {};

var server = http.createServer(function (request, response) {
    var filePath = false;
    if (request.url == '/') {
        filePath = "public/index.html"
    } else {
        filePath = "public" + request.url
    }

    var absPath = "../" + filePath
    util.serveStatic(response, cache, absPath)
})

var listen=function(server,port) {
    server.listen(port, function () {
        console.log("server listening on port "+port)
    })
}

module.exports = {
    'server': server,
    'listen':listen
}