<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	let repetitions = 3; // Número de repeticiones del ciclo
	
	let intervals = [
		{ name: 'Preparación', duration: 3, color: 'bg-yellow-500' },
		{ name: 'Ejercicio', duration: 60, color: 'bg-red-500' },
		{ name: 'Descanso', duration: 30, color: 'bg-blue-500' }
	];
	
	function addInterval() {
		intervals = [...intervals, { name: 'Nuevo Intervalo', duration: 30, color: 'bg-green-500' }];
	}
	
	function removeInterval(index: number) {
		intervals = intervals.filter((_, i) => i !== index);
	}
	
	function startWorkout() {
		if (intervals.length === 0) return;
		dispatch('start', { intervals, repetitions });
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
	const repetitionsId = 'repetitions-input';
	
	function generateIntervalId(index: number, field: string): string {
		return `interval-${index}-${field}`;
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-6">
	<div class="max-w-md w-full">
		<h1 class="text-4xl font-bold text-center mb-8">HIITBeep</h1>
		<p class="text-center text-gray-400 mb-8">Configura tus intervalos de entrenamiento</p>
		
		<!-- Campo de Repeticiones -->
		<div class="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500 mb-6">
			<label for="{repetitionsId}" class="block text-lg font-medium mb-2">Número de Repeticiones</label>
			<p class="text-sm text-gray-400 mb-3">¿Cuántas veces quieres repetir el ciclo completo?</p>
			<input 
				id="{repetitionsId}"
				type="number" 
				bind:value={repetitions} 
				min="1"
				max="99"
				class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500 text-lg"
			/>
		</div>
		
		<div class="space-y-4 mb-8">
			{#each intervals as interval, index}
				<div class="bg-gray-800 rounded-lg p-4 border-l-4 {interval.color}">
					<div class="flex items-center justify-between mb-3">
						<input 
							bind:value={interval.name} 
							class="bg-transparent text-lg font-medium outline-none border-b border-transparent hover:border-gray-600 focus:border-white transition-colors"
						/>
						<button 
							on:click={() => removeInterval(index)}
							class="text-red-400 hover:text-red-300 transition-colors"
						>
							✕
						</button>
					</div>
					
					<div class="flex items-center gap-4">
						<div class="flex-1">
							<label for="{generateIntervalId(index, 'duration')}" class="block text-sm text-gray-400 mb-1">Duración (segundos)</label>
							<input 
								id="{generateIntervalId(index, 'duration')}"
								type="number" 
								bind:value={interval.duration} 
								min="1"
								class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						
						<div class="flex-1">
							<label for="{generateIntervalId(index, 'color')}" class="block text-sm text-gray-400 mb-1">Color</label>
							<select 
								id="{generateIntervalId(index, 'color')}"
								bind:value={interval.color}
								class="w-full bg-gray-700 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
							>
								{#each colorOptions as color}
									<option value={color.value}>{color.name}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			{/each}
		</div>
		
		<div class="flex flex-col gap-3">
			<button 
				on:click={addInterval}
				class="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
			>
				+ Agregar Intervalo
			</button>
			
			<button 
				on:click={startWorkout}
				disabled={intervals.length === 0}
				class="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium text-lg transition-colors"
			>
				Iniciar Rutina
			</button>
		</div>
	</div>
</div>
