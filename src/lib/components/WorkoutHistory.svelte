<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { t } from '$lib/i18n';
	import { workoutStore } from '$lib/stores/workoutStore';
	import { type WorkoutLog, type SavedRoutine } from '$lib/services/routineStorage';
	import WorkoutCalendar from './WorkoutCalendar.svelte';
	import WorkoutDetailModal from './WorkoutDetailModal.svelte';

	const dispatch = createEventDispatcher();

	let totalWorkouts = 0;
	let totalMinutes = 0;
	let currentStreak = 0;
	let longestStreak = 0;
	let selectedLog: WorkoutLog | null = null;

	$: if ($workoutStore) {
		calculateStats($workoutStore);
	}



	function calculateStats(logs: WorkoutLog[]) {
		totalWorkouts = logs.length;
		totalMinutes = Math.round(logs.reduce((acc, log) => acc + (log.duration / 60), 0));

		if (logs.length === 0) { currentStreak = 0; longestStreak = 0; return; }

		const sorted = [...logs].sort((a, b) => a.completedAt - b.completedAt);
		const uniqueDays = new Set<string>();
		sorted.forEach(log => {
			const d = new Date(log.completedAt);
			uniqueDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
		});
		const daysArray = Array.from(uniqueDays).sort();

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
				if (daysArray[i] === dayKey) { currentStreak++; checkDate.setDate(checkDate.getDate() - 1); }
				else break;
			}
		}

		let streak = 1; longestStreak = Math.max(1, daysArray.length > 0 ? 1 : 0);
		for (let i = 1; i < daysArray.length; i++) {
			const diff = Math.floor((new Date(daysArray[i]).getTime() - new Date(daysArray[i-1]).getTime()) / (1000*60*60*24));
			if (diff === 1) { streak++; longestStreak = Math.max(longestStreak, streak); }
			else { streak = 1; }
		}
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')} min` : `${secs}s`;
	}

	function showDetail(log: WorkoutLog) {
		if (log.routineSnapshot) {
			selectedLog = log;
		}
	}

	function closeDetail() {
		selectedLog = null;
	}

	function handleCalendarDayClick(event: CustomEvent<WorkoutLog[]>) {
		const workouts = event.detail;
		if (workouts && workouts.length > 0) {
			// Ordenar por más reciente (completedAt descedente) y tomar el primero,
			// ya que el usuario podría tener múltiples en un día.
			const sortedWorkouts = [...workouts].sort((a, b) => b.completedAt - a.completedAt);
			showDetail(sortedWorkouts[0]);
		}
	}

	function back() { dispatch('back'); }

	const statCards = [
		{ labelKey: 'history.total_workouts', accent: 'var(--accent-blue)',   glow: 'rgba(59,130,246,0.12)',  icon: '🏋️', valueGetter: () => totalWorkouts },
		{ labelKey: 'history.total_minutes',  accent: 'var(--accent-purple)', glow: 'rgba(168,85,247,0.12)', icon: '⏱️', valueGetter: () => totalMinutes },
		{ labelKey: 'history.current_streak', accent: 'var(--accent-green)',  glow: 'rgba(34,197,94,0.12)',  icon: '🔥', valueGetter: () => currentStreak },
		{ labelKey: 'history.longest_streak', accent: 'var(--accent-orange)', glow: 'rgba(249,115,22,0.12)', icon: '🏆', valueGetter: () => longestStreak },
	];
</script>

<div class="wh-root">
	<!-- Header -->
	<header class="wh-header">
		<div class="wh-header-inner">
			<button class="hb-back-btn" on:click={back} aria-label="Volver">
				<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M15 19l-7-7 7-7"/>
				</svg>
			</button>
			<div class="wh-title-area">
				<img src="/logo.png" alt="HIITBeep" class="wh-logo" />
				<h1 class="wh-title">{$t('history.title')}</h1>
			</div>
			<div style="width:38px;"></div>
		</div>
	</header>

	<div class="wh-content">

		<!-- Stats Grid -->
		<div class="wh-stats-grid">
			<div class="wh-stat-card" style="border-left-color:var(--accent-blue);">
				<div class="wh-stat-glow" style="background:rgba(59,130,246,0.1);"></div>
				<span class="wh-stat-label">{$t('history.total_workouts')}</span>
				<span class="wh-stat-value">{totalWorkouts}</span>
				<span class="wh-stat-icon">🏋️</span>
			</div>
			<div class="wh-stat-card" style="border-left-color:var(--accent-purple);">
				<div class="wh-stat-glow" style="background:rgba(168,85,247,0.1);"></div>
				<span class="wh-stat-label">{$t('history.total_minutes')}</span>
				<span class="wh-stat-value">{totalMinutes}</span>
				<span class="wh-stat-icon">⏱️</span>
			</div>
			<div class="wh-stat-card" style="border-left-color:var(--accent-green);">
				<div class="wh-stat-glow" style="background:rgba(34,197,94,0.1);"></div>
				<span class="wh-stat-label">{$t('history.current_streak')}</span>
				<span class="wh-stat-value" style="color:var(--accent-green);">{currentStreak}</span>
				<span class="wh-stat-icon">🔥</span>
			</div>
			<div class="wh-stat-card" style="border-left-color:var(--accent-orange);">
				<div class="wh-stat-glow" style="background:rgba(249,115,22,0.1);"></div>
				<span class="wh-stat-label">{$t('history.longest_streak')}</span>
				<span class="wh-stat-value" style="color:var(--accent-orange);">{longestStreak}</span>
				<span class="wh-stat-icon">🏆</span>
			</div>
		</div>

		<!-- Calendar -->
		<WorkoutCalendar on:day-click={handleCalendarDayClick} />

	</div>
</div>

{#if selectedLog && selectedLog.routineSnapshot}
	<WorkoutDetailModal 
		routine={selectedLog.routineSnapshot} 
		completedAt={selectedLog.completedAt}
		on:close={closeDetail}
	/>
{/if}

<style>
.wh-root {
	min-height: 100vh;
	background: var(--bg-app);
	color: var(--text-primary);
	font-family: 'Inter', sans-serif;
}

/* Header */
.wh-header {
	position: sticky; top: 0; z-index: 50;
	background: rgba(11,17,32,0.88);
	backdrop-filter: blur(14px);
	border-bottom: 1px solid var(--border-card);
}
.wh-header-inner {
	max-width: 560px; margin: 0 auto;
	padding: 0.75rem 1.25rem;
	display: flex; align-items: center; justify-content: space-between;
}
.wh-title-area { display: flex; align-items: center; gap: 0.5rem; }
.wh-logo { width: 26px; height: 26px; object-fit: contain; }
.wh-title { font-size: 1.05rem; font-weight: 800; color: var(--text-primary); }

.hb-back-btn {
	width: 40px; height: 40px;
	background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
	border: 1px solid rgba(255,255,255,0.1);
	border-radius: 14px; color: var(--text-primary);
	display: flex; align-items: center; justify-content: center;
	cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	flex-shrink: 0;
	box-shadow: 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05);
}
.hb-back-btn:hover {
	background: rgba(255,255,255,0.1);
	border-color: rgba(255,255,255,0.2);
	transform: translateX(-4px);
	box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}
.hb-back-btn:active { transform: scale(0.9) translateX(-4px); }

/* Content */
.wh-content {
	max-width: 560px; margin: 0 auto;
	padding: 1.5rem 1.25rem 4rem;
}

/* Stats */
.wh-stats-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0.75rem;
	margin-bottom: 1.5rem;
}
.wh-stat-card {
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-left-width: 4px;
	border-radius: var(--radius-card);
	padding: 1rem 1rem 0.875rem;
	position: relative; overflow: hidden;
	display: flex; flex-direction: column;
}
.wh-stat-glow {
	position: absolute; inset: 0; pointer-events: none;
}
.wh-stat-label {
	font-size: 0.595rem; font-weight: 700;
	letter-spacing: 0.1em; text-transform: uppercase;
	color: var(--text-label); margin-bottom: 0.35rem;
	position: relative; z-index: 1;
}
.wh-stat-value {
	font-size: 2.25rem; font-weight: 900;
	color: var(--text-primary); line-height: 1;
	position: relative; z-index: 1;
}
.wh-stat-icon {
	font-size: 1.1rem; margin-top: 0.35rem;
	position: relative; z-index: 1;
	opacity: 0.7;
}
</style>
