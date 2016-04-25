var http = require('http');
var Static = require('node-static');
var WebSocketServer = new require('ws');


var clients = {};
// model collect id of listElement
var model = [];
// textDict collect text of listElement in id:text format
var textDict = {};

var webSocketServer = new WebSocketServer.Server({ port: 8081 });
webSocketServer.on('connection', function(ws) {

    var id = Math.random();
    clients[id] = ws;
    console.log("новое соединение " + id);
    model.forEach(function(listElementId) {

        clients[id].send(JSON.stringify({ "id": listElementId, "text": textDict[listElementId], "modelChange": "create" }));
    });


    ws.on('message', function(message) {
        var msgObj = JSON.parse(message);
        if (msgObj.modelChange === "create") {

            model.push(msgObj.id);
            textDict[msgObj.id] = msgObj.text;

            for (var key in clients) {
                clients[key].send(JSON.stringify(msgObj));
            }

        } else if (msgObj.modelChange === "dropBefore") {
            var indexTarget = model.indexOf(msgObj.position);
            var indexMoving = model.indexOf(msgObj.id);
            model.splice(indexMoving, 1);
            if (indexTarget > 0) {
                model.splice(indexTarget - 1, 0, msgObj.id);
            } else {
                model.splice(0, 0, msgObj.id);
            }
            for (var key in clients) {
                clients[key].send(JSON.stringify(msgObj));
            }


        } else if (msgObj.modelChange === "dropAfter") {
            var indexTarget = model.indexOf(msgObj.position);
            var indexMoving = model.indexOf(msgObj.id);
            model.splice(indexMoving, 1);
            model.splice(indexTarget, 0, msgObj.id);
            for (var key in clients) {
                clients[key].send(JSON.stringify(msgObj));
            }

        } else {
            for (var key in clients) {
                clients[key].send(msgObj.id + msgObj.text + msgObj.modelChange);
            }

        }


    });

    ws.on('close', function() {
        console.log('соединение закрыто ' + id);
        delete clients[id];
    });

});


// обычный сервер (статика) на порту 8080
var fileServer = new Static.Server('.');
http.createServer(function(req, res) {

    fileServer.serve(req, res);

}).listen(8080);

console.log("Сервер запущен на портах 8080, 8081");
console.log("http://localhost:8080");
