<script>
	import Navbar from '$lib/components/Navbar.svelte'
	import '../app.css'
</script>

<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 h-full flex flex-col">
	<Navbar />
	<div class="flex-1 py-10">
		<slot />
	</div>
</div>
