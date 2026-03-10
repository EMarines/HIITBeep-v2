<script lang="ts">
	import { onMount } from 'svelte';
	import Timer from '$lib/components/Timer.svelte';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import MainScreen from '$lib/components/MainScreen.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import MyRoutines from '$lib/components/MyRoutines.svelte';
	import WorkoutHistory from '$lib/components/WorkoutHistory.svelte';
	import { t } from '$lib/i18n';
	import { user } from '$lib/stores/userStore';
	import { routineStore } from '$lib/stores/routineStore';
	import { workoutStore } from '$lib/stores/workoutStore';
	import { type SavedRoutine } from '$lib/services/routineStorage';
	
	// Estados de la aplicación
	let currentView: 'dashboard' | 'main' | 'settings' | 'timer' | 'routines' | 'history' = 'dashboard';
	
	// Configuración persistente
	let repetitions: number | null = null;
	let intervals: Array<{ name: string; duration: number; color: string; type?: 'interval' | 'repeat' | 'weights'; sets?: number; restTime?: number; prepDuration?: number; restDuration?: number; }> = [];
	let currentRoutineId: string | null = null; // Para tracking de workout logs
	let currentRoutineName: string = '';
	
	// Modal para guardar rutina
	let showSaveModal = false;
	let routineNameInput = '';
	
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
		// Si vienes del dashboard (sin rutina activa), resetear para crear nueva
		if (currentView === 'dashboard') {
			resetConfiguration();
		}
		
		settingsKey++;
		setTimeout(() => {
			currentView = 'settings';
		}, 0);
	}
	
	function openRoutines() {
		currentView = 'routines';
	}
	
	function openHistory() {
		currentView = 'history';
	}
	
	function saveConfiguration(event: any) {
		const config = event.detail;
		intervals = config.intervals;
		repetitions = config.repetitions;
		currentRoutineName = config.routineName || '';
		currentView = 'main';
		
		localStorage.setItem('hiitbeep-config', JSON.stringify({ 
			intervals, 
			repetitions, 
			routineName: currentRoutineName 
		}));
	}
	
	async function handleSaveRoutineFromSettings(event: any) {
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
		
		if (routineNameFromSettings && routineNameFromSettings.trim()) {
			let result;
			
			if (currentRoutineId) {
				result = await routineStore.update(currentRoutineId, routineNameFromSettings.trim(), routineIntervals, routineRepetitions);
			} else {
				result = await routineStore.save(routineNameFromSettings.trim(), routineIntervals, routineRepetitions);
			}
			
			if (result.success) {
				intervals = routineIntervals;
				repetitions = routineRepetitions;
				currentRoutineName = routineNameFromSettings.trim();
				currentRoutineId = result.routine?.id || null;
				
				localStorage.removeItem('hiitbeep-config');
				
				const message = currentRoutineId && currentRoutineId === result.routine?.id 
					? `✅ Rutina "${currentRoutineName}" actualizada`
					: `✅ ${currentT('routines.routine_saved', { name: currentRoutineName })}`;
				alert(message);
				
				currentView = 'main';
			} else {
				alert(`❌ ${currentT('routines.save_error')}: ${result.error}`);
			}
		} else {
			intervals = routineIntervals;
			repetitions = routineRepetitions;
			currentView = 'main';
			
			showSaveModal = true;
			routineNameInput = `Routine ${new Date().toLocaleDateString()}`;
		}
	}
	
	function resetConfiguration() {
		intervals = [];
		repetitions = null;
		currentRoutineName = '';
		currentRoutineId = null;
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
	
	function goToDashboard() {
		currentView = 'dashboard';
	}
	
	function backFromRoutines() {
		currentView = 'dashboard';
	}
	
	function backFromHistory() {
		currentView = 'dashboard';
	}
	
	async function confirmSaveRoutine() {
		let currentT: any;
		t.subscribe(value => currentT = value)();
		
		if (!routineNameInput.trim()) {
			alert(currentT('routines.name_required'));
			return;
		}
		
		if (!repetitions || repetitions < 1) {
			alert(currentT('settings.repetitions_required') || 'Please configure repetitions');
			return;
		}
		
		let result;
		
		if (currentRoutineId) {
			result = await routineStore.update(currentRoutineId, routineNameInput.trim(), intervals, repetitions);
		} else {
			result = await routineStore.save(routineNameInput.trim(), intervals, repetitions);
		}
		
		if (result.success) {
			currentRoutineId = result.routine?.id || null;
			currentRoutineName = routineNameInput.trim();
			showSaveModal = false;
			routineNameInput = '';
			
			localStorage.removeItem('hiitbeep-config');
			
			const message = currentRoutineId && currentRoutineId === result.routine?.id 
				? `✅ Rutina "${currentRoutineName}" actualizada`
				: `✅ ${currentT('routines.routine_saved', { name: currentRoutineName })}`;
			alert(message);
			currentView = 'main';
		} else {
			alert(`❌ ${currentT('routines.save_error')}: ${result.error}`);
		}
	}
	
	function cancelSaveRoutine() {
		showSaveModal = false;
		routineNameInput = '';
	}
	
	function handleLoadRoutine(event: CustomEvent<SavedRoutine>) {
		const routine = event.detail;
		intervals = routine.intervals;
		repetitions = routine.repetitions;
		currentRoutineId = routine.id;
		currentRoutineName = routine.name;
		
		localStorage.setItem('hiitbeep-config', JSON.stringify({ 
			intervals, 
			repetitions, 
			routineName: currentRoutineName 
		}));
		
		currentView = 'main';
	}
	
	async function handleWorkoutComplete(event: CustomEvent<{ duration: number; repetitionsCompleted: number }>) {
		const { duration, repetitionsCompleted } = event.detail;
		const workoutRoutineId = currentRoutineId || 'default-routine';
		const workoutRoutineName = currentRoutineName || 'Unnamed Routine';
		
		await workoutStore.log(workoutRoutineId, workoutRoutineName, duration, repetitionsCompleted);
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
			repetitions={repetitions || 1} 
			{intervals}
			routineName={currentRoutineName}
			on:open-settings={openSettings}
			on:start-workout={startWorkout}
			on:go-dashboard={goToDashboard}
		/>
	{:else if currentView === 'timer'}
		<Timer 
			{intervals} 
			repetitions={repetitions || 1} 
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
					bind:value={routineNameInput}
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
