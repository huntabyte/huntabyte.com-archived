import { downloadMdFile } from "$lib/server/github"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
	await downloadMdFile("blog/first-article.md")
}
