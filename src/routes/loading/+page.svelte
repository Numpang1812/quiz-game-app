<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import defaultBackgroundImage from '$lib/assets/Background image.png'

	let redirectTimer: ReturnType<typeof setTimeout> | null = null

	onMount(() => {
		redirectTimer = setTimeout(() => {
			goto('/game', { replaceState: true })
		}, 1800)
	})

	onDestroy(() => {
		if (redirectTimer) {
			clearTimeout(redirectTimer)
		}
	})
</script>

<main
	class="menu-bg loading-bg"
	style={`--custom-background-image: url('${defaultBackgroundImage}');`}
>
	<section class="loading-content" aria-label="Loading screen">
		<div class="mascot is-sleeping" aria-hidden="true">
			<div class="mascot-body">
				<div class="face">
					<div class="loading-eyes">
						<span class="mascot-eye"></span>
						<span class="mascot-eye"></span>
					</div>
					<div class="mascot-mouth"></div>
				</div>

				<div class="sprout">
					<svg width="52" height="52" viewBox="0 0 40 40">
						<path
							d="M20 40 Q20 20 20 12"
							stroke="#1d5f22"
							stroke-width="4"
							fill="none"
							stroke-linecap="round"
						/>
						<path
							d="M20 15 Q35 0 38 18 Q28 25 20 15"
							fill="#91d685"
							stroke="#1d5f22"
							stroke-width="2.5"
						/>
						<path
							d="M20 15 Q5 0 2 18 Q12 25 20 15"
							fill="#91d685"
							stroke="#1d5f22"
							stroke-width="2.5"
						/>
					</svg>
				</div>

				<div class="zzz-wrapper" aria-hidden="true">
					<span class="zzz">Z</span>
					<span class="zzz">Z</span>
					<span class="zzz">Z</span>
				</div>
			</div>
		</div>

		<p class="loading-text">Loading...</p>
	</section>
</main>
