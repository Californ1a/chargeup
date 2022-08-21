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
				<span v-if="cell.displayValue === 'charge'" class="emoji">
					<span v-if="cell.displayConnectedCar?.displayValue && cell.displayConnection === 'up'"
						style="filter: hue-rotate(100deg) saturate(2.5);">
						<span class="up">^<br /></span>⛽
					</span>
					<span v-else-if="cell.displayConnectedCar?.displayValue && cell.displayConnection === 'down'"
						style="filter: hue-rotate(100deg) saturate(2.5);">
						⛽<span class="down"><br />v</span>
					</span>
					<span v-else-if="cell.displayConnectedCar?.displayValue && cell.displayConnection === 'left'"
						style="filter: hue-rotate(100deg) saturate(2.5);">
						<span class="left">&lt;</span>⛽
					</span>
					<span v-else-if="cell.displayConnectedCar?.displayValue && cell.displayConnection === 'right'"
						style="filter: hue-rotate(100deg) saturate(2.5);">
						⛽<span class="right">&gt;</span>
					</span>
					<span v-else>⛽</span>
				</span>
				<span v-else-if="cell.displayValue === 'car'" class="emoji">

					<span
						v-if="cell.displayConnectedCharger?.displayValue && cell.displayConnection === 'up'"
						:style="`filter: hue-rotate(${random(cell.id, 0,360)}deg)`">
						<span class="up">^<br /></span>{{ cell.carIcon }}
					</span>
					<span
						v-else-if="cell.displayConnectedCharger?.displayValue && cell.displayConnection === 'down'"
						:style="`filter: hue-rotate(${random(cell.id, 0,360)}deg)`">
						{{ cell.carIcon }}<span class="down"><br />v</span>
					</span>
					<span
						v-else-if="cell.displayConnectedCharger?.displayValue && cell.displayConnection === 'left'"
						:style="`filter: hue-rotate(${random(cell.id, 0,360)}deg)`">
						<span class="left">&lt;</span>{{ cell.carIcon }}
					</span>
					<span
						v-else-if="cell.displayConnectedCharger?.displayValue && cell.displayConnection === 'right'"
						:style="`filter: hue-rotate(${random(cell.id, 0,360)}deg)`">
						{{ cell.carIcon }}<span class="right">&gt;</span>
					</span>
					<span v-else>{{ cell.carIcon }}</span>

				</span>
				<span v-else-if="cell.displayValue" class="emoji">&nbsp;</span>
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
			</div>
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

function dealWithRowCol(rowOrCol, i, eType) {
	const rowCol = (rowOrCol === 'row') ? game.value.getRow(i) : game.value.getCol(i);
	const cellsToChange = [];
	const cellsToNull = [];
	const connectedCars = rowCol.filter(c => c.displayValue === 'car' && c.displayConnection);
	for (const cell of rowCol) {
		if (cell.value === 'charge') continue;
		const cars = connectedCars.filter(c => c.id === cell.id);
		if (cars.length !== 0) {
			cell.hover = false;
			continue;
		}
		if (cell.displayValue !== mode.value) {
			cellsToChange.push(cell);
		} else {
			cellsToNull.push(cell);
		}
	}
	if (cellsToChange.length > 0) {
		for (const cell of cellsToChange) {
			if (typeof eType === 'boolean') {
				cell.hover = eType;
			} else {
				editCell(cell, mode.value);
			}
		}
	} else {
		for (const cell of cellsToNull) {
			if (typeof eType === 'boolean') {
				cell.hover = eType;
			} else {
				editCell(cell, null);
			}
		}
	}
}

function toggleHoverClass(e, type, i) {
	const eType = (e.type === 'mouseenter') ? true : false; // .toggle() can get stuck on if hot reload while hovering
	dealWithRowCol(type, i, eType);
}

function displayAll(e, type, i) {
	dealWithRowCol(type, i);
}

const mode = ref('road');
let markMode = true;

function updateMode(newMode) {
	mode.value = newMode;
}

function getCountColor(i, type) {
	const getFunc = "get" + type.charAt(0).toUpperCase() + type.slice(1);
	const cars = game.value[getFunc](i).filter(c => c.value === 'car');
	const displayedCars = game.value[getFunc](i).filter(c => c.displayValue === 'car');
	if (displayedCars.length === cars.length) {
		return 'green';
	}
	return 'white';
}

let seenIds = [];

// search backward from car to charger until finding a charger with no connection
function recurseChargers(cell) {
	if (seenIds.includes(cell.id)) return;
	seenIds.push(cell.id);
	// console.log("seenIds", seenIds);
	if (cell.value === 'charge') {
		let cars = game.value.getCellNeighbors(cell).filter(c => c.displayValue === 'car' && c.displayConnection);
		// console.log("cars", cars);
		// console.log("cell", cell);
		if (cars.length === 1 && !cell.displayConnection) {
			// end of the chain, found charger with only one car, swap connection direction
			// console.log("found charger with only one car", cell, cars[0]);
			return cars[0];
		} else {
			// not end of the chain, keep searching
			const cars1 = cars.filter(c => c.displayConnection);
			// console.log("cars1", cars1);
			const cars2 = cars1.filter(c => !seenIds.includes(c.id));
			// console.log("cars2", cars2);
			for (const car of cars2) {
				const charger = recurseChargers(car);
				if (charger) {
					// console.log("found charger", charger, car);
					return car;
				}
			}
		}
	} else {
		// is a car, keep searching
		const chargers1 = game.value.getCellNeighbors(cell).filter(c => c.value === 'charge');
		// console.log("chargers1", chargers1);
		const chargers = chargers1.filter(c => !seenIds.includes(c.id));
		// console.log("chargers", chargers);
		for (const charger of chargers) {
			const car = recurseChargers(charger);
			if (car) {
				// console.log("found car", charger, car);
				return charger;
			}
		}
	}
}

function editCell(cell, value) {
	const oldValue = cell.displayValue;
	cell.display(value);

	const chargers = game.value.getCellNeighbors(cell).filter(c => c.value === 'charge');
	const unconnectedChargersWithAllNeighborsFilled = chargers.filter(c => {
		const hasConnection = c.displayConnection;
		const neighbors = game.value.getCellNeighbors(c);
		const filledNeighbors = neighbors.filter(n => n.displayValue !== null);
		const filledNeighborsPercent = filledNeighbors.length / neighbors.length;
		const carNeighbors = neighbors.filter(n => n.displayValue === 'car');
		const chargerConnectedCars = carNeighbors.filter(n => {
			return n.displayConnection && game.value.getCellNeighbors(n.displayConnectedCharger).filter(a => a.displayValue === null).length > 0;
		});
		return !hasConnection && filledNeighborsPercent === 1 && carNeighbors.length > 0 && chargerConnectedCars.length > 0;
	});

	// console.log("unconnectedChargersWithAllNeighborsFilled", unconnectedChargersWithAllNeighborsFilled);

	if (value === 'car' && chargers.length > 0) {
		const emptyCarNeighbors = game.value.getCellNeighborsWithDiagonal(cell).filter(c => c.displayValue === null);
		// console.log("chargersA", chargers);
		for (const road of emptyCarNeighbors) {
			road.display('road');
		}
		const charger = chargers.reduce((acc, val) => {
			const neighborsA = game.value.getCellNeighbors(acc);
			const neighborsB = game.value.getCellNeighbors(val);
			const filledNeighborsA = neighborsA.filter(n => n.displayValue !== null);
			const filledNeighborsB = neighborsB.filter(n => n.displayValue !== null);
			const nAFillPercent = filledNeighborsA.length / neighborsA.length;
			const nBFillPercent = filledNeighborsB.length / neighborsB.length;
			const leastNeighbors = (nAFillPercent > nBFillPercent) ? acc : val;
			const mostNeighbors = (nAFillPercent > nBFillPercent) ? val : acc;
			const notConnected = (leastNeighbors.displayConnection) ? mostNeighbors : leastNeighbors;
			// console.log(filledNeighborsA, filledNeighborsB, nAFillPercent, nBFillPercent, leastNeighbors, mostNeighbors, notConnected);
			return notConnected;
		});
		for (const road of emptyCarNeighbors) {
			road.display(null);
		}
		// console.log("chargerA", charger);

		if (charger && !charger.displayConnection) {
			charger.displayConnection = charger.getConnectionDirection(cell);
			cell.displayConnection = cell.getConnectionDirection(charger);
			charger.displayConnectedCar = cell;
			cell.displayConnectedCharger = charger;
		} else if (charger.displayConnection) {
			const newCharger = recurseChargers(cell);
			// console.log("newCharger", newCharger);
			if (newCharger) {
				for (let i = seenIds.length - 1; i >= 0; i -= 2) {
					const newCell = game.value.getCellById(seenIds[i]);
					const newCell2 = game.value.getCellById(seenIds[i - 1]);
					newCell.displayConnection = newCell.getConnectionDirection(newCell2);
					newCell2.displayConnection = newCell2.getConnectionDirection(newCell);
					newCell.displayConnectedCar = newCell2;
					newCell2.displayConnectedCharger = newCell;
				}
			}
			seenIds = [];
		}
	} else if (oldValue === 'car' && cell.displayValue !== 'car' && cell.displayConnectedCharger) {
		// find unconnected cars next to charger and connect them
		const cars = game.value.getCellNeighbors(cell.displayConnectedCharger).filter(c => c.displayValue === 'car' && !c.displayConnection);
		const charger = cell.displayConnectedCharger;
		if (cars.length > 0) {
			cars[0].displayConnection = cars[0].getConnectionDirection(charger);
			charger.displayConnection = charger.getConnectionDirection(cars[0]);
			cars[0].displayConnectedCharger = charger;
			charger.displayConnectedCar = cars[0];
		} else {
			charger.displayConnection = null;
			charger.displayConnectedCar = null;
		}
		cell.displayConnection = null;
		cell.displayConnectedCharger = null;
	} else if (unconnectedChargersWithAllNeighborsFilled.length > 0) {
		for (const charger of unconnectedChargersWithAllNeighborsFilled) {
			const neighbors = game.value.getCellNeighbors(charger)
			const carNeighbors = neighbors.filter(n => n.displayValue === 'car');
			const chargerConnectedCars = carNeighbors.filter(n => {
				return n.displayConnection && game.value.getCellNeighbors(n.displayConnectedCharger).filter(a => a.displayValue === null).length > 0;
			});
			const car = chargerConnectedCars[0];
			const newCharger = car.displayConnectedCharger;
			newCharger.displayConnection = null;
			newCharger.displayConnectedCar = null;
			car.displayConnection = car.getConnectionDirection(charger);
			charger.displayConnection = charger.getConnectionDirection(car);
			car.displayConnectedCharger = charger;
			charger.displayConnectedCar = car;
		}
	} else {
		const connection = cell.displayConnectedCar ?? cell.displayConnectedCharger;
		if (connection) {
			connection.displayConnection = null;
			connection.displayConnectedCar = null;
			connection.displayConnectedCharger = null;
		}
		cell.displayConnection = null;
		cell.displayConnectedCar = null;
		cell.displayConnectedCharger = null;
	}

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
			// console.log(cell.getConnectionDirection());
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
	line-height: 1;
}

.up {
	font-size: calc((13vh + 13vw) / (v-bind('rows') + v-bind('cols')));
}

.down,
.left,
.right {
	font-size: calc((10vh + 10vw) / (v-bind('rows') + v-bind('cols')));
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
