#!/usr/bin/env node

rc = require('../modules/rc.js').rc;

rc.set('my test key', 'my test value');
rc.get('my test key', function (error, result) {
    if (error) {
        console.log(error);
        throw error;
    }
    console.log('GET result ->' + result);
});


rc.set("string key", "string val");
rc.hset("hash key", "hashtest 1", "some value");
rc.hset(["hash key", "hashtest 2", "some other value"]);
rc.hkeys("hash key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
    rc.quit();
});

rc.hmset("key", ["test keys 1", "test val 1", "test keys 2", "test val 2"], function (err, res) {});
rc.hmget('key', ['test key 1', 'test key 2'], function (err, res) {
    console.log(res);
});


key = 'key1';
res = rc.rpush(key, JSON.stringify({
    'max_price': 110.0,
    'min_price': 105.0,
    'date_max': (new Date()).toLocaleString()
}), function (err, res) {console.log(res);});


rc.lrange(key, 0, -1, function (err, res) {
    console.log(res);
});


forecast_id = 125;
source_id = 'libertex_fxclub';
timestamp = (new Date()).toLocaleString();
rc.hmset([source_id, forecast_id].join(':'), {'forecast_id': forecast_id, 'source_id': source_id, 'price': 263.1, 'timestamp': timestamp}, function (err, res) {
    console.log(res);
});

data = rc.hmget([source_id, forecast_id].join(':'), ['forecast_id', 'source_id', 'price', 'timestamp'], function (err, res) {
    console.log(res);
});

rc.lrem(key, 0, '{"min_price": 142.432, "max_price": 142.432, "date_max": "2019-12-26 22:50:08.246000"}', function (err, res) {
    console.log(res);
});
