<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { user } from '$lib/stores/userStore';
    import { userProfile } from '$lib/stores/userProfileStore';
    import LanguageSelector from './LanguageSelector.svelte';

    const dispatch = createEventDispatcher();

    export let initialTab: 'profile' | 'settings' = 'profile';
    let activeTab: 'profile' | 'settings' = initialTab;
    
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

<div class="pm-backdrop" on:click|self={() => dispatch('close')} on:keydown={(e) => e.key === 'Escape' && dispatch('close')} role="dialog" tabindex="-1">
    <div class="pm-panel">
        
        <!-- Header -->
        <div class="pm-header">
            <h2 class="pm-title">
                {#if activeTab === 'profile'}
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Perfil de Usuario
                {:else}
                    <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Configuración
                {/if}
            </h2>
            <div class="pm-actions">
                <button 
                    on:click={() => activeTab = activeTab === 'profile' ? 'settings' : 'profile'}
                    class="pm-icon-btn"
                    title={activeTab === 'profile' ? 'Ajustes' : 'Perfil'}
                >
                    {#if activeTab === 'profile'}
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15... (simplified icon code below, replacing with generic settings) "/><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {:else}
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {/if}
                </button>
                <button on:click={() => dispatch('close')} class="pm-icon-btn pm-close-btn" aria-label="Cerrar">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>

        <!-- Body -->
        <div class="pm-body">
            {#if activeTab === 'profile'}
                <div class="pm-anim-fade">
                    <div class="pm-user-card">
                        {#if $user?.photoURL}
                            <img src={$user.photoURL} alt="Avatar" class="pm-avatar-img" />
                        {:else}
                            <div class="pm-avatar-initials">
                                {(username || $user?.displayName || $user?.email || 'U').substring(0, 2).toUpperCase()}
                            </div>
                        {/if}
                        <div class="pm-user-info">
                            <p class="pm-user-label">Cuenta conectada</p>
                            <p class="pm-user-email">{$user?.email}</p>
                        </div>
                    </div>

                    <div class="pm-grid">
                        <div class="hb-input-group">
                            <label class="hb-label" for="profile-username">Nombre de Usuario</label>
                            <input class="hb-input" id="profile-username" type="text" bind:value={username} placeholder="Tu nombre" />
                        </div>
                        <div class="hb-input-group">
                            <label class="hb-label" for="profile-age">Edad (años)</label>
                            <input class="hb-input" id="profile-age" type="number" bind:value={age} placeholder="Ej. 25" min="1" max="120" />
                        </div>
                    </div>

                    <div class="pm-grid">
                        <div class="hb-input-group">
                            <label class="hb-label" for="profile-gender">Sexo</label>
                            <select class="hb-select" id="profile-gender" bind:value={gender}>
                                <option value="" disabled selected>Selecciona</option>
                                <option value="male">Hombre</option>
                                <option value="female">Mujer</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>
                        <div class="hb-input-group">
                            <label class="hb-label" for="profile-height">Estatura ({lengthSystem === 'cm' ? 'cm' : 'ft'})</label>
                            <input class="hb-input" id="profile-height" type="number" bind:value={height} placeholder={lengthSystem === 'cm' ? '175' : '5.9'} step="0.1" />
                        </div>
                    </div>

                    <div class="hb-input-group">
                        <label class="hb-label" for="profile-weight">Peso ({weightSystem === 'kg' ? 'kg' : 'lb'})</label>
                        <input class="hb-input" id="profile-weight" type="number" bind:value={weight} placeholder={weightSystem === 'kg' ? '70' : '154'} step="0.1" />
                    </div>

                    <div class="hb-input-group">
                        <label class="hb-label" for="profile-goal">Meta de Ejercicio</label>
                        <textarea class="hb-input" id="profile-goal" bind:value={goal} placeholder="Ej. Perder peso, resistencia..." rows="3" style="resize:vertical;"></textarea>
                    </div>

                </div>
            {:else}
                <div class="pm-anim-fade" style="display:flex; flex-direction:column; gap:1.25rem;">
                    
                    <div class="pm-setting-card">
                        <h3 class="pm-setting-title">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            Idioma
                        </h3>
                        <LanguageSelector />
                    </div>

                    <div class="pm-setting-card">
                        <h3 class="pm-setting-title">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/></svg>
                            Sistema de Medida
                        </h3>
                        
                        <div class="pm-setting-row">
                            <span class="pm-setting-label">Longitud (Estatura)</span>
                            <div class="pm-toggle-group">
                                <button class="pm-toggle-btn" class:active={lengthSystem === 'cm'} on:click={() => lengthSystem = 'cm'}>Metros</button>
                                <button class="pm-toggle-btn" class:active={lengthSystem === 'ft'} on:click={() => lengthSystem = 'ft'}>Pies</button>
                            </div>
                        </div>

                        <div class="pm-setting-row" style="border-top:1px solid var(--border-card); margin-top:0.6rem; padding-top:0.6rem;">
                            <span class="pm-setting-label">Peso</span>
                            <div class="pm-toggle-group">
                                <button class="pm-toggle-btn" class:active={weightSystem === 'kg'} on:click={() => weightSystem = 'kg'}>Kilos</button>
                                <button class="pm-toggle-btn" class:active={weightSystem === 'lb'} on:click={() => weightSystem = 'lb'}>Libras</button>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Footer / Save Button -->
        <div class="pm-footer">
            {#if savedMsg}
                <div class="pm-msg">{savedMsg}</div>
            {/if}
            <button class="hb-btn hb-btn-primary" on:click={handleSave} disabled={loading} style="width:100%; justify-content:center;">
                {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </div>
    </div>
</div>

<style>
.pm-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(14px);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 1.5rem; overflow-y: auto;
}

.pm-panel {
    background: var(--bg-card);
    border: 1px solid var(--border-card);
    width: 100%; max-width: 500px;
    border-radius: var(--radius-card);
    display: flex; flex-direction: column;
    box-shadow: var(--shadow-card);
    font-family: 'Inter', sans-serif;
    animation: popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    margin: auto;
}

/* Header */
.pm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-card);
    background: rgba(255,255,255,0.02);
}
.pm-title {
    display: flex; align-items: center; gap: 0.6rem;
    font-size: 1.15rem; font-weight: 800; color: var(--text-primary);
    margin: 0;
}
.pm-title svg { color: var(--accent-blue); }

.pm-actions { display: flex; align-items: center; gap: 0.5rem; }
.pm-icon-btn {
    width: 36px; height: 36px;
    background: var(--bg-card-alt); border: 1px solid var(--border-card);
    border-radius: var(--radius-sm); color: var(--text-secondary);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s;
}
.pm-icon-btn:hover { background: rgba(255,255,255,0.08); color: var(--text-primary); }
.pm-close-btn:hover { color: var(--accent-red); }

/* Body */
.pm-body {
    padding: 1.5rem;
    display: flex; flex-direction: column; gap: 1.25rem;
}
.pm-anim-fade { animation: fadeIn 0.3s ease; display:flex; flex-direction:column; gap:1.25rem; }

/* User card */
.pm-user-card {
    display: flex; align-items: center; gap: 1rem;
    margin-bottom: 0.5rem;
}
.pm-avatar-img {
    width: 64px; height: 64px; border-radius: 50%;
    border: 2px solid var(--accent-blue); box-shadow: 0 4px 14px rgba(59,130,246,0.3);
    object-fit: cover;
}
.pm-avatar-initials {
    width: 64px; height: 64px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    border: 2px solid rgba(255,255,255,0.1); box-shadow: 0 4px 14px rgba(168,85,247,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; font-weight: 800; color: #fff;
}
.pm-user-info { display: flex; flex-direction: column; }
.pm-user-label { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.2rem; }
.pm-user-email { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); word-break: break-all; }

.pm-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
}

/* Settings tab */
.pm-setting-card {
    background: rgba(255,255,255,0.02); border: 1px solid var(--border-card);
    border-radius: var(--radius-card); padding: 1.25rem;
}
.pm-setting-title {
    font-size: 0.75rem; font-weight: 700; color: var(--text-label); letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 1rem; display: flex; align-items: center; gap: 0.45rem;
}
.pm-setting-title svg { color: var(--accent-blue); }

.pm-setting-row {
    display: flex; align-items: center; justify-content: space-between;
}
.pm-setting-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; }
.pm-toggle-group {
    display: flex; background: var(--bg-card-alt); border: 1px solid var(--border-card);
    border-radius: var(--radius-sm); padding: 0.2rem;
}
.pm-toggle-btn {
    background: none; border: none; padding: 0.4rem 0.8rem;
    font-size: 0.8rem; font-weight: 600; color: var(--text-muted);
    border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.pm-toggle-btn:hover { color: var(--text-primary); }
.pm-toggle-btn.active {
    background: var(--accent-blue); color: #fff; box-shadow: 0 2px 8px rgba(59,130,246,0.3);
}

/* Footer */
.pm-footer {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid var(--border-card);
    background: rgba(255,255,255,0.02);
    display: flex; flex-direction: column; gap: 0.75rem;
}
.pm-msg {
    font-size: 0.8rem; font-weight: 600; color: var(--accent-green);
    text-align: center; animation: pulse 2s infinite;
}

@keyframes popIn {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
}
@keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
}
</style>
