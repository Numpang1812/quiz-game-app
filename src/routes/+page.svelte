<script lang="ts">
	import defaultBackgroundImage from '$lib/assets/Background image.png';
	import { getUsername } from '$lib/utils/saveUsername';
	import { audioManager } from '$lib/utils/audioController';
	import { goto } from '$app/navigation';


	function onPlayClick(): void {
		audioManager.playStart();
		audioManager.playClick();
		getUsername(username);
		goto('/loading');
	}

	function onRankingClick(): void {
		audioManager.playClick();
		goto('/ranking');
	}

	function onInputClick(): void {
		audioManager.playClick();
	}

	function onCreditsClick(): void {
		window.location.href = '/credits';
	}

	let username = '';
	let mascotHovered = false;
</script>

<main class="menu-bg" style={`--custom-background-image: url('${defaultBackgroundImage}');`}>
	<section class="menu-content" aria-label="Main menu">
		<div class="title-wrap">
			<h1 class="title-stroke">クイック日本語！</h1>
		</div>

		<button type="button" class="mascot-btn"
			on:click={onCreditsClick}
			on:mouseenter={() => (mascotHovered = true)}
			on:mouseleave={() => (mascotHovered = false)}
		>
			<div class="mascot" aria-hidden="true">
				<div class="mascot-body">
					<div class="face">
						<div class="eyes">
							<span></span>
							<span></span>
						</div>
						{#if mascotHovered}
							<svg width="18" height="18" viewBox="0 0 20 20">
								<ellipse
									cx="10"
									cy="10"
									rx="3.5"
									ry="4.5"
									fill="#1d5f22"
								/>
							</svg>
						{:else}
							<svg width="22" height="10" viewBox="0 0 20 10">
								<path
									d="M2,2 Q5,8 10,2 Q15,8 18,2"
									stroke="#1d5f22"
									stroke-width="3"
									fill="none"
									stroke-linecap="round"
								/>
							</svg>
						{/if}
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
							<path d="M20 15 Q35 0 38 18 Q28 25 20 15" fill="#91d685" stroke="#1d5f22" stroke-width="2.5" />
							<path d="M20 15 Q5 0 2 18 Q12 25 20 15" fill="#91d685" stroke="#1d5f22" stroke-width="2.5" />
						</svg>
					</div>
				</div>
			</div>
		</button>

		<input type="text" maxlength="12" placeholder="あなたの名前は？" aria-label="Username" bind:value={username} on:click={onInputClick}/>

		<div class="actions">
			<button type="button" class="btn play" on:click={onPlayClick}>スタート🌱</button>
			<button type="button" class="btn ranking" on:click={onRankingClick}>ランク🏆</button>
		</div>
	</section>
</main>