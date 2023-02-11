<script lang="ts">
	import Logo from './Logo.svelte'
	import { page } from '$app/stores'
	import { moreNavigation, navigation } from '$lib/ui/data'
	import { GitHubIcon, YouTubeIcon, CaretDownBold } from '$lib/components/icons'
	import DiscordIcon from './icons/DiscordIcon.svelte'

	const activeNavItem = 'text-gray-50'
	const activeMobileNavItem = 'bg-gray-600 text-primary-700 '
</script>

<nav class="bg-inherit">
	<div class="mx-auto max-w-7xl py-2">
		<div class="relative flex h-16 justify-between">
			<div class="flex flex-1 items-center">
				<div class="flex flex-shrink-0 items-center mr-2">
					<a href="/" class="w-8 flex items-center text-gray-50">
						<Logo />
					</a>
				</div>
				<div class="hidden sm:ml-6 sm:flex sm:space-x-4 w-full items-center lowercase ">
					{#each navigation as navItem}
						<a
							href={navItem.href}
							class="inline-flex items-center font-medium text-base hover:opacity-100 transition-all duration-200 ease-in-out {$page
								.url.pathname === navItem.href
								? activeNavItem
								: 'text-gray-50 opacity-70'}">{navItem.label}</a
						>
					{/each}
					<div class="group inline-block relative w-full">
						<button
							class="inline-flex items-center font-medium text-base transition-all duration-200 ease-in-out"
						>
							<span class="mr-1 lowercase opacity-70">More</span>
							<span
								class="group-hover:rotate-180 transition-transform duration-200 group-hover:opacity-100 opacity-70"
							>
								<CaretDownBold />
							</span>
						</button>
						<ul class="absolute hidden pt-1 group-hover:block font-medium bg-gray-900">
							{#each moreNavigation as navItem}
								<li>
									<a
										class="rounded-t py-2 px-4 block whitespace-no-wrap hover:opacity-100 {$page.url
											.pathname === navItem.href
											? activeNavItem
											: 'text-gray-50 opacity-70'}"
										href={navItem.href}>{navItem.label}</a
									>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
			<div class="flex items-center gap-3">
				<a
					href="https://youtube.com/@huntabyte"
					target="_blank"
					rel="noreferrer"
					class="hover:text-gray-400 transition-all duration-200 ease-in-out"
				>
					<YouTubeIcon />
				</a>
				<a
					href="https://github.com/huntabyte"
					target="_blank"
					rel="noreferrer"
					class="hover:text-gray-400 transition-all duration-200 ease-in-out"
				>
					<GitHubIcon />
				</a>
				<a
					href="https://hbyt.us/discord"
					target="_blank"
					rel="noreferrer"
					class="hover:text-gray-400 transition-all duration-200 ease-in-out"
				>
					<DiscordIcon />
				</a>
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
