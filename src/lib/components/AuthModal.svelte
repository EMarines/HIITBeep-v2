<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { user } from '$lib/stores/userStore';
    import { t } from '$lib/i18n';

    const dispatch = createEventDispatcher();

    let email = '';
    let password = '';
    let displayName = '';
    let isRegistering = false;
    let error = '';
    let loading = false;

    async function handleAuth() {
        if (!email || !password) {
            error = 'Por favor completa todos los campos';
            return;
        }
        error = '';
        loading = true;
        try {
            if (isRegistering) {
                if (!displayName.trim()) {
                    error = 'El nombre es requerido';
                    loading = false;
                    return;
                }
                await user.signUpWithEmail(email, password, displayName);
            } else {
                await user.loginWithEmail(email, password);
            }
            dispatch('close');
        } catch (e: any) {
            console.error(e);
            if (e.code === 'auth/user-not-found') error = 'Usuario no encontrado';
            else if (e.code === 'auth/wrong-password') error = 'Contraseña incorrecta';
            else if (e.code === 'auth/email-already-in-use') error = 'El correo ya está en uso';
            else error = e.message;
        } finally {
            loading = false;
        }
    }

    async function handleGoogleLogin() {
        error = '';
        loading = true;
        try {
            await user.loginWithGoogle();
            dispatch('close');
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="modal-backdrop" on:click|self={() => dispatch('close')}>
    <div class="modal-content">
        <!-- Decoration bar -->
        <div class="modal-top-bar" class:registering={isRegistering}></div>

        <button on:click={() => dispatch('close')} class="close-btn">✕</button>

        <div class="modal-header">
            <h2>{isRegistering ? 'Crear cuenta' : '¡Hola de nuevo!'}</h2>
            <p>{isRegistering ? 'Únete a la comunidad HIITBeep' : 'Entra para sincronizar tus rutinas'}</p>
        </div>

        {#if error}
            <div class="error-msg">
                <span class="error-icon">⚠️</span> {error}
            </div>
        {/if}

        <div class="form-group">
            {#if isRegistering}
                <div class="input-wrapper">
                    <span class="input-icon">👤</span>
                    <input 
                        type="text" 
                        bind:value={displayName} 
                        placeholder="Nombre completo" 
                    />
                </div>
            {/if}
            
            <div class="input-wrapper">
                <span class="input-icon">✉️</span>
                <input 
                    type="email" 
                    bind:value={email} 
                    placeholder="Correo electrónico" 
                />
            </div>
            
            <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                    type="password" 
                    bind:value={password} 
                    placeholder="Contraseña" 
                />
            </div>

            <button 
                on:click={handleAuth}
                disabled={loading}
                class="btn-primary"
                class:loading={loading}
            >
                {loading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
            </button>

            <div class="divider">
                <span>O CONTINÚA CON</span>
            </div>

            <button 
                on:click={handleGoogleLogin}
                disabled={loading}
                class="btn-google"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                Google
            </button>
        </div>

        <div class="modal-footer">
            <p>
                {isRegistering ? '¿Ya tienes cuenta?' : '¿Eres nuevo aquí?'}
                <button on:click={() => isRegistering = !isRegistering}>
                    {isRegistering ? 'Inicia sesión' : 'Crea una cuenta'}
                </button>
            </p>
        </div>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1.5rem;
    }

    .modal-content {
        background: #111827;
        width: 100%;
        max-width: 400px;
        border-radius: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        padding: 2.5rem 2rem;
    }

    .modal-top-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(to right, #3b82f6, #2563eb);
        transition: background 0.3s ease;
    }

    .modal-top-bar.registering {
        background: linear-gradient(to right, #9333ea, #7e22ce);
    }

    .close-btn {
        position: absolute;
        top: 1.25rem;
        right: 1.25rem;
        color: #9ca3af;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        transition: color 0.2s;
    }

    .close-btn:hover {
        color: white;
    }

    .modal-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .modal-header h2 {
        color: white;
        font-size: 1.875rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    .modal-header p {
        color: #9ca3af;
        font-size: 0.875rem;
    }

    .error-msg {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #ef4444;
        font-size: 0.75rem;
        padding: 0.75rem;
        border-radius: 0.75rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .input-wrapper {
        position: relative;
    }

    .input-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 1.2rem;
        pointer-events: none;
        opacity: 0.5;
    }

    input {
        width: 100%;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.75rem;
        padding: 0.875rem 1rem 0.875rem 3rem;
        color: white;
        outline: none;
        transition: all 0.2s;
    }

    input:focus {
        background: rgba(255, 255, 255, 0.08);
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .btn-primary {
        background: #2563eb;
        color: white;
        font-weight: 600;
        padding: 1rem;
        border-radius: 0.75rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 0.5rem;
    }

    .btn-primary:hover:not(:disabled) {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .btn-primary:active:not(:disabled) {
        transform: translateY(0);
    }

    .divider {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 0.5rem 0;
    }

    .divider::before, .divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
    }

    .divider span {
        font-size: 0.65rem;
        color: #6b7280;
        font-weight: 700;
        letter-spacing: 0.1em;
    }

    .btn-google {
        background: white;
        color: #374151;
        font-weight: 600;
        padding: 0.875rem;
        border-radius: 0.75rem;
        border: 1px solid #e5e7eb;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        transition: all 0.2s;
    }

    .btn-google img {
        width: 1.25rem;
        height: 1.25rem;
    }

    .btn-google:hover:not(:disabled) {
        background: #f9fafb;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .modal-footer {
        margin-top: 2rem;
        text-align: center;
    }

    .modal-footer p {
        font-size: 0.875rem;
        color: #9ca3af;
    }

    .modal-footer button {
        background: none;
        border: none;
        color: #3b82f6;
        font-weight: 600;
        padding: 0;
        margin-left: 0.25rem;
        cursor: pointer;
    }

    .modal-footer button:hover {
        text-decoration: underline;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
