<script lang="ts">
	import defaultBackgroundImage from '$lib/assets/Background image.png';
	import { goto } from '$app/navigation';
	import { audioManager } from '$lib/utils/audioController';
	function goHome(): void {
		audioManager.playClick();
		goto('/');
	}
</script>

<main
	class="credits-page credit-page-wrap"
	style={`--custom-background-image: url('${defaultBackgroundImage}');  background-size: cover;`}
>
	<div class="fence" aria-hidden="true"></div>
	<div class="garden-floor" aria-hidden="true">
		<div class="grass-top"></div>
		<div class="garden-plants"></div>
	</div>

	<section class="result-view">
		<div class="credits-container">
			<div class="credit-box">
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
						<div class="tag-text">クレジット</div>
					</div>
				</div>

				<div class="credits-stack">
					<div class="credit-block">
						<div class="credit-label">プロジェクトリーダー</div>
						<div class="creator">ピセット・ヂィヴィラックポング</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">データベース設計</div>
						<div class="creator">スン・キングレック</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">ホームページ設計</div>
						<div class="creator">ソク・チャンモニニアット</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">ゲームページ設計</div>
						<div class="creator">ソク・チャンモニニアット</div>
						<div class="creator">ロン・ホンニダ</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">質問作成</div>
						<div class="creator">ピセット・ヂィヴィラックポング</div>
						<div class="creator">ソク・チャンモニニアット</div>
						<div class="creator">ロン・ホンニダ</div>
						<div class="creator">スン・キングレック</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">質問と回答表示機能</div>
						<div class="creator">ロン・ホンニダ</div>
						<div class="creator">ソク・チャンモニニアット</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">回答確認機能</div>
						<div class="creator">ピセット・ヂィヴィラックポング</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">ランクページ作成</div>
						<div class="creator">ソク・チャンモニニアット</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">プレイヤー名とスコア保存機能</div>
						<div class="creator">ピセット・ヂィヴィラックポング</div>
						<div class="creator">スン・キングレック</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">ゲーム結果ページ作成</div>
						<div class="creator">ロン・ホンニダ</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">スコアロジック作成</div>
						<div class="creator">ピセット・ヂィヴィラックポング</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">クレジットページ作成</div>
						<div class="creator">スン・キングレック</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">BGMコンポーザー</div>
						<div class="creator">ロン・ホンニダ</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">プレイヤーランク表示機能</div>
						<div class="creator">ピセット・ヂィヴィラックポング</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">ランク日付フィルター機能</div>
						<div class="creator">ソク・チャンモニニアット</div>
						<div class="creator">ロン・ホンニダ</div>
					</div>

					<div class="credit-block">
						<div class="credit-label">ゲームデプロイ</div>
						<div class="creator">ピセット・ヂィヴィラックポング</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<button class="home-button" type="button" on:click={goHome}>ホームへ戻る</button>
</main>
