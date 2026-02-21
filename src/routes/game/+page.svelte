<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import defaultBackgroundImage from '$lib/assets/Background image.png';
	import {
		type Question,
		type ResultTier,
		type ConfettiPiece,
		type QuestionnaireAnswerKey,
		questions,
		totalTime,
		penaltySeconds,
		randomQuestion,
		shuffleOptions,
		getResultTier,
		timerPercent,
		plantStyle,
		plantSvg
	} from '$lib';

	let score = 0;
	let timeLeft = totalTime;
	let gameOver = false;
	let penaltyVisible = false;
	let timerId: number | null = null;
	let penaltyId: number | null = null;
	let confetti: ConfettiPiece[] = [];

	let currentQuestion: Question | null = null;
	let choices: Array<[QuestionnaireAnswerKey, string]> = [];

	$: resultTier = getResultTier(score);

	function nextQuestion(): void {
		currentQuestion = randomQuestion();
		choices = currentQuestion ? shuffleOptions(currentQuestion) : [];
	}

	function clearTimers(): void {
		if (timerId !== null) {
			window.clearInterval(timerId);
			timerId = null;
		}
		if (penaltyId !== null) {
			window.clearTimeout(penaltyId);
			penaltyId = null;
		}
	}

	function startTimer(): void {
		timerId = window.setInterval(() => {
			if (gameOver) {
				return;
			}

			timeLeft -= 0.05;
			if (timeLeft <= 0) {
				endGame();
			}
		}, 50);
	}

	function startGame(): void {
		clearTimers();
		score = 0;
		timeLeft = totalTime;
		gameOver = false;
		penaltyVisible = false;
		confetti = [];
		nextQuestion();
		startTimer();
	}

	function showPenalty(): void {
		penaltyVisible = true;
		if (penaltyId !== null) {
			window.clearTimeout(penaltyId);
		}
		penaltyId = window.setTimeout(() => {
			penaltyVisible = false;
		}, 400);
	}

	function spawnConfetti(count: number): void {
		const colors = ['#77c66e', '#facc15', '#ffffff', '#43a047'];
		confetti = Array.from({ length: count }, (_, index) => ({
			id: index,
			left: Math.random() * 100,
			duration: 2000 + Math.random() * 2000,
			rotation: 360 + Math.random() * 540,
			color: colors[Math.floor(Math.random() * colors.length)]
		}));
	}

	function endGame(): void {
		gameOver = true;
		clearTimers();
		if (score > 15) {
			spawnConfetti(60);
		} else if (score > 5) {
			spawnConfetti(20);
		} else {
			confetti = [];
		}
	}

	function chooseAnswer(choice: QuestionnaireAnswerKey): void {
		if (!currentQuestion || gameOver) {
			return;
		}

		if (choice === currentQuestion.correct) {
			score += 1;
			nextQuestion();
		} else {
			timeLeft -= penaltySeconds;
			showPenalty();
		}
	}

	onMount(() => {
		startGame();
	});

	onDestroy(() => {
		clearTimers();
	});
</script>

<main class="page-wrap" style={`--custom-background-image: url('${defaultBackgroundImage}');`}>
	<div class="fence" aria-hidden="true"></div>
	<div class="garden-floor" aria-hidden="true">
		<div class="grass-top"></div>
		<div class="garden-plants">
			{#if !gameOver}
				{#each Array(score) as _, index}
					<div class="harvest-item sprout-sway" style={plantStyle(index)}>
						<svg width="50" height="50" viewBox="0 0 20 20">{@html plantSvg(index + 1)}</svg>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	{#if !gameOver}
		<section class="game-view">
			<div class="game-container">
				<div class="hud">
					<div class="hud-left">
						<span class="hud-label">Harvest Count</span>
						<strong class="hud-value">{score}</strong>
					</div>
					<div class="hud-right">
						<span class="hud-label">Remaining</span>
						<strong class="hud-value">{Math.max(0, timeLeft).toFixed(1)}</strong>
					</div>
				</div>

				<div class="timer-container {timeLeft < 6 ? 'timer-low' : ''}">
					<div
						class="timer-bar"
						style={`width:${timerPercent(timeLeft, totalTime)}%; background:${timeLeft < 6 ? '#ef4444' : timeLeft < 15 ? '#facc15' : '#77c66e'};`}
					></div>
				</div>

				<div class="question-card">
					<div class="translate-pill">Translate</div>
					<h2 class="question-text">{currentQuestion?.prompt}</h2>
				</div>

				<div class="choices-grid">
					{#each choices as [key, text]}
						<button type="button" class="choice-btn" on:click={() => chooseAnswer(key)}>{text}</button>
					{/each}
				</div>
			</div>
		</section>
	{:else}
		<section class="result-view">
			<div class={`result-card ${resultTier.className}`}>
				<h2 class="result-title">{resultTier.title}</h2>
				<div class="score-circle">
					<span class="score-value">{score}</span>
				</div>
				<p class="result-subtitle">{resultTier.subtitle}</p>

				<div class="result-actions">
					<button type="button" class="btn-play-again" on:click={startGame}>PLAY AGAIN 🔄</button>
					<a href="/" class="btn-home">HOME</a>
				</div>
			</div>
		</section>
	{/if}

	<div class={`penalty-flash ${penaltyVisible ? 'show' : ''}`} aria-hidden="true">
		<span class="penalty-text">-3s</span>
	</div>

	<div class="confetti-layer" aria-hidden="true">
		{#each confetti as piece (piece.id)}
			<div
				class="confetti"
				style={`left:${piece.left}vw; background-color:${piece.color}; --dur:${piece.duration}ms; --rot:${piece.rotation}deg;`}
			></div>
		{/each}
	</div>
</main>

<style>
	.page-wrap {
		position: relative;
		min-height: 100vh;
		width: 100%;
		overflow: hidden;
		background-image: var(--custom-background-image);
		background-size: 100%;
		background-position: center;
		background-repeat: no-repeat;
		background-attachment: fixed;
		padding: 2rem 1rem 3rem;
		box-sizing: border-box;
	}

	/* GAME SECTION */
	.game-view {
		position: relative;
		z-index: 30;
	}

	.game-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	/* HUD */
	.hud {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 1rem;
	}

	.hud-left,
	.hud-right {
		display: flex;
		flex-direction: column;
	}

	.hud-right {
		align-items: flex-end;
	}

	.hud-label {
		font-size: 0.75rem;
		font-weight: 900;
		color: #1b5e20;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.6;
	}

	.hud-value {
		font-size: 2.25rem;
		font-weight: 900;
		color: #1b5e20;
	}

	/* TIMER BAR */
	.timer-container {
		width: 100%;
		height: 1rem;
		background: white;
		border: 2px solid #1b5e20;
		border-radius: 9999px;
		overflow: hidden;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
		margin-bottom: 3rem;
	}

	.timer-bar {
		height: 100%;
		background: #77c66e;
		transition: width 100ms linear;
		border-radius: 9999px;
	}

	.timer-low {
		animation: shake 0.1s infinite;
	}

	@keyframes shake {
		0% {
			transform: translate(1px, 1px);
		}
		50% {
			transform: translate(-1px, -1px);
		}
		100% {
			transform: translate(1px, -1px);
		}
	}

	/* QUESTION CARD */
	.question-card {
		position: relative;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(12px);
		border: 4px solid #77c66e;
		border-radius: 1.875rem;
		padding: 2.5rem;
		text-align: center;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		margin-bottom: 2rem;
	}

	.translate-pill {
		position: absolute;
		top: -1rem;
		left: 50%;
		transform: translateX(-50%);
		background: #77c66e;
		color: white;
		padding: 0.25rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 900;
		text-transform: uppercase;
	}

	.question-text {
		margin: 0;
		font-size: clamp(2rem, 6vw, 3.75rem);
		font-weight: 900;
		color: #1b5e20;
	}

	/* CHOICES GRID */
	.choices-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		width: 100%;
	}

	.choice-btn {
		padding: 1rem 1.5rem;
		background: white;
		border: none;
		border-bottom: 4px solid #d1d5db;
		border-radius: 0.875rem;
		font-size: 1.25rem;
		font-weight: 900;
		color: #1b5e20;
		cursor: pointer;
		text-align: center;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.choice-btn:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}

	.choice-btn:active {
		border-bottom: 0;
		transform: translateY(4px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 640px) {
		.choices-grid {
			grid-template-columns: 1fr;
		}
	}

	/* RESULT SECTION */
	.result-view {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		position: relative;
		z-index: 40;
		padding: 2rem 1rem;
	}

	.result-card {
		background: white;
		border: 8px solid;
		border-radius: 2.5rem;
		padding: 3rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		max-width: 28rem;
		width: 100%;
		text-align: center;
		animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	@keyframes popIn {
		0% {
			transform: scale(0.9);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.result-card.tier-low {
		border-color: #cbd5e1;
	}

	.result-card.tier-med {
		border-color: #77c66e;
	}

	.result-card.tier-high {
		border-color: #facc15;
		box-shadow: 0 0 30px rgba(250, 204, 21, 0.3), 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	}

	.result-title {
		margin: 0 0 1rem;
		font-size: 1.875rem;
		font-weight: 900;
		text-transform: uppercase;
		color: #1b5e20;
	}

	.score-circle {
		width: 8rem;
		height: 8rem;
		border: 4px solid;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f9fafb;
		margin: 0 auto 1rem;
	}

	.result-card.tier-low .score-circle {
		border-color: #cbd5e1;
	}

	.result-card.tier-med .score-circle {
		border-color: #77c66e;
	}

	.result-card.tier-high .score-circle {
		border-color: #facc15;
	}

	.score-value {
		font-size: 3.75rem;
		font-weight: 900;
		color: #1b5e20;
	}

	.result-subtitle {
		margin: 0 0 2rem;
		font-size: 1.25rem;
		font-weight: 700;
		color: #374151;
	}

	.result-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.btn-play-again {
		padding: 1rem;
		background: #43a047;
		color: white;
		border: none;
		border-bottom: 8px solid #1b5e20;
		border-radius: 0.875rem;
		font-size: 1.5rem;
		font-weight: 900;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-play-again:active {
		transform: translateY(2px);
		border-bottom: 0;
	}

	.btn-home {
		padding: 1rem;
		background: white;
		color: #9ca3af;
		border: 4px solid #e5e7eb;
		border-radius: 0.875rem;
		font-size: 1.25rem;
		font-weight: 900;
		text-align: center;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-home:hover {
		background: #f9fafb;
	}

	/* PENALTY FLASH */
	.penalty-flash {
		position: fixed;
		inset: 0;
		pointer-events: none;
		background: rgba(239, 68, 68, 0.2);
		opacity: 0;
		transition: opacity 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
	}

	.penalty-flash.show {
		opacity: 1;
	}

	.penalty-text {
		font-size: 4.5rem;
		font-weight: 900;
		color: #dc2626;
	}

	/* CONFETTI */
	.confetti-layer {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 100;
	}

	.confetti {
		position: absolute;
		width: 10px;
		height: 10px;
		animation: confettiFall var(--dur) linear forwards;
	}

	@keyframes confettiFall {
		to {
			transform: translateY(100vh) rotate(var(--rot));
			opacity: 0;
		}
	}

	/* GARDEN ELEMENTS */
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

	.garden-plants {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.harvest-item {
		position: absolute;
		bottom: 10px;
		transform-origin: bottom center;
		animation: sproutPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
		z-index: 25;
	}

	@keyframes sproutPop {
		0% {
			transform: scale(0) translateY(40px) rotate(-10deg);
			opacity: 0;
		}
		60% {
			transform: scale(1.2) translateY(-5px) rotate(5deg);
		}
		100% {
			transform: scale(1) translateY(0) rotate(0);
			opacity: 1;
		}
	}

	.sprout-sway {
		animation: sway 3s ease-in-out infinite;
		transform-origin: bottom center;
	}

	@keyframes sway {
		0%,
		100% {
			transform: rotate(-2deg);
		}
		50% {
			transform: rotate(2deg);
		}
	}
</style>