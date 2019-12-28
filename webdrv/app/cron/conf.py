import os

host_ip = os.popen("route | grep default | awk {'print $2'}").read()
db = {
    'fforecast': {
        #'DB_HOST': 'fp.double.systems',  #dev
        #'DB_PORT': 35432,                #dev
        'DB_PORT': 25432,                 #local
        'DB_HOST': host_ip,               #local
        'DB_USER': 'fforecast',
        'DB_NAME': 'fforecast',
        'DB_PASSWORD': 'Admin123456'
    },

    'courses': {
        'DB_HOST': 'db',
        'DB_PORT': 5432,
        'DB_USER': 'parser',
        'DB_NAME': 'courses',
        'DB_PASSWORD': 'Admin123456'
    }
}

REDIS_HOST = 'redis'
REDIS_PORT = 6379
REDIS_PASSWORD = None #'kpaHqGrSvJf5TLCU'

