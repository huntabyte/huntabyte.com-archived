import { Octokit as createOctokit } from "@octokit/rest"
import { throttling } from "@octokit/plugin-throttling"
import { z } from "zod"

const ref = "main"
const GH_TOKEN = process.env.GH_TOKEN

const Octokit = createOctokit.plugin(throttling)

type ThrottleOptions = {
	method: string
	url: string
	request: { retryCount: number }
}

// Interacting with the GitHub API in this manner was inspired by @kentcdodds
const octokit = new Octokit({
	auth: GH_TOKEN,
	throttle: {
		onRateLimit: (retryAfter: number, options: ThrottleOptions) => {
			console.warn(
				`Request quota exhausted for request ${options.method} ${options.url}. Retrying after ${retryAfter} seconds.`,
			)

			return true
		},
		onAbuseLimit: (retryAfter: number, options: ThrottleOptions) => {
			octokit.log.warn(
				`Abuse detected for request ${options.method} ${options.url}`,
			)
		},
	},
})

/**
 *
 * @param relativePath - Path relative to the content directory.
 * Example: content/articles/first-article.md => articles/first-article.md
 * Example: content/snippets/sample-snippet.md => snippets/sample-snippet.md
 */
export async function getMarkdownContent(relativePath: string) {
	const path = `content/${relativePath}.md`
	const { data } = await octokit.repos.getContent({
		owner: "huntabyte",
		repo: "huntabyte.com",
		path,
		ref,
	})

	const parsedData = z
		.object({
			encoding: z.string(),
			content: z.string(),
		})
		.parse(data)

	return Buffer.from(
		parsedData.content,
		parsedData.encoding as BufferEncoding,
	).toString()
}

/**
 *
 * @param path the full path to content directory
 * @returns a promise that resolves to a list of files and directories at the provided path
 */
export async function getMarkdownContentList(path: string) {
	const res = await octokit.repos.getContent({
		owner: "huntabyte",
		repo: "huntabyte.com",
		path,
		ref,
	})

	// Strip unused properties from the response
	return z
		.array(z.object({ name: z.string(), path: z.string() }))
		.parse(res.data)
}
