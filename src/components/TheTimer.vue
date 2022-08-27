<template>
	<span>{{ timer }}</span>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Board from '@/classes/Board';

const props = defineProps({
	game: {
		type: Board,
		required: true,
	},
});
const timer = ref(null);

function convertMsToTimer(time) {
	const hours = Math.floor((time / 1000) / 3600);
	const minutes = Math.floor(((time / 1000) - (hours * 3600)) / 60);
	const seconds = (time / 1000) - (hours * 3600) - (minutes * 60);
	let hrStr = `0${hours}`.slice(-2);
	let minStr = `0${minutes}`.slice(-2);
	hrStr = hours > 0 ? `${hrStr}:` : '';
	minStr = (minutes > 0 || hours > 0) ? `${minStr}:` : '';
	let [secStr, msStr] = `0${seconds}`.split('.');
	secStr = `0${secStr}`.slice(-2);
	msStr = (msStr) ? msStr.slice(0, 2) : '00';

	const formatted = `${hrStr}${minStr}${secStr}.${msStr}`;
	// console.log(formatted);
	return formatted;
}

function updateTimer() {
	requestAnimationFrame(updateTimer);
	timer.value = convertMsToTimer(props.game.getTime());
}

onMounted(() => {
	updateTimer();
});
</script>
