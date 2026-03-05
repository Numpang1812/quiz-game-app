<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import defaultBackgroundImage from '$lib/assets/Background image.png';
	import { returnCurrentUser } from '$lib/utils/saveUsername';
	import { audioManager } from '$lib/utils/audioController';

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
	let selectedDate: string = getTodayString();
	let selectedToDate: string = getTodayString();
	let filterRange: string = 'custom';
	let rankingMode: 'daily' | 'global' = 'daily';

	const TODAY_STR = getTodayString();

	function getTodayString(): string {
		const today = new Date();
		return today.toISOString().split('T')[0];
	}

	function formatDate(dateValue: string): string {
		const date = new Date(dateValue);
		if (Number.isNaN(date.getTime())) {
			return '-';
		}
		return toDateString(date);
	}

	function toDateString(date: Date): string {
		return date.toISOString().split('T')[0];
	}

	function parseCreatedTime(createdTime: string): number {
		if (createdTime.includes('T')) {
			const parsed = Date.parse(createdTime);
			return Number.isFinite(parsed) ? parsed : -1;
		}

		const normalized = `${createdTime.replace(' ', 'T')}Z`;
		const parsed = Date.parse(normalized);
		return Number.isFinite(parsed) ? parsed : -1;
	}

	function getScoresCacheKey(params: URLSearchParams): string {
		return `ranking-cache:${params.toString()}`;
	}

	function readScoresCache(cacheKey: string): ApiScore[] | null {
		try {
			const raw = sessionStorage.getItem(cacheKey);
			if (!raw) return null;
			const parsed = JSON.parse(raw) as ApiScore[];
			return Array.isArray(parsed) ? parsed : null;
		} catch {
			return null;
		}
	}

	function writeScoresCache(cacheKey: string, scores: ApiScore[]): void {
		try {
			sessionStorage.setItem(cacheKey, JSON.stringify(scores));
		} catch {
			// ignore cache write failures
		}
	}

	function buildRows(scores: ApiScore[]): RankingRow[] {
		const currentUser = returnCurrentUser().trim().toLowerCase();
		const sorted = [...scores].sort((a, b) => b.score - a.score);
		const topScores = sorted.slice(0, 10);

		let latestCurrentUserId: string | null = null;
		let latestCurrentUserTime = -1;

		topScores.forEach((score, index) => {
			if (score.name.trim().toLowerCase() !== currentUser) {
				return;
			}

			const timeValue = parseCreatedTime(score.created_time);
			if (timeValue > latestCurrentUserTime) {
				latestCurrentUserTime = timeValue;
				latestCurrentUserId = `${score.name}-${score.created_time}-${index}`;
			}
		});

		const rows: RankingRow[] = topScores.map((score, index) => {
			const id = `${score.name}-${score.created_time}-${index}`;
			return {
				id,
				rank: index + 1,
				name: score.name,
				score: score.score,
				date: formatDate(score.created_time),
				isCurrentUser: latestCurrentUserId !== null && id === latestCurrentUserId,
			};
		});

		for (let rank = rows.length + 1; rank <= 10; rank += 1) {
			rows.push({
				id: `empty-${rank}`,
				rank,
				name: '- - -',
				score: '-',
				date: '-',
				isCurrentUser: false,
			});
		}

		return rows;
	}

	async function loadScores(): Promise<void> {
		try {
			const params = new URLSearchParams({ limit: '10' });

			if (rankingMode === 'daily') {
				if (filterRange === 'custom') {
					params.set('from', selectedDate);
					params.set('to', selectedDate);
				} else {
					params.set('from', selectedDate);
					params.set('to', selectedToDate);
				}
			} else {
				params.set('uniquePlayers', 'true');
			}

			const cacheKey = getScoresCacheKey(params);
			const cachedScores = readScoresCache(cacheKey);
			if (cachedScores) {
				top10Scores = buildRows(cachedScores);
			}

			const response = await fetch(`/api/scores?${params.toString()}`);
			if (!response.ok) {
				if (!cachedScores) {
					top10Scores = buildRows([]);
				}
				return;
			}
			const scores = (await response.json()) as ApiScore[];
			top10Scores = buildRows(scores);
			writeScoresCache(cacheKey, scores);
		} catch {
			if (top10Scores.length === 0) {
				top10Scores = buildRows([]);
			}
		}
	}

	async function updateScoresForDate(): Promise<void> {
		await loadScores();
	}

	function shiftRangeDate(baseDate: Date, direction: 'prev' | 'next'): Date {
		const shiftedDate = new Date(baseDate);
		const step = direction === 'prev' ? -1 : 1;

		if (filterRange === '1month') {
			shiftedDate.setMonth(shiftedDate.getMonth() + step);
			return shiftedDate;
		}

		if (filterRange === '2months') {
			shiftedDate.setMonth(shiftedDate.getMonth() + step * 2);
			return shiftedDate;
		}

		if (filterRange === '2weeks') {
			shiftedDate.setDate(shiftedDate.getDate() + step * 14);
			return shiftedDate;
		}

		if (filterRange === '1week') {
			shiftedDate.setDate(shiftedDate.getDate() + step * 7);
			return shiftedDate;
		}

		shiftedDate.setDate(shiftedDate.getDate() + step);
		return shiftedDate;
	}

	function isNextDisabled(): boolean {
		if (rankingMode !== 'daily') return true;
		if (filterRange === 'custom') return selectedDate === TODAY_STR;
		return selectedToDate === TODAY_STR;
	}

	async function handlePrevDay(): Promise<void> {
		if (rankingMode !== 'daily') return;
		const fromDate = new Date(selectedDate);
		const toDate = new Date(selectedToDate);
		const prevFromDate = shiftRangeDate(fromDate, 'prev');
		const prevToDate = shiftRangeDate(toDate, 'prev');

		selectedDate = toDateString(prevFromDate);
		selectedToDate = toDateString(prevToDate);

		await updateScoresForDate();
	}

	async function handleNextDay(): Promise<void> {
		if (rankingMode !== 'daily') return;

		const fromDate = new Date(selectedDate);
		const toDate = new Date(selectedToDate);
		const nextFromDate = shiftRangeDate(fromDate, 'next');
		const nextToDate = shiftRangeDate(toDate, 'next');
		const todayDate = new Date(TODAY_STR);

		if (nextToDate.getTime() > todayDate.getTime()) {
			return;
		}

		selectedDate = toDateString(nextFromDate);
		selectedToDate = toDateString(nextToDate);

		await updateScoresForDate();
	}

	async function handleRangeChange(e: Event): Promise<void> {
		if (rankingMode !== 'daily') return;
		const target = e.target as HTMLSelectElement;
		const val = target.value;
		filterRange = val;
		const date = new Date(TODAY_STR);

		if (val === 'custom') {
			selectedDate = TODAY_STR;
			selectedToDate = TODAY_STR;
			await updateScoresForDate();
			return;
		}

		if (val === '1week') date.setDate(date.getDate() - 7);
		else if (val === '2weeks') date.setDate(date.getDate() - 14);
		else if (val === '1month') date.setMonth(date.getMonth() - 1);
		else if (val === '2months') date.setMonth(date.getMonth() - 2);
		else return;

		selectedDate = toDateString(date);
		selectedToDate = TODAY_STR;
		await updateScoresForDate();
	}

	async function handleModeChange(e: Event): Promise<void> {
		const target = e.target as HTMLSelectElement;
		rankingMode = target.value === 'global' ? 'global' : 'daily';
		if (rankingMode === 'global') {
			filterRange = 'custom';
			selectedToDate = selectedDate;
		}
		await loadScores();
	}

	function goHome(): void {
		audioManager.playClick();
		goto('/');
	}

	onMount(async () => {
		await loadScores();
	});
</script>

<main
	class="ranking-page page-wrap"
	style={`--custom-background-image: url('${defaultBackgroundImage}');`}
>
	<div class="ranking-board-wrapper">
		<div class="ranking-board-container">
			<!-- Header Section -->
			<div class="header-section">
				<div class="title-badge">ランキング</div>

				<!-- Date Controls Container -->
				<div class="date-controls-wrapper">
					<div class="filter-select-container mode-filter">
						<select bind:value={rankingMode} on:change={handleModeChange} class="filter-select">
							<option value="daily">日別 TOP10</option>
							<option value="global">歴代 TOP 10</option>
						</select>
					</div>

					<!-- Jump Filter -->
					<div class="filter-select-container range-filter">
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="16" y1="2" x2="16" y2="6"></line>
							<line x1="8" y1="2" x2="8" y2="6"></line>
							<line x1="3" y1="10" x2="21" y2="10"></line>
						</svg>
						<select
							bind:value={filterRange}
							on:change={handleRangeChange}
							disabled={rankingMode !== 'daily'}
							class="filter-select"
						>
							<option value="custom">日付選択</option>
							<option value="1week">1週間</option>
							<option value="2weeks">2週間</option>
							<option value="1month">1ヶ月前</option>
							<option value="2months">2ヶ月前</option>
						</select>
					</div>

					<!-- Day Navigator -->
					<div class="day-navigator date-filter">
						<button
							on:click={handlePrevDay}
							disabled={rankingMode !== 'daily'}
							class="nav-button"
							aria-label="Previous range"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polyline points="15 18 9 12 15 6"></polyline>
							</svg>
						</button>

						<span class="date-display">
							{rankingMode === 'daily'
								? filterRange === 'custom'
									? selectedDate
									: `${selectedDate} ~ ${selectedToDate}`
								: '歴代 TOP 10'}
						</span>

						<button
							on:click={handleNextDay}
							disabled={isNextDisabled()}
							class="nav-button"
							class:disabled={isNextDisabled()}
							aria-label="Next range"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</button>
					</div>
				</div>
			</div>

			<!-- Ranking Table -->
			<div class="ranking-table-scroll">
				<table class="ranking-table">
					<thead>
						<tr class="table-header">
							<th
								><span class="th-icon" aria-hidden="true">🏅</span><span class="th-label">順位</span
								></th
							>
							<th
								><span class="th-icon" aria-hidden="true">🌸</span><span class="th-label">名前</span
								></th
							>
							<th
								><span class="th-icon" aria-hidden="true">⭐</span><span class="th-label"
									>スコア</span
								></th
							>
							<th
								><span class="th-icon" aria-hidden="true">🗓️</span><span class="th-label"
									>プレイ日</span
								></th
							>
						</tr>
					</thead>
					<tbody>
						{#each top10Scores as score (score.id)}
							{@const isCurrentUser = score.isCurrentUser}
							<tr class="table-row" class:highlight-row={isCurrentUser}>
								<td class="rank-cell">
									{#if score.rank === 1}
										<svg
											width="40"
											viewBox="0 0 74 41"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M25.4795 18.1179C25.4161 19.0427 26.6596 21.4392 26.3963 22.1623C26.3392 22.3176 24.1218 24.2714 23.7125 24.735C21.0827 27.7433 19.135 31.5652 19.0525 35.1484C13.3963 35.0047 8.60937 33.7949 4.29826 31.0669C1.89368 29.5442 -1.27225 27.3308 0.532773 24.8346C1.7541 23.1496 7.14061 19.9582 9.53567 19.1586C14.0181 17.6613 20.7052 17.309 25.4763 18.1156L25.4795 18.1179Z"
												fill="#BBE973"
											/>
											<path
												d="M22.1477 4.90913L24.7648 15.5103C20.3712 14.8822 15.8634 15.107 11.5745 16.0434C10.2421 16.3331 9.00179 16.8731 7.63454 17.0748C4.97935 13.779 3.8532 10.6385 4.30683 6.73549C4.61771 4.07244 6.39736 3.19403 9.89637 2.99934C14.1599 2.76293 18.3758 3.5301 22.1477 4.90913Z"
												fill="#A3E340"
											/>
											<path
												d="M25.9546 6.47375C26.9951 10.6456 28.0769 14.8013 29.0476 18.9871C27.8516 18.8434 26.6145 18.3103 25.4788 18.1179C20.7077 17.3114 14.0205 17.6613 9.53813 19.1609C8.62769 18.6139 8.20895 17.7865 7.63477 17.075C9.00201 16.871 10.2424 16.3333 11.5747 16.0436C15.8636 15.1095 20.3683 14.8824 24.765 15.5105L22.1479 4.9093C23.4803 5.39834 24.6952 5.89896 25.9546 6.47375Z"
												fill="#8DC638"
											/>
											<path
												d="M29.0493 18.9871C29.0969 19.191 29.4807 19.6546 29.5251 19.8562C29.725 20.7787 29.7059 21.8657 30.001 22.8113C29.9534 23.1404 27.4854 25.1383 26.9524 25.7131C24.348 28.5267 22.8634 31.7739 22.3875 35.1508C21.4707 34.9839 20.4144 35.3339 19.6308 35.3339C19.2977 35.3339 19.0884 35.1508 19.0566 35.1508C19.1391 31.5676 21.0869 27.7457 23.7167 24.7373C24.1228 24.2714 26.3433 22.3199 26.4004 22.1646C26.6606 21.4392 25.4202 19.0427 25.4837 18.1202C26.6193 18.3126 27.8565 18.8457 29.0525 18.9894L29.0493 18.9871Z"
												fill="#A3E341"
											/>
											<path
												d="M63.4087 19.1608C64.6733 19.571 66.4922 20.6511 67.6406 21.2467C69.4662 23.6293 66.1802 25.8659 63.7904 27.3353C60.7069 29.2289 56.9164 30.594 52.8637 31.141C52.4953 31.0645 51.4066 28.5521 51.0813 28.033C50.1619 26.5635 48.9736 25.1242 47.6825 23.8008C47.3572 23.4671 45.8237 22.2989 45.7706 22.1668C45.4819 21.3974 46.8494 19.0773 46.7299 18.1224C51.5725 17.3298 58.8747 17.6937 63.4087 19.1654V19.1608Z"
												fill="#BBE973"
											/>
											<path
												d="M63.409 19.1608C58.875 17.689 51.5728 17.3251 46.7302 18.1178C45.5187 18.3171 44.264 18.8826 42.9961 18.9869C44.0815 14.8174 45.1336 10.6409 46.2323 6.47364C47.5533 5.89885 48.8179 5.3959 50.2153 4.90918L47.477 15.5104C51.3007 15.0051 55.2372 15.0213 59.031 15.6564C61.2615 13.0814 61.8822 9.2178 61.4208 6.21406C61.1785 4.65424 59.9504 3.74801 57.9357 3.17322C60.5578 2.92291 65.6826 2.63783 67.6077 4.15593C69.6922 5.8015 68.9786 10.5018 68.2683 12.5599C67.4584 14.9147 65.7258 17.3669 63.4123 19.1631L63.409 19.1608Z"
												fill="#8DC638"
											/>
											<path
												d="M67.6406 21.2467C71.534 23.2677 75.7925 25.655 71.7497 29.069C66.4855 33.5143 58.181 35.8251 49.966 35.1506C49.3254 30.5917 46.5738 26.1278 42 22.8112L42.9958 18.9869C44.2637 18.8826 45.5183 18.3171 46.7298 18.1178C46.8493 19.0727 45.4785 21.395 45.7706 22.1622C45.8204 22.2966 47.3538 23.4624 47.6824 23.7962C48.9736 25.1196 50.1585 26.5589 51.0812 28.0283C51.4065 28.5475 52.4952 31.0599 52.8636 31.1364C56.9197 30.5917 60.7068 29.2243 63.7904 27.3307C66.1802 25.8636 69.4695 23.6247 67.6406 21.2421V21.2467Z"
												fill="#A3E341"
											/>
											<path
												d="M57.9314 3.17334C59.9461 3.74813 61.1775 4.65435 61.4165 6.21417C61.8812 9.21792 61.2572 13.0815 59.0267 15.6565C55.2329 15.0215 51.2963 15.0076 47.4727 15.5105L50.211 4.9093C52.8265 3.99612 54.9939 3.45146 57.928 3.17102L57.9314 3.17334Z"
												fill="#A3E340"
											/>
											<path
												d="M35.4578 0.100308C54.9706 2.30908 59.993 29.7786 42.1815 38.7156C39.9889 39.8142 37.6387 40.338 35.284 40.943C34.8876 40.9128 34.4565 40.987 34.0672 40.943C23.1762 39.6798 15.048 29.3614 16.1629 18.5238C16.5105 15.1469 17.5952 11.8974 19.498 9.08607C19.8851 8.51359 21.6883 6.51341 21.7254 6.18429C23.8322 4.39966 25.8717 2.78653 28.4421 1.69026C29.8837 1.07606 32.359 0.26023 33.8933 0.100308C34.3105 0.0562718 35.0452 0.0539541 35.4578 0.100308ZM35.284 34.5113C45.9153 35.603 53.7167 24.8303 49.568 14.929C47.2387 9.36883 41.6577 5.97107 35.6316 6.3558C18.6498 7.44049 17.6207 32.6989 35.284 34.5113Z"
												fill="#FCC16D"
											/>
											<path
												d="M39.1074 0.100308C43.328 0.605569 48.3319 3.12492 51.2754 6.18429C54.4692 9.50093 56.3906 13.9648 56.8379 18.5238C57.7974 28.3254 51.8363 37.128 42.5005 40.0785L38.7598 40.9453H35.2832C37.638 40.3404 39.9882 39.8166 42.1807 38.718C59.9923 29.7809 54.9698 2.3114 35.457 0.102625C36.5301 -0.0410731 38.0204 -0.0271669 39.1074 0.102625V0.100308Z"
												fill="#FCB44D"
											/>
											<path
												d="M35.6318 6.35583C35.5275 6.85878 35.8798 6.67336 36.1834 6.75216C49.9228 10.3469 50.7155 29.1737 37.3631 33.8948C36.6864 34.1336 35.9354 34.2077 35.2841 34.5114C17.6209 32.6989 18.65 7.44052 35.6318 6.35583Z"
												fill="#FEE7C9"
											/>
											<path
												d="M35.2832 34.5114C35.9345 34.2078 36.6854 34.1359 37.3622 33.8949C50.7145 29.1737 49.9195 10.347 36.1825 6.75219C35.8812 6.67339 35.5289 6.8588 35.6309 6.35586C41.6569 5.97112 47.2356 9.36888 49.5672 14.9291C53.7183 24.8303 45.9145 35.603 35.2832 34.5114Z"
												fill="#FCCD8A"
											/>
											<path
												d="M36.0334 26.9569C35.2334 26.9569 34.8334 26.5169 34.8334 25.6369V15.9969L33.6134 16.8169C32.8667 17.3102 32.2867 17.2169 31.8734 16.5369C31.66 16.2036 31.5934 15.8902 31.6734 15.5969C31.7667 15.2902 31.9934 15.0302 32.3534 14.8169L34.6334 13.3969C34.9 13.2236 35.16 13.1036 35.4134 13.0369C35.6667 12.9702 35.9534 12.9369 36.2734 12.9369C36.9 12.9369 37.2134 13.3769 37.2134 14.2569V25.6369C37.2134 26.5169 36.82 26.9569 36.0334 26.9569Z"
												fill="#FCB44D"
											/>
										</svg>
									{:else if score.rank === 2}
										<svg
											width="40"
											viewBox="0 0 74 41"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M25.4795 18.1179C25.4161 19.0427 26.6596 21.4392 26.3963 22.1623C26.3392 22.3176 24.1218 24.2714 23.7125 24.735C21.0827 27.7433 19.135 31.5652 19.0525 35.1484C13.3963 35.0047 8.60937 33.7949 4.29826 31.0669C1.89368 29.5442 -1.27225 27.3308 0.532773 24.8346C1.7541 23.1496 7.14061 19.9582 9.53567 19.1586C14.0181 17.6613 20.7052 17.309 25.4763 18.1156L25.4795 18.1179Z"
												fill="#BBE973"
											/>
											<path
												d="M22.1477 4.90913L24.7648 15.5103C20.3712 14.8822 15.8634 15.107 11.5745 16.0434C10.2421 16.3331 9.00179 16.8731 7.63454 17.0748C4.97935 13.779 3.8532 10.6385 4.30683 6.73549C4.61771 4.07244 6.39736 3.19403 9.89637 2.99934C14.1599 2.76293 18.3758 3.5301 22.1477 4.90913Z"
												fill="#A3E340"
											/>
											<path
												d="M25.9546 6.47375C26.9951 10.6456 28.0769 14.8013 29.0476 18.9871C27.8516 18.8434 26.6145 18.3103 25.4788 18.1179C20.7077 17.3114 14.0205 17.6613 9.53813 19.1609C8.62769 18.6139 8.20895 17.7865 7.63477 17.075C9.00201 16.871 10.2424 16.3333 11.5747 16.0436C15.8636 15.1095 20.3683 14.8824 24.765 15.5105L22.1479 4.9093C23.4803 5.39834 24.6952 5.89896 25.9546 6.47375Z"
												fill="#8DC638"
											/>
											<path
												d="M29.0493 18.9871C29.0969 19.191 29.4807 19.6546 29.5251 19.8562C29.725 20.7787 29.7059 21.8657 30.001 22.8113C29.9534 23.1404 27.4854 25.1383 26.9524 25.7131C24.348 28.5267 22.8634 31.7739 22.3875 35.1508C21.4707 34.9839 20.4144 35.3339 19.6308 35.3339C19.2977 35.3339 19.0884 35.1508 19.0566 35.1508C19.1391 31.5676 21.0869 27.7457 23.7167 24.7373C24.1228 24.2714 26.3433 22.3199 26.4004 22.1646C26.6606 21.4392 25.4202 19.0427 25.4837 18.1202C26.6193 18.3126 27.8565 18.8457 29.0525 18.9894L29.0493 18.9871Z"
												fill="#A3E341"
											/>
											<path
												d="M63.4087 19.1608C64.6733 19.571 66.4922 20.6511 67.6406 21.2467C69.4662 23.6293 66.1802 25.8659 63.7904 27.3353C60.7069 29.2289 56.9164 30.594 52.8637 31.141C52.4953 31.0645 51.4066 28.5521 51.0813 28.033C50.1619 26.5635 48.9736 25.1242 47.6825 23.8008C47.3572 23.4671 45.8237 22.2989 45.7706 22.1668C45.4819 21.3974 46.8494 19.0773 46.7299 18.1224C51.5725 17.3298 58.8747 17.6937 63.4087 19.1654V19.1608Z"
												fill="#BBE973"
											/>
											<path
												d="M63.409 19.1608C58.875 17.689 51.5728 17.3251 46.7302 18.1178C45.5187 18.3171 44.264 18.8826 42.9961 18.9869C44.0815 14.8174 45.1336 10.6409 46.2323 6.47364C47.5533 5.89885 48.8179 5.3959 50.2153 4.90918L47.477 15.5104C51.3007 15.0051 55.2372 15.0213 59.031 15.6564C61.2615 13.0814 61.8822 9.2178 61.4208 6.21406C61.1785 4.65424 59.9504 3.74801 57.9357 3.17322C60.5578 2.92291 65.6826 2.63783 67.6077 4.15593C69.6922 5.8015 68.9786 10.5018 68.2683 12.5599C67.4584 14.9147 65.7258 17.3669 63.4123 19.1631L63.409 19.1608Z"
												fill="#8DC638"
											/>
											<path
												d="M67.6406 21.2467C71.534 23.2677 75.7925 25.655 71.7497 29.069C66.4855 33.5143 58.181 35.8251 49.966 35.1506C49.3254 30.5917 46.5738 26.1278 42 22.8112L42.9958 18.9869C44.2637 18.8826 45.5183 18.3171 46.7298 18.1178C46.8493 19.0727 45.4785 21.395 45.7706 22.1622C45.8204 22.2966 47.3538 23.4624 47.6824 23.7962C48.9736 25.1196 50.1585 26.5589 51.0812 28.0283C51.4065 28.5475 52.4952 31.0599 52.8636 31.1364C56.9197 30.5917 60.7068 29.2243 63.7904 27.3307C66.1802 25.8636 69.4695 23.6247 67.6406 21.2421V21.2467Z"
												fill="#A3E341"
											/>
											<path
												d="M57.9314 3.17334C59.9461 3.74813 61.1775 4.65435 61.4165 6.21417C61.8812 9.21792 61.2572 13.0815 59.0267 15.6565C55.2329 15.0215 51.2963 15.0076 47.4727 15.5105L50.211 4.9093C52.8265 3.99612 54.9939 3.45146 57.928 3.17102L57.9314 3.17334Z"
												fill="#A3E340"
											/>
											<path
												d="M35.4578 0.100308C54.9706 2.30908 59.993 29.7786 42.1815 38.7156C39.9889 39.8142 37.6387 40.338 35.284 40.943C34.8876 40.9128 34.4565 40.987 34.0672 40.943C23.1762 39.6798 15.048 29.3614 16.1629 18.5238C16.5105 15.1469 17.5952 11.8974 19.498 9.08607C19.8851 8.51359 21.6883 6.51341 21.7254 6.18429C23.8322 4.39966 25.8717 2.78653 28.4421 1.69026C29.8837 1.07606 32.359 0.26023 33.8933 0.100308C34.3105 0.0562718 35.0452 0.0539541 35.4578 0.100308ZM35.284 34.5113C45.9153 35.603 53.7167 24.8303 49.568 14.929C47.2387 9.36883 41.6577 5.97107 35.6316 6.3558C18.6498 7.44049 17.6207 32.6989 35.284 34.5113Z"
												fill="#737679"
											/>
											<path
												d="M39.1074 0.100308C43.328 0.605569 48.3319 3.12492 51.2754 6.18429C54.4692 9.50093 56.3906 13.9648 56.8379 18.5238C57.7974 28.3254 51.8363 37.128 42.5005 40.0785L38.7598 40.9453H35.2832C37.638 40.3404 39.9882 39.8166 42.1807 38.718C59.9923 29.7809 54.9698 2.3114 35.457 0.102625C36.5301 -0.0410731 38.0204 -0.0271669 39.1074 0.102625V0.100308Z"
												fill="#5C5D60"
											/>
											<path
												d="M35.6318 6.35583C35.5275 6.85878 35.8798 6.67336 36.1834 6.75216C49.9228 10.3469 50.7155 29.1737 37.3631 33.8948C36.6864 34.1336 35.9354 34.2077 35.2841 34.5114C17.6209 32.6989 18.65 7.44052 35.6318 6.35583Z"
												fill="#CFD1D2"
											/>
											<path
												d="M35.2832 34.5114C35.9345 34.2078 36.6854 34.1359 37.3622 33.8949C50.7145 29.1737 49.9195 10.347 36.1825 6.75219C35.8812 6.67339 35.5289 6.8588 35.6309 6.35586C41.6569 5.97112 47.2356 9.36888 49.5672 14.9291C53.7183 24.8303 45.9145 35.603 35.2832 34.5114Z"
												fill="#8F9396"
											/>
											<path
												d="M32.7126 26.9569C31.8326 26.9569 31.3926 26.7169 31.3926 26.2369C31.3926 25.6102 31.4926 24.9969 31.6926 24.3969C31.8926 23.7836 32.2259 23.1502 32.6926 22.4969C33.1726 21.8436 33.8192 21.1302 34.6326 20.3569C35.0326 19.9702 35.4126 19.5836 35.7726 19.1969C36.1326 18.8102 36.4259 18.4302 36.6526 18.0569C36.8792 17.6702 36.9992 17.3102 37.0126 16.9769C37.0259 16.3502 36.8859 15.8836 36.5926 15.5769C36.3126 15.2702 35.8992 15.1169 35.3526 15.1169C34.6726 15.1169 34.2192 15.4436 33.9926 16.0969C33.8592 16.4969 33.6992 16.8036 33.5126 17.0169C33.3259 17.2302 33.0392 17.3369 32.6526 17.3369C32.2792 17.3369 31.9859 17.2169 31.7726 16.9769C31.5592 16.7236 31.4992 16.3769 31.5926 15.9369C31.8192 14.9502 32.2659 14.1902 32.9326 13.6569C33.5992 13.1102 34.4059 12.8369 35.3526 12.8369C36.1259 12.8369 36.8192 13.0036 37.4326 13.3369C38.0592 13.6569 38.5459 14.1302 38.8926 14.7569C39.2526 15.3702 39.4192 16.1302 39.3926 17.0369C39.3792 17.6769 39.2326 18.2569 38.9526 18.7769C38.6859 19.2969 38.3192 19.8102 37.8526 20.3169C37.3992 20.8102 36.8726 21.3436 36.2726 21.9169C35.6992 22.4902 35.1859 23.0302 34.7326 23.5369C34.2926 24.0436 34.0326 24.4569 33.9526 24.7769H37.7926C38.6726 24.7769 39.1126 25.1369 39.1126 25.8569C39.1126 26.5902 38.6726 26.9569 37.7926 26.9569H32.7126Z"
												fill="#5C5D60"
											/>
										</svg>
									{:else if score.rank === 3}
										<svg
											width="40"
											viewBox="0 0 74 41"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M25.4795 18.1179C25.4161 19.0427 26.6596 21.4392 26.3963 22.1623C26.3392 22.3176 24.1218 24.2714 23.7125 24.735C21.0827 27.7433 19.135 31.5652 19.0525 35.1484C13.3963 35.0047 8.60937 33.7949 4.29826 31.0669C1.89368 29.5442 -1.27225 27.3308 0.532773 24.8346C1.7541 23.1496 7.14061 19.9582 9.53567 19.1586C14.0181 17.6613 20.7052 17.309 25.4763 18.1156L25.4795 18.1179Z"
												fill="#BBE973"
											/>
											<path
												d="M22.1477 4.90913L24.7648 15.5103C20.3712 14.8822 15.8634 15.107 11.5745 16.0434C10.2421 16.3331 9.00179 16.8731 7.63454 17.0748C4.97935 13.779 3.8532 10.6385 4.30683 6.73549C4.61771 4.07244 6.39736 3.19403 9.89637 2.99934C14.1599 2.76293 18.3758 3.5301 22.1477 4.90913Z"
												fill="#A3E340"
											/>
											<path
												d="M25.9546 6.47375C26.9951 10.6456 28.0769 14.8013 29.0476 18.9871C27.8516 18.8434 26.6145 18.3103 25.4788 18.1179C20.7077 17.3114 14.0205 17.6613 9.53813 19.1609C8.62769 18.6139 8.20895 17.7865 7.63477 17.075C9.00201 16.871 10.2424 16.3333 11.5747 16.0436C15.8636 15.1095 20.3683 14.8824 24.765 15.5105L22.1479 4.9093C23.4803 5.39834 24.6952 5.89896 25.9546 6.47375Z"
												fill="#8DC638"
											/>
											<path
												d="M29.0493 18.9871C29.0969 19.191 29.4807 19.6546 29.5251 19.8562C29.725 20.7787 29.7059 21.8657 30.001 22.8113C29.9534 23.1404 27.4854 25.1383 26.9524 25.7131C24.348 28.5267 22.8634 31.7739 22.3875 35.1508C21.4707 34.9839 20.4144 35.3339 19.6308 35.3339C19.2977 35.3339 19.0884 35.1508 19.0566 35.1508C19.1391 31.5676 21.0869 27.7457 23.7167 24.7373C24.1228 24.2714 26.3433 22.3199 26.4004 22.1646C26.6606 21.4392 25.4202 19.0427 25.4837 18.1202C26.6193 18.3126 27.8565 18.8457 29.0525 18.9894L29.0493 18.9871Z"
												fill="#A3E341"
											/>
											<path
												d="M63.4087 19.1608C64.6733 19.571 66.4922 20.6511 67.6406 21.2467C69.4662 23.6293 66.1802 25.8659 63.7904 27.3353C60.7069 29.2289 56.9164 30.594 52.8637 31.141C52.4953 31.0645 51.4066 28.5521 51.0813 28.033C50.1619 26.5635 48.9736 25.1242 47.6825 23.8008C47.3572 23.4671 45.8237 22.2989 45.7706 22.1668C45.4819 21.3974 46.8494 19.0773 46.7299 18.1224C51.5725 17.3298 58.8747 17.6937 63.4087 19.1654V19.1608Z"
												fill="#BBE973"
											/>
											<path
												d="M63.409 19.1608C58.875 17.689 51.5728 17.3251 46.7302 18.1178C45.5187 18.3171 44.264 18.8826 42.9961 18.9869C44.0815 14.8174 45.1336 10.6409 46.2323 6.47364C47.5533 5.89885 48.8179 5.3959 50.2153 4.90918L47.477 15.5104C51.3007 15.0051 55.2372 15.0213 59.031 15.6564C61.2615 13.0814 61.8822 9.2178 61.4208 6.21406C61.1785 4.65424 59.9504 3.74801 57.9357 3.17322C60.5578 2.92291 65.6826 2.63783 67.6077 4.15593C69.6922 5.8015 68.9786 10.5018 68.2683 12.5599C67.4584 14.9147 65.7258 17.3669 63.4123 19.1631L63.409 19.1608Z"
												fill="#8DC638"
											/>
											<path
												d="M67.6406 21.2467C71.534 23.2677 75.7925 25.655 71.7497 29.069C66.4855 33.5143 58.181 35.8251 49.966 35.1506C49.3254 30.5917 46.5738 26.1278 42 22.8112L42.9958 18.9869C44.2637 18.8826 45.5183 18.3171 46.7298 18.1178C46.8493 19.0727 45.4785 21.395 45.7706 22.1622C45.8204 22.2966 47.3538 23.4624 47.6824 23.7962C48.9736 25.1196 50.1585 26.5589 51.0812 28.0283C51.4065 28.5475 52.4952 31.0599 52.8636 31.1364C56.9197 30.5917 60.7068 29.2243 63.7904 27.3307C66.1802 25.8636 69.4695 23.6247 67.6406 21.2421V21.2467Z"
												fill="#A3E341"
											/>
											<path
												d="M57.9314 3.17334C59.9461 3.74813 61.1775 4.65435 61.4165 6.21417C61.8812 9.21792 61.2572 13.0815 59.0267 15.6565C55.2329 15.0215 51.2963 15.0076 47.4727 15.5105L50.211 4.9093C52.8265 3.99612 54.9939 3.45146 57.928 3.17102L57.9314 3.17334Z"
												fill="#A3E340"
											/>
											<path
												d="M35.4578 0.100308C54.9706 2.30908 59.993 29.7786 42.1815 38.7156C39.9889 39.8142 37.6387 40.338 35.284 40.943C34.8876 40.9128 34.4565 40.987 34.0672 40.943C23.1762 39.6798 15.048 29.3614 16.1629 18.5238C16.5105 15.1469 17.5952 11.8974 19.498 9.08607C19.8851 8.51359 21.6883 6.51341 21.7254 6.18429C23.8322 4.39966 25.8717 2.78653 28.4421 1.69026C29.8837 1.07606 32.359 0.26023 33.8933 0.100308C34.3105 0.0562718 35.0452 0.0539541 35.4578 0.100308ZM35.284 34.5113C45.9153 35.603 53.7167 24.8303 49.568 14.929C47.2387 9.36883 41.6577 5.97107 35.6316 6.3558C18.6498 7.44049 17.6207 32.6989 35.284 34.5113Z"
												fill="#A67137"
											/>
											<path
												d="M39.1074 0.100308C43.328 0.605569 48.3319 3.12492 51.2754 6.18429C54.4692 9.50093 56.3906 13.9648 56.8379 18.5238C57.7974 28.3254 51.8363 37.128 42.5005 40.0785L38.7598 40.9453H35.2832C37.638 40.3404 39.9882 39.8166 42.1807 38.718C59.9923 29.7809 54.9698 2.3114 35.457 0.102625C36.5301 -0.0410731 38.0204 -0.0271669 39.1074 0.102625V0.100308Z"
												fill="#8B5216"
											/>
											<path
												d="M35.6318 6.35583C35.5275 6.85878 35.8798 6.67336 36.1834 6.75216C49.9228 10.3469 50.7155 29.1737 37.3631 33.8948C36.6864 34.1336 35.9354 34.2077 35.2841 34.5114C17.6209 32.6989 18.65 7.44052 35.6318 6.35583Z"
												fill="#DDAD5F"
											/>
											<path
												d="M35.2832 34.5114C35.9345 34.2078 36.6854 34.1359 37.3622 33.8949C50.7145 29.1737 49.9195 10.347 36.1825 6.75219C35.8812 6.67339 35.5289 6.8588 35.6309 6.35586C41.6569 5.97112 47.2356 9.36888 49.5672 14.9291C53.7183 24.8303 45.9145 35.603 35.2832 34.5114Z"
												fill="#BD7B35"
											/>
											<path
												d="M34.9196 27.1569C33.4396 27.1569 32.3062 26.5969 31.5196 25.4769C31.2662 25.0903 31.1996 24.7503 31.3196 24.4569C31.4396 24.1636 31.6729 23.9569 32.0196 23.8369C32.3929 23.7169 32.6996 23.7236 32.9396 23.8569C33.1796 23.9769 33.4396 24.1769 33.7196 24.4569C33.8662 24.5769 34.0262 24.6769 34.1996 24.7569C34.3862 24.8369 34.6062 24.8769 34.8596 24.8769C35.4729 24.8769 35.9596 24.7303 36.3196 24.4369C36.6929 24.1436 36.8796 23.6236 36.8796 22.8769C36.8796 22.2236 36.6996 21.7036 36.3396 21.3169C35.9929 20.9169 35.4729 20.7169 34.7796 20.7169C34.0462 20.7169 33.6796 20.3503 33.6796 19.6169C33.6796 18.8969 34.0462 18.5369 34.7796 18.5369C35.4062 18.5369 35.8529 18.3569 36.1196 17.9969C36.3996 17.6369 36.5396 17.1903 36.5396 16.6569C36.5396 16.0303 36.3662 15.6036 36.0196 15.3769C35.6729 15.1369 35.2862 15.0169 34.8596 15.0169C34.6596 15.0169 34.4796 15.0569 34.3196 15.1369C34.1596 15.2169 34.0129 15.3169 33.8796 15.4369C33.5996 15.7303 33.3329 15.9369 33.0796 16.0569C32.8396 16.1769 32.5396 16.1636 32.1796 16.0169C31.8462 15.8703 31.6262 15.6503 31.5196 15.3569C31.4262 15.0503 31.5129 14.7169 31.7796 14.3569C32.5929 13.2769 33.6396 12.7369 34.9196 12.7369C35.7462 12.7369 36.4662 12.8969 37.0796 13.2169C37.6929 13.5369 38.1729 13.9836 38.5196 14.5569C38.8662 15.1303 39.0396 15.7969 39.0396 16.5569C39.0396 17.2369 38.8596 17.8503 38.4996 18.3969C38.1396 18.9303 37.6862 19.3236 37.1396 19.5769C37.7929 19.8303 38.3262 20.2636 38.7396 20.8769C39.1529 21.4903 39.3596 22.1903 39.3596 22.9769C39.3596 24.2703 38.9596 25.2903 38.1596 26.0369C37.3729 26.7836 36.2929 27.1569 34.9196 27.1569Z"
												fill="#8B5216"
											/>
										</svg>
									{:else}
										<span class="rank-number">{score.rank}.</span>
									{/if}
								</td>
								<td class="name-cell" class:current-player={isCurrentUser}>
									{score.name}
								</td>
								<td class="score-cell">
									{#if score.score !== '-'}
										{score.score.toLocaleString()}
									{:else}
										-
									{/if}
								</td>
								<td class="date-cell">
									{score.date}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Home Button -->
		<button class="home-button" on:click={goHome}> ホームへ戻る </button>
	</div>
</main>
