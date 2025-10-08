<script lang="ts">
	import { currentLanguage, setLanguage, getAvailableLanguages } from '$lib/i18n';
	
	const languages = getAvailableLanguages();
	
	function handleLanguageChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		setLanguage(target.value);
	}
</script>

<div class="language-selector">
	<select 
		bind:value={$currentLanguage} 
		on:change={handleLanguageChange}
		class="bg-gray-700 text-white rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-purple-500"
	>
		{#each languages as lang}
			<option value={lang.code}>
				{lang.flag} {lang.name}
			</option>
		{/each}
	</select>
</div>

<style>
	.language-selector select {
		cursor: pointer;
	}
</style>