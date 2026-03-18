<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { t } from '$lib/i18n';

	const dispatch = createEventDispatcher();

	let repetitions = 3;

	let intervals = [
		{ name: $t('intervals.preparation'), duration: 3,  color: 'bg-yellow-500' },
		{ name: $t('intervals.exercise'),    duration: 60, color: 'bg-red-500' },
		{ name: $t('intervals.rest'),        duration: 30, color: 'bg-blue-500' }
	];

	function addInterval() {
		intervals = [...intervals, { name: $t('settings.new_interval'), duration: 30, color: 'bg-green-500' }];
	}
	function removeInterval(index: number) {
		intervals = intervals.filter((_, i) => i !== index);
	}
	function startWorkout() {
		if (intervals.length === 0) return;
		dispatch('start', { intervals, repetitions });
	}

	const colorOptions = [
		{ name: $t('colors.yellow'), value: 'bg-yellow-500' },
		{ name: $t('colors.red'),    value: 'bg-red-500' },
		{ name: $t('colors.blue'),   value: 'bg-blue-500' },
		{ name: $t('colors.green'),  value: 'bg-green-500' },
		{ name: $t('colors.purple'), value: 'bg-purple-500' },
		{ name: $t('colors.pink'),   value: 'bg-pink-500' },
		{ name: $t('colors.orange'), value: 'bg-orange-500' }
	];

	const colorAccentMap: Record<string, string> = {
		'bg-yellow-500': 'var(--accent-yellow)',
		'bg-red-500':    'var(--accent-red)',
		'bg-blue-500':   'var(--accent-blue)',
		'bg-green-500':  'var(--accent-green)',
		'bg-purple-500': 'var(--accent-purple)',
		'bg-pink-500':   '#ec4899',
		'bg-orange-500': 'var(--accent-orange)',
	};

	const repetitionsId = 'repetitions-input';
	function generateIntervalId(index: number, field: string): string {
		return `interval-${index}-${field}`;
	}
</script>

<div class="ic-root">
	<div class="page-content" style="padding-bottom:6rem;">

		<!-- Header -->
		<div class="hb-page-header" style="padding-top:1.5rem;">
			<h1 class="hb-page-title">Intervalos<span style="color:var(--accent-green);">::</span></h1>
			<p class="hb-page-subtitle">{$t('app.subtitle')}</p>
		</div>

		<!-- Repetitions Card -->
		<div class="ic-section-card ic-card-accent-purple">
			<div class="ic-card-inner">
				<label class="hb-label hb-label-accent" for={repetitionsId}>{$t('settings.repetitions_number')}</label>
				<p class="ic-help-text">{$t('settings.repetitions_help')}</p>
				<div class="hb-input-suffix-wrap" style="margin-top:0.5rem;">
					<input
						id={repetitionsId}
						type="number"
						bind:value={repetitions}
						min="1"
						max="99"
						class="hb-input"
					/>
				</div>
			</div>
		</div>

		<!-- Intervals List -->
		<div class="hb-stack" style="margin-top:1rem; margin-bottom:1rem;">
			{#each intervals as interval, index}
				<div class="ic-interval-card" style="border-left-color: {colorAccentMap[interval.color] ?? 'var(--accent-green)'}">
					<div class="ic-interval-inner">
						<!-- Top row: name + remove -->
						<div class="ic-interval-header">
							<input
								bind:value={interval.name}
								class="ic-name-input"
								placeholder="Nombre del intervalo"
							/>
							<button
								class="ic-remove-btn"
								on:click={() => removeInterval(index)}
								aria-label="Eliminar intervalo"
							>✕</button>
						</div>

						<!-- Fields: duration + color -->
						<div class="ic-fields-row">
							<div class="ic-field-group">
								<label class="hb-label" for={generateIntervalId(index, 'duration')}>{$t('settings.duration_seconds')}</label>
								<div class="hb-input-suffix-wrap">
									<input
										id={generateIntervalId(index, 'duration')}
										type="number"
										bind:value={interval.duration}
										min="1"
										class="hb-input"
									/>
									<span class="hb-input-suffix">s</span>
								</div>
							</div>
							<div class="ic-field-group">
								<label class="hb-label" for={generateIntervalId(index, 'color')}>{$t('settings.color')}</label>
								<select
									id={generateIntervalId(index, 'color')}
									bind:value={interval.color}
									class="hb-select"
								>
									{#each colorOptions as color}
										<option value={color.value}>{color.name}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Actions -->
		<div class="ic-actions">
			<button class="hb-btn hb-btn-secondary" on:click={addInterval}>
				<span style="font-size:1.1rem;">＋</span>
				{$t('settings.add_interval')}
			</button>
			<button
				class="hb-btn hb-btn-primary"
				on:click={startWorkout}
				disabled={intervals.length === 0}
			>
				{$t('main.start_routine')}
			</button>
		</div>

	</div>
</div>

<style>
.ic-root {
	min-height: 100vh;
	background: var(--bg-app);
	color: var(--text-primary);
	font-family: 'Inter', sans-serif;
}

/* Section card with left accent */
.ic-section-card {
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-radius: var(--radius-card);
	overflow: hidden;
	position: relative;
	margin-bottom: 0.5rem;
}
.ic-card-accent-purple { border-left: 4px solid var(--accent-purple); }
.ic-card-accent-purple::before {
	content: '';
	position: absolute; inset: 0;
	background: linear-gradient(90deg, rgba(168,85,247,0.12) 0%, transparent 40%);
	pointer-events: none;
}
.ic-card-inner { padding: 1.1rem 1.25rem; }
.ic-help-text { font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem; }

/* Interval card */
.ic-interval-card {
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-radius: var(--radius-card);
	border-left-width: 4px;
	overflow: hidden;
	position: relative;
	transition: box-shadow 0.2s;
}
.ic-interval-card::before {
	content: '';
	position: absolute; inset: 0;
	background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, transparent 35%);
	pointer-events: none;
}
.ic-interval-card:hover { box-shadow: var(--shadow-card); }
.ic-interval-inner { padding: 1rem 1.1rem; }

/* Header inside interval card */
.ic-interval-header {
	display: flex; align-items: center; justify-content: space-between;
	margin-bottom: 0.875rem;
}
.ic-name-input {
	background: transparent;
	border: none; border-bottom: 1px solid var(--border-card);
	color: var(--text-primary);
	font-family: 'Inter', sans-serif;
	font-size: 1rem; font-weight: 700;
	flex: 1; padding: 0.2rem 0; outline: none;
	transition: border-color 0.2s;
}
.ic-name-input:focus { border-bottom-color: var(--accent-green); }
.ic-remove-btn {
	width: 28px; height: 28px;
	border-radius: 6px; border: none;
	background: rgba(239,68,68,0.1);
	color: var(--accent-red);
	font-size: 0.75rem; font-weight: 700;
	cursor: pointer; transition: all 0.2s;
	display: flex; align-items: center; justify-content: center;
	flex-shrink: 0; margin-left: 0.75rem;
}
.ic-remove-btn:hover { background: rgba(239,68,68,0.2); }

/* Fields row */
.ic-fields-row {
	display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;
}
.ic-field-group { display: flex; flex-direction: column; }

/* Actions */
.ic-actions {
	display: flex; flex-direction: column; gap: 0.75rem;
	position: sticky; bottom: 0;
	background: linear-gradient(to top, var(--bg-app) 70%, transparent);
	padding-top: 1rem;
}
</style>
