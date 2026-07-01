import os
import redis
from dotenv import load_dotenv

load_dotenv()

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True,
)

# To Open Redis CLI: docker exec -it redis-container redis-cli
#To get all keys: KEYS *
#To get all values : HGETALL tourist:tourist_001