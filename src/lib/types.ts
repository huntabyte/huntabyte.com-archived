import type readingTime from "reading-time"

export type FrontMatter = {
	title: string
	description: string
	date: string
	updated: string
	draft: boolean
	unpublished: boolean
	slug: string
}

export type PageContent = {
	content: string
	frontMatter: FrontMatter
	readTime?: ReturnType<typeof readingTime>
}
