<template>
	<div class="game-board">
		<div class="header">
			<h1>Charge Up</h1>
			<div class="topbuttons">
				<button @click="openRulesModal">Rules</button>
				<button @click="getHint">Hint</button>
			</div>
		</div>
		<div ref="cellElements" class="game-board-cells" @mousemove="clicking">
			<div v-for="cell in game.getFlatCells()" :data-row="cell.row" :data-col="cell.col" :key="cell.id" class="game-cell"
				@mousedown="cellClicked"
				:class="{
          visible: cell.displayValue,
          charge: cell.value === 'charge',
          hover: cell.hover,
					hint: cell.hint,
        }">
				<span v-if="cell.displayValue === 'charge'" class="emoji">⛽</span>
				<span v-else-if="cell.displayValue === 'car'" class="emoji"
					:style="`filter: hue-rotate(${random(cell.id, 0,360)}deg)`">{{ cell.carIcon }}</span>
				<span v-else-if="cell.displayValue" class="emoji">&nbsp;</span>
				<!-- <span v-else>{{ cell.row }}, {{ cell.col }}</span> -->
				<span v-else>&nbsp;</span>
			</div>
		</div>
		<div class="row-count-cells">
			<div v-for="(row, i) in game.cells" :key="row" class="row-count"
				@mouseenter="(e) => toggleHoverClass(e, 'row', i)"
				@mouseleave="(e) => toggleHoverClass(e, 'row', i)"
				@click="(e) => displayAll(e, 'row', i)">
				<span class="count" :style="`color: ${countColor[`row-${i}`]}`">
					{{ carsInRowCol(i, 'row', 'value') }}
				</span>
				<!-- Row {{ i }} -->
			</div>
		</div>
		<div class="col-count-cells">
			<div v-for="(col, i) in game.cells[0]" :key="col" class="col-count"
				@mouseenter="(e) => toggleHoverClass(e, 'col', i)"
				@mouseleave="(e) => toggleHoverClass(e, 'col', i)"
				@click="(e) => displayAll(e, 'col', i)">
				<span class="count" :style="`color: ${countColor[`col-${i}`]}`">
					{{ carsInRowCol(i, 'col', 'value') }}
				</span>
				<!-- Col {{ i }} -->
			</div>
			<!-- <div class="col-count empty"></div> -->
		</div>
		<GameControls :mode="mode" @update:modelValue="updateMode" />
	</div>
	<RulesModal :display="rulesModalDisplay" :close="closeRulesModal" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import GameControls from './components/GameControls.vue';
import RulesModal from './components/RulesModal.vue';
import { Board } from './classes/Board';
// import basicBoard from './assets/basicBoard';

const cellElements = ref(null);

// standard sizes are 5x7, 7x10, and 10x14

// const rows = basicBoard.length;
// const cols = basicBoard[0].length;
// const game = ref(new Board(basicBoard));
const rows = 10;
const cols = 15;
const game = ref(new Board(rows, cols));

const hues = {};
const countColor = ref({});
const rulesModalDisplay = ref('none');

function getHint() {
	const hintCell = game.value.getHint();
	if (!hintCell) return;
	editCell(hintCell, hintCell.value);
	hintCell.hint = true;
	setTimeout(() => {
		hintCell.hint = false;
	}, 1000);
	game.value.hints.push(hintCell);
}

function openRulesModal() {
	rulesModalDisplay.value = 'flex';
}

function closeRulesModal() {
	rulesModalDisplay.value = 'none';
}

function random(id, min, max) {
	hues[id] = hues[id] || Math.floor(Math.random() * (max - min + 1)) + min
	return hues[id];
}

function carsInRowCol(row, rowCol, type) {
	const cells = (rowCol === 'row') ? game.value.getRow(row) : game.value.getCol(row);
	return cells.filter(cell => cell[type] === "car").length;
}

function toggleHoverClass(e, type, i) {
	const rowCol = (type === 'row') ? game.value.getRow(i) : game.value.getCol(i);
	const eType = (e.type === 'mouseenter') ? true : false; // .toggle() can get stuck on if hot reload while hovering
	const cellsToChange = [];
	const cellsToNotChange = [];
	for (const cell of rowCol) {
		if (cell.value === 'charge') continue;
		if (cell.displayValue !== mode.value) {
			cellsToChange.push(cell);
		} else {
			cellsToNotChange.push(cell);
		}
	}
	if (cellsToChange.length > 0) {
		for (const cell of cellsToChange) {
			cell.hover = eType;
		}
	} else {
		for (const cell of cellsToNotChange) {
			cell.hover = eType;
		}
	}
}

const mode = ref('road');
let markMode = true;

function updateMode(newMode) {
	mode.value = newMode;
}

function getCountColor(i, type) {
	const getFunc = "get" + type.charAt(0).toUpperCase() + type.slice(1);
	const cars = game.value[getFunc](i).filter(c => c.value === 'car');
	const displayedCars = cars.filter(c => c.displayValue === 'car');
	if (displayedCars.length === cars.length) {
		return 'green';
	}
	return 'white';
}

function editCell(cell, value) {
	cell.display(value);

	countColor.value[`row-${cell.row}`] = getCountColor(cell.row, 'row');
	countColor.value[`col-${cell.col}`] = getCountColor(cell.col, 'col');

	const check = game.value.checkBoard();
	if (!check) return;
	setTimeout(() => {
		if (check === "win") {
			alert(`You win! Used ${game.value.hints.length} hints.`);
		} else if (check === "wrong") {
			alert('Wrong!');
		}
		console.log(game.value.getAs('value'));
		console.log(game.value.getAs('correct'));
	}, 50);
}

function displayAll(e, type, i) {
	const rowCol = (type === 'row') ? game.value.getRow(i) : game.value.getCol(i);
	const cellsToChange = [];
	const cellsToNotChange = [];
	for (const cell of rowCol) {
		if (cell.value === 'charge') continue;
		if (cell.displayValue !== mode.value) {
			cellsToChange.push(cell);
		} else {
			cellsToNotChange.push(cell);
		}
	}
	if (cellsToChange.length > 0) {
		for (const cell of cellsToChange) {
			editCell(cell, mode.value);
			cell.element.classList.add('hover');
		}
	} else {
		for (const cell of cellsToNotChange) {
			editCell(cell, null);
			cell.element.classList.add('hover');
		}
	}
}

function clicking(e) {
	if (e.buttons !== 1) return;
	const x = e.clientX;
	const y = e.clientY;
	// which cell is mouse within given cellElements
	for (const cellEle of cellElements.value.children) {
		const rect = cellEle.getBoundingClientRect();
		const cell = game.value.getCellFromElement(cellEle);
		if (cell.value === 'charge') continue;
		if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
			if (cell.displayValue !== mode.value && markMode) {
				editCell(cell, mode.value);
			} else if (cell.displayValue === mode.value && !markMode) {
				editCell(cell, null);
			}
		}
	}
}

function cellClicked(e) {
	const cell = game.value.getCellFromElement(e.target);
	if (cell.value === 'charge') return;
	if (cell.displayValue === mode.value) {
		markMode = false;
		editCell(cell, null);
	} else {
		markMode = true;
		editCell(cell, mode.value);
	}
}

onMounted(() => {
	console.log(game);
	for (const cellEle of cellElements.value.children) {
		const cell = game.value.getCellFromElement(cellEle);
		cell.element = cellEle;
		if (cell.value === 'charge') {
			editCell(cell, 'charge');
		}
	}

	const rowsColors = Array.apply(null, Array(rows)).reduce((acc, val, i) => ({
		...acc,
		[`row-${i}`]: getCountColor(i, 'row')
	}), {});
	const colsColors = Array.apply(null, Array(cols)).reduce((acc, val, i) => ({
		...acc,
		[`col-${i}`]: getCountColor(i, 'col')
	}), {});
	countColor.value = { ...rowsColors, ...colsColors };
});
</script>

<style scoped>
.game-board {
	height: 100%;
	grid-area: game-board;
	display: grid;
	gap: 0;
	grid-template-columns: 1fr 1px auto;
	grid-template-rows: auto 1fr auto;
	grid-template-areas:
		"header header header"
		"game-board-cells row-count-cells row-count-cells"
		"col-count-cells col-count-cells empty"
		"controls controls controls";
	overflow: auto;
}

.header {
	grid-area: header;
	font-size: 1.5rem;
	position: sticky;
	top: 0;
	text-align: center;
	font-weight: bold;
	color: white;
	background-color: #2e2e2e;
	padding: 0.5rem;
	z-index: 1;
}

.topbuttons {
	float: right;
	display: grid;
	gap: 0.3rem;
	position: relative;
	top: -0.7rem;
	right: 0.2rem;
}

.header button {
	/* float: right; */
	font-size: 0.9rem;
	color: orange;
	background: #111;
	border: 1px solid #ffa50099;
	border-radius: 5px;
	font-weight: normal;
	padding: 2px 5px 2px 5px;
	cursor: pointer;
}

.header button:hover {
	background: #222;
	border: 1px solid #ffa500aa;
}

h1 {
	color: #fff;
	background: #333333aa;
	font-size: 2rem;
	padding: 0.5rem;
	margin-bottom: -3.2rem;
}

.count {
	color: white;
}

.game-board-cells,
.row-count-cells,
.col-count-cells {
	display: grid;
	height: 100%;
}

.game-board-cells,
.col-count-cells {
	min-width: calc(v-bind(cols) * 1rem);
}

.game-board-cells,
.row-count-cells {
	min-height: calc(v-bind(rows) * 1.2rem);
}

.row-count-cells {
	grid-area: row-count-cells;
	min-width: 30px;
}

.col-count-cells {
	grid-area: col-count-cells;
	min-height: 30px;
}

.row-count-cells {
	grid-template-rows: repeat(v-bind('rows'), minmax(0, 1fr));
}

.game-board-cells {
	grid-template-columns: repeat(v-bind('cols'), minmax(0, 1fr));
	grid-template-rows: repeat(v-bind('rows'), minmax(0, 1fr));
	background: #333;
}

.col-count-cells {
	grid-template-columns: repeat(v-bind('cols'), minmax(0, 1fr));
}

.row-count,
.col-count {
	background: #222;
	font-weight: bold;

}

.game-cell,
.row-count,
.col-count {
	display: flex;
	justify-content: center;
	align-items: center;
	border-top: 1px solid #666;
	border-left: 1px solid #666;
	text-align: center;
	user-select: none;
}

.row-count {
	padding: 0 0.1vw;
}

.col-count {
	padding: 0.1vh 0;
}

.row-count-cells,
.col-count-cells {
	border-right: 1px solid #666;
	border-bottom: 1px solid #666;
}

.game-cell span {
	display: none;
	pointer-events: none;
}

.game-cell.visible span {
	display: inline;
}

.game-cell {
	background: #aaa;
	padding: 0 0.5rem;
	transition: background 0s linear;
}

.game-cell.visible {
	background: #333;
	transition: background 0s linear;
}

.game-cell .emoji {
	font-size: calc((20vh + 20vw) / (v-bind('rows') + v-bind('cols')));
}

.game-cell:not(.visible):hover,
.game-cell:not(.visible).hover {
	background: #999;
	transition: background 0s linear;
}

.game-cell.visible:not(.charge):hover,
.game-cell.visible:not(.charge).hover {
	background: #444;
}

.game-cell.hint {
	background: #ffa500aa;
	transition: background 0.5s ease-in-out;
	border: 0.3vw solid #ffa50099;
	border-radius: 3px;
	/* outline: 8px solid #ffa500; */
	box-shadow: 0 0 0 3px #ffa500ff;
	z-index: 1;
}

.game-cell.charge {
	background: #22222266;
}

.row-count:hover,
.col-count:hover {
	background: #111;
}
</style>
