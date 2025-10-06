<script lang="ts">
	import { onMount } from 'svelte';
	import Timer from '$lib/components/Timer.svelte';
	import MainScreen from '$lib/components/MainScreen.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import MyRoutines from '$lib/components/MyRoutines.svelte';
	import { t } from '$lib/i18n';
	import { saveRoutine, logWorkout, type SavedRoutine } from '$lib/services/routineStorage';
	
	// Estados de la aplicación
	let currentView: 'main' | 'settings' | 'timer' | 'routines' = 'main';
	
	// Configuración persistente
	let repetitions = 3;
	let intervals: Array<{ name: string; duration: number; color: string; type?: 'interval' | 'repeat' | 'weights'; sets?: number; restTime?: number; }> = [];
	let currentRoutineId: string | null = null; // Para tracking de workout logs
	let currentRoutineName: string = '';
	
	// Modal para guardar rutina
	let showSaveModal = false;
	let routineName = '';
	
	// Función para crear intervalos por defecto usando traducciones
	function createDefaultIntervals() {
		return [
			{ name: $t('intervals.preparation'), duration: 3, color: 'bg-yellow-500' },
			{ name: $t('intervals.exercise'), duration: 60, color: 'bg-red-500' },
			{ name: $t('intervals.rest'), duration: 30, color: 'bg-blue-500' }
		];
	}
	
	function openSettings() {
		currentView = 'settings';
	}
	
	function openRoutines() {
		currentView = 'routines';
	}
	
	function saveConfiguration(event: any) {
		const config = event.detail;
		intervals = config.intervals;
		repetitions = config.repetitions;
		currentRoutineName = config.routineName || '';
		currentView = 'main';
		
		// Guardar en localStorage para persistencia
		localStorage.setItem('hiitbeep-config', JSON.stringify({ 
			intervals, 
			repetitions, 
			routineName: currentRoutineName 
		}));
	}
	
	function cancelSettings() {
		currentView = 'main';
	}
	
	function startWorkout() {
		currentView = 'timer';
	}
	
	function backToMain() {
		currentView = 'main';
	}
	
	function backFromRoutines() {
		currentView = 'main';
	}
	
	function handleSaveRoutine() {
		let currentT: any;
		t.subscribe(value => currentT = value)();
		
		if (intervals.length === 0) {
			alert(currentT('routines.no_intervals_error'));
			return;
		}
		
		// Si ya hay un nombre configurado en Settings, guardamos directamente
		if (currentRoutineName && currentRoutineName.trim()) {
			const result = saveRoutine(currentRoutineName.trim(), intervals, repetitions);
			
			if (result.success) {
				currentRoutineId = result.routine?.id || null;
				alert(`✅ ${currentT('routines.routine_saved', { name: currentRoutineName })}`);
			} else {
				alert(`❌ ${currentT('routines.save_error')}: ${result.error}`);
			}
		} else {
			// Si no hay nombre, mostrar modal para pedir uno
			showSaveModal = true;
			routineName = `Routine ${new Date().toLocaleDateString()}`;
		}
	}
	
	function confirmSaveRoutine() {
		let currentT: any;
		t.subscribe(value => currentT = value)();
		
		if (!routineName.trim()) {
			alert(currentT('routines.name_required'));
			return;
		}
		
		const result = saveRoutine(routineName.trim(), intervals, repetitions);
		
		if (result.success) {
			currentRoutineId = result.routine?.id || null;
			currentRoutineName = routineName.trim();
			showSaveModal = false;
			routineName = '';
			alert(`✅ ${currentT('routines.routine_saved', { name: currentRoutineName })}`);
		} else {
			alert(`❌ ${currentT('routines.save_error')}: ${result.error}`);
		}
	}
	
	function cancelSaveRoutine() {
		showSaveModal = false;
		routineName = '';
	}
	
	function handleLoadRoutine(event: CustomEvent<SavedRoutine>) {
		const routine = event.detail;
		intervals = routine.intervals;
		repetitions = routine.repetitions;
		currentRoutineId = routine.id;
		currentRoutineName = routine.name;
		
		// Guardar en localStorage
		localStorage.setItem('hiitbeep-config', JSON.stringify({ 
			intervals, 
			repetitions, 
			routineName: currentRoutineName 
		}));
		
		currentView = 'main';
	}
	
	function handleWorkoutComplete() {
		// Este evento se dispara cuando se completa un entrenamiento
		// Lo configuraremos después desde el Timer
		if (currentRoutineId && currentRoutineName) {
			// Por ahora dejamos esto preparado para cuando Timer emita el evento
			// logWorkout(currentRoutineId, currentRoutineName, duration, repetitions);
		}
	}
	
	// Cargar configuración guardada al iniciar
	onMount(() => {
		try {
			const saved = localStorage.getItem('hiitbeep-config');
			if (saved) {
				const config = JSON.parse(saved);
				intervals = config.intervals;
				repetitions = config.repetitions;
				currentRoutineName = config.routineName || '';
			} else {
				// Si no hay configuración guardada, usar intervalos por defecto
				intervals = createDefaultIntervals();
			}
		} catch (e) {
			console.log('No se pudo cargar configuración guardada');
			intervals = createDefaultIntervals();
		}
	});
</script>

<svelte:head>
	<title>{$t('app.title')} - {$t('app.description')}</title>
</svelte:head>

<main class="min-h-screen transition-colors duration-500 bg-gray-900 text-white">
	{#if currentView === 'main'}
		<MainScreen 
			{repetitions} 
			{intervals}
			routineName={currentRoutineName}
			on:open-settings={openSettings}
			on:start-workout={startWorkout}
			on:open-routines={openRoutines}
			on:save-routine={handleSaveRoutine}
		/>
	{:else if currentView === 'timer'}
		<Timer 
			{intervals} 
			{repetitions} 
			on:back={backToMain} 
		/>
	{:else if currentView === 'routines'}
		<MyRoutines
			on:back={backFromRoutines}
			on:load-routine={handleLoadRoutine}
		/>
	{/if}
	
	{#if currentView === 'settings'}
		<SettingsModal 
			{repetitions} 
			{intervals}
			routineName={currentRoutineName}
			on:save-config={saveConfiguration}
			on:cancel={cancelSettings}
		/>
	{/if}
	
	{#if showSaveModal}
		<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-6">
			<div class="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
				<h3 class="text-xl font-bold mb-4 text-white">{$t('routines.save_routine')}</h3>
				<p class="text-gray-300 mb-4">
					{$t('routines.save_routine_prompt')}
				</p>
				<input
					type="text"
					bind:value={routineName}
					placeholder={$t('routines.routine_name_placeholder')}
					class="w-full px-4 py-3 bg-gray-700 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
					maxlength="50"
					on:keydown={(e) => e.key === 'Enter' && confirmSaveRoutine()}
				/>
				<div class="flex gap-3">
					<button
						on:click={cancelSaveRoutine}
						class="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
					>
						{$t('common.cancel')}
					</button>
					<button
						on:click={confirmSaveRoutine}
						class="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
					>
						{$t('common.save')}
					</button>
				</div>
			</div>
		</div>
	{/if}
</main>
