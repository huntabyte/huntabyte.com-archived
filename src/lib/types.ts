import type readingTime from "reading-time"

export type FrontMatter = {
	title: string
	description: string
	published: string
	draft: boolean
	unpublished: boolean
}

export type GitHubFile = {
	path: string
	content: string
}

export type PageContent = {
	content: string
	frontMatter: FrontMatter
	readTime?: ReturnType<typeof readingTime>
}
