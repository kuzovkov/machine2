#!/usr/bin/env node

var io = require('socket.io-client');
var tncrypto = require('./tn-crypto');
var fs = require('fs');

var pubKey = '*** PUBLIC KEY ***';
var secKey = '*** SECRET KEY ***';
const SERVICE_URL = 'https://ws.tradernet.ru';
const SERVICE_URL_DEMO = 'https://wsbeta.tradernet.ru';
const AUTH_NEED = false;
const INTERVAL = 5; /*interval in sec*/
const SYMBOLS = ['SBER', 'LKOH', 'GMKN', 'ROSN', 'GAZPM'];
const OUTPUT_FILE = '/data/output.txt';

var ws = io(SERVICE_URL, {
    transports: ['websocket']
});

ws.on('connect', function () {
    console.log('WS connect');
    if (AUTH_NEED){
        auth(ws, pubKey, secKey, function (err, auth) {
            if (err) return console.error('Ошибка авторизации', err);
            console.log('login:', auth.login);
            console.log('mode:', auth.mode);
            if (auth.trade)
                console.log('Приказы подавать можно');
            else
                console.log('Приказы подавать нельзя');
        });
    }
});

ws.on('q', function (data) {
    console.log('/--------------------/', data, (new Date()).toLocaleString(),  '/-----------------------/');
    saveData(data);
});

/**
 * auth
 * @param ws
 * @param pubKey
 * @param secKey
 * @param cb
 */
function auth(ws, pubKey, secKey, cb) {
    var data = {
        apiKey: pubKey,
        cmd: 'getAuthInfo',
        nonce: Date.now()
    };
    var sig = tncrypto.sign(data, secKey);
    ws.emit('auth', data, sig, cb);
}

/**
 * getData
 */
function getData(){
    ws.emit('notifyQuotes', SYMBOLS);
}

/**
 * saveData
 * @param data
 */
function saveData(data) {
    data = ['/--------------------/', JSON.stringify(data), (new Date()).toLocaleString(),  '/-----------------------/', "\n"].join("\n");
    fs.appendFile(OUTPUT_FILE, data, 'utf8', function(err){
        if (err) throw err;
        console.log('Data was appended to file!');
    });
}

setInterval(getData, INTERVAL * 1000);


