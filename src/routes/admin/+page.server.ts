import type { Actions, PageServerLoad } from "./$types"
import { env } from "$env/dynamic/private"
import { error, fail } from "@sveltejs/kit"
import { adminRefreshContent, refreshAllContent } from "$lib/server/content"
import { logger } from "$lib/logger"

export const load: PageServerLoad = async ({ request }) => {
	const authHeader = request.headers.get("Authorization")
	const token = authHeader?.split(" ")[1]
	if (token !== env.ADMIN_TOKEN) {
		throw error(401, "Unauthorized")
	}
	return {}
}

export const actions: Actions = {
	refreshContent: async ({ request }) => {
		const authHeader = request.headers.get("Authorization")
		const token = authHeader?.split(" ")[1]
		if (token !== env.ADMIN_TOKEN) {
			throw error(401, "Unauthorized")
		}
		const { contentDir, slug } = Object.fromEntries(
			await request.formData(),
		) as Record<string, string>
		const result = await adminRefreshContent(contentDir, slug)
		if (!result) {
			logger.error("Could not refresh content")
			return fail(500, { message: "Could not refresh content" })
		}
		logger.info(`Refreshed ${contentDir}/${slug}`)
		return {
			success: true,
		}
	},
	refreshAllContent: async ({ request }) => {
		const authHeader = request.headers.get("Authorization")
		const token = authHeader?.split(" ")[1]
		if (token !== env.ADMIN_TOKEN) {
			throw error(401, "Unauthorized")
		}
		const result = await refreshAllContent()
		if (!result) {
			logger.error("Could not refresh content")
			return fail(500, { message: "Could not refresh content" })
		}
		logger.info("Refreshed all content")
		return {
			success: true,
		}
	},
}
