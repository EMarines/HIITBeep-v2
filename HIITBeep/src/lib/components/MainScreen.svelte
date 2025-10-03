<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { t } from '$lib/i18n';
	
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
	}
	
	const dispatch = createEventDispatcher();
	
	export let repetitions: number;
	export let intervals: Array<{ name: string; duration: number; color: string; type?: 'interval' | 'repeat' }>;
	
	function openSettings() {
		dispatch('open-settings');
	}
	
	function startWorkout() {
		if (intervals.length === 0) return;
		dispatch('start-workout');
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white">
	<div class="max-w-md w-full">
		<!-- Header con título y botón de configuración -->
		<div class="flex items-center justify-between mb-8">
			<h1 class="text-4xl font-bold" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">{$t('app.title')}</h1>
			<div class="flex items-center gap-3">
				<button 
					on:click={openSettings}
					class="text-2xl text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
					title={$t('common.settings')}
					style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);"
				>
					⚙️
				</button>
			</div>
		</div>
		
		<!-- Número de repeticiones -->
		<div class="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500 mb-6">
			<h2 class="text-lg font-medium mb-2" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">{$t('main.repetitions')}</h2>
			<p class="text-3xl font-light text-purple-400" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">
				{repetitions} {repetitions === 1 ? $t('main.repetition') : $t('main.repetitions_plural')}
			</p>
		</div>
		
		<!-- Lista de intervalos configurados -->
		<div class="space-y-3 mb-8">
			<h3 class="text-lg font-medium text-gray-300 mb-4" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">{$t('main.intervals_configured')}</h3>
			{#each intervals as interval, index}
				{#if interval.type === 'repeat'}
					<!-- Marcador de repetición especial con fondo gris fuerte -->
					<div class="bg-gray-700 rounded-lg p-3 border-2 border-gray-600 flex items-center justify-between">
						<div>
							<p class="font-medium text-gray-200" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">🔄 {interval.name}</p>
							<p class="text-sm text-gray-300" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">{$t('main.repeat_times', { times: interval.duration })}</p>
						</div>
						<div class="text-right">
							<p class="text-lg font-light text-gray-300" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">🔄</p>
						</div>
					</div>
				{:else}
					<!-- Intervalo normal -->
					<div class="bg-gray-800 rounded-lg p-3 border-l-4 {interval.color} flex items-center justify-between">
						<div>
							<p class="font-medium text-white" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">{interval.name}</p>
							<p class="text-sm text-gray-400" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">{$t('timer.duration')} {formatTime(interval.duration)}</p>
						</div>
						<div class="text-right">
							<p class="text-lg font-light text-gray-300" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">{index + 1}</p>
						</div>
					</div>
				{/if}
			{/each}
			
			{#if intervals.length === 0}
				<div class="bg-gray-800 rounded-lg p-4 text-center">
					<p class="text-gray-400" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">{$t('main.no_intervals')}</p>
					<p class="text-sm text-gray-500 mt-1" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);">{$t('main.use_settings')}</p>
				</div>
			{/if}
		</div>
		
		<!-- Botón iniciar rutina -->
		<button 
			on:click={startWorkout}
			disabled={intervals.length === 0}
			class="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium text-lg transition-colors"
			style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);"
		>
			{intervals.length === 0 ? $t('main.configure_intervals') : $t('main.start_routine')}
		</button>
		
		<!-- Información adicional -->
		{#if intervals.length > 0}
			<div class="mt-6 text-center text-gray-400">
				<p class="text-sm" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">
					{$t('main.total_duration')} {formatTime(intervals.reduce((acc, interval) => acc + interval.duration, 0))}
				</p>
				<p class="text-xs mt-1" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);">
					{$t('main.estimated_time')} {formatTime(intervals.reduce((acc, interval) => acc + interval.duration, 0) * repetitions)}
				</p>
			</div>
		{/if}
	</div>
</div>
