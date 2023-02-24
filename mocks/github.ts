import * as nodePath from "path"
import { promises as fs } from "fs"
import type {
	DefaultRequestMultipartBody,
	MockedRequest,
	RestHandler,
} from "msw"
import { rest } from "msw"

async function isFile(path: string) {
	try {
		return (await fs.lstat(path)).isFile()
	} catch {
		return false
	}
}

async function isDirectory(path: string) {
	try {
		return (await fs.lstat(path)).isDirectory()
	} catch {
		return false
	}
}

type GitHubContentDescription = {
	name: string
	path: string
	sha: string
	size: number
	url: string
	html_url: string
	git_url: string
	download_url: string | null
	type: "dir" | "file"
	_links: {
		self: string
		git: string
		html: string
	}
}

type GitHubContent = {
	sha: string
	node_id: string
	size: number
	url: string
	content: string
	encoding: "base64"
}

export const githubHandlers: Array<
	RestHandler<MockedRequest<DefaultRequestMultipartBody>>
> = [
	rest.get(
		"https://api.github.com/repos/:owner/:repo/contents/:path",
		async (req, res, ctx) => {
			const { owner, repo } = req.params
			if (typeof req.params.path !== "string") {
				throw new Error("Path must be a string")
			}
			const path = decodeURIComponent(req.params.path).trim()
			const isMockable =
				owner === "huntabyte" &&
				repo === "huntabyte.com" &&
				path.startsWith("content")

			if (!isMockable) {
				const message = `Not mockable, ${owner}, ${repo}, ${path} }`
				console.error(message)
				throw new Error(message)
			}

			const localPath = nodePath.join(__dirname, "..", path)
			const isLocalFile = await isFile(localPath)
			const isLocalDir = await isDirectory(localPath)

			if (!(isLocalFile && isLocalDir)) {
				return res(
					ctx.status(404),
					ctx.json({
						message: "Not Found",
						documentation_url:
							"https://docs.github.com/rest/reference/repos#get-repository-content",
					}),
				)
			}

			if (isLocalFile) {
				const encoding = "base64" as const
				const content = await fs.readFile(localPath, { encoding: "utf-8" })
				return res(
					ctx.status(200),
					ctx.json({
						content: Buffer.from(content, "utf-8").toString(encoding),
						encoding,
					}),
				)
			}

			const dirList = await fs.readdir(localPath)

			const contentDescriptions = await Promise.all(
				dirList.map(async (name): Promise<GitHubContentDescription> => {
					const relativePath = nodePath.join(path, name)
					const sha = relativePath
					const fullPath = nodePath.join(localPath, name)
					const isDir = await isDirectory(fullPath)
					const size = isDir ? 0 : (await fs.stat(fullPath)).size
					return {
						name,
						path: relativePath,
						sha,
						size,
						url: `https://api.github.com/repos/${owner}/${repo}/conts/${path}?${req.url.searchParams}`,
						html_url: `https://github.com/${owner}/${repo}/tree/main/${path}`,
						git_url: `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`,
						download_url: null,
						type: isDir ? "dir" : "file",
						_links: {
							self: `https://api.github.com/repos/${owner}/${repo}/contents/${path}${req.url.searchParams}`,
							git: `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`,
							html: `https://github.com/${owner}/${repo}/tree/main/${path}`,
						},
					}
				}),
			)
			return res(ctx.json(contentDescriptions))
		},
	),
	rest.get(
		"https://api.github.com/repos/:owner/:repo/contents/:path*",
		async (req, res, ctx) => {
			const { owner, repo } = req.params

			const relativePath = req.params.path
			if (typeof relativePath !== "string") {
				throw new Error("Path must be a string")
			}
			const fullPath = nodePath.join(__dirname, "..", relativePath)
			const encoding = "base64" as const
			const size = (await fs.stat(fullPath)).size
			const content = await fs.readFile(fullPath, { encoding: "utf-8" })
			const sha = `${relativePath}_sha`

			const resource: GitHubContent = {
				sha,
				node_id: `${req.params.path}_node_id`,
				size,
				url: `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`,
				content: Buffer.from(content, "utf-8").toString(encoding),
				encoding,
			}

			return res(ctx.json(resource))
		},
	),
]
