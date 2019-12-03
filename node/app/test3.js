#!/usr/bin/env node

//work by webscoket protocol

var io = require('socket.io-client');
var sslRootCAs = require('ssl-root-cas/latest');
sslRootCAs.inject();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

var ws = io('wss://stream145.forexpros.com', {
    transports: ['websocket'],
    path: '/echo/426/2kok32wq/websocket',
    query: {},
    extraHeaders: {

            }

});

ws.on('connect', function () {
    console.log('WS connect');
});

ws.on('pid-13691', function (data) {
    console.log(data);
});

ws.on('connect_error', function(error){console.log(error);});
ws.on('reconnect_attempt', function () {ws.io.opts.transports = ['polling', 'websocket'];});






