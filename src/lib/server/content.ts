import { downloadMdFile } from "$lib/server/github"
import { redis } from "$lib/server/redis"
import { compileMarkdown } from "$lib/server/compile-markdown"

const defaultTTL = 1000 * 60 * 60 * 24 * 14

export async function downloadMdFileCached(contentDir: string, slug: string) {
	const key = `${contentDir}:${slug}:downloaded`

	// check if the value is cached
	const cached = await redis.get(key)
	if (cached) {
        console.log('cache hit')
		return cached
	}

	// Value doesn't exist in cache or is expired, so download it
	const downloaded = await downloadMdFile(`${contentDir}/${slug}`)

	// Cache the value
	// Do I need to await this? I don't think so
	redis.set(key, downloaded, "EX", defaultTTL)

	return downloaded
}

// 
export async function compileMdFileCached(contentDir: string, slug: string) {
	const key = `${contentDir}:${slug}:compiled`

	// check if the value is cached
	const cached = await redis.get(key)
	if (cached) {
        console.log('cache hit')
		return JSON.parse(cached)
	}

    // Compiled value doesn't exist in cache or is expired, so download and compile it
	const downloadedContent = await downloadMdFileCached(contentDir, slug)
	const compiledContent = await compileMarkdown(downloadedContent, slug)

	// Cache the compiled value only, the downloaded value is cached separately
	// Do I need to await this? I don't think so
	redis.set(key, JSON.stringify(compiledContent), "EX", defaultTTL)

	return compiledContent
}
