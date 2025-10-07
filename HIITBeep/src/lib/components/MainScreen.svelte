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
    }>;
    export let routineName: string = '';    
    
    function openSettings() {
        dispatch('open-settings');
    }
    
    function goToDashboard() {
        dispatch('go-dashboard');
    }
    
    function startWorkout() {
        if (intervals.length === 0) return;
        dispatch('start-workout');
    }
    
    // Encontrar el índice del primer intervalo después de cada marcador "repeat"
    function getFirstIntervalAfterRepeat(repeatIndex: number): number {
        return repeatIndex + 1;
    }
    
    // Calcular el índice del nodo donde debe apuntar la flecha amarilla de ENTRADA
    // Este es el nodo donde COMIENZA la repetición (el PRIMER intervalo no-repeat después del marcador repeat anterior)
    function getRepeatStartIndex(repeatIndex: number): number {
        const repeatInterval = intervals[repeatIndex];
        if (!repeatInterval || repeatInterval.type !== 'repeat') return -1;
        
        // Encontrar el marcador repeat anterior (si existe)
        let previousRepeatIndex = -1;
        for (let i = repeatIndex - 1; i >= 0; i--) {
            if (intervals[i].type === 'repeat') {
                previousRepeatIndex = i;
                break;
            }
        }
        
        // Buscar desde después del marcador anterior (o desde el inicio si no hay anterior)
        const startFrom = previousRepeatIndex >= 0 ? previousRepeatIndex + 1 : 0;
        
        // Buscar el PRIMER intervalo válido (no-repeat) desde startFrom hasta el marcador actual
        for (let i = startFrom; i < repeatIndex; i++) {
            if (intervals[i].type !== 'repeat') {
                return i; // Retornar el índice del PRIMER intervalo no-repeat en esta sección
            }
        }
        return -1; // No se encontró
    }
</script>

<style>
    /* Flecha amarilla desde marcador repeat hacia primer intervalo */
    .repeat-arrow {
        position: absolute;
        left: -4rem;
        top: 50%;
        width: 3.75rem;
        pointer-events: none;
        z-index: 10;
    }
    
    /* Flecha morada desde último intervalo hacia primer intervalo (repeticiones globales) */
    .global-repeat-arrow {
        position: absolute;
        right: -5rem;
        top: 50%;
        width: 3.75rem;
        pointer-events: none;
    }
</style>

<div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-900 text-white">
    <div class="max-w-md w-full">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-4xl font-bold" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">{$t('app.title')}</h1>
        </div>
        
        <!-- Botones de navegación -->
        <div class="flex gap-3 mb-6">
            <button 
                on:click={openSettings}
                class="flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
                style="background: linear-gradient(to right, #2563eb, #1d4ed8);"
            >
                <span>✏️</span>
                <span>{$t('main.edit_routine')}</span>
            </button>
            <button 
                on:click={goToDashboard}
                class="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
            >
                <span>🏠</span>
                <span>{$t('main.main_menu')}</span>
            </button>
        </div>
        
        {#if routineName}
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 mb-6 shadow-lg">
                <div class="flex items-center gap-2">
                    <span class="text-xl">📋</span>
                    <div class="flex-1">
                        <p class="text-xs text-blue-200 uppercase tracking-wider">{$t('main.current_routine')}</p>
                        <p class="text-lg font-semibold text-white" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">{routineName}</p>
                    </div>
                </div>
            </div>
        {/if}
        
        <div class="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500 mb-6">
            <h2 class="text-lg font-medium mb-2" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">{$t('main.repetitions')}</h2>
            <p class="text-3xl font-light text-purple-400" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">
                {repetitions} {repetitions === 1 ? $t('main.repetition') : $t('main.repetitions_plural')}
            </p>
        </div>
        
        <div class="space-y-3 mb-8 overflow-visible relative">
            <h3 class="text-lg font-medium text-gray-300 mb-4" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">{$t('main.intervals_configured')}</h3>
            
            {#each intervals as interval, index}
                {#if interval.type === 'repeat'}
                    <div class="relative bg-gray-700 rounded-lg p-3 border-2 border-gray-600 flex items-center justify-between min-h-[72px]">
                        <div>
                            <p class="font-medium text-gray-200" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">🔄 {interval.name}</p>
                            <p class="text-sm text-gray-300" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">{$t('main.repeat_times', { times: interval.duration })}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-light text-gray-300" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">🔄</p>
                        </div>
                        
                        <!-- Flecha amarilla SALIDA: L hacia arriba desde lado izquierdo -->
                        <div style="position: absolute; left: -2.5rem; top: 50%; transform: translateY(-50%); pointer-events: none;">
                            <svg width="32" height="32" viewBox="0 0 32 32">
                                <line x1="32" y1="16" x2="10" y2="16" stroke="#facc15" stroke-width="2" />
                                <line x1="10" y1="16" x2="10" y2="4" stroke="#facc15" stroke-width="2" />
                                <polygon points="10,4 6,10 14,10" fill="#facc15" />
                                <text x="16" y="12" class="text-[10px] font-bold" fill="#facc15">{interval.duration}</text>
                            </svg>
                        </div>
                    </div>
                {:else if interval.type === 'weights'}
                    <div class="relative bg-gray-800 rounded-lg p-3 border-l-4 {interval.color} flex items-center justify-between min-h-[72px]">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-purple-400">🏋️</span>
                                <p class="font-medium text-white" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">{interval.name}</p>
                            </div>
                            <p class="text-sm text-gray-400" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">
                                {interval.sets} {$t('intervals.series')} • {formatTime(interval.restTime || 0)} {$t('intervals.rest_time')}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-light text-white" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">{index + 1}</p>
                        </div>
                        
                        <!-- Flecha amarilla ENTRADA: si este nodo es el inicio de una repetición -->
                        {#each intervals as checkInterval, checkIndex}
                            {#if checkInterval.type === 'repeat' && getRepeatStartIndex(checkIndex) === index}
                                <div style="position: absolute; left: -2.5rem; top: 50%; transform: translateY(-50%); pointer-events: none;">
                                    <svg width="32" height="32" viewBox="0 0 32 32">
                                        <line x1="10" y1="28" x2="10" y2="16" stroke="#facc15" stroke-width="2" />
                                        <line x1="10" y1="16" x2="32" y2="16" stroke="#facc15" stroke-width="2" />
                                        <polygon points="32,16 26,12 26,20" fill="#facc15" />
                                    </svg>
                                </div>
                            {/if}
                        {/each}
                        
                        <!-- Flecha morada ENTRADA: si es el primer nodo y hay repeticiones globales -->
                        {#if index === 0 && repetitions > 1}
                            <div style="position: absolute; right: -2.5rem; top: 50%; transform: translateY(-50%); pointer-events: none;">
                                <svg width="32" height="32" viewBox="0 0 32 32" class="text-purple-400">
                                    <line x1="22" y1="28" x2="22" y2="16" stroke="currentColor" stroke-width="2" />
                                    <line x1="22" y1="16" x2="0" y2="16" stroke="currentColor" stroke-width="2" />
                                    <polygon points="0,16 6,12 6,20" fill="currentColor" />
                                </svg>
                            </div>
                        {/if}

                        <!-- Flecha morada SALIDA: si es el último nodo y hay repeticiones globales -->
                        {#if index === intervals.length - 1 && repetitions > 1}
                            <div style="position: absolute; right: -2.5rem; top: 50%; transform: translateY(-50%); pointer-events: none;">
                                <svg width="32" height="32" viewBox="0 0 32 32">
                                    <line x1="0" y1="16" x2="22" y2="16" stroke="#a78bfa" stroke-width="2" />
                                    <line x1="22" y1="16" x2="22" y2="4" stroke="#a78bfa" stroke-width="2" />
                                    <polygon points="22,4 18,10 26,10" fill="#a78bfa" />
                                    <text x="8" y="12" class="text-[10px] font-bold" fill="#a78bfa">{repetitions}</text>
                                </svg>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="relative bg-gray-800 rounded-lg p-3 border-l-4 {interval.color} flex items-center justify-between min-h-[72px]">
                        <div>
                            <p class="font-medium text-white" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);">{interval.name}</p>
                            <p class="text-sm text-gray-400" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">{$t('timer.duration')} {formatTime(interval.duration)}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-light text-white" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);">{index + 1}</p>
                        </div>
                        
                        <!-- Flecha amarilla ENTRADA: si este nodo es el inicio de una repetición -->
                        {#each intervals as checkInterval, checkIndex}
                            {#if checkInterval.type === 'repeat' && getRepeatStartIndex(checkIndex) === index}
                                <div style="position: absolute; left: -2.5rem; top: 50%; transform: translateY(-50%); pointer-events: none;">
                                    <svg width="32" height="32" viewBox="0 0 32 32">
                                        <line x1="10" y1="28" x2="10" y2="16" stroke="#facc15" stroke-width="2" />
                                        <line x1="10" y1="16" x2="32" y2="16" stroke="#facc15" stroke-width="2" />
                                        <polygon points="32,16 26,12 26,20" fill="#facc15" />
                                    </svg>
                                </div>
                            {/if}
                        {/each}
                        
                        <!-- Flecha morada ENTRADA: si es el primer nodo y hay repeticiones globales -->
                        {#if index === 0 && repetitions > 1}
                            <div style="position: absolute; right: -2.5rem; top: 50%; transform: translateY(-50%); pointer-events: none;">
                                <svg width="32" height="32" viewBox="0 0 32 32" class="text-purple-400">
                                    <line x1="22" y1="28" x2="22" y2="16" stroke="currentColor" stroke-width="2" />
                                    <line x1="22" y1="16" x2="0" y2="16" stroke="currentColor" stroke-width="2" />
                                    <polygon points="0,16 6,12 6,20" fill="currentColor" />
                                </svg>
                            </div>
                        {/if}

                        <!-- Flecha morada SALIDA: si es el último nodo y hay repeticiones globales -->
                        {#if index === intervals.length - 1 && repetitions > 1}
                            <div style="position: absolute; right: -2.5rem; top: 50%; transform: translateY(-50%); pointer-events: none;">
                                <svg width="32" height="32" viewBox="0 0 32 32">
                                    <line x1="0" y1="16" x2="22" y2="16" stroke="#a78bfa" stroke-width="2" />
                                    <line x1="22" y1="16" x2="22" y2="4" stroke="#a78bfa" stroke-width="2" />
                                    <polygon points="22,4 18,10 26,10" fill="#a78bfa" />
                                    <text x="8" y="12" class="text-[10px] font-bold" fill="#a78bfa">{repetitions}</text>
                                </svg>
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
            
            {#if intervals.length === 0}
                <div class="bg-gray-800 rounded-lg p-4 text-center">
                    <p class="text-gray-400" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">{$t('main.no_intervals')}</p>
                    <p class="text-sm text-gray-500 mt-1" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);">{$t('main.use_settings')}</p>
                </div>
            {/if}
        </div>
        
        <button 
            on:click={startWorkout}
            disabled={intervals.length === 0}
            class="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium text-lg transition-colors"
            style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);"
        >
            {intervals.length === 0 ? $t('main.configure_intervals') : $t('main.start_routine')}
        </button>
        
        {#if intervals.length > 0}
            <div class="mt-6 text-center text-gray-400">
                <p class="text-sm" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);">
                    {$t('main.total_duration')} {formatTime(intervals.reduce((acc, interval) => acc + interval.duration, 0))}
                </p>
                <p class="text-xs mt-1" style="text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);">
                    {$t('main.estimated_time')} {formatTime(intervals.reduce((acc, interval) => acc + interval.duration, 0) * repetitions)}
                </p>
            </div>
        {/if}
    </div>
</div>