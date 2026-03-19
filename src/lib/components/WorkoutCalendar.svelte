<script lang="ts">
	import { t } from '$lib/i18n';
	import { workoutStore } from '$lib/stores/workoutStore';
	import { createEventDispatcher } from 'svelte';
	import type { WorkoutLog } from '$lib/services/routineStorage';

	const dispatch = createEventDispatcher();

	const monthNamesES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
	const monthNamesEN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	const weekDays = ['D','L','M','M','J','V','S'];

	let currentMonth = new Date().getMonth();
	let currentYear  = new Date().getFullYear();
	let calendarDays: Array<{ day: number; date: Date; workouts: WorkoutLog[] }> = [];

	let currentT: any;
	$: t.subscribe(v => currentT = v)();

	$: if ($workoutStore || currentMonth !== undefined || currentYear !== undefined) {
		generateCalendar();
	}

	function generateCalendar() {
		const firstDay = new Date(currentYear, currentMonth, 1);
		const lastDay  = new Date(currentYear, currentMonth + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startDow   = firstDay.getDay();

		calendarDays = [];
		for (let i = 0; i < startDow; i++) {
			calendarDays.push({ day: 0, date: new Date(), workouts: [] });
		}
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(currentYear, currentMonth, day);
			calendarDays.push({ day, date, workouts: getWorkoutsForDate(date) });
		}
	}

	function getWorkoutsForDate(date: Date): WorkoutLog[] {
		if (!$workoutStore) return [];
		const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0,0,0,0).getTime();
		const endOfDay   = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23,59,59,999).getTime();
		return $workoutStore.filter(log => log.completedAt >= startOfDay && log.completedAt <= endOfDay);
	}

	function previousMonth() {
		if (currentMonth === 0) { currentMonth = 11; currentYear--; }
		else { currentMonth--; }
		generateCalendar();
	}

	function nextMonth() {
		if (currentMonth === 11) { currentMonth = 0; currentYear++; }
		else { currentMonth++; }
		generateCalendar();
	}

	function goToToday() {
		currentMonth = new Date().getMonth();
		currentYear  = new Date().getFullYear();
		generateCalendar();
	}

	function isToday(date: Date): boolean {
		const today = new Date();
		return date.getFullYear() === today.getFullYear()
			&& date.getMonth()    === today.getMonth()
			&& date.getDate()     === today.getDate();
	}

	function handleDayClick(workouts: WorkoutLog[]) {
		if (workouts.length > 0) {
			dispatch('day-click', workouts);
		}
	}

	function getMonthName(month: number): string {
		let lang = 'es';
		if (typeof navigator !== 'undefined') {
			const saved = localStorage.getItem('hiitbeep-language');
			lang = saved || navigator.language.split('-')[0];
		}
		return lang === 'en' ? monthNamesEN[month] : monthNamesES[month];
	}
</script>

<div class="cal-root">
	<!-- Calendar header -->
	<div class="cal-header">
		<button class="cal-nav-btn" on:click={previousMonth} aria-label="Mes anterior">
			<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
			</svg>
		</button>

		<div class="cal-title-group">
			<h3 class="cal-month-title">{getMonthName(currentMonth)} {currentYear}</h3>
			<button class="cal-today-btn" on:click={goToToday}>
				{currentT ? currentT('calendar.today') : 'Today'}
			</button>
		</div>

		<button class="cal-nav-btn" on:click={nextMonth} aria-label="Mes siguiente">
			<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
			</svg>
		</button>
	</div>

	<!-- Week day headers -->
	<div class="cal-grid">
		{#each weekDays as day}
			<div class="cal-weekday">{day}</div>
		{/each}

		<!-- Calendar days -->
		{#each calendarDays as { day, date, workouts }}
			{#if day === 0}
				<div class="cal-day-empty"></div>
			{:else}
				<button
					class="cal-day"
					class:cal-day-worked={workouts.length > 0}
					class:cal-day-today={isToday(date)}
					class:clickable={workouts.length > 0}
					on:click={() => handleDayClick(workouts)}
					disabled={workouts.length === 0}
				>
					<span class="cal-day-num">{day}</span>
					{#if workouts.length > 0}
						<span class="cal-dot"></span>
					{/if}
				</button>
			{/if}
		{/each}
	</div>

	<!-- Legend -->
	<div class="cal-legend">
		<div class="cal-legend-item">
			<div class="cal-legend-dot cal-legend-worked"></div>
			<span>{currentT ? currentT('calendar.completed') : 'Completado'}</span>
		</div>
		<div class="cal-legend-item">
			<div class="cal-legend-dot cal-legend-today"></div>
			<span>{currentT ? currentT('calendar.today') : 'Hoy'}</span>
		</div>
	</div>
</div>

<style>
.cal-root {
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-radius: var(--radius-card);
	padding: 1.25rem;
	margin-bottom: 1.25rem;
}

/* Header */
.cal-header {
	display: flex; align-items: center; justify-content: space-between;
	margin-bottom: 1.1rem;
}
.cal-nav-btn {
	width: 34px; height: 34px;
	background: var(--bg-card-alt);
	border: 1px solid var(--border-card);
	border-radius: var(--radius-sm);
	display: flex; align-items: center; justify-content: center;
	color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
}
.cal-nav-btn:hover { background: rgba(255,255,255,0.08); color: var(--text-primary); }
.cal-title-group { text-align: center; }
.cal-month-title {
	font-size: 1.05rem; font-weight: 800;
	color: var(--text-primary); letter-spacing: -0.02em;
}
.cal-today-btn {
	display: inline-block; margin-top: 0.2rem;
	font-size: 0.75rem; font-weight: 800;
	letter-spacing: 0.1em; text-transform: uppercase;
	color: var(--accent-blue); background: none; border: none; cursor: pointer;
	transition: color 0.2s;
}
.cal-today-btn:hover { color: #60a5fa; }

/* Grid */
.cal-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 0.3rem;
}
.cal-weekday {
	text-align: center;
	font-size: 0.6rem; font-weight: 700;
	letter-spacing: 0.08em; text-transform: uppercase;
	color: var(--text-muted);
	padding-bottom: 0.5rem;
}
.cal-day-empty {
	aspect-ratio: 1;
}
.cal-day {
	aspect-ratio: 1;
	border-radius: 8px;
	background: var(--bg-card-alt);
	border: 1px solid transparent;
	display: flex; flex-direction: column;
	align-items: center; justify-content: center;
	gap: 2px;
	position: relative;
	transition: all 0.15s;
	cursor: default;
	padding: 0; margin: 0; color: inherit; font: inherit; outline: none; box-shadow: none;
}
.cal-day.clickable { cursor: pointer; }
.cal-day.clickable:hover { border-color: rgba(34,197,94,0.5); transform: scale(1.05); }
.cal-day.clickable:active { transform: scale(0.95); }
.cal-day:not(.clickable):hover { border-color: transparent; }

/* Day with workouts */
.cal-day-worked {
	background: rgba(34,197,94,0.1);
	border-color: rgba(34,197,94,0.25);
}
.cal-day-worked .cal-day-num { color: var(--accent-green); }

/* Today */
.cal-day-today {
	border-color: var(--accent-blue);
	box-shadow: 0 0 0 1px rgba(59,130,246,0.3);
}
.cal-day-today .cal-day-num { color: var(--accent-blue); font-weight: 800; }

.cal-day-num {
	font-size: 0.68rem; font-weight: 600;
	color: var(--text-muted); line-height: 1;
}
.cal-dot {
	width: 4px; height: 4px; border-radius: 50%;
	background: var(--accent-green);
	opacity: 0.8;
}

/* Legend */
.cal-legend {
	display: flex; align-items: center; justify-content: center;
	gap: 1.5rem; margin-top: 1rem;
}
.cal-legend-item {
	display: flex; align-items: center; gap: 0.5rem;
	font-size: 0.62rem; font-weight: 600;
	letter-spacing: 0.08em; text-transform: uppercase;
	color: var(--text-muted);
}
.cal-legend-dot {
	width: 10px; height: 10px; border-radius: 50%;
}
.cal-legend-worked { background: rgba(34,197,94,0.5); }
.cal-legend-today  { background: transparent; border: 2px solid var(--accent-blue); }
</style>
