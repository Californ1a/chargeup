<template>
	<GithubCorner />
	<div class="container">
		<TheLeaderboard class="leaderboard" :board="board" />
		<div class="game">
			<GameBoard @game-finished="updateLeaderboard" />
		</div>
	</div>
</template>

<script setup>
import GithubCorner from '@/components/GithubCorner.vue';
import GameBoard from '@/components/GameBoard.vue';
import TheLeaderboard from '@/components/TheLeaderboard.vue';
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
	height: calc(100% - 2rem);
	overflow-y: auto;
}
</style>
