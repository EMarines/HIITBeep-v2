<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { t } from '$lib/i18n';
	
	const dispatch = createEventDispatcher();
	
	export let intervals: Array<{ 
		name: string; 
		duration: number; 
		color: string; 
		type?: 'interval' | 'repeat' | 'weights';
		sets?: number;
		restTime?: number;
	}>;
	export let repetitions: number = 1;
	
	let currentIntervalIndex = 0;
	let currentRepetition = 1;
	let timeRemaining = 0;
	let isRunning = false;
	let isPaused = false;
	let isCompleted = false; // Nueva variable para indicar rutina completada
	let timer: number;
	let audioContext: AudioContext | null = null;
	let repeatMarkersExecuted: Map<number, number> = new Map(); // Controla cuántas veces se ha ejecutado cada marcador
	let lastBeepTime = 0; // Para trackear beeps cada 10 segundos
	
	// Variables para tracking del workout
	let workoutStartTime: number = 0;
	let totalWorkoutDuration: number = 0;
	
	// Variables para el contador visual
	let showRepeatCounter = false;
	let repeatCounterValue = 0;
	
	// Variables para intervalos de pesas
	let currentSet = 1; // Serie actual en intervalos de pesas
	let isWaitingForTap = false; // Esperando que el usuario toque para iniciar descanso
	let isRestingWeights = false; // En descanso de pesas
	
	// Validar que repeticiones sea al menos 1
	$: if (repetitions < 1) repetitions = 1;
	
	$: currentInterval = intervals[currentIntervalIndex];
	$: progress = currentInterval && !isCompleted 
		? (() => {
			// Para pesas en descanso, usar restTime en lugar de duration
			if (currentInterval.type === 'weights' && isRestingWeights) {
				const totalRestTime = currentInterval.restTime || 90;
				return Math.max(0, Math.min(1, (totalRestTime - timeRemaining) / totalRestTime));
			}
			// Para intervalos normales
			return Math.max(0, Math.min(1, (currentInterval.duration - timeRemaining) / currentInterval.duration));
		})()
		: (isCompleted ? 1 : 0);
	$: circumference = 2 * Math.PI * 120;
	$: strokeDashoffset = circumference * (1 - progress);
	
	// Calcular el color de fondo directamente como reactivo
	$: backgroundColor = currentInterval 
		? (() => {
			const colorMap: {[key: string]: string} = {
				'bg-yellow-500': '#eab308',
				'bg-red-500': '#ef4444', 
				'bg-blue-500': '#3b82f6',
				'bg-green-500': '#22c55e',
				'bg-purple-500': '#a855f7',
				'bg-purple-600': '#9333ea',
				'bg-pink-500': '#ec4899',
				'bg-orange-500': '#f97316'
			};
			return colorMap[currentInterval.color] || '#111827';
		})()
		: '#111827';
	
	onMount(() => {
		if (browser && intervals.length > 0) {
			startTimer();
			initAudio();
		}
	});
	
	onDestroy(() => {
		if (timer) clearInterval(timer);
		if (audioContext) audioContext.close();
	});
	
	function initAudio() {
		if (browser) {
			try {
				audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			} catch (e) {
				console.log('Audio no disponible');
			}
		}
	}
	
	function playBeep(frequency: number = 800, duration: number = 200) {
		if (!audioContext) return;
		
		try {
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();
			
			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);
			
			oscillator.frequency.value = frequency;
			oscillator.type = 'square';
			
			gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
			
			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + duration / 1000);
		} catch (e) {
			console.log('Error reproduciendo sonido');
		}
	}
	
	// Sonido especial para finalización de descanso en pesas
	function playWeightsRestComplete() {
		if (!audioContext) return;
		
		try {
			// Secuencia de tonos ascendentes para indicar que puede hacer la siguiente serie
			setTimeout(() => playBeep(600, 150), 0);
			setTimeout(() => playBeep(800, 150), 200);
			setTimeout(() => playBeep(1000, 300), 400);
		} catch (e) {
			console.log('Error reproduciendo sonido de pesas');
		}
	}
	
	// Manejar tap del usuario en intervalos de pesas
	function handleWeightsTap() {
		const currentIntervalData = intervals[currentIntervalIndex];
		if (!currentIntervalData || currentIntervalData.type !== 'weights') return;
		if (!isWaitingForTap) return;
		
		// Usuario tocó, iniciar descanso
		isWaitingForTap = false;
		isRestingWeights = true;
		timeRemaining = currentIntervalData.restTime || 90;
		
		// Beep de confirmación
		playBeep(1000, 200);
		
		// Iniciar countdown de descanso
		if (timer) clearInterval(timer);
		timer = setInterval(() => {
			if (!isPaused) {
				timeRemaining--;
				
				// Beeps de los últimos 5 segundos
				if (timeRemaining <= 5 && timeRemaining > 0) {
					playBeep(1200, 200);
				}
				
				// Descanso terminado
				if (timeRemaining <= 0) {
					playWeightsRestComplete();
					isRestingWeights = false;
					clearInterval(timer); // Detener el timer
					
					setTimeout(() => {
						currentSet++;
						
						// Verificar si completamos todas las series
						if (currentSet > (currentIntervalData.sets || 3)) {
							// Avanzar al siguiente intervalo
							currentSet = 1;
							currentIntervalIndex++;
							
							if (currentIntervalIndex >= intervals.length) {
								// Verificar repeticiones globales
								if (currentRepetition > 1) {
									currentRepetition--;
									currentIntervalIndex = 0;
									repeatMarkersExecuted.clear();
									showRepeatCountdown(currentRepetition);
									initializeInterval();
								} else {
									// Rutina completada
									isRunning = false;
									isCompleted = true;
									
									// Calcular duración total del workout en segundos
									totalWorkoutDuration = Math.floor((Date.now() - workoutStartTime) / 1000);
									
									// Emitir evento de workout completado
									dispatch('workout-complete', {
										duration: totalWorkoutDuration,
										repetitionsCompleted: repetitions
									});
									
									setTimeout(() => playBeep(400, 800), 100);
									setTimeout(() => playBeep(500, 800), 600);
								}
							} else {
								initializeInterval();
							}
						} else {
							// Más series pendientes, esperar tap del usuario
							isWaitingForTap = true;
							timeRemaining = 0; // Resetear tiempo
							// Beep para indicar que puede empezar la siguiente serie
							setTimeout(() => playBeep(800, 200), 100);
						}
					}, 300);
				}
			}
		}, 1000);
	}
	
	// Inicializar intervalo actual (HIIT o Pesas)
	function initializeInterval() {
		const currentIntervalData = intervals[currentIntervalIndex];
		
		// IMPORTANTE: Limpiar cualquier timer activo antes de inicializar
		if (timer) {
			clearInterval(timer);
		}
		
		if (currentIntervalData.type === 'weights') {
			// Intervalo de pesas: esperar tap del usuario
			isWaitingForTap = true;
			isRestingWeights = false;
			timeRemaining = 0;
			currentSet = 1;
			
			// Beep para indicar que puede empezar
			setTimeout(() => playBeep(800, 200), 100);
		} else if (currentIntervalData.type === 'repeat') {
			// Marcador de repetición: SIEMPRE 2 segundos, sin importar duration
			timeRemaining = 2;
			startHIITTimer();
		} else {
			// Intervalo HIIT normal
			timeRemaining = currentIntervalData.duration;
			startHIITTimer();
		}
	}
	
	// Timer para intervalos HIIT (código existente movido aquí)
	function startHIITTimer() {
		timer = setInterval(() => {
			if (!isPaused) {
				timeRemaining--;
				
				// Beeps cada 10 segundos (mejorado con lastBeepTime para evitar duplicados)
				const elapsedInInterval = currentInterval.duration - timeRemaining;
				if (elapsedInInterval > 0 && elapsedInInterval % 10 === 0 && elapsedInInterval !== lastBeepTime) {
					playBeep(800, 150);
					lastBeepTime = elapsedInInterval;
				}
				
				// Beeps de los últimos 5 segundos
				if (timeRemaining <= 5 && timeRemaining > 0) {
					playBeep(1200, 200);
				}
				
				// Cambio de intervalo
				if (timeRemaining <= 0) {
					lastBeepTime = 0; // Reset para el siguiente intervalo
					playBeep(600, 400);
					
					setTimeout(() => {
						handleIntervalChange();
					}, 300);
				}
			}
		}, 1000);
	}
	
	// Manejar cambio de intervalo (lógica existente refactorizada)
	function handleIntervalChange() {
		const currentIntervalData = intervals[currentIntervalIndex];
		
		if (currentIntervalData && currentIntervalData.type === 'repeat') {
			// Manejar marcador de repetición
			const executed = repeatMarkersExecuted.get(currentIntervalIndex) || 0;
			// Cambiado: ahora executed < duration - 1 porque queremos duration ejecuciones totales, no duration + 1
			if (executed < currentIntervalData.duration - 1) {
				repeatMarkersExecuted.set(currentIntervalIndex, executed + 1);
				const remaining = currentIntervalData.duration - executed;
				showRepeatCountdown(remaining);
				
				// Buscar el último marcador de repetición anterior a este
				// Si existe, volver al índice siguiente a ese marcador
				// Si no existe, volver al índice 0
				let returnIndex = 0;
				for (let i = currentIntervalIndex - 1; i >= 0; i--) {
					if (intervals[i].type === 'repeat') {
						returnIndex = i + 1;
						break;
					}
				}
				
				setTimeout(() => playBeep(1000, 200), 100);
				setTimeout(() => playBeep(1000, 200), 300);
				setTimeout(() => playBeep(1200, 300), 500);
				
				setTimeout(() => {
					currentIntervalIndex = returnIndex;
					initializeInterval();
				}, 500);
				return;
			} else {
				currentIntervalIndex++;
			}
		} else {
			currentIntervalIndex++;
		}
		
		if (currentIntervalIndex >= intervals.length) {
			if (currentRepetition > 1) {
				currentRepetition--;
				currentIntervalIndex = 0;
				repeatMarkersExecuted.clear();
				showRepeatCountdown(currentRepetition);
				
				setTimeout(() => playBeep(1000, 300), 100);
				setTimeout(() => playBeep(1200, 300), 500);
				
				setTimeout(() => {
					initializeInterval();
				}, 500);
			} else {
				isRunning = false;
				isCompleted = true;
				clearInterval(timer);
				
				// Calcular duración total del workout en segundos
				totalWorkoutDuration = Math.floor((Date.now() - workoutStartTime) / 1000);
				
				// Emitir evento de workout completado
				dispatch('workout-complete', {
					duration: totalWorkoutDuration,
					repetitionsCompleted: repetitions
				});
				
				setTimeout(() => playBeep(400, 800), 100);
				setTimeout(() => playBeep(500, 800), 600);
			}
		} else {
			initializeInterval();
		}
	}
	
	function showRepeatCountdown(currentRep: number) {
		showRepeatCounter = true;
		repeatCounterValue = currentRep;
		
		setTimeout(() => {
			showRepeatCounter = false;
		}, 500); // medio segundo
	}
	
	function startTimer() {
		if (intervals.length === 0 || repetitions < 1) return;
		
		currentIntervalIndex = 0;
		currentRepetition = repetitions;
		isRunning = true;
		isPaused = false;
		isCompleted = false;
		repeatMarkersExecuted.clear();
		currentSet = 1;
		isWaitingForTap = false;
		isRestingWeights = false;
		
		// Iniciar tracking de tiempo del workout
		workoutStartTime = Date.now();
		
		// Mostrar el número de repetición actual al inicio
		if (repetitions > 1) {
			showRepeatCountdown(currentRepetition);
		}
		
		// Beep inicial de preparación
		setTimeout(() => playBeep(1000, 150), 100);
		setTimeout(() => playBeep(1000, 150), 350);
		setTimeout(() => playBeep(1200, 300), 600);
		
		// Inicializar primer intervalo después de beeps
		setTimeout(() => {
			initializeInterval();
		}, 1000);
	}
	
	function togglePause() {
		if (audioContext && audioContext.state === 'suspended') {
			audioContext.resume();
		}
		
		isPaused = !isPaused;
		playBeep(isPaused ? 500 : 800, 150);
	}
	
	function stopTimer() {
		isRunning = false;
		isPaused = false;
		if (timer) clearInterval(timer);
		dispatch('back');
	}
	
	function resetTimer() {
		if (timer) clearInterval(timer);
		startTimer();
	}
	
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
	

</script>

<div class="min-h-screen flex flex-col items-center justify-center p-8 transition-all duration-1000" style="background-color: {backgroundColor}">
	<div class="text-center text-white">
		<!-- Nombre del intervalo actual -->
		<h1 class="text-3xl font-light mb-8" style="text-shadow: 0 0 10px rgba(0, 0, 0, 1), 2px 2px 8px rgba(0, 0, 0, 0.9), -1px -1px 2px rgba(0, 0, 0, 0.8)">
			{#if currentInterval && currentInterval.type === 'weights'}
				🏋️ {currentInterval.name}
			{:else}
				{currentInterval ? currentInterval.name : $t('timer.completed')}
			{/if}
		</h1>
		
		<!-- Círculo animado con tiempo o botón de tap para pesas -->
		<div class="relative mb-8 flex items-center justify-center">
			{#if currentInterval && currentInterval.type === 'repeat'}
				<!-- Mostrar series faltantes para marcador "Repetir desde aquí" -->
				<div class="w-[280px] h-[280px] rounded-full bg-gray-800 bg-opacity-80 flex items-center justify-center shadow-2xl">
					<div class="text-center">
						<div class="text-2xl font-light mb-4 text-white" style="text-shadow: 0 0 10px rgba(0, 0, 0, 1);">
							Series restantes
						</div>
						<div class="text-8xl font-bold text-yellow-400 animate-pulse" style="text-shadow: 0 0 20px rgba(0, 0, 0, 1), 3px 3px 15px rgba(0, 0, 0, 0.9);">
							{(() => {
								const executed = repeatMarkersExecuted.get(currentIntervalIndex) || 0;
								// Restantes = total - (ejecutadas + 1 porque ya está en ejecución)
								return currentInterval.duration - executed - 1;
							})()}
						</div>
						<div class="text-xl font-light mt-4 text-gray-300" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1);">
							faltantes
						</div>
					</div>
				</div>
			{:else if currentInterval && currentInterval.type === 'weights' && isWaitingForTap}
				<!-- Botón interactivo para iniciar descanso en pesas -->
				<button
					on:click={handleWeightsTap}
					class="w-[280px] h-[280px] rounded-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
				>
					<div class="text-center">
						<div class="text-6xl mb-4">💪</div>
						<div class="text-2xl font-bold" style="text-shadow: 0 0 10px rgba(0, 0, 0, 1);">
							{$t('intervals.tap_to_start_rest')}
						</div>
						<div class="text-lg mt-2 text-purple-200" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1);">
							{$t('intervals.set')} {currentSet}/{currentInterval.sets}
						</div>
					</div>
				</button>
			{:else}
				<!-- Círculo de progreso normal para HIIT y descanso de pesas -->
				<svg width="280" height="280" viewBox="0 0 280 280" class="transform -rotate-90">
					<!-- Círculo de fondo -->
					<circle
						cx="140"
						cy="140"
						r="120"
						stroke="rgba(255,255,255,0.2)"
						stroke-width="8"
						fill="none"
					/>
					<!-- Círculo de progreso -->
					<circle
						cx="140"
						cy="140"
						r="120"
						stroke="rgba(255,255,255,0.9)"
						stroke-width="8"
						fill="none"
						stroke-linecap="round"
						stroke-dasharray="{circumference}"
						stroke-dashoffset="{strokeDashoffset}"
					/>
				</svg>
			{/if}			
			
			<!-- Contador visual superpuesto para marcadores de repetición -->
			{#if showRepeatCounter}
				<div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 rounded-full">
					<div class="text-8xl font-bold text-white animate-pulse" style="text-shadow: 0 0 20px rgba(0, 0, 0, 1), 3px 3px 15px rgba(0, 0, 0, 0.9), -3px -3px 6px rgba(0, 0, 0, 0.8);">
						{repeatCounterValue}
					</div>
				</div>
			{/if}
			
			<!-- Paloma de fondo (solo cuando está completado) -->
			{#if isCompleted}
				<div class="absolute inset-0 flex items-center justify-center">
					<span class="text-[12rem] text-green-500 opacity-60" style="line-height: 1; font-weight: 900;">
						✓
					</span>
				</div>
			{/if}
			
			<!-- Tiempo en el centro (solo si no es pesas esperando tap y no es repeat) -->
			{#if !(currentInterval && currentInterval.type === 'weights' && isWaitingForTap) && !(currentInterval && currentInterval.type === 'repeat')}
				<div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
					<span class="text-6xl font-light text-white" style="line-height: 1; text-shadow: 0 0 15px rgba(0, 0, 0, 1), 3px 3px 10px rgba(0, 0, 0, 0.9), -2px -2px 4px rgba(0, 0, 0, 0.8);">
						{isRunning || isRestingWeights ? formatTime(timeRemaining) : (isCompleted ? '00:00' : '00:00')}
					</span>
				</div>
			{/if}
		</div>
		
		<!-- Información adicional -->
		{#if isRunning}
			<p class="text-white/80 mb-1 text-lg" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9);">
				{#if repetitions > 1}
					{$t('timer.repetition')} {currentRepetition} {$t('common.of')} {repetitions}
				{/if}
			</p>
			
			{#if currentInterval && currentInterval.type !== 'repeat'}
				<p class="text-white/70 mb-2 text-base" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9);">
					{$t('timer.interval')} {currentIntervalIndex + 1} {$t('common.of')} {intervals.length}
				</p>
			{/if}
			
			{#if currentInterval}
				{#if currentInterval.type === 'weights'}
					<!-- Información específica para pesas -->
					<p class="text-white/80 text-base mb-2" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9);">
						{$t('intervals.set')} {currentSet} {$t('common.of')} {currentInterval.sets}
					</p>
					{#if isRestingWeights}
						<p class="text-purple-300 text-lg mb-4 font-medium animate-pulse" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9);">
							⏱️ {$t('intervals.rest_between_sets')}
						</p>
					{:else if isWaitingForTap}
						<p class="text-purple-300 text-lg mb-4 font-medium animate-pulse" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9);">
							👆 {$t('intervals.complete_set')}
						</p>
					{/if}
				{:else if currentInterval.type !== 'repeat'}
					<p class="text-white/60 text-base mb-8" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9);">
						{$t('timer.duration')}: {formatTime(currentInterval.duration)}
					</p>
				{/if}
			{/if}
		{/if}
		
		<!-- Controles -->
		<div class="flex gap-4 justify-center flex-wrap">
			{#if isRunning}
				<button
					on:click={togglePause}
					class="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors backdrop-blur-sm"
					style="text-shadow: 0 0 6px rgba(0, 0, 0, 1), 1px 1px 4px rgba(0, 0, 0, 0.9);"
				>
					{isPaused ? `▶️ ${$t('timer.continue')}` : `⏸️ ${$t('timer.pause')}`}
				</button>
				
				<button
					on:click={resetTimer}
					class="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors backdrop-blur-sm"
					style="text-shadow: 0 0 6px rgba(0, 0, 0, 1), 1px 1px 4px rgba(0, 0, 0, 0.9);"
				>
					🔄 {$t('timer.restart')}
				</button>
			{/if}
			
			<button
				on:click={stopTimer}
				class="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors backdrop-blur-sm"
				style="text-shadow: 0 0 6px rgba(0, 0, 0, 1), 1px 1px 4px rgba(0, 0, 0, 0.9);"
			>
				{isRunning ? `⏹️ ${$t('timer.stop')}` : `← ${$t('common.back')}`}
			</button>
		</div>
		
		{#if isCompleted}
			<div class="mt-8">
				<h2 class="text-4xl font-light text-white mb-4" style="text-shadow: 0 0 10px rgba(0, 0, 0, 1), 2px 2px 8px rgba(0, 0, 0, 0.9);">{$t('timer.routine_completed')}</h2>
				<p class="text-white/80 text-lg" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9);">
					{repetitions === 1 ? $t('timer.excellent_work') : $t('timer.completed_reps', { reps: repetitions })}
				</p>
			</div>
		{/if}
	</div>
</div>
