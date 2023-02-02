import { getMarkdownContentList, getMarkdownContent } from "$lib/server/github"
import { cache } from "$lib/server/cache"
import { compileMarkdown } from "$lib/server/compile-markdown"
import { cachified } from "cachified"
import { typedBoolean } from "$lib/utils"
import type { PageContent, BlogListItem, ContentDir } from "$lib/types"
import { blogListItemSchema, pageContentSchema } from "$lib/schemas"
import { z } from "zod"

type CachifiedOptions = {
	ttl?: number
	forceFresh?: boolean
	staleWhileRevalidate?: number
}

const defaultCacheOptions: CachifiedOptions = {
	ttl: 1000 * 60 * 60 * 24 * 14,
	staleWhileRevalidate: 1000 * 60 * 60 * 24 * 30,
	forceFresh: false,
}

async function getRawPageContent(
	{ contentDir, slug }: { contentDir: ContentDir; slug: string },
	options: CachifiedOptions = defaultCacheOptions,
): Promise<string> {
	const key = `${contentDir}:${slug}:raw`
	const { ttl, staleWhileRevalidate, forceFresh } = options
	const rawPageContent = await cachified({
		key,
		cache,
		ttl,
		staleWhileRevalidate,
		forceFresh,
		checkValue: (value) => value !== null,
		getFreshValue: async () => getMarkdownContent(`${contentDir}/${slug}`),
	})
	if (!rawPageContent) {
		void cache.delete(key)
	}
	return rawPageContent
}

export async function getCompiledPageContent(
	{ contentDir, slug }: { contentDir: ContentDir; slug: string },
	options: CachifiedOptions = defaultCacheOptions,
): Promise<PageContent> {
	const key = `${contentDir}:${slug}:compiled`
	const { ttl, staleWhileRevalidate, forceFresh } = options
	const pageContent = await cachified({
		key,
		cache,
		ttl,
		staleWhileRevalidate,
		forceFresh,
		checkValue: (value) => value !== null,
		getFreshValue: async () => {
			const rawPageContent = await getRawPageContent(
				{ contentDir, slug },
				options,
			)
			const compiledPageContent = await compileMarkdown(
				rawPageContent,
				slug,
			).catch((err) => {
				console.error(
					`Failed to get compiled page content for ${contentDir}/${slug}`,
					err,
				)
				return Promise.reject(err)
			})
			// add slug to frontmatter for linking, etc.
			compiledPageContent.frontMatter.slug = slug

			return compiledPageContent
		},
	})
	if (!pageContent) {
		// if page doesn't exist, remove from cache
		void cache.delete(key)
	}

	pageContent.frontMatter.slug = slug

	return pageContentSchema.parse(pageContent)
}

/**
 *
 * @param contentDir the content directory to list files for
 * Example: "blog" or "snippets"
 * @returns
 */
async function getContentList(
	contentDir: ContentDir,
	options: CachifiedOptions = defaultCacheOptions,
): Promise<
	{
		name: string
		slug: string
	}[]
> {
	const { ttl, forceFresh, staleWhileRevalidate } = options
	const key = `${contentDir}:list:raw`
	return cachified({
		key,
		cache,
		ttl,
		forceFresh,
		staleWhileRevalidate,
		checkValue: (value: unknown) => Array.isArray(value),
		getFreshValue: async () => {
			const fullContentDirPath = `content/${contentDir}`
			const rawContentList = (
				await getMarkdownContentList(fullContentDirPath)
			).map(({ name, path }) => ({
				name,
				slug: path.replace(`${fullContentDirPath}/`, "").replace(/\.md$/, ""),
			}))
			return rawContentList
		},
	})
}

async function getCompiledContentList(
	contentDir: ContentDir,
	options: CachifiedOptions = defaultCacheOptions,
): Promise<PageContent[]> {
	const contentList = await getContentList(contentDir)

	const rawContentList = await Promise.all(
		contentList.map(async ({ slug }) => {
			return {
				markdown: await getRawPageContent({ contentDir, slug }, options),
				slug,
			}
		}),
	)

	const compiledContentList = await Promise.all(
		rawContentList.map((pageContent) =>
			getCompiledPageContent({
				contentDir,
				slug: pageContent.slug,
			}),
		),
	)
	return compiledContentList.filter(typedBoolean)
}

export async function getBlogListItems(
	options: CachifiedOptions = defaultCacheOptions,
): Promise<BlogListItem[]> {
	const { ttl, staleWhileRevalidate, forceFresh } = options
	const key = "blog:list:compiled"
	return cachified({
		key,
		cache,
		ttl,
		staleWhileRevalidate,
		forceFresh,
		getFreshValue: async () => {
			let postList = await getCompiledContentList("blog", options).then(
				(posts) =>
					posts.filter(
						(post) => !(post.frontMatter.draft || post.frontMatter.unpublished),
					),
			)

			postList = postList.sort((first, last) => {
				const aDate = first.frontMatter.date
				const zDate = last.frontMatter.date

				return zDate.getTime() - aDate.getTime()
			})

			return postList.map((post) => blogListItemSchema.parse(post))
		},
	})
}
