<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../styles/global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}

<!-- Footer Scenery: Fence and Garden Bed -->
<div class="fence-row" aria-hidden="true"></div>
<div class="fence-line" aria-hidden="true"></div>
<div class="garden-bed" aria-hidden="true">
	<div class="grass-top"></div>
	<div class="soil-bottom"></div>
</div>
