#!/usr/bin/env node

//work by websocket protocol

var io = require('socket.io-client');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var ws = io('https://p2pvideo.chat', {
    transports: ['websocket']
});

ws.on('connect', function () {
    console.log('WS connect');
    initInterface(rl);
});

ws.on('ice', function (data) {
   console.log(data);
});


function initInterface(rl) {
    console.log('Enter you commands:');
    rl.on('line', function(line){
        console.log('You entered:', line);
        if (line == 'quit' || line == 'exit'){
            console.log('Bye');
            rl.close();
            process.exit(0);
        }
        try{
            var obj = JSON.parse(line);
            if (obj.d == undefined)
                obj.d = {};
            console.log("You entered: ", "event: ", obj.e, "data: ", obj.d);
            ws.emit(obj.e, obj.d);
        }catch (e){
            console.log('Input error');
        }

    });
}







