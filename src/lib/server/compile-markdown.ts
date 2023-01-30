/* Thanks to @joyofcodedev for doing the heavy lifting on this one. */
import { unified } from "unified"
import fromMarkdown from "remark-parse"
import fromMarkdownToHtml from "remark-rehype"
import parseHtmlAndMarkdown from "rehype-raw"
import toHtml from "rehype-stringify"
import matter from "gray-matter"

// plugins
import remarkGfm from "remark-gfm"
import remarkSlug from "remark-slug"
import remarkHeadings from "remark-autolink-headings"
import remarkSmartyPants from "remark-smartypants"
import rehypeCodeTitles from "rehype-code-titles"
import rehypePrism from "rehype-prism-plus"

import type { FrontMatter, MarkdownContent } from "$lib/types"

// TODO: Add link to source - need to think about S3, CF, or Cloudinary for this.
function searchAndReplace(content: string): string {
	const embeds = /{% embed src="(.*?)" title="(.*?)" %}/g
	const videos = /{% video src="(.*?)" %}/g
	const images = /{% img src="(.*?)" alt="(.*?)" %}/g

	return content
		.replace(embeds, (_, src, title) => {
			return `
        <iframe
          title="${title}"
          src=""
          loading="lazy"
        ></iframe>
      `.trim()
		})
		.replace(videos, (_, src) => {
			return `
        <video controls>
          <source
            src=""
            type="video/mp4"
          />
        </video>
      `.trim()
		})
		.replace(images, (_, src, alt) => {
			return `
      <img
        src=""
        alt="${alt}"
        loading="lazy"
      />
  `.trim()
		})
}

export async function markdownToHTML(
	markdown: string,
): Promise<MarkdownContent> {
	const { content, data } = matter(markdown)

	const result = await unified()
		.use(fromMarkdown)
		.use([remarkGfm, remarkHeadings, remarkSlug, remarkSmartyPants])
		.use(fromMarkdownToHtml, { allowDangerousHtml: true })
		.use(rehypeCodeTitles)
		.use(rehypePrism)
		.use(parseHtmlAndMarkdown)
		.use(toHtml)
		.process(searchAndReplace(content))

	const processedMarkdown = result.value

	return {
		content: processedMarkdown as string,
		frontMatter: data as FrontMatter,
	}
}
