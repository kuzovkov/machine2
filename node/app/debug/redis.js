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
timestamp = (new Date()).toISOString();
rc.hmset([source_id, forecast_id].join(':'), {'forecast_id': forecast_id, 'source_id': source_id, 'price': 263.1, 'timestamp': timestamp}, function (err, res) {
    console.log(res);
});

rc.hmget([source_id, forecast_id].join(':'), ['forecast_id', 'source_id', 'price', 'timestamp'], function (err, res) {
    console.log(res);
});

rc.lrem(key, 0, '{"min_price": 142.432, "max_price": 142.432, "date_max": "2019-12-26 22:50:08.246000"}', function (err, res) {
    console.log(res);
});

var data = {
            '1543': '{"price": 67.0, "code": "USD_RUB", "id": 1543}',
            '1544': '{"price": 75.0, "code": "USD_RUB", "id": 1544}',
            '1556': '{"price": 74.25, "code": "EUR_RUB", "id": 1556}'
        };
console.log(typeof data);
rc.hmset('mykey', data);
rc.hdel('mykey', '1544');
rc.hgetall('mykey', function(err, res){
    console.log(res);
});

var data = {
'1543': '{"forecast_id":"1543","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1544': '{"forecast_id":"1544","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1556': '{"forecast_id":"1556","price":"69.3532","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1557': '{"forecast_id":"1557","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1558': '{"forecast_id":"1558","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1562': '{"forecast_id":"1562","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1564': '{"forecast_id":"1564","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1569': '{"forecast_id":"1569","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1570': '{"forecast_id":"1570","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1571': '{"forecast_id":"1571","price":"69.3532","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1583': '{"forecast_id":"1583","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1584': '{"forecast_id":"1584","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1585': '{"forecast_id":"1585","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1590': '{"forecast_id":"1590","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1611': '{"forecast_id":"1611","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1612': '{"forecast_id":"1612","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1613': '{"forecast_id":"1613","price":"69.3532","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1615': '{"forecast_id":"1615","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1657': '{"forecast_id":"1657","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1667': '{"forecast_id":"1667","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1671': '{"forecast_id":"1671","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1682': '{"forecast_id":"1682","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1684': '{"forecast_id":"1684","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1685': '{"forecast_id":"1685","price":"69.3532","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1686': '{"forecast_id":"1686","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1692': '{"forecast_id":"1692","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1694': '{"forecast_id":"1694","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1695': '{"forecast_id":"1695","price":"1.11762","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1696': '{"forecast_id":"1696","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1697': '{"forecast_id":"1697","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1699': '{"forecast_id":"1699","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1700': '{"forecast_id":"1700","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1713': '{"forecast_id":"1713","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1719': '{"forecast_id":"1719","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1721': '{"forecast_id":"1721","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1722': '{"forecast_id":"1722","price":"69.3532","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1723': '{"forecast_id":"1723","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1736': '{"forecast_id":"1736","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1750': '{"forecast_id":"1750","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1751': '{"forecast_id":"1751","price":"69.3532","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1765': '{"forecast_id":"1765","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1780': '{"forecast_id":"1780","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1807': '{"forecast_id":"1807","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1809': '{"forecast_id":"1809","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1810': '{"forecast_id":"1810","price":"69.3532","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1811': '{"forecast_id":"1811","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1814': '{"forecast_id":"1814","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1820': '{"forecast_id":"1820","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1822': '{"forecast_id":"1822","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1825': '{"forecast_id":"1825","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1831': '{"forecast_id":"1831","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1840': '{"forecast_id":"1840","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1842': '{"forecast_id":"1842","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1849': '{"forecast_id":"1849","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1850': '{"forecast_id":"1850","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1864': '{"forecast_id":"1864","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1865': '{"forecast_id":"1865","price":"1.11762","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1883': '{"forecast_id":"1883","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1884': '{"forecast_id":"1884","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1886': '{"forecast_id":"1886","price":"1.11762","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1888': '{"forecast_id":"1888","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1889': '{"forecast_id":"1889","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1893': '{"forecast_id":"1893","price":"69.3532","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}',
'1896': '{"forecast_id":"1896","price":"62.0705","timestamp":"2019-12-29T18:29:04.150Z","source_id":"libertex_fxclub"}'
};



rc.hmset('mykey', data);
rc.hdel('mykey', '1700');
rc.hgetall('mykey', function(err, res){
    console.log(res);
});







