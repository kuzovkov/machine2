#!/usr/bin/env node

//work by webscoket protocol

var io = require('socket.io-client');

var ws = io('https://p2pvideo.chat', {
    transports: ['websocket']
});

ws.on('connect', function () {
    console.log('WS connect');
});

ws.on('ice', function (data) {
    console.log(data);
});




ws.emit('get_ice', {});
setInterval(function () {
    console.log('get_ice');
    ws.emit('get_ice', {});
}, 3000);





