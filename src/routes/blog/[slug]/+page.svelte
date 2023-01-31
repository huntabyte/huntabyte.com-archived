<script lang="ts">
	import { shortDate } from '$lib/utils'
	import type { PageData } from './$types'

	export let data: PageData
	$: ({ pageContent } = data)
</script>

<div class="flex flex-col items-center mx-auto w-full max-w-2xl gap-6">
	<a
		href="/blog"
		class="self-start flex items-center gap-2 hover:text-primary-500 transition-all duration-200 ease-in-out"
	>
		<p>Back to Blog</p>
	</a>
	<div class="w-full">
		<h1 class="text-left text-5xl font-semibold">{pageContent.frontMatter.title}</h1>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2 text-sm pt-2">
				<span>
					{shortDate(new Date(pageContent.frontMatter.publishedAt))}
				</span>
			</div>
			<div class="flex gap-2">
				<span />
				<span> {pageContent.readTime.text} </span>
			</div>
		</div>
	</div>
	<article class="prose-invert prose prose-lg max-w-2xl w-full">
		{@html pageContent.content}
	</article>
</div>
