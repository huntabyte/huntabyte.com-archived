import { Redis } from "ioredis"
import { REDIS_URI } from "$env/static/private"

const redis = new Redis(REDIS_URI)

export { redis }
