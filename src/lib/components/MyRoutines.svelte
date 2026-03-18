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
		const now  = new Date();
		const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
		let currentT: any;
		t.subscribe(value => currentT = value)();
		if (diffDays === 0) return currentT('routines.today');
		if (diffDays === 1) return currentT('routines.yesterday');
		if (diffDays < 7) return currentT('routines.days_ago', { days: diffDays.toString() });
		return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
	}

	function loadRoutine(routine: SavedRoutine) { dispatch('load-routine', routine); }

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

	function goBack() { dispatch('back'); }

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
		return routine.intervals.reduce((acc, interval) => {
			if (interval.type === 'repeat') return acc + 2;
			if (interval.type === 'weights') return acc + ((interval.restTime || 0) * ((interval.sets || 1) - 1));
			return acc + (interval.duration || 0) + (interval.prepDuration || 0) + (interval.restDuration || 0);
		}, 0) * (routine.repetitions || 1);
	}
</script>

<div class="mr-root">
	<!-- Header -->
	<header class="mr-header">
		<div class="mr-header-inner">
			<button class="hb-back-btn" on:click={goBack} aria-label="Volver">←</button>
			<div class="mr-title-area">
				<img src="/logo.png" alt="HIITBeep" class="mr-logo" />
				<h1 class="mr-title">{$t('routines.my_routines')}</h1>
			</div>
			<div style="width:38px;"></div><!-- spacer for centering -->
		</div>
	</header>

	<div class="mr-content">

		<!-- Stats card -->
		<div class="mr-stats-card">
			<div class="mr-stats-number">{$routineStore.length}<span class="mr-stats-total">/15</span></div>
			<div class="mr-stats-label">{$t('routines.routines')}</div>
		</div>

		<!-- Section label -->
		<div class="hb-section-label" style="margin-top:1.5rem;">{$t('routines.routines')}</div>

		<!-- Routines list -->
		{#if $routineStore.length === 0}
			<div class="mr-empty-state">
				<div class="mr-empty-icon">📋</div>
				<p class="mr-empty-title">{$t('routines.no_routines')}</p>
			</div>
		{:else}
			<div class="hb-stack">
				{#each $routineStore as routine (routine.id)}
					<div class="hb-routine-item">
						<div class="hb-routine-body">
							<div class="hb-routine-name">{routine.name}</div>
							<div class="hb-routine-meta">
								{getIntervalCount(routine)} {$t('routines.intervals')} &nbsp;·&nbsp;
								{routine.repetitions} {$t('routines.repetitions')} &nbsp;·&nbsp;
								{formatTime(calculateTotalRoutineTime(routine))}
							</div>
							<div class="hb-routine-date">
								{routine.lastUsed
									? `${$t('routines.last_used')}: ${formatDate(routine.lastUsed)}`
									: formatDate(routine.createdAt)}
							</div>
						</div>
						<div class="hb-routine-actions">
							<button
								class="hb-routine-action-btn"
								on:click={() => loadRoutine(routine)}
							>
								{$t('routines.load')}
							</button>
							<button
								class="hb-routine-action-btn hb-routine-action-btn-danger"
								on:click={() => confirmDelete(routine)}
							>
								🗑️
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm && routineToDelete}
	<div class="hb-modal-backdrop">
		<div class="hb-modal">
			<div class="mr-del-icon-wrap">
				<span class="mr-del-icon">⚠️</span>
			</div>
			<h3 class="mr-del-title">{$t('routines.confirm_delete')}</h3>
			<p class="mr-del-msg">
				{$t('routines.confirm_delete_message')}
				<br/>
				<span class="mr-del-name">"{routineToDelete.name}"</span>
			</p>
			<div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:1.5rem;">
				<button class="hb-btn hb-btn-delete" on:click={handleDelete}>
					{$t('routines.delete')}
				</button>
				<button class="hb-btn hb-btn-secondary" on:click={cancelDelete}>
					{$t('common.cancel')}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
.mr-root {
	min-height: 100vh;
	background: var(--bg-app);
	color: var(--text-primary);
	font-family: 'Inter', sans-serif;
}

/* Header */
.mr-header {
	position: sticky; top: 0; z-index: 50;
	background: rgba(11,17,32,0.88);
	backdrop-filter: blur(14px);
	border-bottom: 1px solid var(--border-card);
}
.mr-header-inner {
	max-width: 520px; margin: 0 auto;
	padding: 0.75rem 1.25rem;
	display: flex; align-items: center; justify-content: space-between;
}
.mr-title-area { display: flex; align-items: center; gap: 0.5rem; }
.mr-logo { width: 26px; height: 26px; object-fit: contain; }
.mr-title { font-size: 1.05rem; font-weight: 800; color: var(--text-primary); }

/* Content */
.mr-content {
	max-width: 520px; margin: 0 auto;
	padding: 1.5rem 1.25rem 5rem;
}

/* Stats */
.mr-stats-card {
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-radius: var(--radius-card);
	padding: 1.5rem;
	text-align: center;
}
.mr-stats-number {
	font-size: 3rem; font-weight: 900;
	color: var(--accent-green); line-height: 1;
}
.mr-stats-total { font-size: 1.5rem; color: var(--text-muted); font-weight: 400; margin-left: 0.2rem; }
.mr-stats-label {
	font-size: 0.65rem; font-weight: 700;
	letter-spacing: 0.12em; text-transform: uppercase;
	color: var(--text-label); margin-top: 0.4rem;
}

/* Empty state */
.mr-empty-state {
	background: var(--bg-card);
	border: 1px dashed var(--border-card);
	border-radius: var(--radius-card);
	padding: 2.5rem; text-align: center;
}
.mr-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.mr-empty-title { font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; }

/* Delete modal */
.mr-del-icon-wrap {
	width: 60px; height: 60px;
	background: rgba(239,68,68,0.1);
	border-radius: 50%; display: flex;
	align-items: center; justify-content: center;
	margin: 0 auto 1.25rem;
}
.mr-del-icon { font-size: 1.75rem; }
.mr-del-title { font-size: 1.25rem; font-weight: 800; text-align: center; color: var(--text-primary); }
.mr-del-msg   { font-size: 0.85rem; color: var(--text-secondary); text-align: center; margin-top: 0.5rem; line-height: 1.6; }
.mr-del-name  { display: block; font-weight: 700; color: var(--text-primary); margin-top: 0.5rem; }

.hb-btn-delete {
	width: 100%; padding: 1rem;
	background: var(--accent-red);
	color: #fff;
	font-size: 1rem; font-weight: 700;
	border-radius: var(--radius-btn);
	border: none; cursor: pointer;
	transition: all 0.2s;
}
.hb-btn-delete:hover { background: #dc2626; }
</style>
