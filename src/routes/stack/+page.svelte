<script lang="ts">
	import PageHeading from '$lib/components/PageHeading.svelte'
	import PageWrapper from '$lib/components/PageWrapper.svelte'
</script>

<PageWrapper>
	<PageHeading>
		<h1 slot="heading" class="text-4xl font-semibold">Tech Stack</h1>
		<p slot="subheading" class="mx-auto max-w-md text-gray-100 pt-2 text-lg text-center">
			What I use on a regular basis to build applications and create content.
		</p>
	</PageHeading>
</PageWrapper>
