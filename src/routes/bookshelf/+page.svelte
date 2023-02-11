<script lang="ts">
	import PageHeading from '$lib/components/PageHeading.svelte'
	import PageWrapper from '$lib/components/PageWrapper.svelte'
</script>

<PageWrapper>
	<PageHeading>
		<h1 slot="heading" class="text-4xl font-semibold">Bookshelf</h1>
		<p slot="subheading" class="mx-auto max-w-lg text-gray-100 pt-2 text-base text-center">
			I truly believe reading can change your life. Here's a list of books I've read and my thoughts
			on them.
		</p>
	</PageHeading>
</PageWrapper>
