<template>
	<div class="container">
		<div v-if="saving" class="inner-content">
			<h2>Saving...</h2>
		</div>
		<div v-else class="inner-container">
			<h2>Correct!</h2>
			<div>
				<div class="hint-label">
					Hints:
				</div>
				<div class="hints">
					{{ hints }}
				</div>
				<div class="time-label">
					Time:
				</div>
				<div class="times">
					{{ time.display }} seconds<br />
					<span class="d">- </span><span class="t2">({{ perCell.display }} per cell)</span><br />
					<span class="d">- </span><span class="t3">({{ perCar.display }} per car)</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
const time = ref({
	save: 0,
	display: 0,
});
const saving = ref(true);
const perCell = ref({
	save: 0,
	display: 0,
});
const perCar = ref({
	save: 0,
	display: 0,
});

async function saveGame() {
	console.log('attempting to save game');
	try {
		const entry = await db.games.add({
			time: time.value.save,
			timePerCell: perCell.value.save,
			timePerCar: perCar.value.save,
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
	const t = (props.game.getTime() / 1000);
	time.value.display = t.toFixed(2);
	time.value.save = t.toFixed(3);
	hints.value = props.game.hints.length;
	const cells = props.game.getFlatCells();
	const ps = (t / cells.filter(c => c.value !== 'charge').length);
	perCell.value.display = ps.toFixed(2);
	perCell.value.save = ps.toFixed(3);
	const pc = (t / cells.filter(c => c.value === 'car').length);
	perCar.value.display = pc.toFixed(2);
	perCar.value.save = pc.toFixed(3);
	await saveGame();
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

.inner-container>div {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	gap: 0.2rem 0.9rem;
	grid-template:
		'hint-label hints'
		'time-label times';
}

.hint-label {
	grid-area: hint-label;
	font-weight: bold;
}

.hints {
	grid-area: hints;
}

.time-label {
	grid-area: time-label;
	font-weight: bold;
}

.times {
	grid-area: times;
}

.d {
	padding-left: 0.4rem;
}

.t2,
.t3 {
	font-size: 0.85rem;
}
</style>
