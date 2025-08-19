<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	
	const dispatch = createEventDispatcher();
	
	export let intervals: Array<{ name: string; duration: number; color: string }>;
	export let repetitions: number = 1;
	
	let currentIntervalIndex = 0;
	let currentRepetition = 1;
	let timeRemaining = 0;
	let isRunning = false;
	let isPaused = false;
	let timer: number;
	let audioContext: AudioContext | null = null;
	
	$: currentInterval = intervals[currentIntervalIndex];
	$: progress = currentInterval ? (currentInterval.duration - timeRemaining) / currentInterval.duration : 0;
	$: circumference = 2 * Math.PI * 120;
	$: strokeDashoffset = circumference * (1 - progress);
	
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
					
					currentIntervalIndex++;
					
					// Si hemos completado todos los intervalos del ciclo actual
					if (currentIntervalIndex >= intervals.length) {
						// Si aún hay repeticiones pendientes
						if (currentRepetition < repetitions) {
							currentRepetition++;
							currentIntervalIndex = 0; // Volver al primer intervalo
							timeRemaining = intervals[0].duration;
							// Beep especial para nueva repetición
							setTimeout(() => playBeep(1000, 300), 100);
							setTimeout(() => playBeep(1200, 300), 500);
						} else {
							// Todas las repeticiones completadas
							isRunning = false;
							clearInterval(timer);
							playBeep(400, 600);
						}
					} else {
						// Siguiente intervalo en la misma repetición
						timeRemaining = intervals[currentIntervalIndex].duration;
					}
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
	
	function getBackgroundColor(): string {
		if (!currentInterval) return 'rgb(17, 24, 39)'; // gray-900
		
		const colorMap: {[key: string]: string} = {
			'bg-yellow-500': 'rgb(234, 179, 8)',
			'bg-red-500': 'rgb(239, 68, 68)',
			'bg-blue-500': 'rgb(59, 130, 246)',
			'bg-green-500': 'rgb(34, 197, 94)',
			'bg-purple-500': 'rgb(168, 85, 247)',
			'bg-pink-500': 'rgb(236, 72, 153)',
			'bg-orange-500': 'rgb(249, 115, 22)'
		};
		
		return colorMap[currentInterval.color] || 'rgb(17, 24, 39)';
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-8 transition-all duration-1000" style="background-color: {getBackgroundColor()}">
	<div class="text-center text-white">
		<!-- Nombre del intervalo actual -->
		<h1 class="text-3xl font-light mb-8">
			{currentInterval ? currentInterval.name : 'Completado'}
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
					style="transition: stroke-dashoffset 1s linear;"
				/>
			</svg>
			
			<!-- Tiempo en el centro -->
			<div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
				<span class="text-6xl font-light text-white" style="line-height: 1;">
					{isRunning ? formatTime(timeRemaining) : '00:00'}
				</span>
			</div>
		</div>
		
		<!-- Información adicional -->
		{#if isRunning}
			<p class="text-white/80 mb-1 text-lg">
				Repetición {currentRepetition} de {repetitions}
			</p>
			<p class="text-white/70 mb-2 text-base">
				Intervalo {currentIntervalIndex + 1} de {intervals.length}
			</p>
			{#if currentInterval}
				<p class="text-white/60 text-base mb-8">
					Duración: {formatTime(currentInterval.duration)}
				</p>
			{/if}
		{/if}
		
		<!-- Controles -->
		<div class="flex gap-4 justify-center flex-wrap">
			{#if isRunning}
				<button
					on:click={togglePause}
					class="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors backdrop-blur-sm"
				>
					{isPaused ? '▶️ Continuar' : '⏸️ Pausar'}
				</button>
				
				<button
					on:click={resetTimer}
					class="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors backdrop-blur-sm"
				>
					🔄 Reiniciar
				</button>
			{/if}
			
			<button
				on:click={stopTimer}
				class="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors backdrop-blur-sm"
			>
				{isRunning ? '⏹️ Detener' : '← Volver'}
			</button>
		</div>
		
		{#if !isRunning && currentRepetition >= repetitions && currentIntervalIndex >= intervals.length}
			<div class="mt-8">
				<h2 class="text-4xl font-light text-white mb-4">¡Rutina Completada! 🎉</h2>
				<p class="text-white/80 text-lg">
					{repetitions === 1 ? '¡Excelente trabajo!' : `¡Completaste ${repetitions} repeticiones!`}
				</p>
			</div>
		{/if}
	</div>
</div>
