<script>
	import Navbar from '$lib/components/Navbar.svelte'
	import '../app.css'
</script>

<div class="mx-auto max-w-2xl px-2 sm:px-0 h-full flex flex-col">
	<Navbar />
	<div class="flex-1 py-10">
		<slot />
	</div>
</div>
