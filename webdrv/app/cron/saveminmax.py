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










