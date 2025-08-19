<script lang="ts">
	import { onMount } from 'svelte';
	import Timer from '$lib/components/Timer.svelte';
	import IntervalConfig from '$lib/components/IntervalConfig.svelte';
	
	let isConfigMode = true;
	let intervals: Array<{ name: string; duration: number; color: string }> = [];
	let repetitions = 1;
	
	function startTimer(event: { intervals: Array<{ name: string; duration: number; color: string }>, repetitions: number }) {
		intervals = event.intervals;
		repetitions = event.repetitions;
		isConfigMode = false;
	}
	
	function backToConfig() {
		isConfigMode = true;
	}
</script>

<svelte:head>
	<title>HIITBeep - Cronómetro HIIT</title>
</svelte:head>

<main class="min-h-screen transition-colors duration-500 bg-gray-900 text-white">
	{#if isConfigMode}
		<IntervalConfig on:start={(event) => startTimer(event.detail)} />
	{:else}
		<Timer {intervals} {repetitions} on:back={backToConfig} />
	{/if}
</main>
