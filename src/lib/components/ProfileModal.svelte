<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { user } from '$lib/stores/userStore';
    import { userProfile } from '$lib/stores/userProfileStore';
    import LanguageSelector from './LanguageSelector.svelte';
    import { storage, auth } from '$lib/services/firebase';
    import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
    import { updateProfile } from 'firebase/auth';

    const dispatch = createEventDispatcher();

    export let initialTab: 'profile' | 'settings' = 'profile';
    let activeTab: 'profile' | 'settings' = initialTab;
    
    let username = '';
    let photoURL = '';
    let age: number | '' = '';
    let gender = '';
    let weight: number | '' = '';
    let height: number | '' = '';
    let goal = '';
    let lengthSystem: 'cm' | 'ft' = 'cm';
    let weightSystem: 'kg' | 'lb' = 'kg';

    let loading = false;
    let uploading = false;
    let uploadProgress = 0;
    let savedMsg = '';
    let fileInput: HTMLInputElement;

    onMount(() => {
        username = $userProfile.username || $user?.displayName || '';
        photoURL = $userProfile.photoURL || $user?.photoURL || '';
        age = $userProfile.age || '';
        gender = $userProfile.gender || '';
        weight = $userProfile.weight || '';
        height = $userProfile.height || '';
        goal = $userProfile.goal || '';
        lengthSystem = $userProfile.lengthSystem || 'cm';
        weightSystem = $userProfile.weightSystem || 'kg';
    });

    async function handleFileUpload(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file || !$user) return;

        uploading = true;
        uploadProgress = 0;
        
        const storageRef = ref(storage, `avatars/${$user.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            }, 
            (error) => {
                console.error("Upload error:", error);
                uploading = false;
                savedMsg = 'Error al subir imagen';
            }, 
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                photoURL = downloadURL;
                uploading = false;
                // Sync with Auth immediately for better UX
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { photoURL: downloadURL });
                }
                savedMsg = 'Imagen subida con éxito';
                setTimeout(() => savedMsg = '', 3000);
            }
        );
    }

    async function handleSave() {
        loading = true;
        savedMsg = '';
        
        // Update Firebase Auth display name and photo too
        if (auth.currentUser) {
             await updateProfile(auth.currentUser, { 
                displayName: username,
                photoURL: photoURL
            });
        }

        const res = await userProfile.saveProfile({
            username,
            photoURL,
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
            savedMsg = '¡Perfil actualizado!';
            setTimeout(() => savedMsg = '', 3000);
        } else {
            savedMsg = 'Error al guardar. Intenta de nuevo.';
        }
    }
</script>

<div class="hb-modal-backdrop" on:click|self={() => dispatch('close')} on:keydown={(e) => e.key === 'Escape' && dispatch('close')} role="dialog" tabindex="-1">
    <div class="hb-modal" style="max-width: 500px;">
        
        <!-- Header -->
        <div class="hb-modal-header" style="display:flex; justify-content:space-between; align-items:center; text-align:left;">
            <h2 class="hb-modal-title" style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0;">
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
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {:else}
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {/if}
                </button>
                <button on:click={() => dispatch('close')} class="hb-modal-close" style="position:static;">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>

        <!-- Body -->
        <div class="pm-body">
            {#if activeTab === 'profile'}
                <div class="pm-anim-fade">
                    <div class="pm-user-card">
                        <div class="pm-avatar-wrap" on:click={() => fileInput.click()}>
                            {#if uploading}
                                <div class="pm-avatar-uploading">
                                    <div class="pm-progress-circle">
                                        <svg viewBox="0 0 36 36" class="circular-chart">
                                            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path class="circle" stroke-dasharray="{uploadProgress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        </svg>
                                    </div>
                                </div>
                            {:else if photoURL}
                                <img src={photoURL} alt="Avatar" class="pm-avatar-img" />
                            {:else}
                                <div class="pm-avatar-initials">
                                    {(username || $user?.displayName || $user?.email || 'U').substring(0, 2).toUpperCase()}
                                </div>
                            {/if}
                            <div class="pm-avatar-hover">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            </div>
                            <input type="file" bind:this={fileInput} on:change={handleFileUpload} accept="image/*" style="display:none;" />
                        </div>
                        <div class="pm-user-info">
                            <p class="pm-user-label">Cuenta conectada</p>
                            <p class="pm-user-email">{$user?.email}</p>
                        </div>
                    </div>

                    <div class="hb-input-group">
                        <label class="hb-label" for="profile-photo">Enlace de Foto (Opcional)</label>
                        <input class="hb-input" id="profile-photo" type="url" bind:value={photoURL} placeholder="https://ejemplo.com/foto.jpg" />
                        <p class="text-xs text-gray-400 mt-1">Sube una foto tocando tu avatar o pega un enlace directo aquí.</p>
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

                    <div class="hb-input-group" style="margin-bottom:0.5rem;">
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
.pm-body {
    padding: 0.5rem 0;
    display: flex; flex-direction: column; gap: 1.25rem;
}
.pm-anim-fade { animation: fadeIn 0.3s ease; display:flex; flex-direction:column; gap:1.25rem; }

.pm-actions { display: flex; align-items: center; gap: 0.5rem; }
.pm-icon-btn {
    width: 36px; height: 36px;
    background: var(--bg-card-alt); border: 1px solid var(--border-card);
    border-radius: var(--radius-sm); color: var(--text-secondary);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s;
}
.pm-icon-btn:hover { background: rgba(255,255,255,0.08); color: var(--text-primary); }

/* User card */
.pm-user-card {
    display: flex; align-items: center; gap: 1.5rem;
    margin-bottom: 0.5rem;
}
.pm-avatar-wrap {
    position: relative;
    width: 80px; height: 80px;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
    transition: all 0.2s;
}
.pm-avatar-wrap:hover .pm-avatar-hover { opacity: 1; }
.pm-avatar-wrap:hover .pm-avatar-img, 
.pm-avatar-wrap:hover .pm-avatar-initials { filter: brightness(0.7); }

.pm-avatar-hover {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.4);
    color: #fff; opacity: 0;
    transition: opacity 0.2s;
    z-index: 2;
}

.pm-avatar-uploading {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(11,17,32,0.8);
    z-index: 3;
}

.circular-chart { display: block; width: 40px; height: 40px; }
.circle-bg { fill: none; stroke: rgba(255,255,255,0.1); stroke-width: 3.8; }
.circle { fill: none; stroke: var(--accent-blue); stroke-width: 3.8; stroke-linecap: round; transition: stroke-dasharray 0.3s ease; }

.pm-avatar-img {
    width: 100%; height: 100%; border-radius: 50%;
    border: 3px solid var(--accent-blue); box-shadow: 0 4px 14px rgba(59,130,246,0.3);
    object-fit: cover;
}
.pm-avatar-initials {
    width: 100%; height: 100%; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    border: 3px solid rgba(255,255,255,0.1); box-shadow: 0 4px 14px rgba(168,85,247,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; font-weight: 800; color: #fff;
}
.pm-user-info { display: flex; flex-direction: column; }
.pm-user-label { font-size: 0.75rem; color: var(--text-label); margin-bottom: 0.2rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.pm-user-email { font-size: 1rem; font-weight: 600; color: var(--text-primary); word-break: break-all; opacity: 0.9; }

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
    padding-top: 1rem;
    display: flex; flex-direction: column; gap: 0.75rem;
}
.pm-msg {
    font-size: 0.8rem; font-weight: 600; color: var(--accent-green);
    text-align: center;
}

@keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
}
</style>
