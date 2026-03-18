<script lang="ts">
	import { currentLanguage, setLanguage, getAvailableLanguages } from '$lib/i18n';
	
	const languages = getAvailableLanguages();
	
	function handleLanguageChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		setLanguage(target.value);
	}
</script>

<div class="ls-root">
	<div class="ls-wrap">
		<select 
			bind:value={$currentLanguage} 
			on:change={handleLanguageChange}
			class="ls-select"
		>
			{#each languages as lang}
				<option value={lang.code}>
					{lang.flag} {lang.name}
				</option>
			{/each}
		</select>
		<div class="ls-arrow">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
		</div>
	</div>
</div>

<style>
.ls-root { width: 100%; display: flex; justify-content: center; }
.ls-wrap { position: relative; width: 100%; max-width: 250px; }
.ls-select {
    appearance: none;
    width: 100%;
    background: var(--bg-card-alt);
    border: 1px solid var(--border-card);
    color: var(--text-primary);
    font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
    padding: 0.75rem 2.5rem 0.75rem 1.25rem;
    border-radius: var(--radius-btn);
    cursor: pointer; outline: none; transition: all 0.2s;
    text-align: center;
}
.ls-select:hover {
    border-color: var(--accent-blue);
    background: rgba(59,130,246,0.08);
}
.ls-select option {
    background: var(--bg-card);
    color: var(--text-primary);
}
.ls-arrow {
    position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: var(--text-secondary);
    display: flex; align-items: center; justify-content: center;
}
.ls-wrap:hover .ls-arrow { color: var(--accent-blue); }
</style>