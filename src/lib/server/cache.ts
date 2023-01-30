import { redis } from "$lib/server/redis"

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function setObjAsJSON(key: string, obj: any, EX: number) {
	return await redis.set(key, JSON.stringify(obj), "EX", EX)
}
