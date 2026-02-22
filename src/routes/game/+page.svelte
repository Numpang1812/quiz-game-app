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