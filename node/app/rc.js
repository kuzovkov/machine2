var redis = require("redis"),
rc = redis.createClient({host: 'redis', port: 6379});

rc.on("error", function (err) {
    console.log("Error " + err);
});

rc.on('connect', function() {
    console.log('Redis client connected');
});

exports.rc = rc;

