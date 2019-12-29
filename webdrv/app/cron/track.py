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
from terminaltables import SingleTable
import os

parser = OptionParser()
parser.add_option('--debug', action='store_true', dest='debug_mode', help='Debug mode')
parser.add_option('--show-tracked-redis', action='store_true', dest='show_tracked', help='Get all tracked forecasts from Redis')
parser.add_option('--show-status-redis', action='store_true', dest='show_status', help='Get all statuses forecasts from Redis')
parser.add_option('--show-tracked', action='store_true', dest='get_tracked', help='Get tracked forecasts from Database')
parser.add_option('--track', action='store_true', dest='track', help='Save best prices for tracked forecasts in Redis')
parser.add_option('--failover', action='store_true', dest='failover', help='Check that all works as we need')

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
TRACKED_FORECASTS_HASH_NAME = 'tracked_forecasts'
STATUS_FORECASTS_HASH_NAME = 'status_forecasts'
RAW_DATA_HASH_NAME = 'raw_data'

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
    hash_name = TRACKED_FORECASTS_HASH_NAME
    for forecast in forecasts:
        key = str(int(forecast['id']))
        payload = json.dumps({'id': int(forecast['id']), 'code': forecast['code'], 'price': float(forecast['price'])})
        pipe.hmset(hash_name, {key: payload})
    pipe.execute()
    pipe.close()

def getDataFromRedis(hash_name):
    data = rc.hgetall(hash_name)
    return data

def updateClosedInRedis(forecasts):
    data = rc.hgetall(STATUS_FORECASTS_HASH_NAME)
    pipe = rc.pipeline()
    for forecast in forecasts:
        key = str(int(forecast['id']))
        pipe.hdel(STATUS_FORECASTS_HASH_NAME, key)
        pipe.hdel(TRACKED_FORECASTS_HASH_NAME, key)
    pipe.execute()
    pipe.close()
    return data

def updateBestPrice(data):
    db = db_fforecast
    db.dbopen()
    for item in data.values():
        item = json.loads(item)
        db.cur.execute('UPDATE forecast SET best_price=%s, best_price_time=%s WHERE id=%s', [float(item['price']), item['timestamp'], int(item['forecast_id'])])
    db.conn.commit()
    db.dbclose()

def renewForecasts():
    sql = '''UPDATE forecast SET status='renew', date_forecast=date_forecast + (date_forecast-created_at)/4
             WHERE status='active' and best_price NOTNULL
             AND date_forecast < current_timestamp AND best_price < price_forecast
             AND current_timestamp < date_forecast + (date_forecast-created_at)/4'''
    db_fforecast.execute(sql)

def closeForecasts():
    sql = '''UPDATE forecast SET status='completed', closed_at=current_timestamp, tracked=FALSE
            WHERE status='renew'
            AND date_forecast < current_timestamp'''
    db_fforecast.execute(sql)

    sql = '''UPDATE forecast SET status='completed', closed_at=current_timestamp, tracked=FALSE
            WHERE status='renew' AND date_forecast > current_timestamp AND best_price NOTNULL
            AND best_price > price_forecast'''
    db_fforecast.execute(sql)

    sql = '''UPDATE forecast SET status='completed', closed_at=current_timestamp, tracked=FALSE
            WHERE status='active' AND date_forecast > current_timestamp AND
            current_timestamp < (date_forecast + (date_forecast-created_at)/4)
            AND best_price NOTNULL AND best_price > price_forecast'''
    db_fforecast.execute(sql)

def track():
    print '-' * 60
    print 'Main'
    print '-' * 60
    markTrackedForecasts()
    tf = getTrackedForecasts()
    logger.info('Tracked forecasts:')
    showAsTable(tf)
    updateTrackedInRedis(tf)
    data = getDataFromRedis(STATUS_FORECASTS_HASH_NAME)
    logger.info('Tracked forecasts status in redis:')
    showAsTable(data)
    updateBestPrice(data)
    logger.info('renew Forecasts')
    renewForecasts()
    logger.info('close Forecasts')
    closeForecasts()
    cf = getClosedForecasts()
    logger.info('Closed forecasts:')
    showAsTable(cf)
    data = updateClosedInRedis(cf)
    updateBestPrice(data)
    logger.info('Done')


def showAsTable(data, pr=True):
    if len(data) > 0:
        if (type(data) is list and type(data[0]) is dict):
            headers = data[0].keys()
            table_data = map(lambda row: row.values(), data)
            table_data = [headers] + table_data
            table = SingleTable(table_data)
            if pr:
                print(table.table)
            else:
                return table.table
        elif (type(data) is dict):
            headers = table_data = []
            if type(data.values()[0]) is str:
                headers = json.loads(data.values()[0]).keys()
                table_data = map(lambda row: json.loads(row).values(), data.values())
            elif type(data.values()[0]) is dict:
                headers = (data.values()[0]).keys()
                table_data = map(lambda row: row.values(), data.values())
            table_data = [headers] + table_data
            table = SingleTable(table_data)
            if pr:
                print(table.table)
            else:
                return table.table
    else:
        print 'Nothing to show'

def failover():
    logger.info('failover')
    nginx_instances = int(os.popen("ps -A | grep nginx | wc -l").read())
    if nginx_instances == 0:
        logger.info('Nginx process not found, try launch...')
        logger.info(os.popen('sudo nginx').read())
        time.sleep(3)
    else:
        logger.info('{count} nginx\'s processed found'.format(count=nginx_instances))
    logger.info('Checking raw data...')
    raw_data = getDataFromRedis(RAW_DATA_HASH_NAME)
    if len(raw_data) > 0:
        raw_data = json.loads(raw_data['data'])
        logger.info('Raw data:')
        showAsTable(raw_data)
        if len(raw_data) > 0:
            if 'source_id' in raw_data[0] and 'symbol' in raw_data[0] and 'timestamp' in raw_data[0] and 'value' in raw_data[0]:
                if (int(time.time()) - raw_data[0]['timestamp']/1000) < 10:
                    logger.info('Last update: {time}'.format(time=datetime.datetime.fromtimestamp(raw_data[0]['timestamp']/1000)))
                    logger.info('OK')
                    return
    logger.info('Raw is not OK, try relaunch browser...')
    logger.info(os.popen("sudo killall -9 chrome").read())
    time.sleep(10)
    logger.info(os.system("/usr/src/app/libertex_fxclub_org_d.py"))

def debug():
    print '-'*60
    print 'Debug'
    print '-' * 60
    #markTrackedForecasts()
    tf = getTrackedForecasts()
    showAsTable(tf)
    data = getDataFromRedis(TRACKED_FORECASTS_HASH_NAME)
    showAsTable(data)
    data = getDataFromRedis(STATUS_FORECASTS_HASH_NAME)
    showAsTable(data)
    # pprint(tf)
    #updateTrackedInRedis(tf)
    #data = updateClosedInRedis(tf)
    #pprint(data)


if __name__ == '__main__':
    if options.debug_mode:
        debug()
    elif options.show_tracked:
        data = getDataFromRedis(TRACKED_FORECASTS_HASH_NAME)
        showAsTable(data)
    elif options.show_status:
        data = getDataFromRedis(STATUS_FORECASTS_HASH_NAME)
        showAsTable(data)
    elif options.get_tracked:
        tf = getTrackedForecasts()
        showAsTable(tf)
    elif options.track:
        track()
    elif options.failover:
        failover()
    else:
        pass













