<script lang="ts">
	import { t } from '$lib/i18n';
	import { type SavedRoutine } from '$lib/services/routineStorage';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let routine: SavedRoutine;
	export let completedAt: number;

	function close() {
		dispatch('close');
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
	}

	function getIntervalCount(routine: SavedRoutine): number {
		return routine.intervals ? routine.intervals.filter(i => i.type !== 'repeat').length : 0;
	}

	function calculateTotalTime(routine: SavedRoutine): number {
		if (!routine.intervals) return 0;
		return routine.intervals.reduce((acc, interval) => {
			if (interval.type === 'repeat') return acc + 2;
			if (interval.type === 'weights') return acc + ((interval.restTime || 0) * ((interval.sets || 1) - 1));
			return acc + (interval.duration || 0) + (interval.prepDuration || 0) + (interval.restDuration || 0);
		}, 0) * (routine.repetitions || 1);
	}

	const dateStr = new Date(completedAt).toLocaleDateString(undefined, {
		weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
		hour: '2-digit', minute: '2-digit'
	});
</script>

<div class="wdm-backdrop" on:click|self={close}>
	<div class="wdm-modal">
		<!-- Header -->
		<div class="wdm-header">
			<div class="wdm-title-area">
				<div class="wdm-icon-circle">🏋️</div>
				<div>
					<h2 class="wdm-title">{routine.name}</h2>
					<p class="wdm-date">{dateStr}</p>
				</div>
			</div>
			<button class="wdm-close-btn" on:click={close}>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>

		<div class="wdm-content">
			<!-- Summary Stats -->
			<div class="wdm-stats-row">
				<div class="wdm-stat-box">
					<span class="wdm-stat-val">{formatTime(calculateTotalTime(routine))}</span>
					<span class="wdm-stat-lab">{$t('timer.duration')}</span>
				</div>
				<div class="wdm-stat-box">
					<span class="wdm-stat-val">{routine.repetitions}</span>
					<span class="wdm-stat-lab">{$t('routines.repetitions')}</span>
				</div>
				<div class="wdm-stat-box">
					<span class="wdm-stat-val">{getIntervalCount(routine)}</span>
					<span class="wdm-stat-lab">{$t('routines.intervals')}</span>
				</div>
			</div>

			<!-- Interval List -->
			<div class="wdm-section-title">{$t('settings.intervals_list')}</div>
			<div class="wdm-intervals">
				{#each routine.intervals as interval, i}
					<div class="wdm-interval-item" style="border-left-color: {interval.color.startsWith('bg-') ? 'var(--' + interval.color.replace('bg-', 'accent-') + ')' : interval.color}">
						<div class="wdm-int-info">
							<span class="wdm-int-name">
								{#if interval.type === 'repeat'}
									🔄 {$t('intervals.repeat_from_here')}
								{:else if interval.type === 'weights'}
									🏋️ {interval.name}
								{:else}
									{interval.name}
								{/if}
							</span>
							<div class="wdm-int-meta">
								{#if interval.type === 'repeat'}
									<span>{interval.duration}x {$t('routines.repetitions')}</span>
								{:else if interval.type === 'weights'}
									<span>{interval.sets} {$t('intervals.sets')} • {formatTime(interval.restTime || 0)} {$t('intervals.rest')}</span>
								{:else}
									<span>{formatTime(interval.duration)}</span>
									{#if interval.prepDuration}
										<span class="wdm-dot">•</span>
										<span>Prep: {formatTime(interval.prepDuration)}</span>
									{/if}
									{#if interval.restDuration}
										<span class="wdm-dot">•</span>
										<span>Rest: {formatTime(interval.restDuration)}</span>
									{/if}
								{/if}
							</div>
						</div>
						<div class="wdm-int-num">#{i + 1}</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="wdm-footer">
			<button class="wdm-btn-primary" on:click={close}>{$t('common.done')}</button>
		</div>
	</div>
</div>

<style>
	.wdm-backdrop {
		position: fixed; inset: 0; z-index: 200;
		background: rgba(0,0,0,0.85);
		backdrop-filter: blur(8px);
		display: flex; align-items: flex-end; justify-content: center;
		padding: 1rem;
	}
	@media (min-width: 640px) {
		.wdm-backdrop { align-items: center; }
	}

	.wdm-modal {
		background: var(--bg-card);
		border: 1px solid var(--border-card);
		border-radius: 24px 24px 0 0;
		width: 100%; max-width: 480px;
		max-height: 90vh;
		display: flex; flex-direction: column;
		box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
		animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		overflow: hidden;
	}
	@media (min-width: 640px) {
		.wdm-modal { border-radius: 24px; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
	}

	@keyframes slideUp {
		0% { transform: translateY(100%); }
		100% { transform: translateY(0); }
	}
	@keyframes popIn {
		0% { opacity: 0; transform: scale(0.95) translateY(10px); }
		100% { opacity: 1; transform: scale(1) translateY(0); }
	}

	.wdm-header {
		padding: 1.5rem;
		display: flex; align-items: flex-start; justify-content: space-between;
		border-bottom: 1px solid var(--border-card);
	}
	.wdm-title-area { display: flex; gap: 1rem; align-items: center; }
	.wdm-icon-circle {
		width: 48px; height: 48px;
		background: rgba(34,197,94,0.1);
		border-radius: 14px;
		display: flex; align-items: center; justify-content: center;
		font-size: 1.5rem;
	}
	.wdm-title { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1.2; }
	.wdm-date { font-size: 0.8rem; color: var(--text-muted); margin: 0.25rem 0 0; text-transform: capitalize; }

	.wdm-close-btn {
		background: rgba(255,255,255,0.05);
		border: 1px solid rgba(255,255,255,0.1);
		border-radius: 12px;
		width: 40px; height: 40px;
		display: flex; align-items: center; justify-content: center;
		color: var(--text-secondary);
		cursor: pointer; transition: all 0.2s;
	}
	.wdm-close-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); transform: rotate(90deg); }

	.wdm-content { padding: 1.5rem; overflow-y: auto; flex: 1; }

	.wdm-stats-row {
		display: grid; grid-template-columns: 1fr 1fr 1fr;
		gap: 0.75rem; margin-bottom: 1.5rem;
	}
	.wdm-stat-box {
		background: var(--bg-card-alt);
		border-radius: 16px; padding: 1rem;
		display: flex; flex-direction: column; align-items: center;
		border: 1px solid var(--border-card);
	}
	.wdm-stat-val { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); }
	.wdm-stat-lab { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 0.25rem; letter-spacing: 0.05em; }

	.wdm-section-title {
		font-size: 0.7rem; font-weight: 700; color: var(--text-label);
		text-transform: uppercase; letter-spacing: 0.1em;
		margin-bottom: 0.75rem;
	}

	.wdm-intervals { display: flex; flex-direction: column; gap: 0.6rem; }
	.wdm-interval-item {
		display: flex; justify-content: space-between; align-items: center;
		background: var(--bg-card-alt);
		border: 1px solid var(--border-card);
		border-left: 4px solid var(--accent-blue);
		border-radius: 12px; padding: 0.75rem 1rem;
	}
	.wdm-int-name { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 0.15rem; }
	.wdm-int-meta { font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.4rem; }
	.wdm-dot { opacity: 0.3; }
	.wdm-int-num { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); opacity: 0.5; }

	.wdm-footer { padding: 1.5rem; border-top: 1px solid var(--border-card); }
	.wdm-btn-primary {
		width: 100%; padding: 1rem;
		background: var(--accent-blue); color: #fff;
		border: none; border-radius: var(--radius-btn);
		font-size: 1rem; font-weight: 700; cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 8px 20px rgba(59,130,246,0.3);
	}
	.wdm-btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 10px 25px rgba(59,130,246,0.4); }
</style>
