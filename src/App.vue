<template>
	<div class="game-board">
		<h1>Charge Up</h1>
		<div ref="cellElements" class="game-board-cells" @mousemove="clicking">
			<div v-for="cell in game.getFlatCells()" :data-row="cell.row" :data-col="cell.col" :key="cell" class="game-cell"
				@mousedown="cellClicked"
				:class="{
          visible: cell.displayValue,
          charge: cell.value === 'charge',
          hover: cell.hover,
        }">
				<span v-if="cell.displayValue === 'charge'" class="emoji">⛽</span>
				<span v-else-if="cell.displayValue === 'car'" class="emoji">{{ cell.carIcon }}</span>
				<span v-if="cell.displayValue" class="emoji">&nbsp;</span>
				<span v-else>{{ cell.row }}, {{ cell.col }}</span>
			</div>
		</div>
		<div class="row-count-cells">
			<div v-for="(row, i) in game.cells" :key="row" class="row-count"
				@mouseenter="(e) => toggleHoverClass(e, 'row', i)"
				@mouseleave="(e) => toggleHoverClass(e, 'row', i)"
				@click="(e) => displayAll(e, 'row', i)">
				<span class="count">{{ row.filter(cell=>cell.value==="car").length }}</span>
				<!-- Row {{ i }} -->
			</div>
		</div>
		<div class="col-count-cells">
			<div v-for="(col, i) in game.cells[0]" :key="col" class="col-count"
				@mouseenter="(e) => toggleHoverClass(e, 'col', i)"
				@mouseleave="(e) => toggleHoverClass(e, 'col', i)"
				@click="(e) => displayAll(e, 'col', i)">
				<span class="count">{{ game.getCol(i).filter(cell=>cell.value==="car").length }}</span>
				<!-- Col {{ i }} -->
			</div>
			<!-- <div class="col-count empty"></div> -->
		</div>
		<div class="controls">
			<div class="control-group">
				<label for="mode">Mode</label>
				<div class="control">
					<input type="radio" id="car" value="car" v-model="mode" />
					<label for="car" :class="{selected:mode==='car'}">Car</label>
				</div>
				<div class="control">
					<input type="radio" id="road" value="road" v-model="mode" />
					<label for="road" :class="{selected:mode==='road'}">Road</label>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Board } from './classes/Board';
import basicBoard from './assets/basicBoard';

const cellElements = ref(null);

// max without scroll is 11x20 or 17x13
// standard sizes are 5x7, 7x10, and 10x14
const rows = basicBoard.length;
const cols = basicBoard[0].length;
const game = ref(new Board(basicBoard));

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

function editCell(cell, value) {
	cell.display(value);
	const check = game.value.checkBoard();
	if (!check) return;
	setTimeout(() => {
		if (check === "win") {
			alert('You win!');
		} else if (check === "wrong") {
			alert('Wrong!');
		}
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

h1 {
	position: sticky;
	top: 0;
	grid-area: header;
	color: #fff;
	background: #333333aa;
	text-align: center;
	font-size: 2rem;
	padding: 0.5rem;
}

.controls {
	padding-top: 15px;
	grid-area: controls;
	color: #fff;
	text-align: center;
	font-size: 1rem;
	justify-content: center;
	align-items: center;
	display: flex;
	user-select: none;
}

.control-group {
	/* max-width: 50%; */
	width: 50%;
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

.control-group>label {
	grid-area: label;
	color: #fff;
	text-align: center;
	font-size: 1rem;
	font-weight: bold;
}

.control-group .control:first-child {
	grid-area: control;
}

.control-group .control:nth-child(1) {
	grid-area: control2;
}

.control-group .control {
	color: #fff;
	text-align: center;
	font-size: 1rem;
}

.control-group input[type="radio"] {
	display: none;
}

.control-group .control label {
	display: block;
	cursor: pointer;
	background: #444;
	color: #fff;
	padding: 3px;
	border-radius: 5px;
	border: 1px solid #fff;
	transition: all 0.2s ease-in-out;
}

.control-group .control label:hover {
	background: #333;
}

.control-group .control label.selected {
	background: #111;
}

.game-board-cells,
.row-count-cells,
.col-count-cells {
	display: grid;
	height: 100%;
}

.row-count-cells {
	grid-area: row-count-cells;
	min-width: 40px;
}

.col-count-cells {
	grid-area: col-count-cells;
}

.row-count-cells {
	grid-template-rows: repeat(v-bind('rows'), 1fr);
}

.game-board-cells {
	grid-template-columns: repeat(v-bind('cols'), 1fr);
	grid-template-rows: repeat(v-bind('rows'), 1fr);
	background: #333;
}

.col-count-cells {
	grid-template-columns: repeat(v-bind('cols'), 1fr);
}

.row-count,
.col-count {
	background: #222;

}

.game-cell,
.row-count,
.col-count {
	display: flex;
	justify-content: center;
	align-items: center;
	border-top: 1px solid #666;
	border-left: 1px solid #666;
	padding: 0.5rem;
	text-align: center;
	user-select: none;
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

}

.game-cell.visible {
	background: #333;
}

.game-cell .emoji {
	font-size: 2rem;
}

.game-cell:not(.visible):hover,
.game-cell:not(.visible).hover {
	background: #999;
}

.game-cell.visible:not(.charge):hover,
.game-cell.visible:not(.charge).hover {
	background: #444;
}

.game-cell.charge {
	background: #22222266;
}

.row-count:hover,
.col-count:hover {
	background: #111;
}
</style>
