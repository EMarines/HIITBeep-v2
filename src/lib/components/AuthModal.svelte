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

<div class="hb-modal-backdrop" on:click|self={() => dispatch('close')} on:keydown={(e) => e.key === 'Escape' && dispatch('close')} role="dialog" tabindex="-1">
	<div class="hb-modal">
		<div class="am-top-bar" class:registering={isRegistering}></div>

		<button aria-label="Cerrar" class="hb-modal-close" on:click={() => dispatch('close')}>
			<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>

		<div class="hb-modal-header">
			<h2 class="hb-modal-title">{isRegistering ? 'Crear cuenta' : '¡Hola de nuevo!'}</h2>
			<p class="hb-modal-subtitle">{isRegistering ? 'Únete a la comunidad HIITBeep' : 'Entra para sincronizar tus rutinas'}</p>
		</div>

		{#if error}
			<div class="am-error">
				<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
				<span>{error}</span>
			</div>
		{/if}

		<div class="am-form">
			{#if isRegistering}
				<div class="am-input-wrap">
					<input class="hb-input am-input" type="text" bind:value={displayName} placeholder="Nombre completo" />
					<span class="am-icon">
						<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
							<circle cx="12" cy="7" r="4"></circle>
						</svg>
					</span>
				</div>
			{/if}
			
			<div class="am-input-wrap">
				<input class="hb-input am-input" type="email" bind:value={email} placeholder="Correo electrónico" />
				<span class="am-icon">
					<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
						<polyline points="22,6 12,13 2,6"></polyline>
					</svg>
				</span>
			</div>
			
			<div class="am-input-wrap">
				<input class="hb-input am-input" type="password" bind:value={password} placeholder="Contraseña" />
				<span class="am-icon">
					<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
						<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
					</svg>
				</span>
			</div>

			<button on:click={handleAuth} disabled={loading} class="hb-btn hb-btn-primary" style="margin-top:0.5rem; width:100%; justify-content:center;">
				{loading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión')}
			</button>

			<div class="am-divider">
				<span>O CONTINÚA CON</span>
			</div>

			<button on:click={handleGoogleLogin} disabled={loading} class="am-google-btn">
				<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
				Google
			</button>
		</div>

		<div class="am-footer">
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
.am-top-bar {
	position: absolute; top: 0; left: 0; right: 0; height: 4px;
	background: linear-gradient(90deg, var(--accent-blue) 0%, #1d4ed8 100%);
	transition: background 0.3s ease;
}
.am-top-bar.registering {
	background: linear-gradient(90deg, var(--accent-purple) 0%, #7e22ce 100%);
}

.am-error {
	background: rgba(239, 68, 68, 0.12);
	border: 1px solid rgba(239, 68, 68, 0.25);
	color: var(--accent-red); font-size: 0.8rem; font-weight: 600;
	padding: 0.75rem 1rem; border-radius: var(--radius-sm);
	margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.6rem;
}

.am-form { display: flex; flex-direction: column; gap: 0.875rem; }

.am-input-wrap { position: relative; }
.am-icon {
	position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
	color: var(--text-secondary); pointer-events: none;
	display: flex; align-items: center; justify-content: center;
}
.am-input { padding-left: 2.8rem; width: 100%; }
.am-input:focus ~ .am-icon { color: var(--accent-green); }

.am-divider { display: flex; align-items: center; gap: 1rem; margin: 0.5rem 0; }
.am-divider::before, .am-divider::after { content: ''; flex: 1; height: 1px; background: var(--border-card); }
.am-divider span { font-size: 0.65rem; color: var(--text-muted); font-weight: 700; letter-spacing: 0.1em; }

.am-google-btn {
	background: #fff; color: #111827; border: 1px solid #e5e7eb;
	font-weight: 700; padding: 0.875rem; border-radius: var(--radius-btn);
	display: flex; align-items: center; justify-content: center; gap: 0.75rem;
	cursor: pointer; transition: all 0.2s; font-size: 0.95rem; font-family: 'Inter', sans-serif;
}
.am-google-btn img { width: 1.25rem; height: 1.25rem; }
.am-google-btn:hover:not(:disabled) { background: #f9fafb; box-shadow: 0 4px 12px rgba(255,255,255,0.1); }
.am-google-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.am-footer { margin-top: 2rem; text-align: center; }
.am-footer p { font-size: 0.85rem; color: var(--text-secondary); }
.am-footer button {
	background: none; border: none; padding: 0; margin-left: 0.35rem;
	color: var(--accent-blue); font-weight: 700; cursor: pointer;
}
.am-footer button:hover { text-decoration: underline; }
</style>
