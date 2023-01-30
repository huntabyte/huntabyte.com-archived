export type FrontMatter = {
	title: string
	description: string
	slug: string
	published: string
}

export type GitHubFile = {
	path: string
	content: string
}

export type MarkdownContent = {
	content: string
	frontMatter: FrontMatter
}
