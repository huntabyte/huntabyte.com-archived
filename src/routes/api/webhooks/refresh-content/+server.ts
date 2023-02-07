import { json, type RequestHandler } from "@sveltejs/kit"
import { env } from "$env/dynamic/private"
import { refreshChangedContent } from "$lib/server/content"
import { ZodError } from "zod"
import { modifiedContentSchema } from "$lib/schemas"
import type { ModifiedContent } from "$lib/types"

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
	console.error("body:", body.data)
	let parsedBody: ModifiedContent | null

	try {
		parsedBody = modifiedContentSchema.parse(body.data)
	} catch (e) {
		if (e instanceof ZodError) {
			console.log(e)
		}
		parsedBody = null
	}

	if (!parsedBody) {
		return json({ message: "Error parsing request body" }, { status: 400 })
	}

	console.log(parsedBody)

	await refreshChangedContent(parsedBody)

	return json({ message: "success" })
}

const body = {
	data: {
		updated: "blog/something.md",
		renamed: "blog/something.md blog/somethingElse.md",
		deleted: "blog/another-article.md",
		created: "blog/anothernother-article.md",
	},
}
