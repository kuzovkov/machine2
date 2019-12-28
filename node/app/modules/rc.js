const getenv = require('getenv');
const redis_host = getenv('REDIS_HOST');
const redis_port = getenv('REDIS_PORT');
const redis_password = getenv('REDIS_PASSWORD');


var redis = require("redis"),
rc = redis.createClient({host: redis_host, port: parseInt(redis_port)});

rc.on("error", function (err) {
    console.log("Error " + err);
});

rc.on('connect', function() {
    console.log('Redis client connected');
});



exports.rc = rc;

