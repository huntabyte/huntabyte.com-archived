import { cachified, redisCacheAdapter } from "cachified"
import { redis } from "$lib/server/redis"

export const cache = redisCacheAdapter(redis)

// export async function setObjAsJSON(key: string, obj: any, EX: number) {
// 	return await redis.set(key, JSON.stringify(obj), "EX", EX)
// }
