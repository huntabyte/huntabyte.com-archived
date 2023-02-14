<script lang="ts">
	import { navigation } from '$lib/ui/data'
</script>

<div class="pt-16 py-8 flex flex-col mx-auto w-full items-center gap-4">
	<p>© huntabyte / hunter johnston</p>
	<ul class="flex items-center gap-4 w-full justify-center">
		{#each navigation as navItem}
			<li><a href={navItem.href} class="lowercase text-sm text-gray-400">{navItem.label}</a></li>
		{/each}
	</ul>
</div>
