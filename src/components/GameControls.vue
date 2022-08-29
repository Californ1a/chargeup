<template>
	<div class="controls">
		<div class="left-control-group">
			<label for="rows" class="rows">Rows:</label>
			<input type="range"
				min="4"
				max="17"
				:value="rowValue"
				class="rows"
				name="rows"
				@input="updateRows">
			<span class="rows">{{ rowValue }}</span>
			<label for="cols" class="cols">Columns:</label>
			<input type="range"
				min="4"
				max="23"
				:value="colValue"
				class="cols"
				name="cols"
				@input="updateCols">
			<span class="cols">{{ colValue }}</span>
			<button type="button" class="new-game" @click="$emit('newGame', $event, rowValue, colValue)">
				New Game
			</button>
		</div>
		<div class="main-control-group">
			<label for="mode">Mode</label>
			<ControlButton btn-type="car"
				:mode="mode"
				@update:model-value="$emit('update:modelValue', $event.target.value)" />
			<ControlButton btn-type="road"
				:mode="mode"
				@update:model-value="$emit('update:modelValue', $event.target.value)" />
		</div>
		<div class="right-control-group">
			<TheTimer :game="game" />
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import Board from '@/classes/Board';
import ControlButton from './ControlButton.vue';
import TheTimer from './TheTimer.vue';

defineEmits(['newGame', 'update:modelValue']);
const props = defineProps({
	mode: {
		type: String,
		default: 'road',
		required: true,
	},
	game: {
		type: Board,
		required: true,
	},
});

const rowValue = ref(+props.game.rows);
const colValue = ref(+props.game.cols);

function updateRows(e) {
	rowValue.value = e.target.value;
}

function updateCols(e) {
	colValue.value = e.target.value;
}
</script>

<style scoped>
.controls {
	padding-top: 15px;
	grid-area: controls;
	color: #fff;
	text-align: center;
	font-size: 1rem;
	align-items: center;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-areas:
		"left-control-group main-control-group right-control-group";
	/* gap: 30px; */
	user-select: none;
	position: sticky;
	bottom: 0;
	background: #222222f9;
}

.left-control-group,
.main-control-group,
.right-control-group {
	background: #33333388;
	border-radius: 5px;
	padding: 5px 20px;
	height: 100%;
	justify-content: center;
}

.right-control-group {
	margin-left: 1rem;
}

.left-control-group {
	/* width: 80%; */
	display: grid;
	grid-template-columns: auto 1fr auto;
	grid-template-rows: 1fr 1fr auto;
	grid-template-areas:
		"row-label row-slider row-count"
		"col-label col-slider col-count"
		"new-game new-game new-game";
	gap: 10px;
	text-align: left;
	margin-right: 1rem;
}

.left-control-group span {
	min-width: 18px;
	text-align: right;
}

.left-control-group button.new-game {
	grid-area: new-game;

}

.left-control-group label.rows {
	grid-area: row-label;
}

.left-control-group input.rows {
	grid-area: row-slider;
}

.left-control-group span.rows {
	grid-area: row-count;
}

.left-control-group label.cols {
	grid-area: col-label;
}

.left-control-group input.cols {
	grid-area: col-slider;
}

.left-control-group span.cols {
	grid-area: col-count;
}

.main-control-group {
	/* width: 100%; */
	max-width: 300px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	grid-template-areas:
		"label label"
		"control control2";
	gap: 5px 20px;
	justify-content: space-evenly;
}

.main-control-group>label {
	grid-area: label;
	color: #fff;
	text-align: center;
	font-size: 1rem;
	font-weight: bold;
}

.main-control-group :deep(.control:first-child) {
	grid-area: control;
}

.main-control-group :deep(.control:nth-child(1)) {
	grid-area: control2;
}

.new-game {
	font-size: 0.9rem;
	color: orange;
	background: #111;
	border: 1px solid #ffa50099;
	border-radius: 5px;
	font-weight: normal;
	padding: 2px 10px 2px 10px;
	cursor: pointer;
	width: 100%;
	margin: 0 auto 5px auto;
}

.new-game:hover {
	background: #222;
	border: 1px solid #ffa500aa;
}

.new-game:active {
	background: #333;
	border: 1px solid #ffa500bb;
}

.new-game:focus {
	outline-color: Highlight;
	outline-color: -webkit-focus-ring-color;
	outline-style: auto;
	outline-width: 1px;
	z-index: 2;
}

@supports selector(:focus-visible) {

	.new-game:focus {
		outline: none;
		z-index: 0;
	}

}

.new-game:focus-visible {
	outline-color: Highlight;
	outline-color: -webkit-focus-ring-color;
	outline-style: auto;
	outline-width: 1px;
	z-index: 2;
}

input[type="range"] {
	cursor: grab;
	width: 100%;
	min-width: 80px;
}

input[type="range"]:active {
	cursor: grabbing;
}
</style>
