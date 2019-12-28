#!/usr/bin/env python
#coding=utf-8

#################################################
# Save to redis min and max values of courses   #
#################################################

import conf
from mylogger import logger
from pg import PgSQLStore
from rc import RedisClient
from pprint import pprint
import time
import json
import datetime
from optparse import OptionParser

parser = OptionParser()
parser.add_option('--debug', action='store_true', dest='debug_mode', help='Debug mode')
parser.add_option('--show-tracked', action='store_true', dest='show_tracked', type='string', help='Get all tracked forecasts from Redis')
parser.add_option('--show-status', action='store_true', dest='show_status', type='string', help='Get all statuses forecasts from Redis')

(options, args) = parser.parse_args()

rc = RedisClient().getRc()

db_courses_conf = {
    'dbname': conf.db['courses']['DB_NAME'], 
    'dbhost': conf.db['courses']['DB_HOST'],
    'dbport': conf.db['courses']['DB_PORT'],
    'dbuser': conf.db['courses']['DB_USER'],
    'dbpass': conf.db['courses']['DB_PASSWORD']
}

db_fforecast_conf = {
    'dbname': conf.db['fforecast']['DB_NAME'], 
    'dbhost': conf.db['fforecast']['DB_HOST'],
    'dbport': conf.db['fforecast']['DB_PORT'],
    'dbuser': conf.db['fforecast']['DB_USER'],
    'dbpass': conf.db['fforecast']['DB_PASSWORD']
}
db_courses = PgSQLStore(db_courses_conf)
db_fforecast = PgSQLStore(db_fforecast_conf)

SOURCE_ID = 'libertex_fxclub'

def markTrackedForecasts():
    sql = '''UPDATE forecast SET tracked=TRUE WHERE id IN
            (SELECT id FROM forecast WHERE (status='active' OR status='renew')
             AND date(current_timestamp) <= date(date_forecast)
            AND date(current_timestamp) >=  date(date_forecast - (date_forecast-created_at)/4))'''
    db_fforecast.execute(sql)
    sql = '''UPDATE forecast SET tracked=FALSE WHERE id NOT IN
            (SELECT id FROM forecast WHERE (status='active' OR status='renew')
             AND date(current_timestamp) <= date(date_forecast)
            AND date(current_timestamp) >=  date(date_forecast - (date_forecast-created_at)/4))'''
    db_fforecast.execute(sql)


def getTrackedForecasts():
    sql = '''SELECT forecast.id, forecast.price_forecast as price, s.code FROM forecast
            INNER JOIN symbol s on forecast.symbol_id = s.id
            WHERE (status='active' OR status='renew')
             AND date(current_timestamp) <= date(date_forecast)
            AND date(current_timestamp) >=  date(date_forecast - (date_forecast-created_at)/4)'''
    res = db_fforecast._getraw(sql, ['id', 'price', 'code'])
    return res

def getUntrackedForecast():
    sql = '''SELECT id from forecast WHERE id NOT IN
            (SELECT forecast.id FROM forecast
            WHERE (status='active' OR status='renew')
             AND date(current_timestamp) <= date(date_forecast)
            AND date(current_timestamp) >=  date(date_forecast - (date_forecast-created_at)/4))'''
    res = db_fforecast._getraw(sql, ['id'])
    return res

def getClosedForecasts(interval='1 day'):
    sql = '''SELECT id FROM forecast WHERE (status='closed' OR status='completed')
            AND closed_at NOTNULL AND closed_at >= (current_timestamp-interval '{interval}')'''.format(interval=interval)
    res = db_fforecast._getraw(sql, ['id'])
    return res

def updateTrackedInRedis(forecasts):
    pipe = rc.pipeline()
    for forecast in forecasts:
        key = ':'.join(['tracked_forecasts', str(int(forecast['id']))])
        payload = {'id': int(forecast['id']), 'code': forecast['code'], 'price': float(forecast['price'])}
        pipe.hmset(key, payload)
    pipe.execute()
    pipe.close()

def getDataFromRedis(forecasts, key_name):
    data = {}
    for forecast in forecasts:
        key = ':'.join([key_name, str(int(forecast['id']))])
        data[int(forecast['id'])] = rc.hgetall(key)
    return data

def updateClosedInRedis(forecasts):
    data = {}
    for forecast in forecasts:
        key = ':'.join(['tracked_forecasts', str(int(forecast['id']))])
        data[int(forecast['id'])] = rc.hgetall(key)
    pipe = rc.pipeline()
    for forecast in forecasts:
        fields = ['id', 'code', 'price']
        key = ':'.join(['tracked_forecasts', str(int(forecast['id']))])
        pipe.hdel(key, fields)
    pipe.execute()
    pipe.close()
    return data

def updatePriceClosed(data):
    pprint(data)

def renewForecasts():
    sql = '''UPDATE forecast SET status='renew', date_forecast=date_forecast + (date_forecast-created_at)/4
             WHERE status='active' and price_closed NOTNULL
             AND date_forecast < current_timestamp AND price_closed < price_forecast
             AND current_timestamp < date_forecast + (date_forecast-created_at)/4'''
    db_fforecast.execute(sql)

def closeForecasts():
    sql = '''UPDATE forecast SET status='completed', closed_at=current_timestamp, tracked=FALSE
            WHERE status='renew'
            AND date_forecast < current_timestamp'''
    db_fforecast.execute(sql)

    sql = '''UPDATE forecast SET status='completed', closed_at=current_timestamp, tracked=FALSE
            WHERE status='renew' AND date_forecast > current_timestamp AND price_closed NOTNULL
            AND price_closed > price_forecast'''
    db_fforecast.execute(sql)

    sql = '''UPDATE forecast SET status='completed', closed_at=current_timestamp, tracked=FALSE
            WHERE status='active' AND date_forecast > current_timestamp AND
            current_timestamp < (date_forecast + (date_forecast-created_at)/4)
            AND price_closed NOTNULL AND price_closed > price_forecast'''
    db_fforecast.execute(sql)

def main():
    markTrackedForecasts()
    tf = getTrackedForecasts()
    # pprint(tf)
    updateTrackedInRedis(tf)
    data = getDataFromRedis(tf, 'status_forecasts')
    updatePriceClosed(data)
    renewForecasts()
    closeForecasts()
    cf = getClosedForecasts()
    #pprint(cf)
    data = updateClosedInRedis(cf)
    updatePriceClosed(data)

def debug():
    print 'Debug'


if __name__ == '__main__':
    if options.debug:
        debug()
    elif options.show_tracked:
        tf = getTrackedForecasts()
        data = getDataFromRedis(tf, 'tracked_forecasts')
        pprint(data)
    elif options.show_tracked:
        tf = getTrackedForecasts()
        data = getDataFromRedis(tf, 'status_forecasts')
        pprint(data)
    else:
        main()




'''
symbols = db_courses._get('symbol')
pprint(symbols)
print('-' * 80)
forecasts = db_fforecast._get('forecast')
pprint(forecasts)
print('-' * 80)
pipe = rc.pipeline()
key = symbols[0]['scode']+'@'+'source_id'
res = pipe.rpush(key, json.dumps({
    'max_price': float(symbols[0]['price']),
    'min_price': float(symbols[0]['price']),
    'date_max': str(symbols[0]['updated_at'])
})).execute()
pprint(res[0])
print('-' * 80)
data = rc.lrange(key, 0, -1)
pprint(data)
print('-' * 80)
forecast_id = 125
source_id = 'libertex_fxclub'
timestamp = datetime.datetime.now()
res = rc.hmset(':'.join([str(source_id), str(forecast_id)]), {'forecast_id': forecast_id, 'source_id': source_id, 'price': float(symbols[1]['price']), 'timestamp': str(timestamp)})
pprint(res)
data = rc.hmget(':'.join([str(source_id), str(forecast_id)]), ['forecast_id', 'source_id', 'price', 'timestamp'])
pprint(data)
rc.lrem(key, 0, '{"min_price": 142.432, "max_price": 142.432, "date_max": "2019-12-26 22:50:08.246000"}')
'''













