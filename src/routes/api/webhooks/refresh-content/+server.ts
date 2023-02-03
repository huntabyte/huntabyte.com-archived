import { json, type RequestHandler } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"

export const POST: RequestHandler = async ({ request }) => {
	const authorization = request.headers.get("Authorization")
	if (!authorization) {
		return json({ error: "Missing authorization header" }, { status: 400 })
	}
	const authCreds = Buffer.from(authorization.split(" ")[1], "base64").toString(
		"ascii",
	)
	if (authCreds !== env.REFRESH_WEBHOOK_AUTH) {
		return json({ error: "Invalid authorization header" }, { status: 400 })
	}

	console.log("hit webhook")
	return json("hit webhook")
}
