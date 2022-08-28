<template>
	<GithubCorner />
	<div class="game">
		<GameBoard />
	</div>
</template>

<script setup>
import GithubCorner from '@/components/GithubCorner.vue';
import GameBoard from '@/components/GameBoard.vue';
</script>

<style scoped>
.game {
	width: 50vw;
	height: 100%;
	margin: 1rem;
	background: #222;
	padding: 1rem 2rem;
	position: relative;
	border-radius: 20px;
	box-shadow: 0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22);
	min-width: 260px;
}
</style>
