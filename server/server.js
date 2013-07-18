/**
 * Created with JetBrains PhpStorm.
 * User: lispad
 * Date: 18.07.13
 * Time: 18:22
 * Server side on node.js
 */

var clientWS = [];
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 8080});

wss.on('connection', function (ws) {
    clientWS.push(ws);
    console.log('Connected. Total: ', clientWS.length, ' clients');
    ws.on('message', function (message) {
        console.log('received: %s', message);
        clientWS.forEach(function (clientSocket) {
            clientSocket.send(message);
        });
    });

    ws.on('close', function () {
        clientWS.splice(clientWS.indexOf(ws), 1);
        console.log('Disconnected. Total: ', clientWS.length, ' clients');
    });

});

