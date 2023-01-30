import { redis } from "$lib/server/redis"
import { downloadMdFile } from "$lib/server/github"

async function getMarkdownPage({
	contentDir,
	slug,
}: { contentDir: string; slug: string }) {
	const key = `md-page:${contentDir}:${slug}:compiled`

	const cached = await redis.get(key)
}
