import { Octokit as createOctokit } from "@octokit/rest"
import { throttling } from "@octokit/plugin-throttling"
import { env } from "$env/dynamic/private"
import { z } from "zod"
import { logger } from "$lib/logger"

const ref = "main"

const Octokit = createOctokit.plugin(throttling)

type ThrottleOptions = {
	method: string
	url: string
	request: { retryCount: number }
}

// Interacting with the GitHub API in this manner was inspired by @kentcdodds
const octokit = new Octokit({
	auth: env.GH_TOKEN,
	throttle: {
		onRateLimit: (retryAfter: number, options: ThrottleOptions) => {
			logger.warn(
				`Request quota exhausted for request ${options.method} ${options.url}. Retrying after ${retryAfter} seconds.`,
			)

			return true
		},
		onAbuseLimit: (retryAfter: number, options: ThrottleOptions) => {
			octokit.log.warn(
				`Abuse detected for request ${options.method} ${options.url}`,
			)
            logger.warn(
				`Abuse detected for request ${options.method} ${options.url}`,
			)
		},
	},
})

/**
 *
 * @param relativePath - Path relative to the content directory.
 * 
 * Example: content/articles/first-article.md => articles/first-article.md
 * 
 * Example: content/snippets/sample-snippet.md => snippets/sample-snippet.md
 */
export async function getMarkdownContent(relativePath: string) {
	const path = `content/${relativePath}.md`
    logger.debug(`Getting content for "${path}" from GitHub`)

	const { data } = await octokit.repos.getContent({
		owner: "huntabyte",
		repo: "huntabyte.com",
		path,
		ref,
	})
    logger.debug(`Received content for "${path}" from GitHub`)
    logger.debug(`Parsing content for "${path}"`)
	const parsedData = z
    .object({
        encoding: z.string(),
        content: z.string(),
    })
    .parse(data)
    logger.debug(`Parsed content for "${path}"`)
    
	return Buffer.from(
		parsedData.content,
		parsedData.encoding as BufferEncoding,
	).toString()
}

/**
 * @param path the full path to content directory
 */
export async function getMarkdownContentList(path: string): Promise<{path: string, name: string}[]> {
    logger.debug(`Getting content list for "${path}" from GitHub`)
	const res = await octokit.repos.getContent({
		owner: "huntabyte",
		repo: "huntabyte.com",
		path,
		ref,
	})
    logger.debug(`Received content list for "${path}" from GitHub`)
	// Strip unused properties from the response
	return z
		.array(z.object({ name: z.string(), path: z.string() }))
		.parse(res.data)
}
