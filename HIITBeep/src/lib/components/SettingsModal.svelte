<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	export let repetitions: number = 3;
	export let intervals: Array<{ name: string; duration: number; color: string }> = [
		{ name: 'Preparación', duration: 3, color: 'bg-yellow-500' },
		{ name: 'Ejercicio', duration: 60, color: 'bg-red-500' },
		{ name: 'Descanso', duration: 30, color: 'bg-blue-500' }
	];
	
	// Copias locales para editar
	let localRepetitions = repetitions;
	let localIntervals = [...intervals];
	
	function addInterval() {
		localIntervals = [...localIntervals, { name: 'Nuevo Intervalo', duration: 30, color: 'bg-green-500' }];
	}
	
	function removeInterval(index: number) {
		localIntervals = localIntervals.filter((_, i) => i !== index);
	}
	
	function copyInterval(index: number) {
		const intervalToCopy = localIntervals[index];
		const copiedInterval = {
			name: intervalToCopy.name,
			duration: intervalToCopy.duration,
			color: intervalToCopy.color
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
		dispatch('save-config', { 
			intervals: localIntervals, 
			repetitions: localRepetitions 
		});
	}
	
	function cancelConfiguration() {
		// Restaurar valores originales
		localRepetitions = repetitions;
		localIntervals = [...intervals];
		dispatch('cancel');
	}
	
	const colorOptions = [
		{ name: 'Amarillo', value: 'bg-yellow-500' },
		{ name: 'Rojo', value: 'bg-red-500' },
		{ name: 'Azul', value: 'bg-blue-500' },
		{ name: 'Verde', value: 'bg-green-500' },
		{ name: 'Morado', value: 'bg-purple-500' },
		{ name: 'Rosa', value: 'bg-pink-500' },
		{ name: 'Naranja', value: 'bg-orange-500' }
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
				<h2 class="text-2xl font-bold text-white">Configuración</h2>
				<button 
					on:click={cancelConfiguration}
					class="text-gray-400 hover:text-white text-2xl"
				>
					✕
				</button>
			</div>
		</div>
		
		<!-- Contenido del modal -->
		<div class="p-4">
			<!-- Campo de Repeticiones -->
			<div class="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500 mb-6">
				<label for="{repetitionsId}" class="block text-lg font-medium mb-2 text-white">Número de Repeticiones</label>
				<p class="text-sm text-gray-400 mb-3">¿Cuántas veces quieres repetir el ciclo completo?</p>
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
				<h3 class="text-lg font-medium text-white">Intervalos:</h3>
				{#each localIntervals as interval, index}
					<div class="bg-gray-800 rounded-lg border-l-4 {interval.color} relative">
						<!-- Barra superior con botones -->
						<div class="flex justify-between items-center p-2 border-b border-gray-700">
							<button 
								on:click={() => copyInterval(index)}
								class="text-blue-400 hover:text-blue-300 transition-colors text-xs p-2 rounded bg-gray-700 hover:bg-gray-600"
								title="Copiar intervalo al final"
							>
								📄 Copiar
							</button>
							<div class="flex gap-3">
								<button 
									on:click={() => moveIntervalUp(index)}
									disabled={index === 0}
									class="text-gray-400 hover:text-white transition-colors text-xs px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
									title="Mover hacia arriba"
								>
									⬆️
								</button>
								<button 
									on:click={() => moveIntervalDown(index)}
									disabled={index === localIntervals.length - 1}
									class="text-gray-400 hover:text-white transition-colors text-xs px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
									title="Mover hacia abajo"
								>
									⬇️
								</button>
								<button 
									on:click={() => removeInterval(index)}
									class="text-red-400 hover:text-red-300 transition-colors text-xs px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
									title="Eliminar intervalo"
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
									placeholder="Nombre del intervalo"
								/>
							</div>
							
						<div class="flex items-center gap-4">
							<div class="flex-1">
								<label for="{generateIntervalId(index, 'duration')}" class="block text-sm text-gray-400 mb-1">Duración (segundos)</label>
								<input 
									id="{generateIntervalId(index, 'duration')}"
									type="number" 
									bind:value={interval.duration} 
									min="1"
									class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-white"
								/>
							</div>
							
							<div class="flex-1">
								<label for="{generateIntervalId(index, 'color')}" class="block text-sm text-gray-400 mb-1">Color</label>
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
				{/each}
				
				{#if localIntervals.length === 0}
					<div class="bg-gray-800 rounded-lg p-4 text-center">
						<p class="text-gray-400">No hay intervalos configurados</p>
					</div>
				{/if}
			</div>
			
			<!-- Botón agregar intervalo -->
			<button 
				on:click={addInterval}
				class="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white mb-4"
			>
				+ Agregar Intervalo
			</button>
		</div>
		
		<!-- Footer del modal -->
		<div class="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4 rounded-b-lg">
			<div class="flex gap-3">
				<button 
					on:click={cancelConfiguration}
					class="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors"
				>
					Cancelar
				</button>
				
				<button 
					on:click={saveConfiguration}
					disabled={localIntervals.length === 0}
					class="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
				>
					Guardar Configuración
				</button>
			</div>
		</div>
	</div>
</div>
