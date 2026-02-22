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