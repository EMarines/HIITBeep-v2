<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { t } from '$lib/i18n';
	
	const dispatch = createEventDispatcher();
	
	export let intervals: Array<{ name: string; duration: number; color: string; type?: 'interval' | 'repeat' }>;
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
	
	$: currentInterval = intervals[currentIntervalIndex];
	$: progress = currentInterval && !isCompleted 
		? Math.max(0, Math.min(1, (currentInterval.duration - timeRemaining) / currentInterval.duration)) 
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
				'bg-pink-500': '#ec4899',
				'bg-orange-500': '#f97316'
			};
			return colorMap[currentInterval.color] || '#111827';
		})()
		: '#111827';
	$: console.log('backgroundColor changed:', backgroundColor);
	
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
	
	function startTimer() {
		if (intervals.length === 0) return;
		
		currentIntervalIndex = 0;
		currentRepetition = 1;
		timeRemaining = intervals[0].duration;
		isRunning = true;
		isPaused = false;
		repeatMarkersExecuted.clear(); // Limpiar contadores de marcadores
		
		// Beep inicial de preparación
		setTimeout(() => playBeep(1000, 150), 100);
		setTimeout(() => playBeep(1000, 150), 350);
		setTimeout(() => playBeep(1200, 300), 600);
		
		timer = setInterval(() => {
			if (!isPaused) {
				timeRemaining--;
				
				// Beeps cada 10 segundos
				if (timeRemaining > 5 && timeRemaining % 10 === 0) {
					playBeep(800, 150);
				}
				
				// Beeps de los últimos 5 segundos
				if (timeRemaining <= 5 && timeRemaining > 0) {
					playBeep(1200, 200);
				}
				
				// Cambio de intervalo
				if (timeRemaining <= 0) {
					playBeep(600, 400);
					
					// Pequeña pausa para mostrar el círculo completado
					setTimeout(() => {
						// Verificar si el intervalo actual es un marcador de repetición
						const currentIntervalData = intervals[currentIntervalIndex];
						if (currentIntervalData && currentIntervalData.type === 'repeat') {
							// Manejar marcador de repetición
							const executed = repeatMarkersExecuted.get(currentIntervalIndex) || 0;
							if (executed < currentIntervalData.duration) {
								// Aún hay repeticiones pendientes, volver al inicio
								repeatMarkersExecuted.set(currentIntervalIndex, executed + 1);
								currentIntervalIndex = 0;
								timeRemaining = intervals[0].duration;
								// Beep especial para repetición desde marcador
								setTimeout(() => playBeep(1000, 200), 100);
								setTimeout(() => playBeep(1000, 200), 300);
								setTimeout(() => playBeep(1200, 300), 500);
								return;
							} else {
								// Se completaron todas las repeticiones del marcador, continuar
								currentIntervalIndex++;
							}
						} else {
							// Intervalo normal, avanzar
							currentIntervalIndex++;
						}
						
						// Si hemos completado todos los intervalos del ciclo actual
						if (currentIntervalIndex >= intervals.length) {
							// Si aún hay repeticiones pendientes
							if (currentRepetition < repetitions) {
								currentRepetition++;
								currentIntervalIndex = 0; // Volver al primer intervalo
								timeRemaining = intervals[0].duration;
								// Limpiar contadores de marcadores para nueva repetición
								repeatMarkersExecuted.clear();
								// Beep especial para nueva repetición
								setTimeout(() => playBeep(1000, 300), 100);
								setTimeout(() => playBeep(1200, 300), 500);
							} else {
								// Todas las repeticiones completadas
								isRunning = false;
								isCompleted = true; // Activar estado de completado
								clearInterval(timer);
								// Beep final más largo
								setTimeout(() => playBeep(400, 800), 100);
								setTimeout(() => playBeep(500, 800), 600);
							}
						} else {
							// Siguiente intervalo en la misma repetición
							timeRemaining = intervals[currentIntervalIndex].duration;
						}
					}, 300); // 300ms para ver el círculo completo
				}
			}
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
			{currentInterval ? currentInterval.name : $t('timer.completed')}
		</h1>
		
		<!-- Círculo animado con tiempo -->
		<div class="relative mb-8 flex items-center justify-center">
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
		</svg>			<!-- Paloma de fondo (solo cuando está completado) -->
			{#if isCompleted}
				<div class="absolute inset-0 flex items-center justify-center">
					<span class="text-[12rem] text-green-500 opacity-60" style="line-height: 1; font-weight: 900;">
						✓
					</span>
				</div>
			{/if}
			
			<!-- Tiempo en el centro -->
			<div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
				<span class="text-6xl font-light text-white" style="line-height: 1; text-shadow: 0 0 15px rgba(0, 0, 0, 1), 3px 3px 10px rgba(0, 0, 0, 0.9), -2px -2px 4px rgba(0, 0, 0, 0.8);">
					{isRunning ? formatTime(timeRemaining) : (isCompleted ? '00:00' : '00:00')}
				</span>
			</div>
		</div>
		
		<!-- Información adicional -->
		{#if isRunning}
			<p class="text-white/80 mb-1 text-lg" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9);">
				{$t('timer.repetition')} {currentRepetition} {$t('common.of')} {repetitions}
			</p>
			<p class="text-white/70 mb-2 text-base" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9);">
				{$t('timer.interval')} {currentIntervalIndex + 1} {$t('common.of')} {intervals.length}
			</p>
			{#if currentInterval}
				<p class="text-white/60 text-base mb-8" style="text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9);">
					{$t('timer.duration')}: {formatTime(currentInterval.duration)}
				</p>
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
