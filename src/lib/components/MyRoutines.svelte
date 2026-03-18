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
			<button class="hb-back-btn" on:click={goBack} aria-label="Volver">
				<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M15 18l-6-6 6-6"/>
				</svg>
			</button>
			<div class="mr-title-area">
				<img src="/logo.png" alt="HIITBeep" class="mr-logo" />
				<h1 class="mr-title">{$t('routines.my_routines')}</h1>
			</div>
			<div style="width:38px;"></div>
		</div>
	</header>

	<div class="mr-content">

		<!-- Stats card -->
		<div class="mr-stats-card">
			<div class="mr-stats-bg-glow"></div>
			<div class="mr-stats-number">{$routineStore.length}<span class="mr-stats-total">/15</span></div>
			<div class="mr-stats-label">{$t('routines.routines')}</div>
		</div>

		<!-- Section label -->
		<div class="hb-section-label" style="margin-top:1.75rem; margin-bottom:0.75rem;">{$t('routines.routines')}</div>

		<!-- Routines list -->
		{#if $routineStore.length === 0}
			<div class="mr-empty-state">
				<div class="mr-empty-icon">📋</div>
				<p class="mr-empty-title">{$t('routines.no_routines')}</p>
				<p style="font-size:0.78rem; color:var(--text-muted); margin-top:0.35rem;">{$t('main.use_settings')}</p>
			</div>
		{:else}
			<div class="mr-list">
				{#each $routineStore as routine (routine.id)}
					<div class="mr-item">
						<div class="mr-item-glow"></div>
						<div class="mr-item-body">
							<div class="mr-item-name">{routine.name}</div>
							<div class="mr-item-meta">
								<span>{getIntervalCount(routine)} {$t('routines.intervals')}</span>
								<span class="mr-meta-sep">•</span>
								<span>{routine.repetitions} {$t('routines.repetitions')}</span>
								<span class="mr-meta-sep">•</span>
								<span>{formatTime(calculateTotalRoutineTime(routine))}</span>
							</div>
							<div class="mr-item-date">
								{routine.lastUsed
									? `${$t('routines.last_used')}: ${formatDate(routine.lastUsed)}`
									: formatDate(routine.createdAt)}
							</div>
						</div>
						<div class="mr-item-actions">
							<button class="mr-item-btn mr-btn-load" on:click={() => loadRoutine(routine)}>
								{$t('routines.load')}
							</button>
							<button class="mr-item-btn mr-btn-del" on:click={() => confirmDelete(routine)} aria-label="Eliminar">
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
	<div class="hb-modal-backdrop" style="z-index:300;">
		<div class="mr-del-modal">
			<div class="mr-del-icon-wrap">
				<svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
					<line x1="12" y1="9" x2="12" y2="13"></line>
					<line x1="12" y1="17" x2="12.01" y2="17"></line>
				</svg>
			</div>
			<h3 style="font-size:1.25rem; font-weight:800; color:var(--text-primary); margin-bottom:0.5rem; letter-spacing:-0.02em;">{$t('routines.confirm_delete')}</h3>
			<p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.5; margin-bottom:1.5rem;">
				{$t('routines.confirm_delete_message')}
				<br/>
				<span style="font-weight:700; color:var(--text-primary);">"{routineToDelete.name}"</span>
			</p>
			<div style="display:flex; flex-direction:column; gap:0.75rem;">
				<button class="mr-btn-danger" on:click={handleDelete}>
					{$t('routines.delete')}
				</button>
				<button class="hb-btn hb-btn-secondary" style="width:100%; border:none;" on:click={cancelDelete}>
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

.hb-back-btn {
	width: 38px; height: 38px;
	background: var(--bg-card-alt); border: 1.5px solid var(--border-card);
	border-radius: 12px; color: var(--text-primary);
	display: flex; align-items: center; justify-content: center;
	cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	flex-shrink: 0;
}
.hb-back-btn:hover {
	background: rgba(255,255,255,0.08);
	border-color: var(--text-muted);
	transform: translateX(-3px);
	box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.hb-back-btn:active { transform: scale(0.92) translateX(-3px); }

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
	padding: 1.75rem 1.5rem;
	text-align: center;
	position: relative; overflow: hidden;
}
.mr-stats-bg-glow {
	position: absolute; inset: 0;
	background: radial-gradient(circle at center, rgba(34,197,94,0.08) 0%, transparent 70%);
	pointer-events: none;
}
.mr-stats-number {
	position: relative; z-index: 1;
	font-size: 3.5rem; font-weight: 900;
	color: var(--accent-green); line-height: 1;
	text-shadow: 0 4px 12px rgba(34,197,94,0.2);
}
.mr-stats-total { font-size: 1.75rem; color: var(--text-muted); font-weight: 400; margin-left: 0.2rem; }
.mr-stats-label {
	position: relative; z-index: 1;
	font-size: 0.65rem; font-weight: 700;
	letter-spacing: 0.15em; text-transform: uppercase;
	color: var(--text-label); margin-top: 0.6rem;
}

/* List */
.mr-list { display: flex; flex-direction: column; gap: 0.875rem; }

/* Routine Item */
.mr-item {
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-left: 4px solid var(--accent-orange);
	border-radius: var(--radius-card);
	padding: 1rem 1.1rem;
	display: flex; align-items: center; justify-content: space-between;
	gap: 1rem;
	position: relative; overflow: hidden;
	transition: all 0.2s;
}
.mr-item:hover {
	border-color: rgba(249,115,22,0.3);
	box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.mr-item-glow {
	position: absolute; inset: 0;
	background: linear-gradient(90deg, rgba(249,115,22,0.1) 0%, transparent 40%);
	pointer-events: none;
}
.mr-item-body { flex: 1; min-width: 0; position: relative; z-index: 1; }
.mr-item-name {
	font-size: 1rem; font-weight: 700; color: var(--text-primary);
	margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mr-item-meta {
	display: flex; align-items: center; gap: 0.5rem;
	font-size: 0.78rem; color: var(--text-secondary);
}
.mr-meta-sep { opacity: 0.4; }
.mr-item-date {
	font-size: 0.7rem; color: var(--text-muted); margin-top: 0.4rem;
}

.mr-item-actions { display: flex; gap: 0.6rem; align-items: center; position: relative; z-index: 1; }
.mr-item-btn {
	border-radius: 8px; border: none; cursor: pointer;
	font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 700;
	transition: all 0.2s;
}
.mr-btn-load {
	padding: 0.5rem 1rem;
	background: var(--bg-card-alt); color: var(--accent-orange);
	border: 1px solid rgba(249,115,22,0.3);
}
.mr-btn-load:hover { background: var(--accent-orange); color: #fff; }

.mr-btn-del {
	width: 36px; height: 36px;
	display: flex; align-items: center; justify-content: center;
	padding: 0; background: rgba(239,68,68,0.1); color: var(--accent-red);
}
.mr-btn-del:hover { background: var(--accent-red); color: #fff; }

/* Empty state */
.mr-empty-state {
	background: var(--bg-card);
	border: 2px dashed var(--border-card);
	border-radius: var(--radius-card);
	padding: 3rem 1.5rem; text-align: center;
}
.mr-empty-icon { font-size: 2.5rem; margin-bottom: 0.875rem; }
.mr-empty-title { font-size: 0.95rem; color: var(--text-secondary); font-weight: 600; }

/* Delete modal icon */
.mr-del-modal {
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-radius: var(--radius-card);
	padding: 2.5rem 2rem;
	width: 100%; max-width: 360px;
	text-align: center;
	box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
	animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mr-del-icon-wrap {
	width: 60px; height: 60px;
	background: rgba(239,68,68,0.12);
	border-radius: 50%; display: flex;
	align-items: center; justify-content: center;
	margin: 0 auto 1.25rem;
	color: var(--accent-red);
}

.mr-btn-danger {
	width: 100%; padding: 0.9rem;
	background: var(--accent-red); color: #fff;
	font-size: 0.95rem; font-weight: 700;
	border-radius: var(--radius-btn); border: none;
	cursor: pointer; transition: all 0.2s;
	font-family: 'Inter', sans-serif;
	box-shadow: 0 4px 14px rgba(239,68,68,0.3);
}
.mr-btn-danger:hover {
	background: #dc2626;
	box-shadow: 0 6px 20px rgba(239,68,68,0.4);
	transform: translateY(-1px);
}

@keyframes popIn {
	0% { opacity: 0; transform: scale(0.95) translateY(10px); }
	100% { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
