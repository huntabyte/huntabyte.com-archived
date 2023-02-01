// Interacting with the GitHub API in this manner was inspired by @kentcdodds
import { GH_TOKEN } from "$env/static/private"
import { Octokit as createOctokit } from "@octokit/rest"
import { throttling } from "@octokit/plugin-throttling"

const ref = "main"

const Octokit = createOctokit.plugin(throttling)

type ThrottleOptions = {
	method: string
	url: string
	request: { retryCount: number }
}

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

	if ("content" in data && "encoding" in data) {
		const encoding = data.encoding as Parameters<typeof Buffer.from>[1]
		const content = Buffer.from(data.content, encoding).toString()
		return content
	}

	throw new Error(
		`Tried to get ${path} but got back something unexpected. 'Content' or 'Encoding' property missing.`,
	)
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

	const data = res.data

	if (!Array.isArray(data)) {
		throw new Error(
			`Tried to get ${path} but got back something unexpected. Expected an array.`,
		)
	}

	return data
}
