import { logger } from "$lib/logger"
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event)
	response.headers.set("X-Frame-Options", "SAMEORIGIN")
	response.headers.set("Referrer-Policy", "no-referrer")
	response.headers.set(
		"Permissions-Policy",
		"accelerometer=(), autoplay=(), camera=(), document-domain=(), encrypted-media=(), fullscreen=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()",
	)
	response.headers.set("X-Content-Type-Options", "nosniff")

	logger.info("This is info")
	logger.error("This is an error")
	logger.warn("This is warn")
	logger.debug("This is debug")
	logger.http("This is http")
	return response
}
