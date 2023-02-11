<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center gap-4 pb-2">
		<div>
			<img
				class="inline-block h-24 w-24 rounded-full"
				src="https://res.cloudinary.com/dgytdtcft/image/upload/v1676135897/huntabyte_scu8lo.jpg"
				alt=""
			/>
		</div>
		<div class="flex flex-col">
			<h1 class="text-3xl font-bold">Hunter Johnston</h1>
			<h2 class="text-gray-400 text-lg">@huntabyte</h2>
		</div>
	</div>
	<p class="text-xl">
		I've been working with technology professionally since 2014, but have been passionate about it
		for as long as I can remember. I currently work full-time as a Consulting Engineer and spend my
		free time developing full-stack applications and sharing what I learn along the way on YouTube.
	</p>
	<p class="text-lg text-gray-400">
		You can find my videos <span class="text-primary-500 opacity-90 font-medium tracking-wide">
			@huntabyte
		</span>
		on YouTube
	</p>
</div>
<div class="flex justify-between items-center pt-16">
	<p class="uppercase tracking-widest font-medium text-gray-400">Recent Posts</p>
	<a
		href="/blog"
		class="font-medium text-sm text-secondary-500 hover:text-secondary-600 transition-all duration-200 ease-in-out "
		>View All -></a
	>
</div>
<ul class="flex flex-col gap-8 pt-6">
	{#each data.posts as post}
		<ArticleCard {post} />
	{/each}
</ul>
