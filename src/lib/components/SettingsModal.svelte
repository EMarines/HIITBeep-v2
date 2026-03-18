<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { goto } from '$app/navigation';
	import { t } from '$lib/i18n';

	const dispatch = createEventDispatcher();

	export let repetitions: number | null = null;
	export let intervals: Array<{
		name: string;
		duration: number;
		color: string;
		type?: 'interval' | 'repeat' | 'weights';
		sets?: number;
		restTime?: number;
		prepDuration?: number;
		restDuration?: number;
	}> = [];
	export let routineName: string = '';

	let localRepetitions = repetitions;
	let localIntervals = [...intervals];
	let localRoutineName = routineName;

	$: localRepetitions = repetitions;
	$: localIntervals = [...intervals];
	$: localRoutineName = routineName;

	const colorAccentMap: Record<string, string> = {
		'bg-yellow-500': 'var(--accent-yellow)',
		'bg-red-500':    'var(--accent-red)',
		'bg-blue-500':   'var(--accent-blue)',
		'bg-green-500':  'var(--accent-green)',
		'bg-purple-500': 'var(--accent-purple)',
		'bg-pink-500':   '#ec4899',
		'bg-orange-500': 'var(--accent-orange)',
		'bg-gray-700':   'var(--text-muted)',
	};
	function getAccent(color: string) { return colorAccentMap[color] ?? 'var(--accent-green)'; }

	function addInterval() {
		localIntervals = [...localIntervals, {
			name: '', duration: null as any, color: 'bg-green-500',
			type: 'interval', prepDuration: null as any, restDuration: null as any
		}];
	}
	function addWeightsInterval() {
		localIntervals = [...localIntervals, {
			name: '', duration: 0, color: 'bg-purple-500',
			type: 'weights', sets: null as any, restTime: null as any
		}];
	}
	function addRepeatMarker() {
		localIntervals = [...localIntervals, {
			name: $t('settings.repeat_marker'), duration: 2, color: 'bg-gray-700', type: 'repeat'
		}];
	}
	function removeInterval(index: number) {
		localIntervals = localIntervals.filter((_, i) => i !== index);
	}
	function copyInterval(index: number) {
		const s = localIntervals[index];
		localIntervals = [...localIntervals, {
			name: s.name, duration: s.duration, color: s.color, type: s.type || 'interval',
			...(s.type === 'weights'
				? { sets: s.sets, restTime: s.restTime }
				: { prepDuration: s.prepDuration, restDuration: s.restDuration })
		}];
	}
	function moveIntervalUp(index: number) {
		if (index > 0) {
			const a = [...localIntervals];
			[a[index], a[index - 1]] = [a[index - 1], a[index]];
			localIntervals = a;
		}
	}
	function moveIntervalDown(index: number) {
		if (index < localIntervals.length - 1) {
			const a = [...localIntervals];
			[a[index], a[index + 1]] = [a[index + 1], a[index]];
			localIntervals = a;
		}
	}

	function saveConfiguration() {
		if (localIntervals.length === 0) return;
		if (!localRepetitions || localRepetitions < 1) {
			alert($t('settings.repetitions_required') || 'Please enter the number of repetitions');
			return;
		}
		dispatch('save-config', { intervals: localIntervals, repetitions: localRepetitions, routineName: localRoutineName.trim() });
	}
	function saveAsRoutine() {
		if (localIntervals.length === 0) return;
		if (!localRepetitions || localRepetitions < 1) {
			alert($t('settings.repetitions_required') || 'Please enter the number of repetitions');
			return;
		}
		dispatch('save-routine', { intervals: localIntervals, repetitions: localRepetitions, routineName: localRoutineName.trim() });
	}
	function cancelConfiguration() {
		localRepetitions = repetitions;
		localIntervals = [...intervals];
		localRoutineName = routineName;
		dispatch('cancel');
	}
	function openPreferences() { goto('/preferences'); }

	const colorOptions = [
		{ name: $t('colors.yellow'), value: 'bg-yellow-500' },
		{ name: $t('colors.red'),    value: 'bg-red-500' },
		{ name: $t('colors.blue'),   value: 'bg-blue-500' },
		{ name: $t('colors.green'),  value: 'bg-green-500' },
		{ name: $t('colors.purple'), value: 'bg-purple-500' },
		{ name: $t('colors.pink'),   value: 'bg-pink-500' },
		{ name: $t('colors.orange'), value: 'bg-orange-500' },
	];

	const repetitionsId = 'settings-repetitions-input';
	let intervalToDeleteIndex: number | null = null;
	function confirmDeleteInterval(index: number) { intervalToDeleteIndex = index; }
	function cancelDeleteInterval() { intervalToDeleteIndex = null; }
	function executeDeleteInterval() {
		if (intervalToDeleteIndex !== null) {
			removeInterval(intervalToDeleteIndex);
			intervalToDeleteIndex = null;
		}
	}
	function generateIntervalId(index: number, field: string) { return `settings-interval-${index}-${field}`; }
</script>

<!-- Modal backdrop -->
<div class="sm-backdrop">
	<div class="sm-panel">

		<!-- Sticky Header -->
		<div class="sm-header">
			<div class="sm-header-left">
				<img src="/logo.png" alt="HIITBeep" class="sm-logo" />
				<h2 class="sm-title">{$t('settings.title')}</h2>
			</div>
			<div class="sm-header-right">
				<button class="sm-icon-btn" on:click={openPreferences} title={$t('preferences.title')}>🔧</button>
				<button class="sm-icon-btn sm-close-btn" on:click={cancelConfiguration} aria-label="Cerrar">✕</button>
			</div>
		</div>

		<!-- Scrollable content -->
		<div class="sm-body">

			<!-- Routine name -->
			<div class="sm-section-card sm-accent-blue">
				<div class="hb-input-group">
					<label class="hb-label hb-label-accent" for="routine-name-input">{$t('settings.routine_name')}</label>
					<p class="sm-help">{$t('settings.routine_name_help')}</p>
					<input
						id="routine-name-input"
						type="text"
						bind:value={localRoutineName}
						placeholder={$t('settings.routine_name_placeholder')}
						maxlength="50"
						class="hb-input"
						style="margin-top:0.5rem;"
					/>
				</div>
			</div>

			<!-- Repetitions -->
			<div class="sm-section-card sm-accent-purple">
				<div class="hb-input-group">
					<label class="hb-label" for={repetitionsId} style="color:var(--accent-purple);">{$t('settings.repetitions_number')}</label>
					<p class="sm-help">{$t('settings.repetitions_help')}</p>
					<input
						id={repetitionsId}
						type="number"
						bind:value={localRepetitions}
						placeholder="1"
						min="1"
						max="99"
						class="hb-input"
						style="margin-top:0.5rem;"
					/>
				</div>
			</div>

			<!-- Intervals section -->
			<div class="sm-intervals-section">
				<div class="hb-section-label">{$t('settings.intervals')}:</div>

				{#if localIntervals.length === 0}
					<div class="sm-empty">
						<div class="sm-empty-icon">🏃‍♂️</div>
						<h3 class="sm-empty-title">{$t('settings.welcome_title')}</h3>
						<p class="sm-empty-msg">{$t('settings.welcome_message')}</p>
					</div>
				{/if}

				<div class="hb-stack">
					{#each localIntervals as interval, index}

						{#if interval.type === 'repeat'}
							<!-- Repeat marker -->
							<div class="sm-interval-card sm-repeat-card">
								<div class="sm-interval-top">
									<div class="sm-interval-type-badge sm-badge-gray">
										🔄 {$t('settings.repeat_marker')}
									</div>
									<div class="sm-interval-actions">
										<button class="sm-act-btn" on:click={() => moveIntervalUp(index)} disabled={index === 0} title={$t('settings.move_up')}>↑</button>
										<button class="sm-act-btn" on:click={() => moveIntervalDown(index)} disabled={index === localIntervals.length - 1} title={$t('settings.move_down')}>↓</button>
										<button class="sm-act-btn sm-act-danger" on:click={() => confirmDeleteInterval(index)} title={$t('settings.delete_interval')}>🗑️</button>
									</div>
								</div>
								<div class="sm-interval-body">
									<div class="sm-inline-field">
										<label class="hb-label" for="repeat-times-{index}">{$t('settings.repeat_times')}:</label>
										<select id="repeat-times-{index}" bind:value={interval.duration} class="hb-select sm-select-sm">
											{#each Array.from({length: 10}, (_, i) => i + 1) as num}
												<option value={num}>{num}</option>
											{/each}
										</select>
										<span class="sm-unit">{$t('settings.times')}</span>
									</div>
									<p class="sm-repeat-desc">{$t('settings.repeat_description', { duration: interval.duration })}</p>
								</div>
							</div>

						{:else if interval.type === 'weights'}
							<!-- Weights interval -->
							<div class="sm-interval-card" style="border-left-color:{getAccent(interval.color)}">
								<div class="sm-interval-top">
									<div class="sm-interval-type-badge" style="color:var(--accent-purple);background:rgba(168,85,247,0.12);">
										🏋️ {$t('intervals.weights')}
									</div>
									<div class="sm-interval-actions">
										<button class="sm-act-btn sm-act-copy" on:click={() => copyInterval(index)} title={$t('settings.copy_interval')}>📄</button>
										<button class="sm-act-btn" on:click={() => moveIntervalUp(index)} disabled={index === 0} title={$t('settings.move_up')}>↑</button>
										<button class="sm-act-btn" on:click={() => moveIntervalDown(index)} disabled={index === localIntervals.length - 1} title={$t('settings.move_down')}>↓</button>
										<button class="sm-act-btn sm-act-danger" on:click={() => confirmDeleteInterval(index)} title={$t('settings.delete_interval')}>🗑️</button>
									</div>
								</div>
								<div class="sm-interval-body">
									<input
										bind:value={interval.name}
										class="hb-input sm-name-input"
										placeholder={$t('settings.exercise_name')}
									/>
									<div class="sm-fields-row" style="margin-top:0.75rem;">
										<div>
											<label class="hb-label" for={generateIntervalId(index, 'sets')}>{$t('settings.number_of_sets')}</label>
											<input id={generateIntervalId(index, 'sets')} type="number" bind:value={interval.sets} min="1" max="20" placeholder="3" class="hb-input" />
										</div>
										<div>
											<label class="hb-label" for={generateIntervalId(index, 'restTime')}>{$t('settings.rest_seconds')}</label>
											<div class="hb-input-suffix-wrap">
												<input id={generateIntervalId(index, 'restTime')} type="number" bind:value={interval.restTime} min="10" max="600" placeholder="90" class="hb-input" />
												<span class="hb-input-suffix">s</span>
											</div>
										</div>
										<div>
											<label class="hb-label" for={generateIntervalId(index, 'color')}>{$t('settings.color')}</label>
											<select id={generateIntervalId(index, 'color')} bind:value={interval.color} class="hb-select">
												{#each colorOptions as c}<option value={c.value}>{c.name}</option>{/each}
											</select>
										</div>
									</div>
								</div>
							</div>

						{:else}
							<!-- Regular HIIT interval -->
							<div class="sm-interval-card" style="border-left-color:{getAccent(interval.color)}">
								<div class="sm-interval-top">
									<div class="sm-interval-dot" style="background:{getAccent(interval.color)};"></div>
									<div class="sm-interval-actions">
										<button class="sm-act-btn sm-act-copy" on:click={() => copyInterval(index)} title={$t('settings.copy_interval')}>📄</button>
										<button class="sm-act-btn" on:click={() => moveIntervalUp(index)} disabled={index === 0} title={$t('settings.move_up')}>↑</button>
										<button class="sm-act-btn" on:click={() => moveIntervalDown(index)} disabled={index === localIntervals.length - 1} title={$t('settings.move_down')}>↓</button>
										<button class="sm-act-btn sm-act-danger" on:click={() => confirmDeleteInterval(index)} title={$t('settings.delete_interval')}>🗑️</button>
									</div>
								</div>
								<div class="sm-interval-body">
									<input
										bind:value={interval.name}
										class="hb-input sm-name-input"
										placeholder={$t('settings.interval_name')}
									/>
									<!-- Prep / Rest mini-fields -->
									<div class="sm-prep-rest-row">
										<div class="sm-mini-field">
											<label class="hb-label" style="color:var(--accent-yellow);" for={generateIntervalId(index, 'prepDuration')}>{$t('settings.prep_short')}</label>
											<div class="hb-input-suffix-wrap">
												<input id={generateIntervalId(index, 'prepDuration')} type="number" bind:value={interval.prepDuration} min="0" placeholder="0" class="hb-input hb-input-sm" />
												<span class="hb-input-suffix">s</span>
											</div>
										</div>
										<div class="sm-mini-field">
											<label class="hb-label" style="color:var(--accent-blue);" for={generateIntervalId(index, 'restDuration')}>{$t('settings.rest_short')}</label>
											<div class="hb-input-suffix-wrap">
												<input id={generateIntervalId(index, 'restDuration')} type="number" bind:value={interval.restDuration} min="0" placeholder="0" class="hb-input hb-input-sm" />
												<span class="hb-input-suffix">s</span>
											</div>
										</div>
									</div>
									<!-- Duration + Color -->
									<div class="sm-fields-row" style="margin-top:0.5rem;">
										<div>
											<label class="hb-label" for={generateIntervalId(index, 'duration')}>{$t('settings.duration_seconds')}</label>
											<div class="hb-input-suffix-wrap">
												<input id={generateIntervalId(index, 'duration')} type="number" bind:value={interval.duration} min="1" placeholder="30" class="hb-input" />
												<span class="hb-input-suffix">s</span>
											</div>
										</div>
										<div>
											<label class="hb-label" for={generateIntervalId(index, 'color')}>{$t('settings.color')}</label>
											<select id={generateIntervalId(index, 'color')} bind:value={interval.color} class="hb-select">
												{#each colorOptions as c}<option value={c.value}>{c.name}</option>{/each}
											</select>
										</div>
									</div>
								</div>
							</div>
						{/if}

					{/each}
				</div>

				<!-- Add buttons row -->
				<div class="sm-add-btns">
					<button class="sm-add-btn" on:click={addInterval}>
						<span>📝</span>
						{$t('settings.add_interval')}
					</button>
					<button class="sm-add-btn" on:click={addWeightsInterval}>
						<span>🏋️</span>
						{$t('settings.add_weights_interval')}
					</button>
					<button class="sm-add-btn sm-add-btn-dashed" on:click={addRepeatMarker}>
						<span>🔄</span>
						{$t('settings.add_repeat_marker')}
					</button>
				</div>
			</div>

		</div><!-- end sm-body -->

		<!-- Sticky footer -->
		<div class="sm-footer">
			<div class="sm-footer-actions">
				<button
					class="hb-btn hb-btn-primary"
					style="flex:1; background:var(--accent-blue); box-shadow:0 4px 14px rgba(59,130,246,0.35);"
					on:click={saveConfiguration}
					disabled={localIntervals.length === 0}
				>
					✅ {$t('settings.save_configuration')}
				</button>
				<button
					class="hb-btn hb-btn-primary"
					style="flex:1; background:var(--accent-purple); box-shadow:0 4px 14px rgba(168,85,247,0.35);"
					on:click={saveAsRoutine}
					disabled={localIntervals.length === 0}
				>
					💾 {$t('settings.save_as_routine')}
				</button>
			</div>
			<button class="hb-btn hb-btn-secondary" on:click={cancelConfiguration} style="margin-top:0.5rem;">
				{$t('common.cancel')}
			</button>
		</div>

	</div>
</div>

<!-- Delete confirmation modal -->
{#if intervalToDeleteIndex !== null}
	<div class="hb-modal-backdrop" style="z-index:300;">
		<div class="hb-modal" style="text-align:center;">
			<div class="sm-del-icon-wrap">🗑️</div>
			<h3 style="font-size:1.2rem;font-weight:800;margin-bottom:0.5rem;">{$t('settings.confirm_delete_interval')}</h3>
			<p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:1.5rem;">{$t('settings.confirm_delete_interval_message')}</p>
			<div style="display:flex;flex-direction:column;gap:0.75rem;">
				<button class="hb-btn" style="width:100%;padding:0.9rem;background:var(--accent-red);color:#fff;border-radius:var(--radius-btn);font-weight:700;" on:click={executeDeleteInterval}>
					{$t('common.delete')}
				</button>
				<button class="hb-btn hb-btn-secondary" on:click={cancelDeleteInterval}>
					{$t('common.cancel')}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
/* ── Backdrop + Panel ── */
.sm-backdrop {
	position: fixed; inset: 0;
	background: rgba(0,0,0,0.8);
	backdrop-filter: blur(10px);
	display: flex; align-items: flex-start; justify-content: center;
	z-index: 200;
	padding: 0;
}
.sm-panel {
	background: var(--bg-app);
	width: 100%; max-width: 520px;
	height: 100vh;
	display: flex; flex-direction: column;
	overflow: hidden;
}

/* ── Header ── */
.sm-header {
	display: flex; align-items: center; justify-content: space-between;
	padding: 0.875rem 1.25rem;
	background: rgba(11,17,32,0.95);
	border-bottom: 1px solid var(--border-card);
	flex-shrink: 0;
	position: sticky; top: 0; z-index: 10;
}
.sm-header-left { display: flex; align-items: center; gap: 0.6rem; }
.sm-logo { width: 26px; height: 26px; object-fit: contain; }
.sm-title { font-size: 1.05rem; font-weight: 800; color: var(--text-primary); }
.sm-header-right { display: flex; align-items: center; gap: 0.4rem; }
.sm-icon-btn {
	width: 34px; height: 34px;
	background: var(--bg-card-alt); border: 1px solid var(--border-card);
	border-radius: var(--radius-sm);
	display: flex; align-items: center; justify-content: center;
	font-size: 0.95rem; cursor: pointer; color: var(--text-secondary);
	transition: all 0.2s;
}
.sm-icon-btn:hover { background: rgba(255,255,255,0.08); color: var(--text-primary); }
.sm-close-btn { font-size: 0.8rem; font-weight: 700; }
.sm-close-btn:hover { color: var(--accent-red); }

/* ── Body (scrollable) ── */
.sm-body {
	flex: 1; overflow-y: auto;
	padding: 1.1rem 1.25rem;
	display: flex; flex-direction: column; gap: 0.75rem;
}
.sm-body::-webkit-scrollbar { width: 4px; }
.sm-body::-webkit-scrollbar-track { background: transparent; }
.sm-body::-webkit-scrollbar-thumb { background: var(--border-card); border-radius: 2px; }

/* ── Section cards (name, reps) ── */
.sm-section-card {
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-radius: var(--radius-card);
	padding: 1rem 1.1rem;
	position: relative; overflow: hidden;
}
.sm-accent-blue   { border-left: 4px solid var(--accent-blue); }
.sm-accent-blue::before   { content:''; position:absolute; inset:0; background:linear-gradient(90deg, rgba(59,130,246,0.1) 0%, transparent 40%); pointer-events:none; }
.sm-accent-purple { border-left: 4px solid var(--accent-purple); }
.sm-accent-purple::before { content:''; position:absolute; inset:0; background:linear-gradient(90deg, rgba(168,85,247,0.1) 0%, transparent 40%); pointer-events:none; }
.sm-help { font-size: 0.73rem; color: var(--text-secondary); margin-top: 0.15rem; }

/* ── Intervals section ── */
.sm-intervals-section { display: flex; flex-direction: column; gap: 0.75rem; }

/* ── Interval card ── */
.sm-interval-card {
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-left-width: 4px;
	border-radius: var(--radius-card);
	overflow: hidden;
	position: relative;
}
.sm-repeat-card {
	border-left-color: var(--text-muted);
	border-style: solid;
	border-width: 1px 1px 1px 4px;
	border-color: var(--border-card) var(--border-card) var(--border-card) var(--text-muted);
}

.sm-interval-top {
	display: flex; align-items: center; justify-content: space-between;
	padding: 0.6rem 0.875rem;
	border-bottom: 1px solid var(--border-card);
	background: rgba(255,255,255,0.02);
}
.sm-interval-type-badge {
	font-size: 0.7rem; font-weight: 700;
	padding: 0.2rem 0.55rem; border-radius: 6px;
	letter-spacing: 0.04em;
}
.sm-badge-gray { background: rgba(100,116,139,0.15); color: var(--text-secondary); }

.sm-interval-dot {
	width: 8px; height: 8px; border-radius: 50%;
	flex-shrink: 0;
}

.sm-interval-actions {
	display: flex; gap: 0.3rem; align-items: center;
}
.sm-act-btn {
	height: 28px; min-width: 28px; padding: 0 0.4rem;
	border-radius: 6px; border: none; cursor: pointer;
	background: var(--bg-card-alt); color: var(--text-secondary);
	font-size: 0.78rem; font-weight: 600;
	transition: all 0.15s; display: flex; align-items: center; justify-content: center;
}
.sm-act-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }
.sm-act-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.sm-act-danger:hover { background: rgba(239,68,68,0.15); color: var(--accent-red); }
.sm-act-copy:hover  { background: rgba(59,130,246,0.12); color: var(--accent-blue); }

/* ── Interval body ── */
.sm-interval-body { padding: 0.875rem; }
.sm-name-input {
	background: var(--bg-input);
	border: 1.5px solid var(--border-input);
	border-radius: var(--radius-input);
	padding: 0.6rem 0.875rem;
	font-size: 0.95rem; font-weight: 600;
	color: var(--text-input);
	width: 100%; outline: none;
	transition: border-color 0.2s, box-shadow 0.2s;
	font-family: 'Inter', sans-serif;
}
.sm-name-input:focus {
	border-color: var(--accent-green);
	box-shadow: 0 0 0 3px var(--accent-green-glow);
}
.sm-name-input::placeholder { color: #94a3b8; font-weight: 400; }

.sm-prep-rest-row {
	display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;
	margin-top: 0.6rem;
}
.sm-mini-field {}
.hb-input-sm { padding: 0.55rem 2rem 0.55rem 0.75rem; font-size: 0.85rem; }

.sm-fields-row {
	display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;
}

/* Repeat inline fields */
.sm-inline-field {
	display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
}
.sm-select-sm { width: auto; min-width: 80px; padding: 0.5rem 2rem 0.5rem 0.75rem; }
.sm-unit { font-size: 0.8rem; color: var(--text-secondary); }
.sm-repeat-desc {
	font-size: 0.78rem; color: var(--text-secondary);
	margin-top: 0.5rem; line-height: 1.4;
}

/* ── Empty state ── */
.sm-empty {
	background: var(--bg-card);
	border: 2px dashed var(--border-card);
	border-radius: var(--radius-card);
	padding: 2.5rem 1.5rem; text-align: center;
}
.sm-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.sm-empty-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem; }
.sm-empty-msg   { font-size: 0.8rem; color: var(--text-secondary); }

/* ── Add buttons ── */
.sm-add-btns {
	display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;
	margin-top: 0.25rem;
}
.sm-add-btn {
	display: flex; flex-direction: column; align-items: center; justify-content: center;
	gap: 0.3rem;
	padding: 0.75rem 0.5rem;
	background: var(--bg-card); border: 1px solid var(--border-card);
	border-radius: var(--radius-btn); cursor: pointer;
	font-size: 0.7rem; font-weight: 600; color: var(--text-secondary);
	font-family: 'Inter', sans-serif; text-align: center; line-height: 1.3;
	transition: all 0.2s;
}
.sm-add-btn span { font-size: 1.1rem; }
.sm-add-btn:hover { border-color: var(--accent-green); color: var(--accent-green); background: rgba(34,197,94,0.06); }
.sm-add-btn-dashed { border-style: dashed; }

/* ── Footer ── */
.sm-footer {
	padding: 0.875rem 1.25rem 1.1rem;
	background: rgba(11,17,32,0.95);
	border-top: 1px solid var(--border-card);
	flex-shrink: 0;
}
.sm-footer-actions { display: flex; gap: 0.6rem; }

/* ── Delete modal ── */
.sm-del-icon-wrap {
	width: 56px; height: 56px;
	background: rgba(239,68,68,0.1);
	border-radius: 50%;
	display: flex; align-items: center; justify-content: center;
	font-size: 1.75rem; margin: 0 auto 1rem;
}
</style>
