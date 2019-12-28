#!/usr/bin/env node

rc = require('../modules/rc.js').rc;

const TRACKED_FORECASTS_HASH_NAME = 'tracked_forecasts';
const STATUS_FORECASTS_HASH_NAME = 'status_forecasts';

/**
 * getHashData
 * @param hash_name
 * @returns {Promise}
 */
function getHashData(hash_name){
    return new Promise(function(resolve, reject) {
        rc.hgetall(hash_name, function (err, res) {
            if (err) {
                reject(err);
            }else{
                resolve(res);
            }
        });
    });
}


/**
 * Track forecasts prices
 * @param data array of objects [{symbol: symbol, value: value, timestamp: timestamp, source_id: source_id }, ...]
 */
function track(data){
    var dataIndex1 = {};
    var dataIndex2 = {};
    var dataIndex3 = {};
    var trackedForecasts = {};
    var statusForecasts = {};
    for(var i = 0; i < data.length; i++){
        dataIndex1[symbol] = i;
        var alias = [symbol.substring(0, 3), symbol.substring(3)].join('_'); 
        dataIndex2[alias] = i;
        alias = [symbol.substring(0, 3), symbol.substring(3)].join('/'); 
        dataIndex3[alias] = i;
    }
    
    getHashData(TRACKED_FORECASTS_HASH_NAME)
        .then(function (forecasts) {
            if (forecasts){
                for (var forecastId in forecasts){
                    trackedForecasts[forecastId] = JSON.parse(forecasts[forecastId]);
                }
            }
            return getHashData(STATUS_FORECASTS_HASH_NAME);
        })
        .then(function (forecasts) {
            if (forecasts){
                for (var forecastId in forecasts){
                    statusForecasts[forecastId] = JSON.parse(forecasts[forecastId]);
                }
            }
            return true;
        })
        .catch(function (err) {
            console.log(err);
        })
        .then(function (res) {
            //update statusForecasts jbject in memory
            for(var trackedForecastId in trackedForecasts){
                var symbol = trackedForecasts[forecastId]['code'];
                var symbolIndex = symbolIndex = dataIndex1[symbol] || dataIndex2[symbol] || dataIndex3[symbol];
                if (symbolIndex == undefined)
                    continue;
                if (statusForecasts[trackedForecastId] == undefined){
                    var payload = {'forecast_id': trackedForecastId, 'price': data[symbolIndex].value, 'timestamp': data[symbolIndex].timestamp, 'source_id': data[symbolIndex].source_id};
                    statusForecasts[trackedForecastId] = JSON.stringify(payload);
                }else{
                    var newPrice = data[symbolIndex].value;
                    var oldPrice = statusForecasts[trackedForecastId].price;
                    var forecastPrice =trackedForecasts[trackedForecastId].price;
                    if (newPriceIsBetter(newPrice, oldPrice, forecastPrice)){
                        var payload = {'forecast_id': trackedForecastId, 'price': newPrice, 'timestamp': data[symbolIndex].timestamp, 'source_id': data[symbolIndex].source_id};
                        statusForecasts[trackedForecastId] = JSON.stringify(payload);
                    }
                }
                //update STATUS_FORECASTS_HASH in Redis
                rc.hmset(STATUS_FORECASTS_HASH_NAME, statusForecasts, function (err, res) {
                    console.log(res);
                })
            }
        })
}

/**
 * New Price Is Better
 * @param newPrice
 * @param oldPrice
 * @param forecastPrice
 * @returns {boolean}
 */
function newPriceIsBetter(newPrice, oldPrice, forecastPrice){
    return (Math.abs(forecastPrice - newPrice) < Math.abs(forecastPrice - oldPrice)) && newPrice >= forecastPrice;
}

exports.track = track;
