import { createClient } from "redis"
import { REDIS_URI } from "$env/static/private"

const redis = createClient({ url: REDIS_URI })

export { redis }
