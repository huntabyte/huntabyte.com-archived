<div class="flex flex-col mx-auto items-center space-y-12">
	<h1 class="text-2xl font-medium w-full">Admin Dashboard</h1>
	<div class="w-full flex flex-col gap-8">
		<form method="POST" action="?/refreshContent" class="flex flex-col gap-4 max-w-md">
			<h2 class="text-lg font-medium">Refresh Content Item</h2>
			<div class="flex flex-col gap-1">
				<label for="contentDir">Content Directory</label>
				<input
					class="bg-gray-900 border-gray-50 rounded-md"
					type="text"
					name="contentDir"
					id="contentDir"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label for="contentDir">Slug</label>
				<input class="bg-gray-900 border-gray-50 rounded-md" type="text" name="slug" id="slug" />
			</div>
			<button
				class="bg-primary-500 text-gray-900 font-semibold uppercase py-3 px-3.5 leading-none rounded-md hover:bg-primary-600 transition-all duration-200"
				type="submit">Refresh</button
			>
		</form>
		<form method="POST" action="?/refreshAllContent">
			<button
				class="bg-primary-500 text-gray-900 font-semibold uppercase py-3 px-3.5 leading-none rounded-md hover:bg-primary-600 transition-all duration-200"
				type="submit">Refresh All Content</button
			>
		</form>
	</div>
</div>
