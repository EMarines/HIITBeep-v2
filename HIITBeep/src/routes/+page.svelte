<script lang="ts">
	import { onMount } from 'svelte';
	import Timer from '$lib/components/Timer.svelte';
	import MainScreen from '$lib/components/MainScreen.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	
	// Estados de la aplicación
	let currentView: 'main' | 'settings' | 'timer' = 'main';
	
	// Configuración persistente
	let repetitions = 3;
	let intervals: Array<{ name: string; duration: number; color: string }> = [
		{ name: 'Preparación', duration: 3, color: 'bg-yellow-500' },
		{ name: 'Ejercicio', duration: 60, color: 'bg-red-500' },
		{ name: 'Descanso', duration: 30, color: 'bg-blue-500' }
	];
	
	function openSettings() {
		currentView = 'settings';
	}
	
	function saveConfiguration(event: any) {
		const config = event.detail;
		intervals = config.intervals;
		repetitions = config.repetitions;
		currentView = 'main';
		
		// Opcional: Guardar en localStorage para persistencia
		localStorage.setItem('hiitbeep-config', JSON.stringify({ intervals, repetitions }));
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
	
	// Cargar configuración guardada al iniciar
	onMount(() => {
		try {
			const saved = localStorage.getItem('hiitbeep-config');
			if (saved) {
				const config = JSON.parse(saved);
				intervals = config.intervals;
				repetitions = config.repetitions;
			}
		} catch (e) {
			console.log('No se pudo cargar configuración guardada');
		}
	});
</script>

<svelte:head>
	<title>HIITBeep - Cronómetro HIIT</title>
</svelte:head>

<main class="min-h-screen transition-colors duration-500 bg-gray-900 text-white">
	{#if currentView === 'main'}
		<MainScreen 
			{repetitions} 
			{intervals} 
			on:open-settings={openSettings}
			on:start-workout={startWorkout}
		/>
	{:else if currentView === 'timer'}
		<Timer 
			{intervals} 
			{repetitions} 
			on:back={backToMain} 
		/>
	{/if}
	
	{#if currentView === 'settings'}
		<SettingsModal 
			{repetitions} 
			{intervals}
			on:save-config={saveConfiguration}
			on:cancel={cancelSettings}
		/>
	{/if}
</main>
