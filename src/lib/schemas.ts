import { z } from "zod"

export const readingTimeSchema = z.object({
	text: z.string().catch(""),
	time: z.number().catch(0),
	words: z.number().catch(0),
	minutes: z.number().catch(0),
})

export const frontMatterSchema = z.object({
	title: z.string(),
	description: z.string(),
	date: z.coerce.date(),
	updated: z.coerce.date(),
	draft: z.boolean(),
	unpublished: z.boolean(),
	slug: z.string(),
})

export const blogListItemSchema = z.object({
	frontMatter: frontMatterSchema,
	readTime: readingTimeSchema,
})

export const pageContentSchema = z.object({
	content: z.string(),
	frontMatter: frontMatterSchema,
	readTime: readingTimeSchema,
})
