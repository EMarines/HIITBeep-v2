<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { t } from '$lib/i18n';

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    }

    const dispatch = createEventDispatcher();

    export let repetitions: number;
    export let intervals: Array<{
        name: string;
        duration: number;
        color: string;
        type?: 'interval' | 'repeat' | 'weights';
        sets?: number;
        restTime?: number;
        prepDuration?: number;
        restDuration?: number;
    }>;
    export let routineName: string = '';

    function openSettings()  { dispatch('open-settings'); }
    function goToDashboard() { dispatch('go-dashboard'); }
    function startWorkout() {
        if (intervals.length === 0) return;
        dispatch('start-workout');
    }

    function getRepeatStartIndex(repeatIndex: number): number {
        const repeatInterval = intervals[repeatIndex];
        if (!repeatInterval || repeatInterval.type !== 'repeat') return -1;
        let previousRepeatIndex = -1;
        for (let i = repeatIndex - 1; i >= 0; i--) {
            if (intervals[i].type === 'repeat') { previousRepeatIndex = i; break; }
        }
        const startFrom = previousRepeatIndex >= 0 ? previousRepeatIndex + 1 : 0;
        for (let i = startFrom; i < repeatIndex; i++) {
            if (intervals[i].type !== 'repeat') return i;
        }
        return -1;
    }

    const colorAccentMap: Record<string, string> = {
        'bg-yellow-500': 'var(--accent-yellow)',
        'bg-red-500':    'var(--accent-red)',
        'bg-blue-500':   'var(--accent-blue)',
        'bg-green-500':  'var(--accent-green)',
        'bg-purple-500': 'var(--accent-purple)',
        'bg-pink-500':   '#ec4899',
        'bg-orange-500': 'var(--accent-orange)',
    };

    function getAccent(color: string): string {
        return colorAccentMap[color] ?? 'var(--accent-green)';
    }

    function totalDuration() {
        return intervals.reduce((acc, interval) => {
            if (interval.type === 'repeat') return acc + 2;
            if (interval.type === 'weights') return acc + ((interval.restTime || 0) * ((interval.sets || 1) - 1));
            return acc + (interval.duration || 0) + (interval.prepDuration || 0) + (interval.restDuration || 0);
        }, 0);
    }
</script>

<div class="ms-root">
    <!-- Top bar with logo & nav -->
    <header class="ms-top-bar">
        <div class="ms-top-inner">
            <div class="ms-logo-area">
                <img src="/logo.png" alt="HIITBeep" class="ms-logo" />
                <h1 class="ms-app-title">{$t('app.title')}</h1>
            </div>
            <div class="ms-top-actions">
                <button class="ms-action-btn ms-btn-blue" on:click={openSettings}>
                    <span>✏️</span>
                    <span>{$t('main.edit_routine')}</span>
                </button>
                <button class="ms-action-btn ms-btn-ghost" on:click={goToDashboard}>
                    <span>🏠</span>
                    <span>{$t('main.main_menu')}</span>
                </button>
            </div>
        </div>
    </header>

    <div class="ms-content">

        <!-- Routine Name Banner -->
        {#if routineName}
            <div class="ms-routine-banner">
                <span class="ms-banner-icon">📋</span>
                <div>
                    <p class="ms-banner-label">{$t('main.current_routine')}</p>
                    <p class="ms-banner-name">{routineName}</p>
                </div>
            </div>
        {/if}

        <!-- Repetitions info card -->
        <div class="ms-reps-card">
            <div class="ms-reps-label">Repeticiones</div>
            <div class="ms-reps-value">
                {repetitions}
                <span class="ms-reps-unit">{repetitions === 1 ? $t('main.repetition') : $t('main.repetitions_plural')}</span>
            </div>
        </div>

        <!-- Intervals list -->
        <div class="ms-section-label">{$t('main.intervals_configured')}</div>

        <div class="ms-intervals-list">
            {#each intervals as interval, index}
                {#if interval.type === 'repeat'}
                    <!-- Repeat marker -->
                    <div class="ms-repeat-card">
                        <div class="ms-repeat-inner">
                            <span class="ms-repeat-icon">🔄</span>
                            <div>
                                <p class="ms-repeat-name">{interval.name}</p>
                                <p class="ms-repeat-sub">{$t('main.repeat_times', { times: interval.duration })}</p>
                            </div>
                            <!-- Yellow L arrow (exit) -->
                            <div class="repeat-arrow-exit">
                                <svg width="28" height="28" viewBox="0 0 28 28">
                                    <line x1="28" y1="14" x2="8" y2="14" stroke="#facc15" stroke-width="2"/>
                                    <line x1="8" y1="14" x2="8" y2="3" stroke="#facc15" stroke-width="2"/>
                                    <polygon points="8,3 4,9 12,9" fill="#facc15"/>
                                    <text x="14" y="11" font-size="9" font-weight="700" fill="#facc15">{interval.duration}</text>
                                </svg>
                            </div>
                        </div>
                    </div>

                {:else if interval.type === 'weights'}
                    <!-- Weights interval -->
                    <div class="ms-interval-card" style="border-left-color:{getAccent(interval.color)}">
                        <div class="ms-interval-inner">
                            <div class="ms-interval-header">
                                <span class="ms-interval-badge" style="background:rgba(168,85,247,0.15);">🏋️</span>
                                <div>
                                    <p class="ms-interval-name">{interval.name}</p>
                                    <p class="ms-interval-meta">{interval.sets} {$t('intervals.series')} • {formatTime(interval.restTime || 0)} {$t('intervals.rest_time')}</p>
                                </div>
                                <span class="ms-interval-index">{index + 1}</span>
                            </div>
                        </div>
                        {#each intervals as checkInterval, checkIndex}
                            {#if checkInterval.type === 'repeat' && getRepeatStartIndex(checkIndex) === index}
                                <div class="arrow-entry">
                                    <svg width="28" height="28" viewBox="0 0 28 28">
                                        <line x1="8" y1="28" x2="8" y2="14" stroke="#facc15" stroke-width="2"/>
                                        <line x1="8" y1="14" x2="28" y2="14" stroke="#facc15" stroke-width="2"/>
                                        <polygon points="28,14 22,10 22,18" fill="#facc15"/>
                                    </svg>
                                </div>
                            {/if}
                        {/each}
                        {#if index === 0 && repetitions > 1}
                            <div class="arrow-global-entry">
                                <svg width="28" height="28" viewBox="0 0 28 28">
                                    <line x1="20" y1="28" x2="20" y2="14" stroke="#a855f7" stroke-width="2"/>
                                    <line x1="20" y1="14" x2="0" y2="14" stroke="#a855f7" stroke-width="2"/>
                                    <polygon points="0,14 6,10 6,18" fill="#a855f7"/>
                                </svg>
                            </div>
                        {/if}
                        {#if index === intervals.length - 1 && repetitions > 1}
                            <div class="arrow-global-exit">
                                <svg width="28" height="28" viewBox="0 0 28 28">
                                    <line x1="0" y1="14" x2="20" y2="14" stroke="#a855f7" stroke-width="2"/>
                                    <line x1="20" y1="14" x2="20" y2="3" stroke="#a855f7" stroke-width="2"/>
                                    <polygon points="20,3 16,9 24,9" fill="#a855f7"/>
                                    <text x="4" y="11" font-size="9" font-weight="700" fill="#a855f7">{repetitions}</text>
                                </svg>
                            </div>
                        {/if}
                    </div>

                {:else}
                    <!-- Regular interval -->
                    <div class="ms-interval-card" style="border-left-color:{getAccent(interval.color)}">
                        <div class="ms-interval-inner">
                            <div class="ms-interval-header">
                                <div class="ms-interval-dot" style="background:{getAccent(interval.color)};"></div>
                                <p class="ms-interval-name">{interval.name}</p>
                                <span class="ms-interval-index">{index + 1}</span>
                            </div>
                            <!-- Time blocks -->
                            <div class="hb-time-blocks">
                                {#if interval.prepDuration && interval.prepDuration > 0}
                                    <div class="hb-time-block">
                                        <span class="hb-time-label hb-time-label-prep">PREP</span>
                                        <span class="hb-time-value">{formatTime(interval.prepDuration)}</span>
                                    </div>
                                {/if}
                                <div class="hb-time-block hb-time-block-active">
                                    <span class="hb-time-label hb-time-label-work">WORK</span>
                                    <span class="hb-time-value">{formatTime(interval.duration)}</span>
                                </div>
                                {#if interval.restDuration && interval.restDuration > 0}
                                    <div class="hb-time-block">
                                        <span class="hb-time-label hb-time-label-rest">REST</span>
                                        <span class="hb-time-value">{formatTime(interval.restDuration)}</span>
                                    </div>
                                {/if}
                            </div>
                        </div>
                        {#each intervals as checkInterval, checkIndex}
                            {#if checkInterval.type === 'repeat' && getRepeatStartIndex(checkIndex) === index}
                                <div class="arrow-entry">
                                    <svg width="28" height="28" viewBox="0 0 28 28">
                                        <line x1="8" y1="28" x2="8" y2="14" stroke="#facc15" stroke-width="2"/>
                                        <line x1="8" y1="14" x2="28" y2="14" stroke="#facc15" stroke-width="2"/>
                                        <polygon points="28,14 22,10 22,18" fill="#facc15"/>
                                    </svg>
                                </div>
                            {/if}
                        {/each}
                        {#if index === 0 && repetitions > 1}
                            <div class="arrow-global-entry">
                                <svg width="28" height="28" viewBox="0 0 28 28">
                                    <line x1="20" y1="28" x2="20" y2="14" stroke="#a855f7" stroke-width="2"/>
                                    <line x1="20" y1="14" x2="0" y2="14" stroke="#a855f7" stroke-width="2"/>
                                    <polygon points="0,14 6,10 6,18" fill="#a855f7"/>
                                </svg>
                            </div>
                        {/if}
                        {#if index === intervals.length - 1 && repetitions > 1}
                            <div class="arrow-global-exit">
                                <svg width="28" height="28" viewBox="0 0 28 28">
                                    <line x1="0" y1="14" x2="20" y2="14" stroke="#a855f7" stroke-width="2"/>
                                    <line x1="20" y1="14" x2="20" y2="3" stroke="#a855f7" stroke-width="2"/>
                                    <polygon points="20,3 16,9 24,9" fill="#a855f7"/>
                                    <text x="4" y="11" font-size="9" font-weight="700" fill="#a855f7">{repetitions}</text>
                                </svg>
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}

            {#if intervals.length === 0}
                <div class="ms-empty-state">
                    <p class="ms-empty-text">{$t('main.no_intervals')}</p>
                    <p class="ms-empty-hint">{$t('main.use_settings')}</p>
                </div>
            {/if}
        </div>

        <!-- Duration info -->
        {#if intervals.length > 0}
            <div class="ms-duration-info">
                <div class="ms-dur-item">
                    <span class="ms-dur-label">{$t('main.total_duration')}</span>
                    <span class="ms-dur-value">{formatTime(totalDuration())}</span>
                </div>
                <div class="ms-dur-sep"></div>
                <div class="ms-dur-item">
                    <span class="ms-dur-label">{$t('main.estimated_time')}</span>
                    <span class="ms-dur-value">{formatTime(totalDuration() * repetitions)}</span>
                </div>
            </div>
        {/if}

        <!-- Start button -->
        <button
            class="hb-btn hb-btn-primary"
            style="margin-top:1rem;"
            on:click={startWorkout}
            disabled={intervals.length === 0}
        >
            {intervals.length === 0 ? $t('main.configure_intervals') : $t('main.start_routine')}
        </button>
    </div>
</div>

<style>
.ms-root {
    min-height: 100vh;
    background: var(--bg-app);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
}

/* Top bar */
.ms-top-bar {
    position: sticky; top: 0; z-index: 50;
    background: rgba(11,17,32,0.88);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--border-card);
}
.ms-top-inner {
    max-width: 520px; margin: 0 auto;
    padding: 0.75rem 1.25rem;
    display: flex; align-items: center; justify-content: space-between;
    gap: 0.75rem;
}
.ms-logo-area { display: flex; align-items: center; gap: 0.6rem; }
.ms-logo { width: 30px; height: 30px; object-fit: contain; }
.ms-app-title { font-size: 1rem; font-weight: 800; color: var(--text-primary); }
.ms-top-actions { display: flex; gap: 0.5rem; }
.ms-action-btn {
    display: flex; align-items: center; gap: 0.35rem;
    padding: 0.45rem 0.85rem;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 0.78rem; font-weight: 600;
    border: none; cursor: pointer; transition: all 0.2s;
}
.ms-btn-blue  { background: var(--accent-blue); color: #fff; }
.ms-btn-blue:hover { background: #2563eb; }
.ms-btn-ghost { background: var(--bg-card-alt); color: var(--text-secondary); border: 1px solid var(--border-card); }
.ms-btn-ghost:hover { color: var(--text-primary); }

/* Content */
.ms-content {
    max-width: 520px; margin: 0 auto;
    padding: 1.25rem 1.25rem 5rem;
}

/* Routine banner */
.ms-routine-banner {
    display: flex; align-items: center; gap: 0.75rem;
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-left: 4px solid var(--accent-blue);
    border-radius: var(--radius-card);
    padding: 0.875rem 1.1rem;
    margin-bottom: 1rem;
}
.ms-banner-icon { font-size: 1.2rem; }
.ms-banner-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent-blue); }
.ms-banner-name  { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-top: 0.1rem; }

/* Reps card */
.ms-reps-card {
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-left: 4px solid var(--accent-purple);
    border-radius: var(--radius-card);
    padding: 1rem 1.1rem;
    margin-bottom: 1rem;
    position: relative;
}
.ms-reps-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(168,85,247,0.1) 0%, transparent 40%);
    pointer-events: none;
    border-radius: var(--radius-card);
}
.ms-reps-label {
    font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--accent-purple); margin-bottom: 0.3rem;
}
.ms-reps-value {
    font-size: 1.75rem; font-weight: 800;
    color: var(--text-primary); line-height: 1;
}
.ms-reps-unit { font-size: 0.875rem; font-weight: 400; color: var(--text-secondary); margin-left: 0.4rem; }

/* Section label */
.ms-section-label {
    font-size: 0.65rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-label); margin-bottom: 0.75rem;
}

/* Intervals list */
.ms-intervals-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }

/* Regular interval card */
.ms-interval-card {
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-radius: var(--radius-card);
    border-left-width: 4px;
    position: relative;
    overflow: visible;
}
.ms-interval-inner { padding: 0.9rem 1rem 1rem; }
.ms-interval-header {
    display: flex; align-items: center; gap: 0.6rem;
    margin-bottom: 0.25rem;
}
.ms-interval-dot {
    width: 8px; height: 8px;
    border-radius: 50%; flex-shrink: 0;
}
.ms-interval-name {
    flex: 1; font-size: 0.95rem; font-weight: 700;
    color: var(--text-primary);
}
.ms-interval-meta { font-size: 0.78rem; color: var(--text-secondary); }
.ms-interval-badge {
    width: 30px; height: 30px;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; flex-shrink: 0;
}
.ms-interval-index {
    font-size: 0.75rem; font-weight: 700;
    color: var(--text-muted); flex-shrink: 0;
}

/* Repeat card */
.ms-repeat-card {
    background: var(--bg-card-alt);
    border: 2px dashed var(--border-card);
    border-radius: var(--radius-card);
    position: relative; overflow: visible;
}
.ms-repeat-inner {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.875rem 1rem; position: relative;
}
.ms-repeat-icon { font-size: 1.2rem; flex-shrink: 0; }
.ms-repeat-name { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
.ms-repeat-sub  { font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.1rem; }

/* Arrows */
.repeat-arrow-exit {
    position: absolute; left: -2.25rem; top: 50%;
    transform: translateY(-50%); pointer-events: none;
}
.arrow-entry {
    position: absolute; left: -2.25rem; top: 50%;
    transform: translateY(-50%); pointer-events: none;
}
.arrow-global-entry {
    position: absolute; right: -2.25rem; top: 50%;
    transform: translateY(-50%); pointer-events: none;
}
.arrow-global-exit {
    position: absolute; right: -2.25rem; top: 50%;
    transform: translateY(-50%); pointer-events: none;
}

/* Empty state */
.ms-empty-state {
    background: var(--bg-card);
    border: 1px dashed var(--border-card);
    border-radius: var(--radius-card);
    padding: 2rem; text-align: center;
}
.ms-empty-text { font-size: 0.9rem; color: var(--text-secondary); }
.ms-empty-hint { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.35rem; }

/* Duration info */
.ms-duration-info {
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    border-radius: var(--radius-card);
    padding: 0.875rem 1.1rem;
    display: flex; align-items: center; gap: 1rem;
    margin-top: 0.25rem;
}
.ms-dur-item { display: flex; flex-direction: column; gap: 0.15rem; }
.ms-dur-label { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-label); }
.ms-dur-value { font-size: 1rem; font-weight: 700; color: var(--accent-green); }
.ms-dur-sep { width: 1px; height: 2.5rem; background: var(--border-card); }
</style>