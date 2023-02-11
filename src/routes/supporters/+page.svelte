<script lang="ts">
	import PageHeading from '$lib/components/PageHeading.svelte'
	import PageWrapper from '$lib/components/PageWrapper.svelte'
</script>

<PageWrapper>
	<PageHeading>
		<h1 slot="heading" class="text-4xl font-semibold">Supporters</h1>
		<p slot="subheading" class="mx-auto max-w-md text-gray-100 pt-2 text-lg text-center">
			Thank you to each and every one of you for your support. I'm so grateful for the opportunity
			to provide value to you in some way.
		</p>
	</PageHeading>
</PageWrapper>
