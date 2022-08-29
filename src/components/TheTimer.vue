<template>
	<span>{{ timer }}</span>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Board from '@/classes/Board';
import formatMs from '@/util/formatMs';

const props = defineProps({
	game: {
		type: Board,
		required: true,
	},
});
const timer = ref(null);

function updateTimer() {
	requestAnimationFrame(updateTimer);
	timer.value = formatMs(props.game.getTime());
}

onMounted(() => {
	updateTimer();
});
</script>

<style scoped>
span {
	font-size: 1.2rem;
	font-weight: bold;
}
</style>
