var mime=require("mime");
var path=require("path");
var fs= require("fs");

function send404(response) {
    response.writeHead(404,{"content-type":"text/plain"});
    response.write("Error 404:Resource not found")
    response.end()
}

function sendFile(response,filePath,fileContents) {
    response.writeHead(
        200,
        {'content-type':mime.getType(filePath.split('/')[-1])}
        );
    response.end(fileContents)
}

var serveStatic=function(response,cache,absPath) {
    //检查是否在cache里
    if(cache[absPath]){
        sendFile(response,absPath,cache[absPath])
    }else{
        //检查文件是否存在
        fs.exists(absPath,function (exists) {
            if(exists){
                //读文件
                fs.readFile(absPath,function (error,data) {
                    if(error){
                        send404(response)
                    }else{
                        //缓存到cache中
                        cache[absPath]=data
                        sendFile(response,absPath,data)
                    }
                })
            }else{
                send404(response)
            }
        })
    }
}

module.exports={
    'serveStatic':serveStatic
}