<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { loadWorkoutLogs, type WorkoutLog } from '$lib/services/routineStorage';
	import WorkoutCalendar from './WorkoutCalendar.svelte';
	
	const dispatch = createEventDispatcher();
	
	let workoutLogs: WorkoutLog[] = [];
	let groupedByDate: Map<string, WorkoutLog[]> = new Map();
	let totalWorkouts = 0;
	let totalMinutes = 0;
	let currentStreak = 0;
	let longestStreak = 0;
	
	onMount(() => {
		loadData();
	});
	
	function loadData() {
		workoutLogs = loadWorkoutLogs();
		groupWorkoutsByDate();
		calculateStats();
	}
	
	function groupWorkoutsByDate() {
		groupedByDate = new Map();
		
		// Ordenar por fecha más reciente primero
		const sorted = [...workoutLogs].sort((a, b) => b.completedAt - a.completedAt);
		
		sorted.forEach(log => {
			const date = new Date(log.completedAt);
			const dateKey = date.toLocaleDateString(undefined, { 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric' 
			});
			
			if (!groupedByDate.has(dateKey)) {
				groupedByDate.set(dateKey, []);
			}
			groupedByDate.get(dateKey)!.push(log);
		});
	}
	
	function calculateStats() {
		totalWorkouts = workoutLogs.length;
		totalMinutes = Math.round(workoutLogs.reduce((acc, log) => acc + (log.duration / 60), 0));
		
		// Calcular rachas
		if (workoutLogs.length === 0) {
			currentStreak = 0;
			longestStreak = 0;
			return;
		}
		
		// Ordenar por fecha
		const sorted = [...workoutLogs].sort((a, b) => a.completedAt - b.completedAt);
		
		// Agrupar por días únicos
		const uniqueDays = new Set<string>();
		sorted.forEach(log => {
			const date = new Date(log.completedAt);
			const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
			uniqueDays.add(dayKey);
		});
		
		const daysArray = Array.from(uniqueDays).sort();
		
		// Calcular racha actual
		const today = new Date();
		const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
		
		currentStreak = 0;
		if (daysArray.includes(todayKey) || daysArray.includes(yesterdayKey)) {
			let checkDate = daysArray.includes(todayKey) ? today : yesterday;
			
			for (let i = daysArray.length - 1; i >= 0; i--) {
				const dayKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
				if (daysArray[i] === dayKey) {
					currentStreak++;
					checkDate.setDate(checkDate.getDate() - 1);
				} else {
					break;
				}
			}
		}
		
		// Calcular racha más larga
		let streak = 1;
		longestStreak = 1;
		for (let i = 1; i < daysArray.length; i++) {
			const prevDate = new Date(daysArray[i - 1]);
			const currDate = new Date(daysArray[i]);
			const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
			
			if (diffDays === 1) {
				streak++;
				longestStreak = Math.max(longestStreak, streak);
			} else {
				streak = 1;
			}
		}
	}
	
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		if (mins > 0) {
			return `${mins}:${secs.toString().padStart(2, '0')} min`;
		}
		return `${secs}s`;
	}
	
	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		
		// Obtener traducciones directamente
		let currentT: any;
		t.subscribe(value => currentT = value)();
		
		if (diffDays === 0) return currentT('routines.today');
		if (diffDays === 1) return currentT('routines.yesterday');
		if (diffDays < 7) return currentT('routines.days_ago', { days: diffDays.toString() });
		
		return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
	}
	
	function back() {
		dispatch('back');
	}
</script>

<div class="min-h-screen bg-gray-900 text-white p-6">
	<div class="max-w-4xl mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-8">
			<div class="flex items-center gap-3">
				<button 
					on:click={back}
					class="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
					aria-label="Back"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
					</svg>
				</button>
				<h1 class="text-3xl font-bold" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">
					📊 {$t('history.title')}
				</h1>
			</div>
		</div>
		
		<!-- Stats Cards -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			<div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 shadow-lg">
				<p class="text-sm text-blue-200 uppercase tracking-wider mb-1">{$t('history.total_workouts')}</p>
				<p class="text-3xl font-bold text-white" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">
					{totalWorkouts}
				</p>
			</div>
			
			<div class="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 shadow-lg">
				<p class="text-sm text-purple-200 uppercase tracking-wider mb-1">{$t('history.total_minutes')}</p>
				<p class="text-3xl font-bold text-white" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">
					{totalMinutes}
				</p>
			</div>
			
			<div class="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 shadow-lg">
				<p class="text-sm text-green-200 uppercase tracking-wider mb-1">{$t('history.current_streak')}</p>
				<p class="text-3xl font-bold text-white" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">
					{currentStreak} 🔥
				</p>
			</div>
			
			<div class="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4 shadow-lg">
				<p class="text-sm text-orange-200 uppercase tracking-wider mb-1">{$t('history.longest_streak')}</p>
				<p class="text-3xl font-bold text-white" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">
					{longestStreak} 🏆
				</p>
			</div>
		</div>
		
		<!-- Calendar -->
		<WorkoutCalendar />
		
		<!-- Workout History List -->
		<div class="bg-gray-800 rounded-lg p-6 shadow-lg">
			<h2 class="text-2xl font-bold mb-4 text-white" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">
				{$t('history.workout_list')}
			</h2>
			
			{#if groupedByDate.size === 0}
				<div class="text-center py-12">
					<p class="text-gray-400 text-lg mb-2">📋 {$t('history.no_workouts')}</p>
					<p class="text-gray-500 text-sm">{$t('history.complete_first_workout')}</p>
				</div>
			{:else}
				<div class="space-y-6">
					{#each Array.from(groupedByDate.entries()) as [dateKey, logs]}
						<div>
							<h3 class="text-lg font-semibold text-gray-300 mb-3 sticky top-0 bg-gray-800 py-2">
								{dateKey}
							</h3>
							<div class="space-y-2">
								{#each logs as log}
									<div class="bg-gray-700/50 rounded-lg p-4 border-l-4 border-blue-500 hover:bg-gray-700 transition-colors">
										<div class="flex items-center justify-between">
											<div class="flex-1">
												<h4 class="font-medium text-white mb-1">
													{log.routineName}
												</h4>
												<div class="flex items-center gap-4 text-sm text-gray-400">
													<span class="flex items-center gap-1">
														⏱️ {formatTime(log.duration)}
													</span>
													<span class="flex items-center gap-1">
														🔄 {log.repetitionsCompleted} {$t('main.repetitions_plural')}
													</span>
													<span class="flex items-center gap-1">
														🕐 {new Date(log.completedAt).toLocaleTimeString(undefined, { 
															hour: '2-digit', 
															minute: '2-digit' 
														})}
													</span>
												</div>
											</div>
											<div class="text-right">
												<span class="text-green-400 text-2xl">✓</span>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
