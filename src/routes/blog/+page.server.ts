import { downloadMarkdownContent } from "$lib/server/github"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
	const data = await downloadMarkdownContent("blog/first-article.md")
	console.log(data)
}
