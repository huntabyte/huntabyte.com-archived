import { json, type RequestHandler } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"
import { refreshChangedContent } from "$lib/server/content"

export const POST: RequestHandler = async ({ request }) => {
	const authorization = request.headers.get("Authorization")
	if (!authorization) {
		console.error("/api/webhooks/refresh-content: Missing authorization header")
		return json({ error: "Missing authorization header" }, { status: 400 })
	}
	const authCreds = Buffer.from(authorization.split(" ")[1], "base64").toString(
		"ascii",
	)
	if (authCreds !== env.REFRESH_WEBHOOK_AUTH) {
		console.error("/api/webhooks/refresh-content: Invalid authorization header")
		return json({ error: "Invalid authorization header" }, { status: 400 })
	}

	const body = await request.json()
	console.error("body:", body)
	await refreshChangedContent(body.data)

	return json({ message: "success" })
}
