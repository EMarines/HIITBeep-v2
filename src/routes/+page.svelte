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
	
	// Toast para notificaciones
	let toastMessage = '';
	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => { toastMessage = ''; }, 3000);
	}
	
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
			const wasUpdating = !!currentRoutineId;
			
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
				
				const message = wasUpdating 
					? `✅ Rutina "${currentRoutineName}" actualizada`
					: `✅ ${currentT('routines.routine_saved', { name: currentRoutineName })}`;
				showToast(message);
				
				// El botón de "Guardar e Iniciar" debe llevar directo al Timer
				currentView = 'timer';
			} else {
				showToast(`❌ ${currentT('routines.save_error')}: ${result.error}`);
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
			showToast(currentT('routines.name_required'));
			return;
		}
		
		if (!repetitions || repetitions < 1) {
			showToast(currentT('settings.repetitions_required') || 'Please configure repetitions');
			return;
		}
		
		let result;
		const wasUpdating = !!currentRoutineId;
		
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
			
			const message = wasUpdating 
				? `✅ Rutina "${currentRoutineName}" actualizada`
				: `✅ ${currentT('routines.routine_saved', { name: currentRoutineName })}`;
			showToast(message);
			currentView = 'main';
		} else {
			showToast(`❌ ${currentT('routines.save_error')}: ${result.error}`);
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

<!-- Toast notification superior -->
{#if toastMessage}
	<div class="fixed top-6 left-1/2 -translate-x-1/2 z-[99999] bg-gray-900 border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center justify-center animate-bounce-in">
		<span class="text-sm font-bold text-white tracking-wide">{toastMessage}</span>
	</div>
	<style>
		@keyframes bounceIn {
			0% { opacity: 0; transform: translate(-50%, -20px); }
			50% { opacity: 1; transform: translate(-50%, 5px); }
			100% { opacity: 1; transform: translate(-50%, 0); }
		}
		.animate-bounce-in {
			animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
		}
	</style>
{/if}

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
		<div class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[300] p-6">
			<div class="sv-modal">
				<div class="sv-icon-wrap">
					<svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
						<polyline points="17 21 17 13 7 13 7 21"></polyline>
						<polyline points="7 3 7 8 15 8"></polyline>
					</svg>
				</div>
				<h3 style="font-size:1.25rem; font-weight:800; color:var(--text-primary); margin-bottom:0.5rem; letter-spacing:-0.02em;">{$t('routines.save_routine')}</h3>
				<p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.5; margin-bottom:1.5rem;">
					{$t('routines.save_routine_prompt')}
				</p>
				<input
					type="text"
					bind:value={routineNameInput}
					placeholder={$t('routines.routine_name_placeholder')}
					class="sv-input"
					maxlength="50"
					on:keydown={(e) => e.key === 'Enter' && confirmSaveRoutine()}
				/>
				<div style="display:flex; gap:0.6rem; margin-top:1.5rem;">
					<button class="sv-btn-cancel" on:click={cancelSaveRoutine}>
						{$t('common.cancel')}
					</button>
					<button class="sv-btn-save" on:click={confirmSaveRoutine}>
						{$t('common.save')}
					</button>
				</div>
			</div>
		</div>
		<style>
		.sv-modal {
			background: var(--bg-card);
			border: 1px solid var(--border-card);
			border-radius: var(--radius-card);
			padding: 2.25rem 2rem;
			width: 100%; max-width: 360px;
			text-align: center;
			box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
			animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		}
		.sv-icon-wrap {
			width: 60px; height: 60px;
			background: rgba(168,85,247,0.12);
			border-radius: 50%; display: flex;
			align-items: center; justify-content: center;
			margin: 0 auto 1.25rem;
			color: var(--accent-purple);
		}
		.sv-input {
			width: 100%; background: var(--bg-input); color: var(--text-input);
			border: 1px solid var(--border-input); border-radius: var(--radius-input);
			padding: 0.8rem 1rem; font-family: 'Inter', sans-serif;
			font-size: 0.95rem; font-weight: 600; text-align: center;
			outline: none; transition: all 0.2s;
		}
		.sv-input:focus { border-color: var(--accent-purple); box-shadow: 0 0 0 3px rgba(168,85,247,0.25); }
		.sv-btn-cancel {
			flex: 1; padding: 0.85rem; background: var(--bg-card-alt); color: var(--text-secondary);
			border: 1px solid var(--border-card); border-radius: var(--radius-btn);
			font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.9rem;
		}
		.sv-btn-cancel:hover { background: rgba(255,255,255,0.08); color: var(--text-primary); }
		.sv-btn-save {
			flex: 1; padding: 0.85rem; background: var(--accent-purple); color: #fff;
			border: none; border-radius: var(--radius-btn); box-shadow: 0 4px 14px rgba(168,85,247,0.3);
			font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 0.9rem;
		}
		.sv-btn-save:hover { background: #9333ea; box-shadow: 0 6px 20px rgba(168,85,247,0.4); transform: translateY(-1px); }
		</style>
	{/if}
</main>
