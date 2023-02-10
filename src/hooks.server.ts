import type { Handle } from "@sveltejs/kit"
import { logger } from "$lib/logger"

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event)

	return response
}
