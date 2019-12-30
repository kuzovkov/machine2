#!/usr/bin/env node

rc = require('../modules/rc.js').rc;

const TRACKED_FORECASTS_HASH_NAME = 'tracked_forecasts';
const STATUS_FORECASTS_HASH_NAME = 'status_forecasts';
const RAW_DATA_HASH_NAME = 'raw_data';

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
 * Функция для отслеживаемых прогнозов обновляет лучшую цену и сохраняет это всё в Redis
 * @param data array of objects [{symbol: symbol, value: value, timestamp: timestamp, source_id: source_id }, ...]
 */
function track(data){
    var dataIndex1 = {};
    var dataIndex2 = {};
    var dataIndex3 = {};
    var trackedForecasts = {};
    var statusForecasts = {};
    var source_id = null;
    for(var i = 0; i < data.length; i++){
        var symbol = data[i].symbol;
        dataIndex1[symbol] = i;
        var alias = [symbol.substring(0, 3), symbol.substring(3)].join('_');
        dataIndex2[alias] = i;
        alias = [symbol.substring(0, 3), symbol.substring(3)].join('/');
        dataIndex3[alias] = i;
    }
    status_forecasts_hash_name = STATUS_FORECASTS_HASH_NAME;
    if (data.length > 0){
        source_id = data[0].source_id;
        status_forecasts_hash_name = [STATUS_FORECASTS_HASH_NAME, source_id].join('_');
    }

    
    getHashData(TRACKED_FORECASTS_HASH_NAME)
        .then(function (forecasts) {
            if (forecasts){
                for (var forecastId in forecasts){
                    trackedForecasts[forecastId] = JSON.parse(forecasts[forecastId]);
                }
            }
            return getHashData(status_forecasts_hash_name);
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
            //update statusForecasts object in memory
            for(var trackedForecastId in trackedForecasts){
                var symbol = trackedForecasts[trackedForecastId]['code'];
                var symbolIndex = dataIndex1[symbol] || dataIndex2[symbol] || dataIndex3[symbol];
                if (symbolIndex == undefined)
                    continue;
                if (statusForecasts[trackedForecastId] == undefined){
                    var payload = {'forecast_id': trackedForecastId, 'price': data[symbolIndex].value, 'timestamp': (new Date(data[symbolIndex].timestamp)).toISOString(), 'source_id': data[symbolIndex].source_id};
                    statusForecasts[trackedForecastId] = JSON.stringify(payload);
                }else{
                    var newPrice = data[symbolIndex].value;
                    var oldPrice = statusForecasts[trackedForecastId].price;
                    var forecastPrice =trackedForecasts[trackedForecastId].price;
                    if (isNewPriceBetter(newPrice, oldPrice, forecastPrice)){
                        var payload = {'forecast_id': trackedForecastId, 'price': newPrice, 'timestamp': (new Date(data[symbolIndex].timestamp)).toISOString(), 'source_id': data[symbolIndex].source_id};
                        statusForecasts[trackedForecastId] = JSON.stringify(payload);
                    }else{
                        delete statusForecasts[trackedForecastId];
                    }
                }
            }
            //update STATUS_FORECASTS_HASH in Redis
            if (Object.keys(statusForecasts).length > 0){
                rc.hmset(status_forecasts_hash_name, statusForecasts);
            }

        })
}

/**
 * is new price better?
 * @param newPrice
 * @param oldPrice
 * @param forecastPrice
 * @returns {boolean}
 */
function isNewPriceBetter(newPrice, oldPrice, forecastPrice){
    return (Math.abs(forecastPrice - newPrice) <= Math.abs(forecastPrice - oldPrice));
}

/**
 * Save raw data to Redis
 * @param data array of objects [{symbol: symbol, value: value, timestamp: timestamp, source_id: source_id }, ...]
 */
function saveRawData(data) {
    rc.hmset(RAW_DATA_HASH_NAME, {'data': JSON.stringify(data)});
}

exports.track = track;
exports.saveRawData = saveRawData;
