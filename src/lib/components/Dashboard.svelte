<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { user } from '$lib/stores/userStore';
	import { userProfile } from '$lib/stores/userProfileStore';
	import AuthModal from './AuthModal.svelte';
	import ProfileModal from './ProfileModal.svelte';
	import { routineStats } from '$lib/stores/routineStore';

	const dispatch = createEventDispatcher();

	let animate = false;
	let showAuthModal = false;
	let showUserMenu = false;
	let showProfileModal = false;
	let profileInitialTab: 'profile' | 'settings' = 'profile';

	function toggleAuthModal() { showAuthModal = !showAuthModal; }
	function toggleUserMenu() { showUserMenu = !showUserMenu; }
	function closeUserMenu() { showUserMenu = false; }

	function openProfile() {
		profileInitialTab = 'profile';
		showProfileModal = true;
		showUserMenu = false;
	}

	function openPreferences() {
		profileInitialTab = 'settings';
		showProfileModal = true;
		showUserMenu = false;
	}

	function closeProfileModal() { showProfileModal = false; }
	function handleLogin() { toggleAuthModal(); }

	async function handleLogout() {
		showUserMenu = false;
		await user.logout();
	}

	onMount(() => {
		setTimeout(() => { animate = true; }, 80);
	});

	function openSettings()  { dispatch('open-settings'); }
	function openRoutines()  { dispatch('open-routines'); }
	function openHistory()   { dispatch('open-history'); }

	const navCards = [
		{
			action: openSettings,
			icon: '⚙️',
			titleKey: 'dashboard.configure_routines',
			descKey: 'dashboard.configure_description',
			accent: 'var(--accent-blue)',
			glow: 'rgba(59,130,246,0.15)',
		},
		{
			action: openRoutines,
			icon: '📋',
			titleKey: 'dashboard.my_routines',
			descKey: null,
			accent: 'var(--accent-green)',
			glow: 'rgba(34,197,94,0.15)',
		},
		{
			action: openHistory,
			icon: '📊',
			titleKey: 'dashboard.history',
			descKey: null,
			accent: 'var(--accent-purple)',
			glow: 'rgba(168,85,247,0.15)',
		},
	];
</script>

<div class="dashboard-root" class:loaded={animate}>
	<!-- Ambient Background Glows -->
	<div class="ambient-glow glow-tl"></div>
	<div class="ambient-glow glow-br"></div>

	<!-- ── Top Bar ── -->
	<header class="top-bar">
		<div class="top-bar-inner">
			<!-- Logo chip -->
			<div class="logo-chip">
				<div class="hb-logo-wrap">
					<div class="hb-logo-glow"></div>
					<img src="/logo.png" alt="HIITBeep" class="logo-img" />
				</div>
				<span class="logo-text">HIIT<span>Beep</span></span>
			</div>

			<!-- User Area -->
			{#if $user}
				<div class="relative">
					<button class="user-pill" on:click={toggleUserMenu}>
						{#if $user.photoURL}
							<img src={$user.photoURL} alt="avatar" class="user-avatar" />
						{:else}
							<div class="user-avatar avatar-initials">
								{($userProfile.username || $user.displayName || $user.email || 'U').substring(0, 2).toUpperCase()}
							</div>
						{/if}
						<div class="user-pill-info">
							<span class="user-pill-name">{$userProfile.username || $user.displayName || $user.email}</span>
							<span class="user-pill-sub">Mi cuenta ▾</span>
						</div>
					</button>

					{#if showUserMenu}
						<!-- Backdrop -->
						<div
							class="menu-backdrop"
							on:click={closeUserMenu}
							on:keydown={(e) => e.key === 'Escape' && closeUserMenu()}
							role="button"
							tabindex="0"
						></div>
						<!-- Dropdown -->
						<div class="user-dropdown">
							<div class="dropdown-header">
								{#if $user.photoURL}
									<img src={$user.photoURL} alt="avatar" class="dropdown-avatar" />
								{:else}
									<div class="dropdown-avatar avatar-initials avatar-lg">
										{($userProfile.username || $user.displayName || $user.email || 'U').substring(0, 2).toUpperCase()}
									</div>
								{/if}
								<div>
									<p class="dropdown-name">{$userProfile.username || $user.displayName || 'Usuario'}</p>
									<p class="dropdown-email">{$user.email}</p>
								</div>
							</div>
							<div class="hb-divider"></div>
							<button class="dropdown-item" on:click={openProfile}>
								<span class="dropdown-item-icon" style="background: rgba(59,130,246,0.12); color: var(--accent-blue);">
									<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
								</span>
								<div>
									<span class="dropdown-item-label">Editar Perfil</span>
									<span class="dropdown-item-desc">Nombre, edad, peso, meta</span>
								</div>
							</button>
							<button class="dropdown-item" on:click={openPreferences}>
								<span class="dropdown-item-icon" style="background: rgba(168,85,247,0.12); color: var(--accent-purple);">
									<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
								</span>
								<div>
									<span class="dropdown-item-label">Preferencias</span>
									<span class="dropdown-item-desc">Idioma, unidades de medida</span>
								</div>
							</button>
							<div class="hb-divider"></div>
							<button class="dropdown-item dropdown-item-danger" on:click={handleLogout}>
								<span class="dropdown-item-icon" style="background: rgba(239,68,68,0.1); color: var(--accent-red);">
									<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
								</span>
								<span class="dropdown-item-label">Cerrar Sesión</span>
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<button class="login-btn" on:click={handleLogin}>
					<span class="login-btn-icon">
						<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
					</span>
					Login
				</button>
			{/if}
		</div>
	</header>

	{#if showAuthModal}
		<AuthModal on:close={toggleAuthModal} />
	{/if}
	{#if showProfileModal}
		<ProfileModal initialTab={profileInitialTab} on:close={closeProfileModal} />
	{/if}

	<!-- ── Main Content ── -->
	<main class="dashboard-main">
		<!-- Hero -->
		<div class="hero-wrap" class:hero-visible={animate}>
			<div class="hero-logo-container">
				<div class="hb-logo-glow hero-glow"></div>
				<img src="/logo.png" alt="HIITBeep" class="hero-logo" />
			</div>
			<h1 class="hero-title">{$t('app.title')}</h1>
			<p class="hero-sub">{$t('dashboard.subtitle')}</p>
			<p class="hero-tagline">"{$t('dashboard.tagline')}"</p>
		</div>

		<!-- Stats Row -->
		<div class="stats-row" class:stats-visible={animate}>
			<div class="hb-stat-card">
				<div class="hb-stat-number">{$routineStats.totalRoutines}</div>
				<div class="hb-stat-label">Rutinas</div>
			</div>
			<div class="hb-stat-card">
				<div class="hb-stat-number">{$routineStats.totalWorkouts}</div>
				<div class="hb-stat-label">Entrenos</div>
			</div>
		</div>

		<!-- Nav Cards -->
		<div class="nav-cards" class:cards-visible={animate}>
			<!-- Configure Routines -->
			<button class="hb-nav-card nav-card-blue" on:click={openSettings}>
				<div class="hb-nav-card-icon">⚙️</div>
				<div class="nav-card-body">
					<div class="hb-nav-card-title">{$t('dashboard.configure_routines')}</div>
					<div class="hb-nav-card-desc">{$t('dashboard.configure_description')}</div>
				</div>
			</button>

			<!-- My Routines -->
			<button class="hb-nav-card nav-card-green" on:click={openRoutines}>
				<div class="hb-nav-card-icon">📋</div>
				<div class="nav-card-body">
					<div class="hb-nav-card-title">{$t('dashboard.my_routines')}</div>
					<div class="hb-nav-card-desc">
						<span class="font-bold text-white">{$routineStats.totalRoutines}</span>
						{$routineStats.totalRoutines === 1 ? $t('dashboard.routine_saved') : $t('dashboard.routines_saved')}
					</div>
				</div>
			</button>

			<!-- History -->
			<button class="hb-nav-card nav-card-purple" on:click={openHistory}>
				<div class="hb-nav-card-icon">📊</div>
				<div class="nav-card-body">
					<div class="hb-nav-card-title">{$t('dashboard.history')}</div>
					<div class="hb-nav-card-desc">
						<span class="font-bold text-white">{$routineStats.totalWorkouts}</span>
						{$routineStats.totalWorkouts === 1 ? $t('dashboard.workout_completed') : $t('dashboard.workouts_completed')}
					</div>
				</div>
			</button>
		</div>
	</main>
</div>

<style>
.dashboard-root {
	min-height: 100vh;
	background: var(--bg-app);
	color: var(--text-primary);
	font-family: 'Inter', sans-serif;
	position: relative;
	overflow-x: hidden;
	padding-bottom: 2rem;
}

/* Ambient glows */
.ambient-glow {
	position: fixed;
	border-radius: 50%;
	pointer-events: none;
	z-index: 0;
	filter: blur(100px);
}
.glow-tl {
	width: 45vw; height: 45vw;
	top: -15%; left: -15%;
	background: rgba(34,197,94,0.06);
}
.glow-br {
	width: 40vw; height: 40vw;
	bottom: -15%; right: -15%;
	background: rgba(59,130,246,0.06);
}

/* ── Top Bar ── */
.top-bar {
	position: sticky; top: 0; z-index: 50;
	background: rgba(11,17,32,0.82);
	backdrop-filter: blur(16px);
	border-bottom: 1px solid var(--border-card);
}
.top-bar-inner {
	max-width: 520px; margin: 0 auto;
	padding: 0.65rem 1.25rem;
	display: flex; align-items: center; justify-content: space-between;
}

/* Logo chip */
.logo-chip {
	display: flex; align-items: center; gap: 0.6rem;
}
.logo-img { width: 32px; height: 32px; object-fit: contain; }
.logo-text {
	font-size: 1.05rem; font-weight: 800;
	color: #fff; letter-spacing: -0.02em;
}
.logo-text span { color: var(--accent-green); }

/* User pill */
.user-pill {
	display: flex; align-items: center; gap: 0.65rem;
	background: var(--bg-card); border: 1px solid var(--border-card);
	border-radius: 50px; padding: 0.35rem 0.9rem 0.35rem 0.35rem;
	cursor: pointer; transition: all 0.2s;
}
.user-pill:hover { border-color: rgba(255,255,255,0.14); }
.user-avatar {
	width: 34px; height: 34px; border-radius: 50%;
	border: 2px solid var(--accent-green);
	object-fit: cover;
}
.avatar-initials {
	background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
	display: flex; align-items: center; justify-content: center;
	font-size: 0.75rem; font-weight: 700; color: #fff;
}
.user-pill-info { display: flex; flex-direction: column; text-align: left; }
.user-pill-name { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.user-pill-sub  { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent-green); }

/* Login button */
.login-btn {
	display: flex; align-items: center; gap: 0.45rem;
	background: var(--accent-green); color: #0b1120;
	font-size: 0.85rem; font-weight: 700;
	padding: 0.55rem 1.1rem; border-radius: 50px; border: none;
	cursor: pointer; transition: all 0.2s;
	box-shadow: 0 3px 12px var(--accent-green-glow);
}
.login-btn:hover { background: #16a34a; box-shadow: 0 4px 18px rgba(34,197,94,0.5); }
.login-btn-icon { font-size: 1rem; }

/* Dropdown menu */
.menu-backdrop { position: fixed; inset: 0; z-index: 40; }
.user-dropdown {
	position: absolute; right: 0; top: calc(100% + 0.5rem);
	width: 240px; z-index: 50;
	background: var(--bg-card);
	border: 1px solid var(--border-card);
	border-radius: var(--radius-card);
	overflow: hidden;
	box-shadow: 0 16px 48px rgba(0,0,0,0.5);
	animation: dropIn 0.18s ease-out;
}
.dropdown-header {
	display: flex; align-items: center; gap: 0.75rem;
	padding: 1rem;
}
.dropdown-avatar {
	width: 40px; height: 40px; border-radius: 50%;
	border: 2px solid var(--accent-green);
	flex-shrink: 0;
}
.avatar-lg { width: 40px; height: 40px; font-size: 0.875rem; }
.dropdown-name  { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
.dropdown-email { font-size: 0.7rem; color: var(--text-muted); margin-top: 0.1rem; }

.dropdown-item {
	width: 100%; display: flex; align-items: center; gap: 0.75rem;
	padding: 0.75rem 1rem; background: none; border: none; cursor: pointer;
	transition: background 0.15s;
}
.dropdown-item:hover { background: rgba(255,255,255,0.05); }
.dropdown-item-danger:hover { background: rgba(239,68,68,0.08); }
.dropdown-item-icon {
	width: 34px; height: 34px; border-radius: var(--radius-sm);
	display: flex; align-items: center; justify-content: center;
	font-size: 1rem; flex-shrink: 0;
}
.dropdown-item-label { display: block; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); text-align: left; }
.dropdown-item-desc  { display: block; font-size: 0.7rem; color: var(--text-muted); margin-top: 0.1rem; }
.dropdown-item-danger .dropdown-item-label { color: var(--accent-red); }

/* ── Main ── */
.dashboard-main {
	max-width: 520px; margin: 0 auto;
	padding: 1.5rem 1.25rem 3rem;
	position: relative; z-index: 1;
}

/* Hero */
.hero-wrap {
	text-align: center;
	padding: 1.5rem 0 2rem;
	opacity: 0; transform: translateY(16px);
	transition: opacity 0.55s ease, transform 0.55s ease;
}
.hero-wrap.hero-visible { opacity: 1; transform: translateY(0); }
.hero-logo-container { position: relative; display: inline-block; margin-bottom: 1rem; }
.hero-glow {
	position: absolute; inset: -20px;
	background: radial-gradient(circle, var(--accent-green-glow) 0%, transparent 70%);
	border-radius: 50%;
	animation: pulseGlow 3s ease-in-out infinite;
}
.hero-logo { width: 90px; height: 90px; object-fit: contain; position: relative; z-index: 1; }
.hero-title {
	font-size: 2.5rem; font-weight: 900;
	color: var(--text-primary); letter-spacing: -0.03em;
	line-height: 1;
}
.hero-sub {
	font-size: 1rem; color: var(--accent-green);
	font-weight: 500; margin-top: 0.4rem;
}
.hero-tagline {
	font-size: 0.8rem; color: var(--text-secondary);
	font-style: italic; margin-top: 0.35rem;
}

/* Stats row */
.stats-row {
	display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem;
	margin-bottom: 1.5rem;
	opacity: 0; transform: translateY(12px);
	transition: opacity 0.55s 0.12s ease, transform 0.55s 0.12s ease;
}
.stats-row.stats-visible { opacity: 1; transform: translateY(0); }

/* Nav cards */
.nav-cards {
	display: flex; flex-direction: column; gap: 0.875rem;
	opacity: 0; transform: translateY(12px);
	transition: opacity 0.55s 0.22s ease, transform 0.55s 0.22s ease;
}
.nav-cards.cards-visible { opacity: 1; transform: translateY(0); }

/* Color variants */
.nav-card-blue   { border-left: 4px solid var(--accent-blue); }
.nav-card-blue::before   { content:''; position:absolute; inset:0; background: linear-gradient(90deg, rgba(59,130,246,0.12) 0%, transparent 45%); pointer-events:none; }
.nav-card-green  { border-left: 4px solid var(--accent-green); }
.nav-card-green::before  { content:''; position:absolute; inset:0; background: linear-gradient(90deg, var(--accent-green-glow) 0%, transparent 45%); pointer-events:none; }
.nav-card-purple { border-left: 4px solid var(--accent-purple); }
.nav-card-purple::before { content:''; position:absolute; inset:0; background: linear-gradient(90deg, rgba(168,85,247,0.12) 0%, transparent 45%); pointer-events:none; }

.nav-card-body { flex: 1; min-width: 0; padding-right: 1.5rem; }

/* Animations */
@keyframes dropIn {
	from { opacity: 0; transform: translateY(-8px) scale(0.97); }
	to   { opacity: 1; transform: none; }
}
@keyframes pulseGlow {
	0%, 100% { opacity: 0.7; transform: scale(1); }
	50%       { opacity: 1;   transform: scale(1.06); }
}
</style>
