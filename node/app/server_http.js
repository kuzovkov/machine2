#!/usr/bin/env node

/*сервер*/

var fs = require('fs');
var express = require('express');
var app = express();
var fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var port_default = 80;
var port = (process.argv.length > 2)? parseInt(process.argv[2]) : port_default;
var cons = require('consolidate');
var store = require('./modules/store.js');
var tracker = require('./modules/tracker.js');
var sockets = {};

server.listen(port,function(){
    console.log('Server start at port '+port+ ' ' + (new Date()).toLocaleString());
    /*сброс привилегий*/
    if (process.getuid && process.setuid) {
        console.log('Current uid: ' + process.getuid());
        if (process.geteuid)
            console.log('Current euid: ' + process.geteuid());
        try {
            process.setuid('www-data');
            console.log('New uid: ' + process.getuid());
            if (process.geteuid && process.seteuid){
                process.seteuid('www-data');
                console.log('New euid: ' + process.geteuid());
            }
        }
        catch (err) {
            console.log('Failed to set uid: ' + err);
        }
    }
});

/* настройки для рендеринга шаблонов*/
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views',__dirname+'/views');

/* подключение каталога статических файлов, cookies, bodyParser */
app.use(express.static(__dirname+'/public'));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*обработка запросов*/
app.get('/', function (req, res) {
    res.render('index');
});

app.post('/data', function (req, res) {
    //console.log(JSON.stringify(req.body));
    res.set({'Access-Control-Allow-Origin': '*'});
    try{
        data = req.body;
        if (typeof(data) === 'string')
            data = JSON.parse(data);
        if (data.data !== undefined)
            data = data.data;
        //console.log(data);
        store.insertData(data); //update courses in database
        shareData(sockets, data); //send date to connected browsers
        tracker.track(data); //track symbols price for check best forecast's price
        tracker.saveRawData(data); //save raw data to redis for control
    }catch (e){
        console.error(e.message);
    }
    res.send(req.body);
});

io.on('connection', function(socket){
    console.log('Socket connected, id=', socket.id);
    sockets[socket.id] = socket;
    console.log('sockets: ', Object.keys(sockets).length);
    socket.on('disconnect', function () {
        console.log('Socket disconnected, id=', socket.id);
        delete sockets[socket.id];
        console.log('sockets: ', Object.keys(sockets).length);
    });

});

function shareData(sockets, data){
    for (var id in sockets){
        sockets[id].emit('data', data);
    }
}








