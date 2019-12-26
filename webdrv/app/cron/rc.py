import conf
import redis

# Singleton
class RedisClient:
    _rc = None

    class __RedisClient:
        _rc = None

        def __init__(self):
            if conf.REDIS_PASSWORD and len(conf.REDIS_PASSWORD) > 0:
                self._rc = redis.Redis(host=conf.REDIS_HOST, port=conf.REDIS_PORT,
                                       password=conf.REDIS_PASSWORD)
            else:
                self._rc = redis.Redis(host=conf.REDIS_HOST, port=conf.REDIS_PORT)

        def getRc(self):
            return self._rc

    instance = None

    def __init__(self):
        if not RedisClient.instance:
            RedisClient.instance = RedisClient.__RedisClient()
        else:
            RedisClient._rc = RedisClient.instance._rc

    def __getattr__(self, name):
        return getattr(self.instance, name)


