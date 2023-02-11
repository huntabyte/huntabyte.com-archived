import type { Actions, PageServerLoad } from "./$types"
import { env } from "$env/dynamic/private"
import { error, fail } from "@sveltejs/kit"
import {
	refreshCacheContent,
	refreshAllCachedContent,
} from "$lib/server/content"
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

		try {
			await refreshCacheContent(contentDir, slug)
		} catch (e) {
			logger.error(`Could not refresh ${contentDir}/${slug}`)
			logger.error(e)
			return fail(500, { message: `Could not refresh ${contentDir}/${slug}` })
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
		try {
			await refreshAllCachedContent()
		} catch (e) {
			logger.error("Could not refresh all content")
			logger.error(e)
			return fail(500, { message: "Could not refresh all content" })
		}
		logger.info("Successfully refreshed all content")
		return {
			success: true,
		}
	},
}
