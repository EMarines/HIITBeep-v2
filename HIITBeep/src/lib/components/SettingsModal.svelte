<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';
	
	const dispatch = createEventDispatcher();
	// Force recompilation - button colors updated
	
	export let repetitions: number = 3;
	export let intervals: Array<{ 
		name: string; 
		duration: number; 
		color: string; 
		type?: 'interval' | 'repeat' | 'weights';
		sets?: number; // Para intervalos de pesas
		restTime?: number; // Tiempo de descanso para pesas
	}> = [];
	export let routineName: string = '';
	
	// Copias locales para editar
	let localRepetitions = repetitions;
	let localIntervals = [...intervals];
	let localRoutineName = routineName;
	
	// Reactividad: actualizar copias locales cuando cambien los props
	$: localRepetitions = repetitions;
	$: localIntervals = [...intervals];
	$: localRoutineName = routineName;
	
	function addInterval() {
		localIntervals = [...localIntervals, { name: $t('settings.new_interval'), duration: 30, color: 'bg-green-500', type: 'interval' }];
	}
	
	function addWeightsInterval() {
		localIntervals = [...localIntervals, { 
			name: $t('settings.new_weights_interval'), 
			duration: 0, // No usado en pesas
			color: 'bg-purple-600', 
			type: 'weights',
			sets: 3,
			restTime: 90
		}];
	}
	
	function addRepeatMarker() {
		localIntervals = [...localIntervals, { name: $t('settings.repeat_marker'), duration: 2, color: 'bg-gray-700', type: 'repeat' }];
	}
	
	function removeInterval(index: number) {
		localIntervals = localIntervals.filter((_, i) => i !== index);
	}
	
	function copyInterval(index: number) {
		const intervalToCopy = localIntervals[index];
		const copiedInterval = {
			name: intervalToCopy.name,
			duration: intervalToCopy.duration,
			color: intervalToCopy.color,
			type: intervalToCopy.type || 'interval',
			...(intervalToCopy.type === 'weights' && {
				sets: intervalToCopy.sets,
				restTime: intervalToCopy.restTime
			})
		};
		localIntervals = [...localIntervals, copiedInterval];
	}
	
	function moveIntervalUp(index: number) {
		if (index > 0) {
			const newIntervals = [...localIntervals];
			[newIntervals[index], newIntervals[index - 1]] = [newIntervals[index - 1], newIntervals[index]];
			localIntervals = newIntervals;
		}
	}
	
	function moveIntervalDown(index: number) {
		if (index < localIntervals.length - 1) {
			const newIntervals = [...localIntervals];
			[newIntervals[index], newIntervals[index + 1]] = [newIntervals[index + 1], newIntervals[index]];
			localIntervals = newIntervals;
		}
	}
	
	function saveConfiguration() {
		if (localIntervals.length === 0) return;
		// Asegurar que las repeticiones sean al menos 1
		if (localRepetitions < 1) localRepetitions = 1;
		dispatch('save-config', { 
			intervals: localIntervals, 
			repetitions: localRepetitions,
			routineName: localRoutineName.trim()
		});
	}
	
	function saveAsRoutine() {
		if (localIntervals.length === 0) return;
		// Asegurar que las repeticiones sean al menos 1
		if (localRepetitions < 1) localRepetitions = 1;
		dispatch('save-routine', { 
			intervals: localIntervals, 
			repetitions: localRepetitions,
			routineName: localRoutineName.trim()
		});
	}
	
	function cancelConfiguration() {
		// Restaurar valores originales
		localRepetitions = repetitions;
		localIntervals = [...intervals];
		localRoutineName = routineName;
		dispatch('cancel');
	}
	
	function openPreferences() {
		goto('/preferences');
	}
	
	const colorOptions = [
		{ name: $t('colors.yellow'), value: 'bg-yellow-500' },
		{ name: $t('colors.red'), value: 'bg-red-500' },
		{ name: $t('colors.blue'), value: 'bg-blue-500' },
		{ name: $t('colors.green'), value: 'bg-green-500' },
		{ name: $t('colors.purple'), value: 'bg-purple-500' },
		{ name: $t('colors.pink'), value: 'bg-pink-500' },
		{ name: $t('colors.orange'), value: 'bg-orange-500' }
	];
	
	// Generate unique IDs for form controls
	const repetitionsId = 'settings-repetitions-input';
	
	function generateIntervalId(index: number, field: string): string {
		return `settings-interval-${index}-${field}`;
	}
</script>

<!-- Modal backdrop -->
<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
	<div class="bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
		<!-- Header del modal -->
		<div class="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 rounded-t-lg">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-bold text-white">{$t('settings.title')}</h2>
				<div class="flex items-center gap-3">
					<button 
						on:click={openPreferences}
						class="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
						title="{$t('preferences.title')}"
					>
						🔧
					</button>
					<button 
						on:click={cancelConfiguration}
						class="text-gray-400 hover:text-white text-2xl"
					>
						✕
					</button>
				</div>
			</div>
		</div>
		
		<!-- Contenido del modal -->
		<div class="p-4">
			<!-- Campo de Nombre de Rutina -->
			<div class="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500 mb-6">
				<label for="routine-name-input" class="block text-lg font-medium mb-2 text-white">{$t('settings.routine_name')}</label>
				<p class="text-sm text-gray-400 mb-3">{$t('settings.routine_name_help')}</p>
				<input 
					id="routine-name-input"
					type="text" 
					bind:value={localRoutineName} 
					placeholder={$t('settings.routine_name_placeholder')}
					maxlength="50"
					class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-lg text-white placeholder-gray-500"
				/>
			</div>
		
			<!-- Campo de Repeticiones -->
			<div class="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500 mb-6">
				<label for="{repetitionsId}" class="block text-lg font-medium mb-2 text-white">{$t('settings.repetitions_number')}</label>
				<p class="text-sm text-gray-400 mb-3">{$t('settings.repetitions_help')}</p>
				<input 
					id="{repetitionsId}"
					type="number" 
					bind:value={localRepetitions} 
					min="1"
					max="99"
					class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 text-lg text-white"
				/>
			</div>
			
			<!-- Intervalos -->
			<div class="space-y-4 mb-6">
				<h3 class="text-lg font-medium text-white">{$t('settings.intervals')}:</h3>
				{#each localIntervals as interval, index}
					{#if interval.type === 'repeat'}
						<!-- Marcador de repetición especial con fondo gris fuerte -->
						<div class="bg-gray-700 rounded-lg border-2 border-gray-600 relative">
							<div class="flex justify-between items-center p-2 border-b border-gray-600 bg-gray-700">
								<span class="text-gray-200 font-medium">🔄 {$t('settings.repeat_marker')}</span>
								<div class="flex gap-3">
									<button 
										on:click={() => moveIntervalUp(index)}
										disabled={index === 0}
										class="text-gray-400 hover:text-white transition-colors text-xs px-3 py-2 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
										title="{$t('settings.move_up')}"
									>
										⬆️
									</button>
									<button 
										on:click={() => moveIntervalDown(index)}
										disabled={index === localIntervals.length - 1}
										class="text-gray-400 hover:text-white transition-colors text-xs px-3 py-2 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
										title="{$t('settings.move_down')}"
									>
										⬇️
									</button>
									<button 
										on:click={() => removeInterval(index)}
										class="text-red-400 hover:text-red-300 transition-colors text-xs px-3 py-2 rounded bg-gray-600 hover:bg-gray-500"
										title="{$t('settings.delete_interval')}"
									>
										🗑️
									</button>
								</div>
							</div>
							
							<div class="p-4 bg-gray-800">
								<div class="flex items-center gap-4">
									<label for="repeat-times-{index}" class="text-sm text-gray-300 font-medium">
										{$t('settings.repeat_times')}:
									</label>
									<select 
										id="repeat-times-{index}"
										bind:value={interval.duration}
										class="bg-gray-600 text-white rounded px-3 py-2 text-sm border border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none"
									>
										{#each Array.from({length: 10}, (_, i) => i + 1) as num}
											<option value={num}>{num}</option>
										{/each}
									</select>
									<span class="text-sm text-gray-400">{$t('settings.times')}</span>
								</div>
								<p class="text-gray-300 text-sm mt-2">
									{$t('settings.repeat_description', { duration: interval.duration })}
								</p>
							</div>
						</div>
					{:else if interval.type === 'weights'}
						<!-- Intervalo de Pesas -->
						<div class="bg-gray-800 rounded-lg border-l-4 {interval.color} relative">
							<div class="flex justify-between items-center p-2 border-b border-gray-700">
								<div class="flex items-center gap-2">
									<span class="text-purple-400">🏋️</span>
									<span class="text-xs text-purple-400 font-medium">{$t('intervals.weights')}</span>
								</div>
								<div class="flex gap-3">
									<button 
										on:click={() => copyInterval(index)}
										class="text-blue-400 hover:text-blue-300 transition-colors text-xs p-2 rounded bg-gray-700 hover:bg-gray-600"
										title="{$t('settings.copy_interval')}"
									>
										📄
									</button>
									<button 
										on:click={() => moveIntervalUp(index)}
										disabled={index === 0}
										class="text-gray-400 hover:text-white transition-colors text-xs px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
										title="{$t('settings.move_up')}"
									>
										⬆️
									</button>
									<button 
										on:click={() => moveIntervalDown(index)}
										disabled={index === localIntervals.length - 1}
										class="text-gray-400 hover:text-white transition-colors text-xs px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
										title="{$t('settings.move_down')}"
									>
										⬇️
									</button>
									<button 
										on:click={() => removeInterval(index)}
										class="text-red-400 hover:text-red-300 transition-colors text-xs px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
										title="{$t('settings.delete_interval')}"
									>
										🗑️
									</button>
								</div>
							</div>
							
							<!-- Contenido de datos para Pesas -->
							<div class="p-4">
								<div class="mb-3">
									<input 
										bind:value={interval.name} 
										class="bg-gray-700 text-lg font-medium outline-none rounded px-3 py-2 hover:bg-gray-600 focus:ring-2 focus:ring-purple-500 transition-colors text-white w-full"
										placeholder="{$t('settings.exercise_name')}"
									/>
								</div>
								
								<div class="flex items-center gap-4">
									<div class="flex-1">
										<label for="{generateIntervalId(index, 'sets')}" class="block text-sm text-gray-400 mb-1">{$t('settings.number_of_sets')}</label>
										<input 
											id="{generateIntervalId(index, 'sets')}"
											type="number" 
											bind:value={interval.sets} 
											min="1"
											max="20"
											class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 text-white"
										/>
									</div>
									
									<div class="flex-1">
										<label for="{generateIntervalId(index, 'restTime')}" class="block text-sm text-gray-400 mb-1">{$t('settings.rest_seconds')}</label>
										<input 
											id="{generateIntervalId(index, 'restTime')}"
											type="number" 
											bind:value={interval.restTime} 
											min="10"
											max="600"
											class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 text-white"
										/>
									</div>
									
									<div class="flex-1">
										<label for="{generateIntervalId(index, 'color')}" class="block text-sm text-gray-400 mb-1">{$t('settings.color')}</label>
										<select 
											id="{generateIntervalId(index, 'color')}"
											bind:value={interval.color}
											class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 text-white"
										>
											{#each colorOptions as color}
												<option value={color.value}>{color.name}</option>
											{/each}
										</select>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<!-- Intervalo normal HIIT -->
						<div class="bg-gray-800 rounded-lg border-l-4 {interval.color} relative">
							<div class="flex justify-between items-center p-2 border-b border-gray-700">
								<button 
									on:click={() => copyInterval(index)}
									class="text-blue-400 hover:text-blue-300 transition-colors text-xs p-2 rounded bg-gray-700 hover:bg-gray-600"
									title="{$t('settings.copy_interval')}"
								>
									📄 {$t('common.copy')}
								</button>
								<div class="flex gap-3">
									<button 
										on:click={() => moveIntervalUp(index)}
										disabled={index === 0}
										class="text-gray-400 hover:text-white transition-colors text-xs px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
										title="{$t('settings.move_up')}"
									>
										⬆️
									</button>
									<button 
										on:click={() => moveIntervalDown(index)}
										disabled={index === localIntervals.length - 1}
										class="text-gray-400 hover:text-white transition-colors text-xs px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
										title="{$t('settings.move_down')}"
									>
										⬇️
									</button>
									<button 
										on:click={() => removeInterval(index)}
										class="text-red-400 hover:text-red-300 transition-colors text-xs px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
										title="{$t('settings.delete_interval')}"
									>
										🗑️
									</button>
								</div>
							</div>
							
							<!-- Contenido de datos -->
							<div class="p-4">
								<div class="mb-3">
									<input 
										bind:value={interval.name} 
										class="bg-gray-700 text-lg font-medium outline-none rounded px-3 py-2 hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 transition-colors text-white w-full"
										placeholder="{$t('settings.interval_name')}"
									/>
								</div>
								
							<div class="flex items-center gap-4">
								<div class="flex-1">
									<label for="{generateIntervalId(index, 'duration')}" class="block text-sm text-gray-400 mb-1">{$t('settings.duration_seconds')}</label>
									<input 
										id="{generateIntervalId(index, 'duration')}"
										type="number" 
										bind:value={interval.duration} 
										min="1"
										class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-white"
									/>
								</div>
								
								<div class="flex-1">
									<label for="{generateIntervalId(index, 'color')}" class="block text-sm text-gray-400 mb-1">{$t('settings.color')}</label>
									<select 
										id="{generateIntervalId(index, 'color')}"
										bind:value={interval.color}
										class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-white"
									>
										{#each colorOptions as color}
											<option value={color.value}>{color.name}</option>
										{/each}
									</select>
								</div>
								</div>
							</div>
						</div>
					{/if}
			{/each}
			
			{#if localIntervals.length === 0}
				<div class="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-8 text-center border-2 border-dashed border-blue-500/30">
					<div class="text-6xl mb-4">🏃‍♂️</div>
					<h3 class="text-xl font-bold text-white mb-2">{$t('settings.welcome_title')}</h3>
					<p class="text-gray-300 mb-4">{$t('settings.welcome_message')}</p>
					<div class="flex gap-2 justify-center text-sm text-gray-400">
						<span>📝 {$t('settings.add_interval')}</span>
						<span>•</span>
						<span>🏋️ {$t('settings.add_weights_interval')}</span>
					</div>
				</div>
			{/if}
		</div>			<!-- Botones agregar intervalo, pesas y marcador de repetición -->
			<div class="flex gap-2 mb-4">
				<button 
					on:click={addInterval}
					class="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-medium"
					style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);"
				>
					📝 {$t('settings.add_interval')}
				</button>
				<button 
					on:click={addWeightsInterval}
					class="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-medium"
					style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);"
				>
					🏋️ {$t('settings.add_weights_interval')}
				</button>
				<button 
					on:click={addRepeatMarker}
					class="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-medium border-2 border-gray-500"
					style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);"
				>
					🔄 {$t('settings.add_repeat_marker')}
				</button>
			</div>
		</div>
		
		<!-- Footer del modal -->
		<div class="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4 rounded-b-lg">
			<div class="flex gap-3 mb-3">
				<button 
					on:click={saveConfiguration}
					disabled={localIntervals.length === 0}
					class="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
				>
					✅ {$t('settings.save_configuration')}
				</button>
				
				<button 
					on:click={saveAsRoutine}
					disabled={localIntervals.length === 0}
					class="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
				>
					💾 {$t('settings.save_as_routine')}
				</button>
			</div>
			
			<button 
				on:click={cancelConfiguration}
				class="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors text-sm"
			>
				{$t('common.cancel')}
			</button>
		</div>
	</div>
</div>