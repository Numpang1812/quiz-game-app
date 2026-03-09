<script lang="ts">
	import '../styles/homepage.css'
	import defaultBackgroundImage from '$lib/assets/Background image.png'
	import { getUsername } from '$lib/utils/saveUsername'
	import { audioManager } from '$lib/utils/audioController'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'

	let username = $state('')
	let showModal = $state(false)
	let mascotHovered = $state(false)

	onMount(() => {
		const stored = localStorage.getItem('quiz-username')
		username = stored && stored !== 'Player' ? stored : ''
	})

	function onPlayClick(): void {
		audioManager.playClick()
		if (username.trim() === '') {
			showModal = true
		} else {
			proceedToGame()
		}
	}

	function proceedToGame(): void {
		audioManager.playStart()
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

	function onCreditsClick(): void {
		audioManager.playClick()
		goto('/credits')
	}
</script>

<main class="menu-bg" style={`--custom-background-image: url('${defaultBackgroundImage}');`}>
	<section class="menu-content" aria-label="Main menu">
		<div class="title-wrap">
			<h1 class="title-stroke">クイック日本語！</h1>
		</div>

		<button
			type="button"
			class="mascot-btn"
			onclick={onCreditsClick}
			onmouseenter={() => (mascotHovered = true)}
			onmouseleave={() => (mascotHovered = false)}
			aria-label="View credits"
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
			onclick={() => audioManager.playClick()}
		/>

		<div class="actions">
			<button type="button" class="btn play" onclick={onPlayClick}>
				スタート🌱
			</button>
			<button type="button" class="btn ranking" onclick={onRankingClick}>
				ランク🏆
			</button>
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
							<button type="button" class="btn play" onclick={confirmDefaultName}>
								はい
							</button>
							<button
								type="button"
								class="btn ranking"
								onclick={() => {
									audioManager.playClick()
									showModal = false
								}}
							>
								いいえ
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</section>
</main>

<style>
	:global(.menu-content) input::placeholder {
		color: #9c9c9c;
		font-weight: 600;
	}
</style>
