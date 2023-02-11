<script lang="ts">
	import type { BlogListItem } from '$lib/types'
	import { shortDate } from '$lib/utils'

	export let post: BlogListItem

	$: ({ frontMatter } = post)
</script>

<a href="/blog/{frontMatter.slug}" class="group flex flex-col w-full max-w-2xl">
	<h2 class="text-xl font-semibold ">{frontMatter.title}</h2>
	<p class="text-gray-200 opacity-90 mt-1">
		Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sint ullam nemo culpa, aut pariatur
		tenetur obcaecati fugiat laboriosam quos alias esse assumenda corrupti labore vero excepturi.
	</p>
	<div class="flex flex-row items-center space-x-2 mt-2 justify-between">
		<div class="flex items-center">
			<span class="text-sm opacity-40">{shortDate(new Date('2023-01-30'))}</span>
		</div>
		<div>
			<span class="flex text-sm opacity-40">
				{post.readTime.text}
			</span>
		</div>
	</div></a
>
