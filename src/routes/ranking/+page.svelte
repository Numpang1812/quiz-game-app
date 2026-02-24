<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import defaultBackgroundImage from '$lib/assets/Background image.png';
	import { returnCurrentUser } from '$lib/utils/saveUsername';

	type ApiScore = {
		name: string;
		score: number;
		created_time: string;
	};

	type RankingRow = {
		id: string;
		rank: number;
		name: string;
		score: number | string;
		date: string;
		isCurrentUser: boolean;
	};

	let top10Scores: RankingRow[] = [];

	function formatDate(dateValue: string): string {
		const date = new Date(dateValue);
		if (Number.isNaN(date.getTime())) {
			return '-';
		}
		return date.toLocaleDateString('ja-JP');
	}

	function buildRows(scores: ApiScore[]): RankingRow[] {
		const currentUser = returnCurrentUser().trim().toLowerCase();
		const rows: RankingRow[] = scores.slice(0, 10).map((score, index) => ({
			id: `${score.name}-${score.created_time}-${index}`,
			rank: index + 1,
			name: score.name,
			score: score.score,
			date: formatDate(score.created_time),
			isCurrentUser: currentUser.length > 0 && score.name.trim().toLowerCase() === currentUser
		}));

		for (let rank = rows.length + 1; rank <= 10; rank += 1) {
			rows.push({
				id: `empty-${rank}`,
				rank,
				name: '- - -',
				score: '-',
				date: '-',
				isCurrentUser: false
			});
		}

		return rows;
	}

	async function loadScores(): Promise<void> {
		try {
			const response = await fetch('/api/scores');
			if (!response.ok) {
				top10Scores = buildRows([]);
				return;
			}
			const scores = (await response.json()) as ApiScore[];
			top10Scores = buildRows(scores);
		} catch {
			top10Scores = buildRows([]);
		}
	}

	function goHome(): void {
		goto('/');
	}

	onMount(async () => {
		await loadScores();
	});
</script>

<main class="ranking-page page-wrap" style={`--custom-background-image: url('${defaultBackgroundImage}');`}>
	<section class="ranking-board-container" aria-label="Ranking board">
		<div class="title-badge">ランキング</div>

		<div class="ranking-table-scroll">
			<div class="ranking-table" role="table" aria-label="Top ranking table">
				<div class="cell header-cell" role="columnheader">順位</div>
				<div class="cell header-cell" role="columnheader">プレイヤー名</div>
				<div class="cell header-cell" role="columnheader">スコア</div>
				<div class="cell header-cell" role="columnheader">プレイ日</div>

				{#each top10Scores as score (score.id)}
					{@const cellClass = score.isCurrentUser ? 'highlight-cell' : 'normal-cell'}

					<div class={`cell ${cellClass}`} role="cell">
						{#if score.rank === 1}
							<svg viewBox="0 0 40 24" class="medal-icon" aria-label="1st place medal">
								<ellipse cx="12" cy="12" rx="6" ry="3" fill="#8cc63f" transform="rotate(-30 12 12)" />
								<ellipse cx="28" cy="12" rx="6" ry="3" fill="#8cc63f" transform="rotate(30 28 12)" />
								<circle cx="20" cy="12" r="8" fill="#fcd34d" stroke="#d97706" stroke-width="1.5" />
								<text x="20" y="16" font-size="10" font-weight="bold" fill="white" text-anchor="middle">1</text>
							</svg>
						{:else if score.rank === 2}
							<svg viewBox="0 0 40 24" class="medal-icon" aria-label="2nd place medal">
								<ellipse cx="12" cy="12" rx="6" ry="3" fill="#8cc63f" transform="rotate(-30 12 12)" />
								<ellipse cx="28" cy="12" rx="6" ry="3" fill="#8cc63f" transform="rotate(30 28 12)" />
								<circle cx="20" cy="12" r="8" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" />
								<text x="20" y="16" font-size="10" font-weight="bold" fill="white" text-anchor="middle">2</text>
							</svg>
						{:else if score.rank === 3}
							<svg viewBox="0 0 40 24" class="medal-icon" aria-label="3rd place medal">
								<ellipse cx="12" cy="12" rx="6" ry="3" fill="#8cc63f" transform="rotate(-30 12 12)" />
								<ellipse cx="28" cy="12" rx="6" ry="3" fill="#8cc63f" transform="rotate(30 28 12)" />
								<circle cx="20" cy="12" r="8" fill="#b45309" stroke="#78350f" stroke-width="1.5" />
								<text x="20" y="16" font-size="10" font-weight="bold" fill="white" text-anchor="middle">3</text>
							</svg>
						{:else}
							<span class="rank-number">{score.rank}.</span>
						{/if}
					</div>

					<div class={`cell ${cellClass} name-cell`} role="cell">{score.name}</div>
					<div class={`cell ${cellClass} score-cell`} role="cell">{score.score}</div>
					<div class={`cell ${cellClass} date-cell`} role="cell">{score.date}</div>
				{/each}
			</div>
		</div>
	</section>

	<button class="home-button" type="button" on:click={goHome}>ホームへ戻る</button>
</main>

