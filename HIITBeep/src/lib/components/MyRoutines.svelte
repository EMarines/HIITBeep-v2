<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { loadRoutines, deleteRoutine, exportData, importData, type SavedRoutine } from '$lib/services/routineStorage';
	
	const dispatch = createEventDispatcher();
	
	let routines: SavedRoutine[] = [];
	let showDeleteConfirm = false;
	let routineToDelete: SavedRoutine | null = null;
	let importFileInput: HTMLInputElement;
	
	onMount(() => {
		loadData();
	});
	
	function loadData() {
		routines = loadRoutines();
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
	
	function loadRoutine(routine: SavedRoutine) {
		dispatch('load-routine', routine);
	}
	
	function confirmDelete(routine: SavedRoutine) {
		routineToDelete = routine;
		showDeleteConfirm = true;
	}
	
	function handleDelete() {
		if (routineToDelete) {
			deleteRoutine(routineToDelete.id);
			loadData();
			showDeleteConfirm = false;
			routineToDelete = null;
		}
	}
	
	function cancelDelete() {
		showDeleteConfirm = false;
		routineToDelete = null;
	}
	
	function handleExport() {
		const data = exportData();
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `hiitbeep-backup-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
	
	function triggerImport() {
		importFileInput.click();
	}
	
	function handleImport(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				const result = importData(content);
				
				// Obtener traducciones
				let currentT: any;
				t.subscribe(value => currentT = value)();
				
				if (result.success) {
					alert(`✅ ${currentT('routines.import_success')}!\n\n${currentT('routines.routines')}: ${result.imported?.routines || 0}\n${currentT('routines.workouts')}: ${result.imported?.logs || 0}`);
					loadData();
				} else {
					alert(`❌ ${currentT('routines.import_error')}: ${result.error}`);
				}
			};
			reader.readAsText(file);
			
			// Reset input
			input.value = '';
		}
	}
	
	function goBack() {
		dispatch('back');
	}
	
	function getIntervalCount(routine: SavedRoutine): number {
		return routine.intervals.filter(i => i.type !== 'repeat').length;
	}
</script>

<div class="min-h-screen bg-gray-900 text-white p-6">
	<div class="max-w-md mx-auto">
		<!-- Header -->
		<div class="flex items-center justify-between mb-6">
			<button
				on:click={goBack}
				class="text-2xl text-gray-400 hover:text-white transition-colors"
				style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);"
			>
				← 
			</button>
			<h1 class="text-3xl font-bold" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">
				{$t('routines.my_routines')}
			</h1>
			<div class="w-8"></div> <!-- Spacer -->
		</div>
		
		<!-- Stats -->
		<div class="bg-gray-800 rounded-lg p-4 mb-6 border-l-4 border-purple-500">
			<div class="flex justify-center items-center">
				<div class="text-center">
					<p class="text-4xl font-light text-purple-400">{routines.length}/15</p>
					<p class="text-sm text-gray-400 mt-1">{$t('routines.routines')}</p>
				</div>
			</div>
		</div>
		
		<!-- Export/Import Buttons -->
		<div class="flex gap-3 mb-6">
			<button
				on:click={handleExport}
				class="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
				style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);"
			>
				⬇️ {$t('routines.export_data')}
			</button>
			<button
				on:click={triggerImport}
				class="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
				style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);"
			>
				⬆️ {$t('routines.import_data')}
			</button>
		</div>
		
		<input
			type="file"
			accept=".json"
			bind:this={importFileInput}
			on:change={handleImport}
			class="hidden"
		/>
		
		<!-- Routines List -->
		<div class="space-y-3">
			<h3 class="text-lg font-medium text-gray-300 mb-4" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">
				{$t('routines.routines')}
			</h3>
			
			{#if routines.length === 0}
				<div class="bg-gray-800 rounded-lg p-8 text-center">
					<p class="text-gray-400 mb-2" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">
						{$t('routines.no_routines')}
					</p>
					<p class="text-sm text-gray-500" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);">
						{$t('routines.save_first_routine')}
					</p>
				</div>
			{:else}
				{#each routines as routine (routine.id)}
					<div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
						<div class="flex items-start justify-between">
							<div class="flex-1">
								<h4 class="font-medium text-white mb-1" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">
									{routine.name}
								</h4>
								<div class="text-sm text-gray-400 space-y-1">
									<p>
										{getIntervalCount(routine)} {$t('routines.intervals')} • {routine.repetitions} {routine.repetitions === 1 ? $t('main.repetition') : $t('main.repetitions_plural')}
									</p>
									<p class="text-xs text-gray-500">
										{routine.lastUsed ? `${$t('routines.last_used')}: ${formatDate(routine.lastUsed)}` : formatDate(routine.createdAt)}
									</p>
								</div>
							</div>
							
							<div class="flex gap-2 ml-4">
								<button
									on:click={() => loadRoutine(routine)}
									class="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
									style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);"
								>
									{$t('routines.load')}
								</button>
								<button
									on:click={() => confirmDelete(routine)}
									class="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition-colors"
									style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);"
								>
									🗑️
								</button>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm && routineToDelete}
	<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-6">
		<div class="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
			<h3 class="text-xl font-bold mb-4 text-white">{$t('routines.confirm_delete')}</h3>
			<p class="text-gray-300 mb-6">
				{$t('routines.confirm_delete_message')} "<span class="font-medium text-white">{routineToDelete.name}</span>"
			</p>
			<div class="flex gap-3">
				<button
					on:click={cancelDelete}
					class="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
				>
					{$t('common.cancel')}
				</button>
				<button
					on:click={handleDelete}
					class="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
				>
					{$t('routines.delete')}
				</button>
			</div>
		</div>
	</div>
{/if}


