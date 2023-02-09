import { json, type RequestHandler } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"
import { refreshChangedContent } from "$lib/server/content"
import { ZodError } from "zod"
import { modifiedContentSchema } from "$lib/schemas"
import type { ModifiedContent } from "$lib/types"
import { logger } from "$lib/logger"

export const POST: RequestHandler = async ({ request }) => {
	const authorization = request.headers.get("Authorization")
	if (!authorization) {
		logger.info("/api/webhooks/refresh-content: Missing authorization header")
		return json({ error: "Missing authorization header" }, { status: 400 })
	}
	const authCreds = Buffer.from(authorization.split(" ")[1], "base64").toString(
		"ascii",
	)
	if (authCreds !== env.REFRESH_WEBHOOK_AUTH) {
		logger.info("/api/webhooks/refresh-content: Invalid authorization header")
		return json({ error: "Invalid authorization header" }, { status: 400 })
	}

	logger.info("Received content changes.")
	const body = await request.json()

	let parsedBody: ModifiedContent | null
	logger.info(`Raw Body:, ${body.data}`)

	try {
		parsedBody = modifiedContentSchema.parse(body.data)
	} catch (e) {
		if (e instanceof ZodError) {
			logger.error(`Failed to parse body of changed files. ${e} `)
		}
		parsedBody = null
	}

	if (!parsedBody) {
		return json({ message: "Error parsing request body" }, { status: 400 })
	}

	await refreshChangedContent(parsedBody)

	return json({ message: "success" })
}
