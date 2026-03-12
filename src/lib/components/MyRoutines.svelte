<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { t } from '$lib/i18n';
	import { routineStore } from '$lib/stores/routineStore';
	import { type SavedRoutine } from '$lib/services/routineStorage';
	
	const dispatch = createEventDispatcher();
	
	let showDeleteConfirm = false;
	let routineToDelete: SavedRoutine | null = null;

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
	
	function loadRoutine(routine: SavedRoutine) {
		dispatch('load-routine', routine);
	}
	
	function confirmDelete(routine: SavedRoutine) {
		routineToDelete = routine;
		showDeleteConfirm = true;
	}
	
	async function handleDelete() {
		if (routineToDelete) {
			await routineStore.delete(routineToDelete.id);
			showDeleteConfirm = false;
			routineToDelete = null;
		}
	}
	
	function cancelDelete() {
		showDeleteConfirm = false;
		routineToDelete = null;
	}
	

	function goBack() {
		dispatch('back');
	}
	
	function getIntervalCount(routine: SavedRoutine): number {
		return routine.intervals ? routine.intervals.filter(i => i.type !== 'repeat').length : 0;
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
	}

	function calculateTotalRoutineTime(routine: SavedRoutine): number {
		if (!routine.intervals || routine.intervals.length === 0) return 0;
		const totalSeconds = routine.intervals.reduce((acc, interval) => {
			if (interval.type === 'repeat') return acc + 2;
			if (interval.type === 'weights') return acc + ((interval.restTime || 0) * ((interval.sets || 1) - 1));
			return acc + (interval.duration || 0) + (interval.prepDuration || 0) + (interval.restDuration || 0);
		}, 0) * (routine.repetitions || 1);
		
		return totalSeconds;
	}
</script>

<div class="min-h-screen bg-[#05070a] text-white p-6 relative">
	<div class="max-w-md mx-auto">
		<!-- Header -->
		<div class="flex items-center mb-8 relative justify-center">
			<button
				on:click={goBack}
				class="w-10 h-10 flex items-center justify-center bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-white transition-all shadow-lg border border-white/5 absolute left-0"
			>
				←
			</button>
			<div class="flex items-center gap-3">
				<img src="/logo.png" alt="HiitBeep Logo" class="w-8 h-8 object-contain drop-shadow-md" />
				<h1 class="text-3xl font-semibold tracking-tight text-center" style="text-shadow: 0 4px 12px rgba(0,0,0,0.5);">
					{$t('routines.my_routines')}
				</h1>
			</div>
		</div>
		
		<!-- Stats Card -->
		<div class="bg-gray-800/30 border border-white/5 rounded-2xl p-8 mb-8 text-center shadow-xl backdrop-blur-sm relative overflow-hidden group">
			<div class="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
			<p class="text-5xl font-semibold text-purple-400 mb-2 relative z-10">
				{$routineStore.length}/15
			</p>
			<p class="text-xs text-gray-400 font-medium uppercase tracking-widest relative z-10">{$t('routines.routines')}</p>
		</div>
		
		
		<!-- List Section -->
		<div class="space-y-6">
			<h3 class="text-xl font-semibold text-white/90 px-1 ml-4 uppercase tracking-wider">
				{$t('routines.routines')}
			</h3>
			
			{#if $routineStore.length === 0}
				<div class="bg-gray-800/20 border border-dashed border-gray-700 rounded-2xl p-10 text-center">
					<p class="text-gray-500 font-medium">{$t('routines.no_routines')}</p>
				</div>
			{:else}
				{#each $routineStore as routine (routine.id)}
					<div class="bg-gray-800/40 border border-white/5 rounded-lg overflow-hidden hover:bg-gray-800/60 transition-all shadow-lg flex group">
						<div class="flex-1 p-6 min-w-0">
							<h4 class="text-lg font-semibold text-white truncate mb-1 group-hover:text-purple-400 transition-colors">
								{routine.name}
							</h4>
							<p class="text-sm text-gray-400">
								{getIntervalCount(routine)} {$t('routines.intervals')} • {routine.repetitions} {$t('routines.repetitions')} • {formatTime(calculateTotalRoutineTime(routine))}
							</p>
							<p class="text-[10px] text-gray-500 mt-2 font-medium uppercase tracking-wider">
								{routine.lastUsed ? `${$t('routines.last_used')}: ${formatDate(routine.lastUsed)}` : formatDate(routine.createdAt)}
							</p>
						</div>
						
						<div class="flex border-l border-white/5 bg-white/5">
							<button
								on:click={() => loadRoutine(routine)}
								class="px-6 flex items-center justify-center bg-transparent text-gray-400 hover:text-purple-400 transition-all font-medium text-xs uppercase cursor-pointer"
							>
								{$t('routines.load')}
							</button>
							<button
								on:click={() => confirmDelete(routine)}
								class="px-4 flex items-center justify-center bg-transparent hover:bg-red-500/20 text-gray-400 hover:text-red-500 border-l border-white/5 transition-all"
							>
								🗑️
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm && routineToDelete}
	<div class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
		<div class="bg-gray-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
			<div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
				<span class="text-3xl">⚠️</span>
			</div>
			
			<h3 class="text-2xl font-bold mb-2">{$t('routines.confirm_delete')}</h3>
			<p class="text-gray-400 text-sm mb-8">
				{$t('routines.confirm_delete_message')}
				<br/>
				<span class="text-white font-bold mt-2 block">"{routineToDelete.name}"</span>
			</p>
			
			<div class="flex flex-col gap-3">
				<button
					on:click={handleDelete}
					class="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
				>
					{$t('routines.delete')}
				</button>
				<button
					on:click={cancelDelete}
					class="w-full py-3 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-xl font-medium transition-all"
				>
					{$t('common.cancel')}
				</button>
			</div>
		</div>
	</div>
{/if}


