<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import defaultBackgroundImage from '$lib/assets/Background image.png'
	import {
		type Question,
		type ConfettiPiece,
		type QuestionnaireAnswerKey,
		totalTime,
		penaltySeconds,
		randomQuestion,
		shuffleOptions,
		getResultTier,
		timerPercent,
		plantStyle,
		plantSvg,
	} from '$lib'
	import { returnCurrentUser } from '$lib/utils/saveUsername'
	import { audioManager } from '$lib/utils/audioController'
	import { goto } from '$app/navigation'
	import { resolve } from '$app/paths'

	export let data: { sessionId: string; signature: string }

	let score = 0
	let ranking: number | null = null

	let timeLeft = totalTime
	let isLowTime = false
	let gameOver = false

	let penaltyVisible = false
	let timerId: number | null = null
	let penaltyId: number | null = null
	let confetti: ConfettiPiece[] = []

	let currentQuestion: Question | null = null
	let choices: Array<[QuestionnaireAnswerKey, string]> = []

	$: resultTier = getResultTier(score)

	async function saveNameAndScore() {
		const res = await fetch('/api/scores', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name: returnCurrentUser(),
				score,
				sessionId: data.sessionId,
				signature: data.signature,
			}),
		})
		const result = await res.json()
		if (!res.ok) {
			console.error('unable to save score', result)
			// either throw or return a sentinel
			throw new Error(result.error || 'save failed')
		}

		// coerce to number just in case it comes back as a string
		return Number(result.rank)
	}

	async function getNameAndScore() {
		const response = await fetch('/api/scores')
		const scores = await response.json()
		return scores
	}

	function nextQuestion(): void {
		currentQuestion = randomQuestion()
		choices = currentQuestion ? shuffleOptions(currentQuestion) : []
	}

	function clearTimers(): void {
		if (timerId !== null) {
			window.clearInterval(timerId)
			timerId = null
		}
		if (penaltyId !== null) {
			window.clearTimeout(penaltyId)
			penaltyId = null
		}
	}

	function startTimer(): void {
		timerId = window.setInterval(() => {
			if (gameOver) return
			timeLeft -= 0.05

			isLowTime = timeLeft <= 7 && timeLeft > 0

			if (timeLeft <= 0) {
				isLowTime = false
				endGame()
			}
		}, 50)
	}

	function startGame(): void {
		clearTimers()
		score = 0
		timeLeft = totalTime
		gameOver = false
		penaltyVisible = false

		audioManager.isGameOver = false
		audioManager.playTrack('game')

		confetti = []
		nextQuestion()
		startTimer()
	}

	function showPenalty(): void {
		penaltyVisible = true
		if (penaltyId !== null) {
			window.clearTimeout(penaltyId)
		}
		penaltyId = window.setTimeout(() => {
			penaltyVisible = false
		}, 400)
	}

	function spawnConfetti(count: number): void {
		const colors = ['#77c66e', '#facc15', '#ffffff', '#43a047']
		confetti = Array.from({ length: count }, (_, index) => ({
			id: index,
			left: Math.random() * 100,
			duration: 2000 + Math.random() * 2000,
			rotation: 360 + Math.random() * 540,
			color: colors[Math.floor(Math.random() * colors.length)],
		}))
	}

	async function endGame(): Promise<void> {
		audioManager.stopGameMusic()
		audioManager.playGameOver()
		audioManager.playTrack('mainMenu')
		isLowTime = false

		gameOver = true
		penaltyVisible = false
		clearTimers()

		if (score > 15) {
			spawnConfetti(60)
		} else if (score > 5) {
			spawnConfetti(20)
		} else {
			confetti = []
		}
		try {
			const r = await saveNameAndScore()
			ranking = Number.isFinite(r) ? r : null
		} catch (err) {
			ranking = null
		}
	}

	function chooseAnswer(choice: QuestionnaireAnswerKey): void {
		if (!currentQuestion || gameOver) {
			return
		}

		if (choice === currentQuestion.correct) {
			score += 1
			audioManager.playCorrect()
			nextQuestion()
		} else {
			audioManager.playWrong()
			timeLeft -= penaltySeconds
			showPenalty()
		}
	}

	onMount(() => {
		startGame()
	})

	onDestroy(() => {
		clearTimers()
		audioManager.stopGameMusic()
	})


</script>

<main
	class="page-wrap"
	style={`--custom-background-image: url('${defaultBackgroundImage}');  background-size: cover;`}
>
	<div class="fence" aria-hidden="true"></div>
	<div class="garden-floor" aria-hidden="true">
		<div class="grass-top"></div>
		<div class="garden-plants">
			{#if !gameOver}
				{#each Array(score) as _, index (index)}
					<div class="harvest-item sprout-sway" style={plantStyle(index)}>
						<svg width="50" height="50" viewBox="0 0 20 20">
							<!-- eslint-disable svelte/no-at-html-tags -->
							<g>{@html plantSvg(index + 1)}</g>
						</svg>
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
								<span class="tag-text">TRANSLATE</span>
							</div>
						</div>
						<h2 class="question-text">{currentQuestion?.prompt}</h2>
					</div>

					<div class="choices-layout">
						{#each choices as [key, text] (key)}
							<button type="button" class="choice-item" on:click={() => chooseAnswer(key)}
								>{text}</button
							>
						{/each}
					</div>
				</div>
			</div>
		</section>
	{:else}
		<section class="result-view">
			<div class="results-container">
				<div class="result-box">
					<!-- Floating Header Mascot (Issue #15) -->
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
							<div class="tag-text">タイムアップ！</div>
						</div>
					</div>

					<div class="score-content">
						<h3 class="user-display">{returnCurrentUser()} のスコア</h3>
						<div class="score-number">{score}</div>
						<p class="unit-label">正解数</p>
						<h3 class="user-display ranking-display">
							<span>歴代ランキング：</span>
							<span class="ranking-value">
								{#if ranking !== null}
									#{ranking}
								{:else}
									取得中...
								{/if}
							</span>
						</h3>

						<!-- <button class="ranking-pill">ランキング</button> -->
						<button
							class="ranking-pill"
							on:click={() => {
								audioManager.playClick()
								goto(resolve('/ranking'))
							}}>ランキング</button
						>

						<div class="nav-buttons">
							<button
								class="btn-circle green-dark"
								on:click={() => {
									audioManager.playClick()
									goto(resolve('/'))
								}}
								aria-label="Go back to home page"
							>
								<svg viewBox="0 0 24 24" width="24" height="24"
									><path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg
								>
							</button>
							<button
								class="btn-circle green-light"
								on:click={() => {
									audioManager.playClick()
									goto(resolve('/loading'))
								}}
								aria-label="Play again"
							>
								<svg viewBox="0 0 24 24" width="24" height="24"
									><path
										fill="currentColor"
										d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
									/></svg
								>
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- Red flash overlay when time is low -->
	{#if isLowTime && !gameOver}
		<div class="warning-flash" aria-hidden="true"></div>
	{/if}

	<div class={`penalty-flash ${penaltyVisible ? 'show' : ''}`} aria-hidden="true">
		<span class="penalty-text">-3s</span>
	</div>
</main>

<div class="confetti-layer" aria-hidden="true">
	{#each confetti as piece (piece.id)}
		<div
			class="confetti"
			style={`left:${piece.left}vw; background-color:${piece.color}; --dur:${piece.duration}ms; --rot:${piece.rotation}deg;`}
		></div>
	{/each}
</div>
