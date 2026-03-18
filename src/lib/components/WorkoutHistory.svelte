<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { t } from '$lib/i18n';
	import { workoutStore } from '$lib/stores/workoutStore';
	import { type WorkoutLog } from '$lib/services/routineStorage';
	import WorkoutCalendar from './WorkoutCalendar.svelte';

	const dispatch = createEventDispatcher();

	let groupedByDate: Map<string, WorkoutLog[]> = new Map();
	let totalWorkouts = 0;
	let totalMinutes = 0;
	let currentStreak = 0;
	let longestStreak = 0;

	$: if ($workoutStore) {
		groupWorkoutsByDate($workoutStore);
		calculateStats($workoutStore);
	}

	function groupWorkoutsByDate(logs: WorkoutLog[]) {
		groupedByDate = new Map();
		const sorted = [...logs].sort((a, b) => b.completedAt - a.completedAt);
		sorted.forEach(log => {
			const date = new Date(log.completedAt);
			const dateKey = date.toLocaleDateString(undefined, {
				year: 'numeric', month: 'long', day: 'numeric'
			});
			if (!groupedByDate.has(dateKey)) groupedByDate.set(dateKey, []);
			groupedByDate.get(dateKey)!.push(log);
		});
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
			<button class="hb-back-btn" on:click={back} aria-label="Volver">←</button>
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
		<WorkoutCalendar />

		<!-- Workout Log List -->
		<div class="wh-section-header">
			<div class="hb-section-label">{$t('history.workout_list')}</div>
		</div>

		{#if groupedByDate.size === 0}
			<div class="wh-empty">
				<div class="wh-empty-icon">📋</div>
				<p class="wh-empty-title">{$t('history.no_workouts')}</p>
				<p class="wh-empty-sub">{$t('history.complete_first_workout')}</p>
			</div>
		{:else}
			<div class="wh-log-groups">
				{#each Array.from(groupedByDate.entries()) as [dateKey, logs]}
					<div class="wh-date-group">
						<div class="wh-date-label">{dateKey}</div>
						<div class="wh-log-list">
							{#each logs as log}
								<div class="wh-log-card">
									<div class="wh-log-left">
										<div class="wh-check-badge">✓</div>
									</div>
									<div class="wh-log-body">
										<div class="wh-log-name">{log.routineName}</div>
										<div class="wh-log-meta">
											<span>⏱️ {formatTime(log.duration)}</span>
											<span>🔄 {log.repetitionsCompleted} {$t('main.repetitions_plural')}</span>
											<span>🕐 {new Date(log.completedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
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

/* Section header */
.wh-section-header { margin-bottom: 0.875rem; }

/* Empty state */
.wh-empty {
	background: var(--bg-card);
	border: 1px dashed var(--border-card);
	border-radius: var(--radius-card);
	padding: 3rem 1.5rem; text-align: center;
}
.wh-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.wh-empty-title { font-size: 1rem; color: var(--text-secondary); font-weight: 600; }
.wh-empty-sub   { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.35rem; }

/* Log groups */
.wh-log-groups { display: flex; flex-direction: column; gap: 1.5rem; }
.wh-date-group {}
.wh-date-label {
	font-size: 0.7rem; font-weight: 700;
	letter-spacing: 0.1em; text-transform: uppercase;
	color: var(--text-label);
	padding: 0.4rem 0; margin-bottom: 0.5rem;
	border-bottom: 1px solid var(--border-card);
}
.wh-log-list { display: flex; flex-direction: column; gap: 0.625rem; }

/* Log card */
.wh-log-card {
	display: flex; align-items: flex-start; gap: 0.875rem;
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-left: 4px solid var(--accent-green);
	border-radius: var(--radius-card);
	padding: 0.875rem 1rem;
	position: relative; overflow: hidden;
	transition: box-shadow 0.2s;
}
.wh-log-card::before {
	content: '';
	position: absolute; inset: 0;
	background: linear-gradient(90deg, var(--accent-green-glow) 0%, transparent 35%);
	pointer-events: none;
}
.wh-log-card:hover { box-shadow: var(--shadow-card); }

.wh-log-left { flex-shrink: 0; }
.wh-check-badge {
	width: 32px; height: 32px;
	border-radius: 50%;
	background: rgba(34,197,94,0.15);
	border: 1.5px solid rgba(34,197,94,0.3);
	display: flex; align-items: center; justify-content: center;
	font-size: 0.875rem; font-weight: 700;
	color: var(--accent-green);
}

.wh-log-body { flex: 1; min-width: 0; }
.wh-log-name {
	font-size: 0.95rem; font-weight: 700;
	color: var(--text-primary); margin-bottom: 0.35rem;
	white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.wh-log-meta {
	display: flex; flex-wrap: wrap; gap: 0.75rem;
	font-size: 0.75rem; color: var(--text-secondary);
}
.wh-log-meta span { display: flex; align-items: center; gap: 0.2rem; }
</style>
