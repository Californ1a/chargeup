<template>
	<GithubCorner />
	<div class="container">
		<TheLeaderboard class="leaderboard" />
		<div class="game">
			<GameBoard />
		</div>
	</div>
</template>

<script setup>
import GithubCorner from '@/components/GithubCorner.vue';
import GameBoard from '@/components/GameBoard.vue';
import TheLeaderboard from '@/components/TheLeaderboard.vue';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
</script>

<style scoped>
.container {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 0;
	height: 100%;
}

.game,
.leaderboard {
	margin: 1rem;
	background: #222;
	padding: 1rem 2rem;
	position: relative;
	border-radius: 20px;
	box-shadow: 0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22);
}

.game {
	width: 50vw;
	min-width: 260px;
}

.leaderboard {
	margin-right: 0;
	padding: 1rem;
	/* height: calc(100% - 2rem);
	overflow-y: hidden; */
}

@media screen and (max-width: 1100px) {
	.container {
		display: flex;
		flex-direction: column-reverse;
		height: unset;
		margin-right: 2rem;
		margin-left: 0.1rem;
	}

	.game {
		width: 100%;
		height: calc(100vh - 2rem);
		min-width: 520px;
	}

	.leaderboard {
		width: 100%;
		height: calc(100vh - 2rem);
	}
}
</style>
