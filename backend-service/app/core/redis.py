import redis
from app.core.config import settings

redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True,
)


def get_redis():
    return redis_client

# To Open Redis CLI: docker exec -it redis-container redis-cli
# To get all keys: KEYS *
# To get all values: HGETALL tourist:tourist_001