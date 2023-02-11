<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte'
	import { shortDate } from '$lib/utils'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="flex items-center gap-4">
	<div>
		<img
			class="inline-block h-20 w-20 rounded-full"
			src="https://avatars.githubusercontent.com/u/64506580?v=4"
			alt=""
		/>
	</div>
	<div class="flex flex-col">
		<h1 class="text-3xl font-bold">Hunter Johnston</h1>
		<h2 class="text-gray-400 text-lg">@huntabyte</h2>
	</div>
</div>
<p class="pt-6 text-xl">
	I've been working with technology professionally since 2014, but have been passionate about it for
	as long as I can remember. I currently work full-time as a Consulting Engineer and spend my free
	time developing full-stack applications and sharing what I learn along the way on YouTube.
</p>
<div class="flex justify-between items-center pt-12">
	<p class="uppercase tracking-widest font-medium text-gray-400">Recent Posts</p>
	<a
		href="/blog"
		class="font-medium text-base text-secondary-500 hover:text-secondary-600 transition-all duration-200 ease-in-out "
		>All -></a
	>
</div>
<ul class="flex flex-col gap-8 pt-6">
	{#each data.posts as post}
		<ArticleCard {post} />
	{/each}
</ul>
