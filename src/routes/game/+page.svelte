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
		penaltyVisible = false;
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

<main class="page-wrap" style={`--custom-background-image: url('${defaultBackgroundImage}');  background-size: cover;`}>
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

				<div class="quiz-container">
					<div class="question-card">
						<div class="card-header">
							<div class="mascot-tag">
								<div class="mini-mascot">
									<div class="mini-mascot-body">
										<div class="mini-face">
										<div class="mini-eyes">
											<span></span>
											<span></span>
										</div>
										<svg width="9" height="9" viewBox="0 0 20 20">
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
											<path d="M20 15 Q35 0 38 18 Q28 25 20 15" fill="#91d685" stroke="#1d5f22" stroke-width="2.5" />
											<path d="M20 15 Q5 0 2 18 Q12 25 20 15" fill="#91d685" stroke="#1d5f22" stroke-width="2.5" />
										</svg>
										</div>
									</div>
								</div>
								<span class="tag-text">TRANSLATE</span>
							</div>
						</div>
						<h2 class="question-text">{currentQuestion?.prompt}</h2>
					</div>

					<div class="choices-layout">
						{#each choices as [key, text]}
							<button type="button" class="choice-item" on:click={() => chooseAnswer(key)}>{text}</button>
						
						{/each}
					</div>
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