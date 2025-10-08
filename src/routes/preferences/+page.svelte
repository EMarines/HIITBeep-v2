<script lang="ts">
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
</script>

<svelte:head>
	<title>{$t('preferences.title')} - {$t('app.title')}</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white p-6">
	<div class="max-w-2xl mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-8">
			<div class="flex items-center gap-4">
				<button 
					on:click={() => goto('/')}
					class="text-gray-400 hover:text-white text-2xl transition-colors"
					title="{$t('common.back')}"
				>
					←
				</button>
				<h1 class="text-3xl font-bold">{$t('preferences.title')}</h1>
			</div>
		</div>

		<!-- Configuraciones -->
		<div class="space-y-6">
			
			<!-- Sección de Idioma -->
			<div class="bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
				<h2 class="text-xl font-semibold mb-2 flex items-center gap-3">
					🌐 {$t('preferences.language')}
				</h2>
				<p class="text-gray-400 mb-4">{$t('preferences.language_description')}</p>
				
				<div class="flex items-center gap-4">
					<label for="language-selector" class="text-sm font-medium text-gray-300">
						{$t('preferences.select_language')}:
					</label>
					<LanguageSelector />
				</div>
			</div>

			<!-- Sección de Sonidos (Placeholder para futuro) -->
			<div class="bg-gray-800 rounded-lg p-6 border-l-4 border-purple-500 opacity-50">
				<h2 class="text-xl font-semibold mb-2 flex items-center gap-3">
					🔊 {$t('preferences.sounds')}
				</h2>
				<p class="text-gray-400 mb-4">{$t('preferences.sounds_description')}</p>
				<p class="text-sm text-gray-500 italic">{$t('preferences.coming_soon')}</p>
			</div>

			<!-- Sección de Tema (Placeholder para futuro) -->
			<div class="bg-gray-800 rounded-lg p-6 border-l-4 border-green-500 opacity-50">
				<h2 class="text-xl font-semibold mb-2 flex items-center gap-3">
					🎨 {$t('preferences.theme')}
				</h2>
				<p class="text-gray-400 mb-4">{$t('preferences.theme_description')}</p>
				<p class="text-sm text-gray-500 italic">{$t('preferences.coming_soon')}</p>
			</div>

			<!-- Sección de Accesibilidad (Placeholder para futuro) -->
			<div class="bg-gray-800 rounded-lg p-6 border-l-4 border-orange-500 opacity-50">
				<h2 class="text-xl font-semibold mb-2 flex items-center gap-3">
					♿ {$t('preferences.accessibility')}
				</h2>
				<p class="text-gray-400 mb-4">{$t('preferences.accessibility_description')}</p>
				<p class="text-sm text-gray-500 italic">{$t('preferences.coming_soon')}</p>
			</div>

		</div>

		<!-- Footer con información -->
		<div class="mt-12 pt-8 border-t border-gray-700">
			<div class="text-center">
				<h3 class="text-lg font-semibold mb-2">{$t('app.title')}</h3>
				<p class="text-gray-400 text-sm">{$t('app.description')}</p>
				<p class="text-gray-500 text-xs mt-2">
					{$t('preferences.version')}: 2.0.0 | {$t('preferences.made_with')} ❤️
				</p>
			</div>
		</div>
	</div>
</div>