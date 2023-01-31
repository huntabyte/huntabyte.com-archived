import { redis } from "$lib/server/redis"
import { cache } from "$lib/server/cache"
import { cachified } from "cachified"
import { downloadMdFile } from "$lib/server/github"

async function getMarkdownPage({
	contentDir,
	slug,
}: { contentDir: string; slug: string }) {
	const key = `md-page:${contentDir}:${slug}:compiled`

	const content = await cachified({
		cache,
		key,
		getFreshValue: async () => {},
	})
}
