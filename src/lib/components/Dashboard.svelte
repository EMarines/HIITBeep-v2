<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { loadRoutines, loadWorkoutLogs } from '$lib/services/routineStorage';
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

	function toggleAuthModal() {
		showAuthModal = !showAuthModal;
	}

	function toggleUserMenu() {
		showUserMenu = !showUserMenu;
	}

	function closeUserMenu() {
		showUserMenu = false;
	}

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

	function closeProfileModal() {
		showProfileModal = false;
	}

	function handleLogin() {
		toggleAuthModal();
	}

	async function handleLogout() {
		showUserMenu = false;
		await user.logout();
	}
	
	onMount(() => {
		setTimeout(() => {
			animate = true;
		}, 100);
	});
	
	function openSettings() {
		dispatch('open-settings');
	}
	
	function openRoutines() {
		dispatch('open-routines');
	}
	
	function openHistory() {
		dispatch('open-history');
	}
</script>

<div class="min-h-screen bg-[#05070a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
	<!-- Animated Background Glows -->
	<div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
	<div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>

	<!-- Top Bar / User Profile -->
	<div class="max-w-md w-full flex justify-end items-center mb-12 px-2 z-10">
		
		{#if $user}
			<div class="relative">
				<!-- Avatar Button -->
				<button on:click={toggleUserMenu} class="flex items-center gap-3 bg-white/10 hover:bg-white/15 transition-all duration-300 rounded-full pl-1.5 pr-4 py-1.5 backdrop-blur-md border border-white/10 cursor-pointer shadow-lg hover:shadow-blue-500/20 hover:border-white/20">
					{#if $user.photoURL}
						<img src={$user.photoURL} alt={$userProfile.username || $user.displayName} class="w-9 h-9 rounded-full border-2 border-blue-500/50 shadow-md" />
					{:else}
						<div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-purple-500 flex items-center justify-center text-xs font-bold text-white border-2 border-white/20 shadow-md">
							{($userProfile.username || $user.displayName || $user.email || 'U').substring(0, 2).toUpperCase()}
						</div>
					{/if}
					<div class="flex flex-col items-start text-left">
						<span class="text-xs text-white/90 font-medium truncate max-w-[120px]">{$userProfile.username || $user.displayName || $user.email}</span>
						<span class="text-[9px] text-blue-300/60 font-semibold uppercase tracking-widest">Mi cuenta ▾</span>
					</div>
				</button>
				
				<!-- Dropdown User Menu -->
				{#if showUserMenu}
					<div 
						class="fixed inset-0 z-40" 
						on:click={closeUserMenu}
						on:keydown={(e) => e.key === 'Escape' && closeUserMenu()}
						role="button"
						tabindex="0"
					></div>
					
					<div class="absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl z-50 overflow-hidden border border-white/10 user-menu-enter">
						<!-- Gradient top bar -->
						<div class="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
						
						<div class="bg-[#111827]/95 backdrop-blur-xl p-2">
							<!-- User info header -->
							<div class="flex items-center gap-3 px-3 py-3 mb-1">
								{#if $user.photoURL}
									<img src={$user.photoURL} alt="Avatar" class="w-10 h-10 rounded-full border-2 border-purple-500/50" />
								{:else}
									<div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white border-2 border-white/10">
										{($userProfile.username || $user.displayName || $user.email || 'U').substring(0, 2).toUpperCase()}
									</div>
								{/if}
								<div class="flex-1 min-w-0">
									<p class="text-sm font-semibold text-white truncate">{$userProfile.username || $user.displayName || 'Usuario'}</p>
									<p class="text-[10px] text-gray-400 truncate">{$user.email}</p>
								</div>
							</div>

							<div class="h-px bg-white/10 mx-2 mb-1"></div>

							<!-- Menu items -->
							<button 
								on:click={openProfile}
								class="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
							>
								<span class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-base group-hover:scale-110 transition-transform">👤</span>
								<div class="text-left">
									<span class="block font-medium">Editar Perfil</span>
									<span class="block text-[10px] text-gray-500">Nombre, edad, peso, meta</span>
								</div>
							</button>

							<button 
								on:click={openPreferences}
								class="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 group"
							>
								<span class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-base group-hover:scale-110 transition-transform">⚙️</span>
								<div class="text-left">
									<span class="block font-medium">Preferencias</span>
									<span class="block text-[10px] text-gray-500">Idioma, unidades de medida</span>
								</div>
							</button>

							<div class="h-px bg-white/10 mx-2 my-1"></div>

							<button 
								on:click={handleLogout}
								class="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
							>
								<span class="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-base group-hover:scale-110 transition-transform">🚪</span>
								<span class="font-medium">Cerrar Sesión</span>
							</button>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<button 
				on:click={handleLogin}
				class="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 rounded-full group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#05070a] shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
			>
				<span class="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-500 opacity-80 group-hover:opacity-100 transition-all duration-300"></span>
				<span class="absolute inset-0 w-full h-full rounded-full opacity-0 group-hover:opacity-40 blur-md bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"></span>
				<span class="absolute inset-[1px] w-[calc(100%-2px)] h-[calc(100%-2px)] rounded-full bg-[#0a0f18] group-hover:bg-opacity-0 transition-all duration-300"></span>
				<span class="relative flex items-center gap-2 text-white/90 group-hover:text-white">
					<span class="text-base group-hover:scale-110 transition-transform duration-300">⚡</span>
					<span class="tracking-widest uppercase">Login</span>
				</span>
			</button>
		{/if}
	</div>

	{#if showAuthModal}
		<AuthModal on:close={toggleAuthModal} />
	{/if}

	{#if showProfileModal}
		<ProfileModal initialTab={profileInitialTab} on:close={closeProfileModal} />
	{/if}

	<div class="max-w-md w-full">
		<!-- Logo animado -->
		<div class="text-center mb-4" class:animate={animate}>
			<div class="relative inline-block">
				<div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
				<div class="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-2 shadow-2xl transform hover:scale-110 transition-transform duration-300">
					<img src="/logo.png" alt="HiitBeep Logo" class="w-36 h-36 object-contain drop-shadow-lg" />
				</div>
			</div>
		</div>
		
		<!-- Título y Subtítulo -->
		<div class="text-center space-y-4 mb-12">
			<h1 class="text-5xl font-bold text-white tracking-tight">
				{$t('app.title')}
			</h1>
			<p class="text-xl text-blue-200 font-light">
				{$t('dashboard.subtitle')}
			</p>
			<p class="text-sm text-gray-300 italic">
				"{$t('dashboard.tagline')}"
			</p>
		</div>
		
		<!-- Botones de Navegación -->
		<div class="space-y-4" class:animate-buttons={animate}>
			<!-- Botón Configurar Rutinas -->
			<button 
				on:click={openSettings}
				class="w-full group relative overflow-hidden rounded-2xl p-6 shadow-2xl transform hover:translate-y-[-4px] transition-all duration-300 border border-white/5"
				style="background: linear-gradient(135deg, #1e40af, #1e3a8a);"
			>
				<div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<div class="relative flex items-center space-x-5">
					<div class="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">⚙️</div>
					<div class="flex-1 text-left">
						<h3 class="text-xl font-bold text-white tracking-tight">{$t('dashboard.configure_routines')}</h3>
						<p class="text-blue-100/70 text-xs font-medium uppercase tracking-wider mt-1">{$t('dashboard.configure_description')}</p>
					</div>
					<div class="text-white/30 group-hover:translate-x-1 group-hover:text-white/100 transition-all font-bold text-xl">→</div>
				</div>
			</button>
			
			<!-- Botón Mis Rutinas -->
			<button 
				on:click={openRoutines}
				class="w-full group relative overflow-hidden rounded-2xl p-6 shadow-2xl transform hover:translate-y-[-4px] transition-all duration-300 border border-white/5"
				style="background: linear-gradient(135deg, #166534, #14532d);"
			>
				<div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<div class="relative flex items-center space-x-5">
					<div class="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">📋</div>
					<div class="flex-1 text-left">
						<h3 class="text-xl font-bold text-white tracking-tight">{$t('dashboard.my_routines')}</h3>
						<p class="text-green-100/70 text-xs font-medium mt-1">
							<span class="font-bold text-white">{$routineStats.totalRoutines}</span> {$routineStats.totalRoutines === 1 ? $t('dashboard.routine_saved') : $t('dashboard.routines_saved')}
						</p>
					</div>
					<div class="text-white/30 group-hover:translate-x-1 group-hover:text-white/100 transition-all font-bold text-xl">→</div>
				</div>
			</button>
			
			<!-- Botón Historial -->
			<button 
				on:click={openHistory}
				class="w-full group relative overflow-hidden rounded-2xl p-6 shadow-2xl transform hover:translate-y-[-4px] transition-all duration-300 border border-white/5"
				style="background: linear-gradient(135deg, #6b21a8, #581c87);"
			>
				<div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<div class="relative flex items-center space-x-5">
					<div class="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform">📊</div>
					<div class="flex-1 text-left">
						<h3 class="text-xl font-bold text-white tracking-tight">{$t('dashboard.history')}</h3>
						<p class="text-purple-100/70 text-xs font-medium mt-1">
							<span class="font-bold text-white">{$routineStats.totalWorkouts}</span> {$routineStats.totalWorkouts === 1 ? $t('dashboard.workout_completed') : $t('dashboard.workouts_completed')}
						</p>
					</div>
					<div class="text-white/30 group-hover:translate-x-1 group-hover:text-white/100 transition-all font-bold text-xl">→</div>
				</div>
			</button>
		</div>
		
	</div>
</div>

<style>
	.animate {
		animation: fadeInScale 0.6s ease-out;
	}
	
	.animate-buttons {
		animation: slideUp 0.8s ease-out;
	}
	
	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.user-menu-enter) {
		animation: menuSlideIn 0.2s ease-out;
	}

	@keyframes menuSlideIn {
		from {
			opacity: 0;
			transform: translateY(-8px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
