<script lang="ts">
	import { onMount } from 'svelte';
	import Timer from '$lib/components/Timer.svelte';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import MainScreen from '$lib/components/MainScreen.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import MyRoutines from '$lib/components/MyRoutines.svelte';
	import WorkoutHistory from '$lib/components/WorkoutHistory.svelte';
	import { t } from '$lib/i18n';
	import { saveRoutine, logWorkout, type SavedRoutine } from '$lib/services/routineStorage';
	
	// Estados de la aplicación
	let currentView: 'dashboard' | 'main' | 'settings' | 'timer' | 'routines' | 'history' = 'dashboard';
	
	// Configuración persistente
	let repetitions = 1;
	let intervals: Array<{ name: string; duration: number; color: string; type?: 'interval' | 'repeat' | 'weights'; sets?: number; restTime?: number; }> = [];
	let currentRoutineId: string | null = null; // Para tracking de workout logs
	let currentRoutineName: string = '';
	
	// Modal para guardar rutina
	let showSaveModal = false;
	let routineName = '';
	
	// Key para forzar recreación de SettingsModal
	let settingsKey = 0;
	
	// Función para crear intervalos por defecto usando traducciones
	function createDefaultIntervals() {
		return [
			{ name: $t('intervals.preparation'), duration: 3, color: 'bg-yellow-500' },
			{ name: $t('intervals.exercise'), duration: 60, color: 'bg-red-500' },
			{ name: $t('intervals.rest'), duration: 30, color: 'bg-blue-500' }
		];
	}
	
	function openSettings() {
		// Si ya hay una rutina guardada, limpiar Settings para crear una nueva
		if (currentRoutineId) {
			resetConfiguration();
		}
		// Incrementar key para forzar recreación del componente
		settingsKey++;
		// Usar setTimeout para asegurar que la reactividad se ejecute
		setTimeout(() => {
			currentView = 'settings';
		}, 0);
	}
	
	function openRoutines() {
		console.log('Opening routines view');
		currentView = 'routines';
	}
	
	function openHistory() {
		console.log('Opening history view');
		currentView = 'history';
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
	
	function handleSaveRoutineFromSettings(event: any) {
		let currentT: any;
		t.subscribe(value => currentT = value)();
		
		const config = event.detail;
		const routineIntervals = config.intervals;
		const routineRepetitions = config.repetitions;
		const routineNameFromSettings = config.routineName || '';
		
		if (routineIntervals.length === 0) {
			alert(currentT('routines.no_intervals_error'));
			return;
		}
		
		// Si hay nombre en Settings, usarlo; si no, pedir uno
		if (routineNameFromSettings && routineNameFromSettings.trim()) {
			const result = saveRoutine(routineNameFromSettings.trim(), routineIntervals, routineRepetitions);
			
			if (result.success) {
				// Actualizar la configuración actual
				intervals = routineIntervals;
				repetitions = routineRepetitions;
				currentRoutineName = routineNameFromSettings.trim();
				currentRoutineId = result.routine?.id || null;
				
				// NO guardar en hiitbeep-config porque ya está en hiitbeep-routines
				// hiitbeep-config es solo para configuraciones temporales ("Just Start")
				localStorage.removeItem('hiitbeep-config');
				
				alert(`✅ ${currentT('routines.routine_saved', { name: currentRoutineName })}`);
				
				// Ir a Main para que el usuario pueda iniciar la rutina
				currentView = 'main';
			} else {
				alert(`❌ ${currentT('routines.save_error')}: ${result.error}`);
			}
		} else {
			// Si no hay nombre, aplicar configuración y mostrar modal para pedir nombre
			intervals = routineIntervals;
			repetitions = routineRepetitions;
			currentView = 'main';
			
			showSaveModal = true;
			routineName = `Routine ${new Date().toLocaleDateString()}`;
		}
	}
	
	function resetConfiguration() {
		// Limpiar completamente para crear una nueva rutina desde cero
		intervals = []; // Lienzo completamente limpio, sin intervalos
		repetitions = 3;
		currentRoutineName = '';
		currentRoutineId = null;
		
		// Limpiar localStorage
		localStorage.removeItem('hiitbeep-config');
	}
	
	function cancelSettings() {
		currentView = 'dashboard';
	}
	
	function startWorkout() {
		currentView = 'timer';
	}
	
	function backToMain() {
		currentView = 'main';
	}
	
	function backFromRoutines() {
		currentView = 'dashboard';
	}
	
	function backFromHistory() {
		currentView = 'dashboard';
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
			
			// Limpiar config temporal ya que ahora está guardada con nombre
			localStorage.removeItem('hiitbeep-config');
			
			alert(`✅ ${currentT('routines.routine_saved', { name: currentRoutineName })}`);
			// Ir a Main para que el usuario pueda iniciar la rutina
			currentView = 'main';
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
	
	function handleWorkoutComplete(event: CustomEvent<{ duration: number; repetitionsCompleted: number }>) {
		const { duration, repetitionsCompleted } = event.detail;
		
		// Usar el routineId y routineName actual, o valores por defecto si no existen
		const workoutRoutineId = currentRoutineId || 'default-routine';
		const workoutRoutineName = currentRoutineName || 'Unnamed Routine';
		
		// Registrar el workout completado
		logWorkout(workoutRoutineId, workoutRoutineName, duration, repetitionsCompleted);
		
		console.log('Workout completado:', {
			routineId: workoutRoutineId,
			routineName: workoutRoutineName,
			duration,
			repetitionsCompleted
		});
	}
	
	// No cargar automáticamente configuración al iniciar
	// El usuario elegirá desde Dashboard: crear nueva rutina o cargar una guardada
	onMount(() => {
		// intervals inicia vacío [], el usuario debe elegir qué hacer desde Dashboard
		console.log('App iniciada - Dashboard mode');
	});
</script>

<svelte:head>
	<title>{$t('app.title')} - {$t('app.description')}</title>
</svelte:head>

<main class="min-h-screen transition-colors duration-500 bg-gray-900 text-white">
	{#if currentView === 'dashboard'}
		<Dashboard 
			on:open-settings={openSettings}
			on:open-routines={openRoutines}
			on:open-history={openHistory}
		/>
	{:else if currentView === 'main'}
		<MainScreen 
			{repetitions} 
			{intervals}
			routineName={currentRoutineName}
			on:open-settings={openSettings}
			on:start-workout={startWorkout}
			on:open-routines={openRoutines}
			on:open-history={openHistory}
		/>
	{:else if currentView === 'timer'}
		<Timer 
			{intervals} 
			{repetitions} 
			on:back={backToMain}
			on:workout-complete={handleWorkoutComplete}
		/>
	{:else if currentView === 'routines'}
		<MyRoutines
			on:back={backFromRoutines}
			on:load-routine={handleLoadRoutine}
		/>
	{:else if currentView === 'history'}
		<WorkoutHistory
			on:back={backFromHistory}
		/>
	{/if}
	
	{#if currentView === 'settings'}
		{#key settingsKey}
			<SettingsModal 
				{repetitions} 
				{intervals}
				routineName={currentRoutineName}
				on:save-config={saveConfiguration}
				on:save-routine={handleSaveRoutineFromSettings}
				on:cancel={cancelSettings}
			/>
		{/key}
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
