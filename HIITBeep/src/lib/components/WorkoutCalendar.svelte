<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { loadWorkoutLogs, type WorkoutLog } from '$lib/services/routineStorage';
	
	let currentMonth = new Date().getMonth();
	let currentYear = new Date().getFullYear();
	let workoutLogs: WorkoutLog[] = [];
	let calendarDays: Array<{ day: number; date: Date; workouts: WorkoutLog[] }> = [];
	
	const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const monthNamesES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
	const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
	const weekDaysES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
	
	onMount(() => {
		loadData();
	});
	
	function loadData() {
		workoutLogs = loadWorkoutLogs();
		generateCalendar();
	}
	
	function generateCalendar() {
		const firstDay = new Date(currentYear, currentMonth, 1);
		const lastDay = new Date(currentYear, currentMonth + 1, 0);
		const daysInMonth = lastDay.getDate();
		const startingDayOfWeek = firstDay.getDay();
		
		calendarDays = [];
		
		// Días en blanco antes del primer día del mes
		for (let i = 0; i < startingDayOfWeek; i++) {
			calendarDays.push({ day: 0, date: new Date(), workouts: [] });
		}
		
		// Días del mes
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(currentYear, currentMonth, day);
			const dayWorkouts = getWorkoutsForDate(date);
			calendarDays.push({ day, date, workouts: dayWorkouts });
		}
	}
	
	function getWorkoutsForDate(date: Date): WorkoutLog[] {
		// Crear fecha local a medianoche (00:00:00.000) del día especificado
		const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
		// Fin del día a las 23:59:59.999
		const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
		
		return workoutLogs.filter(log => {
			return log.completedAt >= startOfDay && log.completedAt <= endOfDay;
		});
	}
	
	function previousMonth() {
		if (currentMonth === 0) {
			currentMonth = 11;
			currentYear--;
		} else {
			currentMonth--;
		}
		generateCalendar();
	}
	
	function nextMonth() {
		if (currentMonth === 11) {
			currentMonth = 0;
			currentYear++;
		} else {
			currentMonth++;
		}
		generateCalendar();
	}
	
	function goToToday() {
		currentMonth = new Date().getMonth();
		currentYear = new Date().getFullYear();
		generateCalendar();
	}
	
	function isToday(date: Date): boolean {
		const today = new Date();
		// Normalizar ambas fechas a medianoche para comparar solo año/mes/día
		const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		return normalizedDate.getTime() === normalizedToday.getTime();
	}
	
	function formatTime(minutes: number): string {
		const hrs = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hrs > 0) {
			return `${hrs}h ${mins}m`;
		}
		return `${mins}m`;
	}
	
	// Obtener nombre del mes según idioma
	let currentT: any;
	$: {
		t.subscribe(value => currentT = value)();
	}
	
	function getMonthName(month: number): string {
		// Detectar idioma actual
		let currentLang = 'es';
		if (typeof navigator !== 'undefined') {
			const saved = localStorage.getItem('hiitbeep-language');
			currentLang = saved || navigator.language.split('-')[0];
		}
		
		return currentLang === 'en' ? monthNames[month] : monthNamesES[month];
	}
	
	function getWeekDays(): string[] {
		let currentLang = 'es';
		if (typeof navigator !== 'undefined') {
			const saved = localStorage.getItem('hiitbeep-language');
			currentLang = saved || navigator.language.split('-')[0];
		}
		
		return currentLang === 'en' ? weekDays : weekDaysES;
	}
</script>

<div class="bg-gray-800 rounded-lg p-4 mb-6">
	<!-- Header con navegación -->
	<div class="flex items-center justify-between mb-4">
		<button
			on:click={previousMonth}
			class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
			title="Previous month"
			aria-label="Previous month"
		>
			<svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
			</svg>
		</button>
		
		<div class="text-center">
			<h3 class="text-xl font-bold text-white">
				{getMonthName(currentMonth)} {currentYear}
			</h3>
			<button
				on:click={goToToday}
				class="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
			>
				{currentT ? currentT('calendar.today') : 'Today'}
			</button>
		</div>
		
		<button
			on:click={nextMonth}
			class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
			title="Next month"
			aria-label="Next month"
		>
			<svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
			</svg>
		</button>
	</div>
	
	<!-- Días de la semana -->
	<div class="grid grid-cols-7 gap-1 mb-2">
		{#each getWeekDays() as day}
			<div class="text-center text-xs font-semibold text-gray-400 py-1">
				{day}
			</div>
		{/each}
	</div>
	
	<!-- Días del mes -->
	<div class="grid grid-cols-7 gap-1">
		{#each calendarDays as { day, date, workouts }}
			{#if day === 0}
				<!-- Día vacío -->
				<div class="aspect-square"></div>
			{:else}
				<div
					class="aspect-square relative rounded-lg transition-all duration-200
						{workouts.length > 0 ? 'bg-green-900/30 border border-green-500/50' : 'bg-gray-700/30'}
						{isToday(date) ? 'ring-2 ring-blue-500' : ''}
						hover:bg-gray-700/50"
				>
					<!-- Número del día -->
					<div class="absolute top-1 left-1 text-xs font-medium
						{isToday(date) ? 'text-blue-400' : workouts.length > 0 ? 'text-green-300' : 'text-gray-400'}">
						{day}
					</div>
					
					<!-- Checkmark si hay entrenamientos -->
					{#if workouts.length > 0}
						<div class="absolute top-1 right-1 text-green-400" title="{workouts.length} workout{workouts.length > 1 ? 's' : ''}">
							<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
							</svg>
						</div>
						
						<!-- Nombre de rutina (solo el primero si hay varios) -->
						<div class="absolute bottom-1 left-1 right-1">
							<p class="text-[8px] leading-tight text-green-300 truncate font-medium">
								{workouts[0].routineName}
							</p>
							{#if workouts.length > 1}
								<p class="text-[7px] text-green-400/70">
									+{workouts.length - 1} more
								</p>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
	
	<!-- Leyenda -->
	<div class="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
		<div class="flex items-center gap-1">
			<div class="w-3 h-3 rounded bg-green-900/30 border border-green-500/50"></div>
			<span>{currentT ? currentT('calendar.completed') : 'Completed'}</span>
		</div>
		<div class="flex items-center gap-1">
			<div class="w-3 h-3 rounded ring-2 ring-blue-500"></div>
			<span>{currentT ? currentT('calendar.today') : 'Today'}</span>
		</div>
	</div>
</div>
