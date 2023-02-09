import { logger } from "$lib/logger"
import { getBlogListItems } from "$lib/server/content"
import type { PageServerLoad } from "./$types"
import { env } from "$env/dynamic/private"

export const load: PageServerLoad = async () => {
	logger.info(`Currently in region: ${env.FLY_REGION}`)
	logger.info(`Currently in region process: ${process.env.FLY_REGION}`)
	return {
		posts: getBlogListItems(),
	}
}
