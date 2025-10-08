<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { loadRoutines, loadWorkoutLogs } from '$lib/services/routineStorage';
	import LanguageSelector from './LanguageSelector.svelte';
	
	const dispatch = createEventDispatcher();
	
	let routineCount = 0;
	let workoutCount = 0;
	let animate = false;
	
	onMount(() => {
		// Cargar contadores
		const routines = loadRoutines();
		const workouts = loadWorkoutLogs();
		routineCount = routines.length;
		workoutCount = workouts.length;
		
		// Activar animación
		setTimeout(() => {
			animate = true;
		}, 100);
	});
	
	function openSettings() {
		dispatch('open-settings');
	}
	
	function openRoutines() {
		dispatch('open-routines');
	}
	
	function openHistory() {
		dispatch('open-history');
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
	<div class="max-w-md w-full">
		<!-- Logo animado -->
		<div class="text-center mb-4" class:animate={animate}>
			<div class="relative inline-block">
				<div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
				<div class="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
					<!-- Icono de cronómetro + ondas de sonido -->
					<svg class="w-24 h-24 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
						<!-- Cronómetro -->
						<circle cx="50" cy="55" r="30" stroke="currentColor" stroke-width="4" fill="none"/>
						<circle cx="50" cy="55" r="25" fill="currentColor" opacity="0.2"/>
						<line x1="50" y1="55" x2="50" y2="35" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
						<line x1="50" y1="55" x2="65" y2="55" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
						<circle cx="50" cy="55" r="3" fill="currentColor"/>
						
						<!-- Ondas de sonido (beep) -->
						<path d="M 15 45 Q 10 55 15 65" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6">
							<animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
						</path>
						<path d="M 8 40 Q 2 55 8 70" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.4">
							<animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" begin="0.3s" repeatCount="indefinite"/>
						</path>
						<path d="M 85 45 Q 90 55 85 65" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6">
							<animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
						</path>
						<path d="M 92 40 Q 98 55 92 70" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.4">
							<animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" begin="0.3s" repeatCount="indefinite"/>
						</path>
						
						<!-- Botón superior del cronómetro -->
						<rect x="45" y="15" width="10" height="8" rx="2" fill="currentColor"/>
					</svg>
				</div>
			</div>
		</div>
		
		<!-- Título y Subtítulo -->
		<div class="text-center space-y-2 mb-12">
			<h1 class="text-5xl font-bold text-white tracking-tight">
				{$t('app.title')}
			</h1>
			<p class="text-xl text-blue-200 font-light">
				{$t('dashboard.subtitle')}
			</p>
			<p class="text-sm text-gray-300 italic">
				"{$t('dashboard.tagline')}"
			</p>
		</div>
		
		<!-- Botones de Navegación -->
		<div class="space-y-4" class:animate-buttons={animate}>
			<!-- Botón Configurar Rutinas -->
			<button 
				on:click={openSettings}
				class="w-full group relative overflow-hidden rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300"
				style="background: linear-gradient(to right, #2563eb, #1d4ed8);"
			>
				<div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
				<div class="relative flex items-center space-x-4">
					<div class="text-5xl">⚙️</div>
					<div class="flex-1 text-left">
						<h3 class="text-2xl font-bold text-white">{$t('dashboard.configure_routines')}</h3>
						<p class="text-blue-100 text-sm">{$t('dashboard.configure_description')}</p>
					</div>
					<div class="text-white text-2xl opacity-50">→</div>
				</div>
			</button>
			
			<!-- Botón Mis Rutinas -->
			<button 
				on:click={openRoutines}
				class="w-full group relative overflow-hidden rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300"
				style="background: linear-gradient(to right, #16a34a, #15803d);"
			>
				<div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
				<div class="relative flex items-center space-x-4">
					<div class="text-5xl">📋</div>
					<div class="flex-1 text-left">
						<h3 class="text-2xl font-bold text-white">{$t('dashboard.my_routines')}</h3>
						<p class="text-green-100 text-sm">
							{routineCount} {routineCount === 1 ? $t('dashboard.routine_saved') : $t('dashboard.routines_saved')}
						</p>
					</div>
					<div class="text-white text-2xl opacity-50">→</div>
				</div>
			</button>
			
			<!-- Botón Historial -->
			<button 
				on:click={openHistory}
				class="w-full group relative overflow-hidden rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300"
				style="background: linear-gradient(to right, #9333ea, #7e22ce);"
			>
				<div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
				<div class="relative flex items-center space-x-4">
					<div class="text-5xl">📊</div>
					<div class="flex-1 text-left">
						<h3 class="text-2xl font-bold text-white">{$t('dashboard.history')}</h3>
						<p class="text-purple-100 text-sm">
							{workoutCount} {workoutCount === 1 ? $t('dashboard.workout_completed') : $t('dashboard.workouts_completed')}
						</p>
					</div>
					<div class="text-white text-2xl opacity-50">→</div>
				</div>
			</button>
		</div>
		
		<!-- Selector de Idioma -->
		<div class="flex justify-center pt-4">
			<LanguageSelector />
		</div>
	</div>
</div>

<style>
	.animate {
		animation: fadeInScale 0.6s ease-out;
	}
	
	.animate-buttons {
		animation: slideUp 0.8s ease-out;
	}
	
	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
