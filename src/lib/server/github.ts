// Most of the heavy lifting here was done by Kent C Dodds - https://github.com/kentcdodds/kentcdodds.com
// Thanks, Kent! Follow him on Twitter @kentcdodds.

import nodePath from "path"
import { GH_TOKEN } from "$env/static/private"
import { Octokit as createOctokit } from "@octokit/rest"
import { throttling } from "@octokit/plugin-throttling"
import type { GitHubFile } from "$lib/types"

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

async function downloadFirstMdFile(
	list: Array<{ name: string; type: string; path: string; sha: string }>,
) {
	const filesOnly = list.filter(({ type }) => type === "file")
	for (const extension of [".md"]) {
		const file = filesOnly.find(({ name }) => name.endsWith(extension))
		if (file) return downloadFileBySha(file.sha)
	}
}

/**
 *
 * @param relativePath - Path relative to the content directory.
 * Example: content/articles/first-article.md => articles/first-article.md
 * Example: content/articles/first-article/index.md => articles/first-article/index.md
 * Example: content/snippets/sample-snippet.md => snippets/sample-snippet.md
 */
// export async function downloadMdFile(
// 	relativePath: string,
// ): Promise<{ entry: string; files: Array<GitHubFile> }> {
// 	const mdFile = `content/${relativePath}`

// 	const parentDir = nodePath.dirname(mdFile)
// 	const dirList = await downloadDirList(parentDir)

// 	const basename = nodePath.basename(mdFile)
// 	const mdFileWithoutExt = nodePath.parse(mdFile).name
// 	const potentials = dirList.filter(({ name }) => name.startsWith(basename))
// 	const exactMatch = potentials.find(
// 		({ name }) => nodePath.parse(name).name === mdFileWithoutExt,
// 	)

// 	const content = await downloadFirstMdFile(
// 		exactMatch ? [exactMatch] : potentials,
// 	)

// 	let files: Array<GitHubFile> = []
// 	let entry = mdFile
// 	if (content) {
// 		entry = mdFile.endsWith(".md") ? mdFile : `${mdFile}.md`
// 		files = [{ path: mdFile, content }]
// 	}

// 	return { entry, files }
// }

/**
 *
 * @param dir directory to download
 * Recursively downloads all content at the given directory.
 * @returns an array of GitHubFile objects
 *
 */
export async function downloadDirectory(
	dir: string,
): Promise<Array<GitHubFile>> {
	const dirList = await downloadDirList(dir)
	const result = await Promise.all(
		dirList.map(async ({ path: fileDir, type, sha }) => {
			switch (type) {
				case "file":
					const content = await downloadFileBySha(sha)
					return { path: fileDir, content }
				case "dir":
					return downloadDirectory(fileDir)
				default: {
					throw new Error(`Unexpected file type: ${type}`)
				}
			}
		}),
	)

	return result.flat()
}

/**
 *
 * @param sha the hash for the file (retrieved via `downloadDirList`)
 * @returns a promise that resolves to a string of the contents of the file
 */
export async function downloadFileBySha(sha: string) {
	const { data } = await octokit.git.getBlob({
		owner: "huntabyte",
		repo: "huntabyte.com",
		file_sha: sha,
	})
	const encoding = data.encoding as Parameters<typeof Buffer.from>[1]
	return Buffer.from(data.content, encoding).toString()
}

/**
 *
 * @param relativePath - Path relative to the content directory.
 * Example: content/articles/first-article.md => articles/first-article.md
 * Example: content/articles/first-article/index.md => articles/first-article/index.md
 * Example: content/snippets/sample-snippet.md => snippets/sample-snippet.md
 */
export async function downloadMdFile(relativePath: string) {
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
 * @param path the full path to list
 * @returns a promise that resolves to a file ListItem of the files/directories in the given directory (not recursive)
 */
export async function downloadDirList(path: string) {
	const res = await octokit.repos.getContent({
		owner: "huntabyte",
		repo: "huntabyte.com",
		path,
		ref,
	})

	const data = res.data
	console.log("github:downloadDirList:data", data)

	if (!Array.isArray(data)) {
		throw new Error(
			`Tried to get ${path} but got back something unexpected. Expected an array.`,
		)
	}

	return data
}
