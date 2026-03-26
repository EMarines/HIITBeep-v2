<script lang="ts">
	import { t } from '$lib/i18n';
	import { type SavedRoutine, type WorkoutLog } from '$lib/services/routineStorage';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let routine: SavedRoutine;
	export let completedAt: number;
	export let log: WorkoutLog | undefined = undefined;
	export let totalLogs: number = 1;
	export let currentIndex: number = 0;

	function close() {
		dispatch('close');
	}

	function next() {
		dispatch('next');
	}

	function prev() {
		dispatch('prev');
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

	$: dateStr = new Date(completedAt).toLocaleDateString(undefined, {
		weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
		hour: '2-digit', minute: '2-digit'
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="hb-modal-backdrop" on:click|self={close}>
	<div class="hb-modal">
		<!-- Header -->
		<div class="hb-modal-header" style="justify-content:space-between; align-items:flex-start; text-align:left;">
			<div class="wdm-title-area">
				<div class="wdm-icon-circle" style="flex-direction: column; gap: 0.1rem; position: relative;">
					{#if totalLogs > 1}
						{#if currentIndex > 0}
							<!-- svelte-ignore a11y_consider_explicit_label -->
							<button on:click|stopPropagation={prev} class="wdm-nav-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
						{/if}
						<span style="font-size:0.6rem; font-weight:800; line-height:1;">{currentIndex + 1}/{totalLogs}</span>
						{#if currentIndex < totalLogs - 1}
							<!-- svelte-ignore a11y_consider_explicit_label -->
							<button on:click|stopPropagation={next} class="wdm-nav-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
						{/if}
					{:else}
						<span>🏋️</span>
					{/if}
				</div>
				<div>
					<h2 class="hb-modal-title" style="margin-bottom:0.25rem;">{routine.name}</h2>
					<p class="hb-modal-subtitle" style="text-transform:capitalize;">{dateStr}</p>
				</div>
			</div>
			<button class="hb-modal-close" aria-label={$t('common.close') || 'Close'} on:click={close} style="position:static;">
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
					<span class="wdm-stat-val">{formatTime(log ? log.duration : calculateTotalTime(routine))}</span>
					<span class="wdm-stat-lab">{$t('timer.duration')}</span>
				</div>
				<div class="wdm-stat-box">
					<span class="wdm-stat-val">{log ? log.repetitionsCompleted : routine.repetitions}</span>
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
			<button class="hb-btn hb-btn-primary" on:click={close} style="width:100%; justify-content:center;">{$t('common.done')}</button>
		</div>
	</div>
</div>

<style>
	.wdm-title-area { display: flex; gap: 1rem; align-items: center; }
	.wdm-icon-circle {
		width: 48px; height: 48px;
		background: rgba(34,197,94,0.1);
		border-radius: 14px;
		display: flex; align-items: center; justify-content: center;
		font-size: 1.5rem;
	}

	.wdm-content { padding: 1.5rem 0; overflow-y: auto; flex: 1; }

	.wdm-stats-row {
		display: grid; grid-template-columns: 1fr 1fr 1fr;
		gap: 0.75rem; margin-bottom: 1.5rem;
	}
	.wdm-stat-box {
		background: var(--bg-card-alt);
		border-radius: 16px; padding: 0.75rem;
		display: flex; flex-direction: column; align-items: center;
		border: 1px solid var(--border-card);
	}
	.wdm-stat-val { font-size: 1rem; font-weight: 800; color: var(--text-primary); }
	.wdm-stat-lab { font-size: 0.6rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 0.25rem; letter-spacing: 0.05em; }

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
	.wdm-int-name { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 0.15rem; }
	.wdm-int-meta { font-size: 0.7rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.4rem; }
	.wdm-dot { opacity: 0.3; }
	.wdm-int-num { font-size: 0.75rem; font-weight: 800; color: var(--text-muted); opacity: 0.5; }

	.wdm-footer { padding-top: 1rem; }
	.wdm-nav-btn {
		background: rgba(255,255,255,0.1);
		border-radius: 4px; border: none;
		color: var(--accent-green);
		cursor: pointer; padding: 2px;
		display: flex; align-items: center; justify-content: center;
	}
	.wdm-nav-btn:hover { background: rgba(255,255,255,0.2); }
</style>
