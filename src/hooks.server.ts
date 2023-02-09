import type { Handle } from "@sveltejs/kit"
import { logger } from "$lib/logger"

export const handle: Handle = async ({ event, resolve }) => {
	const requestedRegion = event.request.headers.get("fly-replay")
	const response = await resolve(event)

	if (requestedRegion) {
		logger.info(`Requested region: ${requestedRegion}`)
		response.headers.set("fly-replay", requestedRegion)
		return Response.redirect(event.url.toString().split("?")[0], 302)
	}

	response.headers.set("X-Frame-Options", "SAMEORIGIN")
	response.headers.set("Referrer-Policy", "no-referrer")
	response.headers.set(
		"Permissions-Policy",
		"accelerometer=(), autoplay=(), camera=(), document-domain=(), encrypted-media=(), fullscreen=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=(), geolocation=()",
	)
	response.headers.set("X-Content-Type-Options", "nosniff")

	return response
}
