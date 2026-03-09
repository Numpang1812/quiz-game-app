<script lang="ts">
	import defaultBackgroundImage from '$lib/assets/Background image.png'
	import { getUsername } from '$lib/utils/saveUsername'
	import { audioManager } from '$lib/utils/audioController'
	import { goto } from '$app/navigation'

	let showModal = false

	function onPlayClick(): void {
		if (username.trim() === '') {
			audioManager.playClick()
			showModal = true
		} else {
			proceedToGame()
		}
	}

	function proceedToGame(): void {
		audioManager.playStart()
		audioManager.playClick()
		getUsername(username || 'Player')
		goto('/loading')
	}

	function confirmDefaultName(): void {
		username = 'Player'
		showModal = false
		proceedToGame()
	}

	function onRankingClick(): void {
		audioManager.playClick()
		goto('/ranking')
	}

	function onInputClick(): void {
		audioManager.playClick()
	}

	function onCreditsClick(): void {
		audioManager.playClick()
		goto('/credits')
	}

	import { onMount } from 'svelte'
	let username = ''

	onMount(() => {
		const stored = localStorage.getItem('quiz-username')
		if (stored && stored !== 'Player') {
			username = stored
		} else {
			username = ''
		}
	})
	let mascotHovered = false
</script>

<main class="menu-bg" style={`--custom-background-image: url('${defaultBackgroundImage}');`}>
	<section class="menu-content" aria-label="Main menu">
		<div class="title-wrap">
			<h1 class="title-stroke">クイック日本語！</h1>
		</div>

		<button
			type="button"
			class="mascot-btn"
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
								<ellipse cx="10" cy="10" rx="3.5" ry="4.5" fill="#1d5f22" />
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
				</div>
			</div>
		</button>

		<input
			type="text"
			maxlength="12"
			placeholder="あなたの名前は？"
			aria-label="Username"
			bind:value={username}
			on:click={onInputClick}
		/>

		<div class="actions">
		<!-- Professor said the 🌱 and 🏆 should be on the left side instead -->
			<button type="button" class="btn play" on:click={onPlayClick}>🌱スタート</button>
			<button type="button" class="btn ranking" on:click={onRankingClick}>🏆ランク</button>
		</div>

		{#if showModal}
			<div class="modal-overlay">
				<div class="modal-box credit-box">
					<div class="header-decoration">
						<div class="mascot-tag">
							<div class="mini-mascot">
								<div class="mini-mascot-body">
									<div class="mini-face">
										<div class="mini-eyes">
											<span></span>
											<span></span>
										</div>
										<svg width="9" height="8" viewBox="0 0 20 20">
											<path
												d="M2,2 Q5,8 10,2 Q15,8 18,2"
												stroke="#1d5f22"
												stroke-width="3"
												fill="none"
												stroke-linecap="round"
											/>
										</svg>
									</div>
									<div class="mini-sprout">
										<svg width="20" height="20" viewBox="0 0 40 40">
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
								</div>
							</div>
							<div class="tag-text">確認</div>
						</div>
					</div>

					<div class="modal-content">
						<p class="modal-message">
							名前が入力されていません。<br />「Player」として進みますか？
						</p>
						<div class="modal-actions">
							<button type="button" class="btn play" on:click={confirmDefaultName}>はい</button>
							<button
								type="button"
								class="btn ranking"
								on:click={() => {
									audioManager.playClick()
									showModal = false
								}}>いいえ</button
							>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</section>
</main>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		backdrop-filter: blur(3px);
	}

	.modal-box {
		width: min(450px, 90vw) !important;
		height: auto !important;
		min-height: auto !important;
		padding: 50px 30px 40px !important;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.modal-message {
		font-size: clamp(1rem, 4vw, 1.3rem);
		font-weight: 800;
		color: #1b5e20;
		margin-bottom: 2.5rem;
		line-height: 1.6;
		white-space: pre-line;
	}

	.modal-actions {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		width: 100%;
	}

	.modal-actions .btn {
		min-width: 120px !important;
		padding: 10px 20px !important;
		font-size: 1.1rem !important;
	}

	.header-decoration {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 10;
	}
</style>
