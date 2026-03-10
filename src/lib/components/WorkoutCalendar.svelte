<script lang="ts">
	import { t } from '$lib/i18n';
	import { workoutStore } from '$lib/stores/workoutStore';
	import type { WorkoutLog } from '$lib/services/routineStorage';
	
	const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const monthNamesES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
	const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
	const weekDaysES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

	let currentMonth = new Date().getMonth();
	let currentYear = new Date().getFullYear();
	let calendarDays: Array<{ day: number; date: Date; workouts: WorkoutLog[] }> = [];
	
	// Reactividad sobre el store de workouts
	$: if ($workoutStore || currentMonth !== undefined || currentYear !== undefined) {
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
		if (!$workoutStore) return [];
		
		// Crear fecha local a medianoche (00:00:00.000) del día especificado
		const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
		// Fin del día a las 23:59:59.999
		const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
		
		return $workoutStore.filter(log => {
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

<div class="bg-gray-800/40 border border-white/5 rounded-2xl p-6 mb-8 shadow-xl backdrop-blur-md">
	<!-- Header con navegación -->
	<div class="flex items-center justify-between mb-8">
		<button
			on:click={previousMonth}
			class="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/5"
			title="Previous month"
			aria-label="Previous month"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
			</svg>
		</button>
		
		<div class="text-center">
			<h3 class="text-2xl font-black text-white tracking-tighter">
				{getMonthName(currentMonth)} {currentYear}
			</h3>
			<button
				on:click={goToToday}
				class="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors mt-1"
			>
				{currentT ? currentT('calendar.today') : 'Today'}
			</button>
		</div>
		
		<button
			on:click={nextMonth}
			class="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/5"
			title="Next month"
			aria-label="Next month"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
			</svg>
		</button>
	</div>
	
	<!-- Días de la semana -->
	<div class="grid grid-cols-7 gap-2 mb-3">
		{#each getWeekDays() as day}
			<div class="text-center text-[10px] font-black text-gray-500 uppercase tracking-tighter">
				{day}
			</div>
		{/each}
	</div>
	
	<!-- Días del mes -->
	<div class="grid grid-cols-7 gap-2">
		{#each calendarDays as { day, date, workouts }}
			{#if day === 0}
				<!-- Día vacío -->
				<div class="aspect-square opacity-0"></div>
			{:else}
				<div
					class="aspect-square relative rounded-xl transition-all duration-300 border
						{workouts.length > 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-transparent'}
						{isToday(date) ? 'ring-2 ring-blue-500 border-blue-500/50' : ''}
						hover:scale-105 active:scale-95 cursor-default"
				>
					<!-- Número del día -->
					<div class="absolute top-1.5 left-1.5 text-[10px] font-black
						{isToday(date) ? 'text-blue-400' : workouts.length > 0 ? 'text-green-400' : 'text-gray-500'}">
						{day}
					</div>
					
					<!-- Checkmark si hay entrenamientos -->
					{#if workouts.length > 0}
						<div class="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                            <span class="text-base">●</span>
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
	
	<!-- Leyenda -->
	<div class="flex items-center justify-center gap-6 mt-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">
		<div class="flex items-center gap-2">
			<div class="w-3 h-3 rounded-full bg-green-500 opacity-40"></div>
			<span>{currentT ? currentT('calendar.completed') : 'Completed'}</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="w-3 h-3 rounded-full border-2 border-blue-500"></div>
			<span>{currentT ? currentT('calendar.today') : 'Today'}</span>
		</div>
	</div>
</div>
