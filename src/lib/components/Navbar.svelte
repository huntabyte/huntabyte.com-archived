<script lang="ts">
	import Logo from './Logo.svelte'
	import { page } from '$app/stores'
	import { navigation } from '$lib/ui/data'

	const activeNavItem = 'text-primary-500'
	const activeMobileNavItem = 'bg-gray-600 text-primary-700 '
</script>

<nav class="bg-inherit">
	<div class="mx-auto max-w-7xl py-2">
		<div class="relative flex h-16 justify-between">
			<div class="flex flex-1 items-center justify-between">
				<div class="flex flex-shrink-0 items-center">
					<a href="/" class="w-8 flex items-center text-gray-50">
						<Logo />
					</a>
				</div>
				<div class="hidden sm:ml-6 sm:flex sm:space-x-6">
					{#each navigation as navItem}
						<a
							href={navItem.href}
							class="inline-flex items-center font-medium text-base hover:text-primary-500 transition-all duration-200 ease-in-out {$page
								.url.pathname === navItem.href
								? activeNavItem
								: 'text-gray-50'}">{navItem.label}</a
						>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<div class="sm:hidden" id="mobile-menu">
		<div class="space-y-1 pt-2 pb-4">
			{#each navigation as navItem}
				<a
					href={navItem.href}
					class="block border-l-4 text-gray-50 hover:bg-gray-700 py-2 pl-3 pr-4 text-base font-medium  hover:border-primary-500 hover:text-primary-500 {$page
						.url.pathname === navItem.href
						? activeMobileNavItem
						: ''}">{navItem.label}</a
				>
			{/each}
		</div>
	</div>
</nav>
