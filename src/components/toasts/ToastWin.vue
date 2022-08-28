<template>
	<div class="container">
		<div v-if="saving" class="inner-content">
			<h2>Saving...</h2>
		</div>
		<div v-else class="inner-container">
			<h2>You Win!</h2>
			<p>
				Used {{ hints }} {{ hintPlural }}. <br />
				Took {{ parseFloat(time).toFixed(2) }} seconds
				({{ parseFloat(perCell).toFixed(2) }} per cell
				& {{ parseFloat(perCar).toFixed(2) }} per car).
			</p>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Board from '@/classes/Board';
import db from '@/store/db';

const props = defineProps({
	game: {
		type: Board,
		required: true,
	},
	toastId: {
		type: Number,
		default: 0,
	},
});
const emit = defineEmits(['doneSaving']);
const hints = ref(0);
const time = ref(0);
const saving = ref(true);
const perCell = computed(() => {
	const placedCells = props.game.getFlatCells().filter(c => c.value !== 'charge');
	return (time.value / placedCells.length).toFixed(3);
});
const perCar = computed(() => {
	const cars = props.game.getFlatCells().filter(c => c.value === 'car');
	return (time.value / cars.length).toFixed(3);
});
const hintPlural = computed(() => `hint${(hints.value === 1) ? '' : 's'}`);

async function saveGame() {
	console.log('attempting to save game');
	try {
		const entry = await db.games.add({
			time: time.value,
			timePerCell: perCell.value,
			timePerCar: perCar.value,
			hintCount: hints.value,
			date: new Date(),
			board: props.game.getAs('value'),
			rows: props.game.rows,
			cols: props.game.cols,
			hints: props.game.getHintList(),
		});
		console.log(`Inserted new game to finished games with id ${entry}.`);
		await db.currentGame.clear();
		console.log('Deleted current game from db.');
	} catch (e) {
		console.error(`Error inserting new game to db: ${e}`);
	}
	saving.value = false;
	emit('doneSaving', props.toastId);
}

async function getGameStats() {
	time.value = (props.game.getTime() / 1000).toFixed(3);
	hints.value = props.game.hints.length;
	await saveGame(time, hints, perCell, perCar);
}

onMounted(async () => {
	saving.value = true;
	await getGameStats();
});
</script>

<style scoped>
.container {
	/* width: 20vw; */
	display: flex;
	justify-content: space-between;
	align-items: center;
}
</style>
