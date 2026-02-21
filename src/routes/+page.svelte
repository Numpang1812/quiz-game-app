<script lang="ts">
	import defaultBackgroundImage from '$lib/assets/Background image.png';

	function onPlayClick(): void {
		window.location.href = '/game';
	}

	function onRankingClick(): void {
		window.location.href = '/ranking';
	}
</script>

<main class="menu-bg" style={`--custom-background-image: url('${defaultBackgroundImage}');`}>
	<div class="fence" aria-hidden="true"></div>
	<div class="garden-floor" aria-hidden="true">
		<div class="grass-top"></div>
	</div>

	<section class="menu-content" aria-label="Main menu">
		<div class="title-wrap">
			<h1 class="title-stroke">クイック日本語！</h1>
		</div>

		<div class="mascot" aria-hidden="true">
			<div class="mascot-body">
				<div class="face">
					<div class="eyes">
						<span></span>
						<span></span>
					</div>
					<svg width="22" height="10" viewBox="0 0 20 10">
						<path
							d="M2,2 Q5,8 10,2 Q15,8 18,2"
							stroke="#1d5f22"
							stroke-width="3"
							fill="none"
							stroke-linecap="round"
						/>
					</svg>
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

		<input type="text" maxlength="12" placeholder="あなたの名前は？" aria-label="Username" />

		<div class="actions">
			<button type="button" class="btn ranking" on:click={onRankingClick}>🏆 RANKING</button>
			<button type="button" class="btn play" on:click={onPlayClick}>Start🌱</button>
		</div>
	</section>
</main>

<style>
	.menu-bg {
		position: relative;
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 0;
		overflow: hidden;
		background-image: var(--custom-background-image);
		background-size: 100%;
		background-position: center;
		background-repeat: no-repeat;
		background-attachment: fixed;
	}

	.menu-content {
		position: relative;
		z-index: 30;
		width: min(720px, 95%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.8rem;
		text-align: center;
	}

	/* TITLE */
	.title-wrap h1 {
		margin: 0;
		font-size: clamp(2.8rem, 7vw, 4.5rem);
		font-weight: 900;
		letter-spacing: 2px;
	}

	.title-stroke {
		color: #ffffff;
		text-shadow:
			-4px -4px 0 #5cc45f,
			4px -4px 0 #5cc45f,
			-4px 4px 0 #5cc45f,
			4px 4px 0 #5cc45f,
			0 10px 18px rgba(0, 0, 0, 0.2);
	}

	/* MASCOT */
	.mascot {
		position: relative;
		width: 200px;
		height: 160px;
		animation: bounce 2.5s ease-in-out infinite;
	}

	.mascot-body {
		position: absolute;
		left: 50%;
		bottom: 0;
		transform: translateX(-50%);
		width: 170px;
		height: 125px;
		border: 4px solid #2e7d32;
		border-radius: 55% 55% 45% 45%;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.face {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 1.4rem;
	}

	.eyes {
		display: flex;
		gap: 2.2rem;
		margin-bottom: 0.3rem;
	}

	.eyes span {
		width: 9px;
		height: 9px;
		border-radius: 999px;
		background: #2e7d32;
	}

	/* Sprout sway */
	.sprout {
		position: absolute;
		top: -36px;
		left: 50%;
		transform: translateX(-50%);
		transform-origin: bottom center;
		animation: sway 3s ease-in-out infinite;
	}

	/* INPUT */
	input {
		width: min(460px, 95%);
		padding: 1rem 1.2rem;
		border-radius: 18px;
		border: 4px solid #7ed957;
		background: #f2f2f2;
		outline: none;
		text-align: center;
		font-size: 1.1rem;
		font-weight: 600;
		color: #555;
		box-shadow: 0 6px 0 #5bbf4c;
		transition: 0.2s ease;
	}

	input::placeholder {
		color: #9c9c9c;
		font-weight: 600;
	}

	input:focus {
		background: #ffffff;
		transform: translateY(-2px);
	}

	/* BUTTONS */
	.actions {
		display: flex;
		gap: 1.2rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn {
		border: none;
		border-radius: 16px;
		padding: 0.9rem 1.6rem;
		font-size: 1.3rem;
		font-weight: 800;
		color: #fff;
		cursor: pointer;
		border-bottom: 8px solid transparent;
		transition: all 0.15s ease;
	}

	.btn.ranking {
		background: #e2a72f;
		border-bottom-color: #b77e13;
	}

	.btn.play {
		font-size: 1.6rem;
		background: #3ed33e;
		border-bottom-color: #1f8f1f;
	}

	/* Nintendo hover lift */
	.btn:hover {
		transform: translateY(-4px);
		filter: brightness(1.05);
	}

	.btn:active {
		transform: translateY(8px);
		border-bottom-width: 0;
	}

	/* FENCE */
	.fence {
		position: fixed;
		left: 0;
		bottom: 50px;
		width: 100%;
		height: 42px;
		background-image: linear-gradient(
			90deg,
			#d9c7bf 20px,
			transparent 20px,
			transparent 30px,
			#d9c7bf 30px
		);
		background-size: 40px 100%;
		z-index: 5;
	}

	/* GROUND */
	.garden-floor {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 50px;
		background: #7a5a4e;
		border-top: 12px solid #a37b6c;
		z-index: 20;
	}

	.grass-top {
		position: absolute;
		top: -24px;
		left: 0;
		width: 100%;
		height: 24px;
		background-image: radial-gradient(circle at 10px 24px, #3ed33e 12px, transparent 13px);
		background-size: 20px 24px;
	}

	/* Animations */
	@keyframes sway {
		0%, 100% { transform: translateX(-50%) rotate(-2deg); }
		50% { transform: translateX(-50%) rotate(2deg); }
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}
</style>