<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { user } from '$lib/stores/userStore';
    import { userProfile } from '$lib/stores/userProfileStore';
    import LanguageSelector from './LanguageSelector.svelte';

    const dispatch = createEventDispatcher();

    // Accept initial tab from parent
    export let initialTab: 'profile' | 'settings' = 'profile';

    // Tabs: 'profile' | 'settings'
    let activeTab: 'profile' | 'settings' = initialTab;
    
    // Default form data bound to stores
    let username = '';
    let age: number | '' = '';
    let gender = '';
    let weight: number | '' = '';
    let height: number | '' = '';
    let goal = '';
    let lengthSystem: 'cm' | 'ft' = 'cm';
    let weightSystem: 'kg' | 'lb' = 'kg';

    let loading = false;
    let savedMsg = '';

    onMount(() => {
        // Load data to local variables
        username = $userProfile.username || $user?.displayName || '';
        age = $userProfile.age || '';
        gender = $userProfile.gender || '';
        weight = $userProfile.weight || '';
        height = $userProfile.height || '';
        goal = $userProfile.goal || '';
        lengthSystem = $userProfile.lengthSystem || 'cm';
        weightSystem = $userProfile.weightSystem || 'kg';
    });

    async function handleSave() {
        loading = true;
        savedMsg = '';
        const res = await userProfile.saveProfile({
            username,
            age: typeof age === 'number' ? age : null,
            gender,
            weight: typeof weight === 'number' ? weight : null,
            height: typeof height === 'number' ? height : null,
            goal,
            lengthSystem,
            weightSystem
        });
        
        loading = false;
        if (res.success) {
            savedMsg = '¡Guardado correctamente!';
            setTimeout(() => savedMsg = '', 3000);
        } else {
            savedMsg = 'Error al guardar. Intenta de nuevo.';
        }
    }
</script>

<!-- svelte-ignore a11y_interactive_supports_focus -->
<div class="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 sm:p-6" on:click|self={() => dispatch('close')} on:keydown|self={(e) => e.key === 'Escape' && dispatch('close')} role="dialog" aria-modal="true" tabindex="-1">
    <div class="bg-gray-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-full">
        
        <!-- Header -->
        <div class="relative flex items-center justify-between p-5 border-b border-white/10 bg-gray-800/50">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                {#if activeTab === 'profile'}
                    <span>👤</span> Perfil de Usuario
                {:else}
                    <span>⚙️</span> Configuración
                {/if}
            </h2>
            <div class="flex items-center gap-2">
                <!-- Toggle Tab Button -->
                <button 
                    on:click={() => activeTab = activeTab === 'profile' ? 'settings' : 'profile'}
                    class="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/5"
                    title={activeTab === 'profile' ? 'Configuración' : 'Perfil'}
                >
                    {#if activeTab === 'profile'}
                        ⚙️
                    {:else}
                        👤
                    {/if}
                </button>
                <button on:click={() => dispatch('close')} class="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all text-xl">✕</button>
            </div>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1">
            {#if activeTab === 'profile'}
                <div class="space-y-4 animate-fadeIn">
                    <div class="flex items-center gap-4 mb-2">
                        {#if $user?.photoURL}
                            <img src={$user.photoURL} alt="Avatar" class="w-16 h-16 rounded-full border-2 border-blue-500 shadow-lg shadow-blue-500/20" />
                        {:else}
                            <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/20 border-2 border-white/10">
                                {(username || $user?.displayName || $user?.email || 'U').substring(0, 2).toUpperCase()}
                            </div>
                        {/if}
                        <div>
                            <p class="text-sm text-gray-400">Cuenta conectada</p>
                            <p class="font-medium text-white truncate max-w-[200px]">{$user?.email}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="profile-username">Nombre de Usuario</label>
                            <input id="profile-username" type="text" bind:value={username} placeholder="Tu nombre o apodo" />
                        </div>
                        <div class="form-group">
                            <label for="profile-age">Edad (años)</label>
                            <input id="profile-age" type="number" bind:value={age} placeholder="Ej. 25" min="1" max="120" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="profile-gender">Sexo</label>
                            <select id="profile-gender" bind:value={gender}>
                                <option value="" disabled selected>Selecciona</option>
                                <option value="male">Hombre</option>
                                <option value="female">Mujer</option>
                                <option value="other">Otro / Prefiero no decir</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="profile-height">Estatura ({lengthSystem === 'cm' ? 'cm' : 'ft'})</label>
                            <input id="profile-height" type="number" bind:value={height} placeholder={lengthSystem === 'cm' ? 'Ej. 175' : 'Ej. 5.9'} step="0.1" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="profile-weight">Peso ({weightSystem === 'kg' ? 'kg' : 'lb'})</label>
                        <input id="profile-weight" type="number" bind:value={weight} placeholder={weightSystem === 'kg' ? 'Ej. 70' : 'Ej. 154'} step="0.1" />
                    </div>

                    <div class="form-group">
                        <label for="profile-goal">Meta de Ejercicio</label>
                        <textarea id="profile-goal" bind:value={goal} placeholder="Ej. Perder peso, ganar fuerza, resistencia..." rows="3"></textarea>
                    </div>

                </div>
            {:else}
                <div class="space-y-6 animate-fadeIn">
                    <div class="bg-gray-800/50 p-4 rounded-xl border border-white/5">
                        <h3 class="font-semibold text-white mb-3 text-sm uppercase tracking-wider text-blue-400">🌐 Idioma</h3>
                        <LanguageSelector />
                    </div>

                    <div class="bg-gray-800/50 p-4 rounded-xl border border-white/5 space-y-4">
                        <h3 class="font-semibold text-white mb-1 text-sm uppercase tracking-wider text-blue-400">📏 Sistema de Medida</h3>
                        
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-300">Longitud (Estatura)</span>
                            <div class="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                <button type="button" class="px-3 py-1 text-sm rounded-md transition-all {lengthSystem === 'cm' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}" on:click={() => lengthSystem = 'cm'}>Metros (cm)</button>
                                <button type="button" class="px-3 py-1 text-sm rounded-md transition-all {lengthSystem === 'ft' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}" on:click={() => lengthSystem = 'ft'}>Pies (ft)</button>
                            </div>
                        </div>

                        <div class="flex items-center justify-between pt-2 border-t border-white/5">
                            <span class="text-sm text-gray-300">Peso</span>
                            <div class="flex bg-black/40 p-1 rounded-lg border border-white/10">
                                <button type="button" class="px-3 py-1 text-sm rounded-md transition-all {weightSystem === 'kg' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}" on:click={() => weightSystem = 'kg'}>Kilos (kg)</button>
                                <button type="button" class="px-3 py-1 text-sm rounded-md transition-all {weightSystem === 'lb' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}" on:click={() => weightSystem = 'lb'}>Libras (lb)</button>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Footer / Save Button -->
        <div class="p-5 border-t border-white/10 bg-gray-800/80 backdrop-blur-md flex flex-col gap-2">
            {#if savedMsg}
                <div class="text-green-400 text-xs text-center font-medium animate-pulse">{savedMsg}</div>
            {/if}
            <button 
                on:click={handleSave}
                disabled={loading}
                class="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </div>
    </div>
</div>

<style>
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .form-group label {
        font-size: 0.75rem;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
        margin-left: 0.25rem;
    }

    .form-group input, .form-group select, .form-group textarea {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        color: white;
        transition: all 0.2s;
        font-size: 0.875rem;
    }
    
    .form-group input::placeholder, .form-group textarea::placeholder {
        color: rgba(255, 255, 255, 0.3);
    }

    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
        outline: none;
        border-color: #3b82f6;
        background: rgba(255, 255, 255, 0.05);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    
    .form-group select option {
        background: #1f2937;
        color: white;
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
    }
</style>
