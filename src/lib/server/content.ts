import { downloadContentList, downloadMdFile } from "$lib/server/github"
import { redis } from "$lib/server/redis"
import { compileMarkdown } from "$lib/server/compile-markdown"

type CachifiedOptions = {
	ttl?: number
	forceFresh?: boolean
	staleWhileRevalidate?: number
}

export async function getContent(contentDir: string, slug: string) {
	const key = `${contentDir}:${slug}:downloaded`

	// check if the value is cached
	const cached = await redis.get(key)
	if (cached) {
		return cached
	}

	// Value doesn't exist in cache or is expired, so download it
	const downloaded = await downloadMdFile(`${contentDir}/${slug}`)

	// Cache the value
	redis.set(key, downloaded, "EX", defaultTTL)

	return downloaded
}

export async function getCompiledContent(contentDir: string, slug: string) {
	const key = `${contentDir}:${slug}:compiled`

	// check if the value is cached
	const cached = await redis.get(key)
	if (cached) {
		return JSON.parse(cached)
	}

	// Compiled value doesn't exist in cache or is expired, so download and compile it
	const downloadedContent = await getContent(contentDir, slug)
	const compiledContent = await compileMarkdown(downloadedContent, slug)

	// Cache the compiled value only, the downloaded value is cached separately
	redis.set(key, JSON.stringify(compiledContent), "EX", defaultTTL)

	return compiledContent
}

/**
 *
 * @param contentDir the content directory to list files for
 * Example: "blog" or "snippets"
 * @returns
 */
export async function getContentList(contentDir: string) {
	const key = `${contentDir}:list`
	const fullPath = `content/${contentDir}`

	// check if the value is cached
	const cached = await redis.get(key)
	if (cached) {
		return JSON.parse(cached) as ContentListItem[]
	}

	const contentList = (await downloadContentList(fullPath)).map(
		({ name, path }) => ({
			name,
			slug: path.replace(`${fullPath}/`, "").replace(/\.md$/, ""),
		}),
	)

	redis.set(key, JSON.stringify(contentList), "EX", defaultTTL)

	return contentList
}

type ContentListItem = {
	name: string
	slug: string
}

export async function getCompiledContentList(contentDir: string) {
	const contentList = await getContentList(contentDir)

	const pageContentList = await Promise.all(
		contentList.map(async ({ slug }) => {
			return {
				markdown: await getContent(contentDir, slug),
				slug,
			}
		}),
	)

	const compiledContentList = await Promise.all(
		pageContentList.map((pageContent) =>
			compileMarkdown(pageContent.markdown, pageContent.slug),
		),
	)
	return compiledContentList
}

export async function getBlogListItems() {
	const key = "blog:list:compiled"
	const cached = await redis.get(key)

	if (cached) {
		return JSON.parse(cached)
	}

	const postList = await getCompiledContentList("blog")
	const filteredPostList = postList.filter(
		(post) => !post.frontMatter.draft && !post.frontMatter.unpublished,
	)
	const posts = filteredPostList.sort((a, z) => {
		const aDate = new Date(a.frontMatter.published)
		const zDate = new Date(z.frontMatter.published)

		return zDate.getTime() - aDate.getTime()
	})

	redis.set(key, JSON.stringify(posts), "EX", defaultTTL)
	return posts
}
