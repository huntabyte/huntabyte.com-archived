import { getCompiledPageContent } from "$lib/server/content"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params

	return {
		pageContent: getCompiledPageContent({ contentDir: "blog", slug: slug }),
	}
}
