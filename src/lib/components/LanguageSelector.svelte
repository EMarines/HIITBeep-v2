<script lang="ts">
	import { currentLanguage, setLanguage, getAvailableLanguages } from '$lib/i18n';
	
	const languages = getAvailableLanguages();
	
	function handleLanguageChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		setLanguage(target.value);
	}
</script>

<div class="language-selector">
	<div class="relative group">
		<select 
			bind:value={$currentLanguage} 
			on:change={handleLanguageChange}
			class="appearance-none bg-white/5 hover:bg-white/10 text-white font-bold rounded-full pl-4 pr-10 py-2 text-xs outline-none transition-all cursor-pointer backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg text-center tracking-widest uppercase"
		>
			{#each languages as lang}
				<option value={lang.code} class="bg-gray-900 text-white">
					{lang.flag} {lang.name}
				</option>
			{/each}
		</select>
		<div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] opacity-40 group-hover:opacity-70 transition-opacity">
			▼
		</div>
	</div>
</div>

<style>
	.language-selector select {
		cursor: pointer;
	}
</style>