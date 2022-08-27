<template>
	<div class="game-board">
		<div class="header">
			<h1>Charge Up</h1>
			<div class="topbuttons">
				<button type="button" @click="openRulesModal">
					Rules
				</button>
				<button type="button" @click="getHint">
					Hint
				</button>
			</div>
		</div>
		<SimpleLoading v-if="loading" />
		<div :key="game.id"
			:class="{
				hidden: loading,
			}">
			<div class="game-board-cells">
				<div v-for="cell in game.getFlatCells()"
					:key="cell.id"
					:data-row="cell.row"
					:data-col="cell.col"
					class="game-cell"
					:class="{
						visible: cell.displayValue,
						charge: cell.value === 'charge',
						hover: cell.hover,
						hint: cell.hint,
					}"
					:tabindex="(cell.displayValue === 'charge') ? -1 : 0"
					@mousedown="cellClicked($event, cell)"
					@keydown="cellClicked($event, cell)"
					@mousemove="clicking($event, cell)">
					<span v-if="cell.displayValue === 'charge'" class="emoji">
						<EmojiCell :key="cell.displayConnectedCar"
							type="charge"
							:cell="cell"
							:rows="game.rows"
							:cols="game.cols" />
					</span>
					<span v-else-if="cell.displayValue === 'car'" class="emoji">
						<EmojiCell type="car"
							:cell="cell"
							:rows="game.rows"
							:cols="game.cols" />
					</span>
					<span v-else-if="cell.displayValue" class="emoji">&nbsp;</span>
					<span v-else>&nbsp;</span>
				</div>
			</div>
		</div>
		<CarCounts :key="game.id"
			type="row"
			:game="game"
			:mode="mode"
			:edit-cell="editCell"
			:class="{
				hidden: loading,
			}" />
		<CarCounts :key="game.id"
			type="col"
			:game="game"
			:mode="mode"
			:edit-cell="editCell"
			:class="{
				hidden: loading,
			}" />
		<GameControls :key="game.id"
			:mode="mode"
			:game="game"
			@update:model-value="updateMode"
			@new-game="newGameBtn" />
	</div>
	<RulesModal :display="rulesModalDisplay" :close="closeRulesModal" />
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeMount, computed } from 'vue';
import { useToast } from 'vue-toastification';
import SimpleLoading from './components/SimpleLoading.vue';
import GameControls from './components/GameControls.vue';
import RulesModal from './components/RulesModal.vue';
import EmojiCell from './components/EmojiCell.vue';
import CarCounts from './components/CarCounts.vue';
import ToastButton from './components/ToastButton.vue';
import db from './store/db';
import tryPersistWithoutPromtingUser from './store/persistance';
import Board from './classes/Board';
import bfs from './util/bfs';
// import basicBoard from './assets/basicBoard';

const game = reactive(new Board());
const mode = ref('road');
const doneLoading = ref(false);
const toast = useToast();
const persist = ref(null);
const rulesModalDisplay = ref('none');
let lastDraggedCellVal = null;
let markMode = true;
let showPersistToast = true;
const persistToastContent = {
	component: ToastButton,
	listeners: {
		persistenceGranted: () => {
			console.log('User granted persistence');
			toast.info('Persistence granted!\nGame saves will be stored unless manually cleared by you.', {
				timeout: 10000,
			});
			localStorage.setItem('persist', 'granted');
		},
		persistenceDenied: () => {
			console.log('User denied persistence');
			toast.info('Couldn\'t get persistence.\nYour browser may automatically delete game saves after a while.', {
				timeout: 10000,
			});
			localStorage.setItem('persist', 'denied');
		},
	},
};

onBeforeMount(async () => {
	doneLoading.value = false;
	// standard sizes are 5x7, 7x10, and 10x14
	const defaultRows = 10;
	const defaultCols = 15;
	const currentGame = await db.currentGame.orderBy('date').reverse().limit(1).first();
	const recentCompleteGame = await db.games.orderBy('date').reverse().limit(1).first();
	if (currentGame?.display.flat().filter(c => c.displayValue !== null && c.displayValue !== 'charge').length > 0) {
		console.log('Loaded existing game', currentGame);
		toast.success('Loaded in-progress game!');
		Object.assign(game, new Board(currentGame.board));
		game.setHintList(currentGame.hints);
		game.setPreviousDuration(currentGame.time);
		game.setState(currentGame.display);
		// immedaitely start the timer because it's an existing game with tiles already placed
		game.setStartTime();
		game.setId(currentGame.id);
		mode.value = currentGame.mode;
	} else if (currentGame || recentCompleteGame) {
		console.log('Got row/col count from empty existing game or most recent finished game', currentGame, recentCompleteGame);
		const initRows = currentGame ? currentGame.board.length : recentCompleteGame.rows;
		const initCols = currentGame ? currentGame.board[0].length : recentCompleteGame.cols;
		Object.assign(game, new Board(initRows, initCols));
		mode.value = 'road';
		if (currentGame) {
			await db.currentGame.clear();
		}
	} else {
		console.log('No in-progress or previous game found, using default row/col', defaultRows, defaultCols);
		Object.assign(game, new Board(defaultRows, defaultCols));
		mode.value = 'road';
	}
	doneLoading.value = true;
});

function updateMode(newMode) {
	mode.value = newMode;
}

async function newGameBtn(e, rowCount, colCount) {
	const placedCells = game.getFlatCells().filter(c => c.displayValue !== null && c.displayValue !== 'charge');
	if (game.startTime && !game.endTime && placedCells.length > 0) {
		// eslint-disable-next-line no-restricted-globals
		const confirmation = confirm('Give up your current game and start a new one?');
		if (!confirmation) return;
	}
	doneLoading.value = false;
	mode.value = 'road';
	await db.currentGame.clear();
	Object.assign(game, new Board(rowCount, colCount));
	doneLoading.value = true;
}

onMounted(async () => {
	document.addEventListener('keydown', (e) => {
		if (e.code === 'KeyS' || e.code === 'Digit2') {
			e.preventDefault();
			document.querySelectorAll('*:focus,*:focus-visible').forEach(el => el.blur());
			const newMode = (mode.value === 'road') ? 'car' : 'road';
			updateMode(newMode);
		} else if (e.code === 'Digit3') {
			e.preventDefault();
			document.querySelectorAll('*:focus,*:focus-visible').forEach(el => el.blur());
			newGameBtn(null, game.rows, game.cols);
		}
	});

	persist.value = await tryPersistWithoutPromtingUser();
	// persist.value = 'prompt';
	switch (persist.value) {
		case 'never':
			console.log('Not possible to persist storage');
			localStorage.setItem('persist', 'denied');
			showPersistToast = false;
			break;
		case 'persisted':
			console.log('Successfully persisted storage silently');
			localStorage.setItem('persist', 'granted');
			showPersistToast = false;
			break;
		case 'prompt':
			console.log('Not persisted, but we may prompt user when we want to.');
			if (localStorage.getItem('persist') === 'denied') {
				console.log('User has previously denied persistence, not prompting');
				showPersistToast = false;
				break;
			} else {
				console.log('User has not previously denied persistence, prompting');
				showPersistToast = true;
			}
			break;
		default:
			console.log('No persistence value found, prompting');
			showPersistToast = true;
			break;
	}

	setInterval(async () => {
		if (game.startTime && !game.endTime) {
			await game.save('update', mode.value);
		}
	}, 5000);

	console.log('game', game);
});

function openRulesModal() {
	rulesModalDisplay.value = 'flex';
}

function closeRulesModal() {
	rulesModalDisplay.value = 'none';
}

function editCell(cell, value, save = true) {
	if (game.endTime) return;
	const oldValue = cell.displayValue;
	cell.display(value);

	if (value !== 'charge' && !game.startTime) {
		game.setStartTime();
	}

	const chargers = game.getCellNeighbors(cell).filter(c => c.value === 'charge');
	const unconnectedChargersWithAllNeighborsFilled = chargers.filter((c) => {
		const hasConnection = c.displayConnection;
		const neighbors = game.getCellNeighbors(c);
		const filledNeighbors = neighbors.filter(n => n.displayValue !== null);
		const filledNeighborsPercent = filledNeighbors.length / neighbors.length;
		const carNeighbors = neighbors.filter(n => n.displayValue === 'car');
		const chargerConnectedCars = carNeighbors.filter((n) => {
			if (!n.displayConnection) return false;
			const chargerNeighbors = game.getCellNeighbors(n.displayConnectedCharger);
			const nullNeighbors = chargerNeighbors.filter(a => a.displayValue === null);
			return nullNeighbors.length > 0;
		});
		return !hasConnection && filledNeighborsPercent === 1
			&& carNeighbors.length > 0 && chargerConnectedCars.length > 0;
	});

	if (value === 'car' && chargers.length > 0) {
		// when placing a car next to a charger
		const carNeighbors = game.getCellNeighborsWithDiagonal(cell);
		const emptyCarNeighbors = carNeighbors.filter(c => c.displayValue === null);
		emptyCarNeighbors.forEach(n => n.display('road'));

		let charger = chargers[0];
		if (chargers.length > 1) {
			charger = chargers.reduce((acc, val) => {
				const neighborsA = game.getCellNeighbors(acc);
				const neighborsB = game.getCellNeighbors(val);
				const filledNeighborsA = neighborsA.filter(n => n.displayValue !== null);
				const filledNeighborsB = neighborsB.filter(n => n.displayValue !== null);
				const nAFillPercent = filledNeighborsA.length / neighborsA.length;
				const nBFillPercent = filledNeighborsB.length / neighborsB.length;
				const leastNeighbors = (nAFillPercent > nBFillPercent) ? acc : val;
				const mostNeighbors = (nAFillPercent > nBFillPercent) ? val : acc;
				const notConnected = (leastNeighbors.displayConnection) ? mostNeighbors : leastNeighbors;
				return notConnected;
			});
		}
		emptyCarNeighbors.forEach(n => n.display(null));

		if (charger && !charger.displayConnection) {
			Board.linkCarToCharger(cell, charger);
		} else if (charger.displayConnection) {
			const path = bfs(game, cell);
			// console.log("seenIds", seenIds);
			if (path && path.length > 0) {
				for (let i = path.length - 1; i >= 0; i -= 2) {
					// const newCell = game.getCellById(seenIds[i]);
					// const newCell2 = game.getCellById(seenIds[i - 1]);
					Board.linkCarToCharger(path[i], path[i - 1]);
				}
			}
		}
	} else if (oldValue === 'car' && cell.displayValue !== 'car' && cell.displayConnectedCharger) {
		// when removing a connected car,
		// find unconnected cars next to previously-connected charger and connect them if there are any
		const cars = game.getCellNeighbors(cell.displayConnectedCharger).filter(c => c.displayValue === 'car' && !c.displayConnection);
		const charger = cell.displayConnectedCharger;
		if (cars.length > 0) {
			Board.linkCarToCharger(cars[0], charger);
		} else {
			charger.clearDisplayConnections();
		}
		cell.clearDisplayConnections();
	} else if (unconnectedChargersWithAllNeighborsFilled.length > 0) {
		// when placing a road next to an unconnected charger, completely blocking it,
		// find connected cars next to the charger and swap their connection if
		// their previously-connected charger has an open neighbor
		unconnectedChargersWithAllNeighborsFilled.forEach((charger) => {
			const neighbors = game.getCellNeighbors(charger);
			const carNeighbors = neighbors.filter(n => n.displayValue === 'car');
			const chargerConnectedCars = carNeighbors.filter((n) => {
				const chargerNeighbors = game.getCellNeighbors(n.displayConnectedCharger);
				const nullNeighbors = chargerNeighbors.filter(a => a.displayValue === null);
				return n.displayConnection && nullNeighbors.length > 0;
			});
			const car = chargerConnectedCars[0];
			const newCharger = car.displayConnectedCharger;
			newCharger.clearDisplayConnections();
			Board.linkCarToCharger(car, charger);
		});
	}

	if (save) {
		game.save('put', mode.value);
	}

	const check = game.checkBoard();
	if (!check) return;
	game.setEndTime();
	const placedCells = game.getFlatCells().filter(c => c.value !== 'charge');
	const cars = game.getFlatCells().filter(c => c.value === 'car');
	setTimeout(async () => {
		if (check === 'win') {
			document.querySelectorAll('*:focus,*:focus-visible').forEach(el => el.blur());
			const time = (game.getTime() / 1000).toFixed(3);
			const hints = game.hints.length;
			const hintStr = `Used ${hints} hint${(hints.length === 1) ? '' : 's'}.`;
			const perCell = (time / placedCells.length).toFixed(3);
			const perCar = (time / cars.length).toFixed(3);
			const timeStr = `Took ${time} seconds (${perCell} per cell & ${perCar} per car).`;
			alert(`You win! ${hintStr} ${timeStr}`);
			try {
				const entry = await db.games.add({
					time,
					timePerCell: perCell,
					timePerCar: perCar,
					hintCount: hints,
					date: new Date(),
					board: game.getAs('value'),
					rows: game.rows,
					cols: game.cols,
					hints: game.getHintList(),
				});
				console.log(`Inserted new game to finished games with id ${entry}.`);
				await db.currentGame.clear();
				console.log('Deleted current game from db.');
			} catch (e) {
				console.error(`Error inserting new game to db: ${e}`);
			}
			if (showPersistToast) {
				toast.error(persistToastContent, {
					position: 'top-center',
					timeout: false,
					closeOnClick: false,
					draggable: false,
					showCloseButtonOnHover: false,
					hideProgressBar: true,
					closeButton: false,
				});
			}
		} else if (check === 'wrong') {
			game.endTime = null;
			alert('Wrong!');
		}
		console.log(game.getAs('value'));
		console.log(game.getAs('correct'));
	}, 50);
}

function getHint() {
	const hintCell = game.getHint();
	if (!hintCell) return;
	editCell(hintCell, hintCell.value);
	hintCell.hint = true;
	setTimeout(() => {
		hintCell.hint = false;
	}, 1000);
	game.hints.push(hintCell);
}

function clicking(e, cell) {
	if (e.buttons !== 1 || game.endTime) {
		lastDraggedCellVal = null;
		return;
	}
	const x = e.clientX;
	const y = e.clientY;
	// which cell is mouse within given cellElements
	const rect = e.target.getBoundingClientRect();
	if (cell.value === 'charge' || game.endTime || lastDraggedCellVal !== cell.displayValue) return;
	if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
		if (cell.displayValue !== mode.value && markMode) {
			editCell(cell, mode.value);
		} else if (cell.displayValue === mode.value && !markMode) {
			editCell(cell, null);
		}
	}
}

function focusSelection(i, type, dir) {
	if (dir) {
		dir.focus();
	} else {
		const carCounts = document.querySelectorAll(`.${type}-count-cells [tabindex="0"]`);
		carCounts[i].focus();
	}
}

function cellClicked(e, cell) {
	if (cell.value === 'charge' || game.endTime) return;
	if (e.type === 'click' || e.type === 'mousedown' || (e.type === 'keydown' && (e.code === 'Enter' || e.code === 'Space'))) {
		lastDraggedCellVal = cell.displayValue;
		if (cell.displayValue === mode.value) {
			markMode = false;
			editCell(cell, null);
		} else {
			markMode = true;
			editCell(cell, mode.value);
		}
		return;
	}
	if (!e.code.match(/^Arrow(Up|Down|Left|Right)$/)) return;

	const current = document.querySelector('.game-cell[tabindex="0"]:focus-visible,.game-cell[tabindex="0"]:focus');
	const rowIndex = +current.dataset.row;
	const colIndex = +current.dataset.col;
	const up = Array.from(document.querySelectorAll(`.game-cell[tabindex="0"][data-col="${colIndex}"]`))
		.filter(c => +c.dataset.row < rowIndex).reverse()[0];
	const down = Array.from(document.querySelectorAll(`.game-cell[tabindex="0"][data-col="${colIndex}"]`))
		.filter(c => +c.dataset.row > rowIndex)[0];
	const left = Array.from(document.querySelectorAll(`.game-cell[tabindex="0"][data-row="${rowIndex}"]`))
		.filter(c => +c.dataset.col < colIndex).reverse()[0];
	const right = Array.from(document.querySelectorAll(`.game-cell[tabindex="0"][data-row="${rowIndex}"]`))
		.filter(c => +c.dataset.col > colIndex)[0];

	if (e.code === 'ArrowUp' && rowIndex >= 0) {
		focusSelection(colIndex, 'col', up);
	} else if (e.code === 'ArrowDown' && rowIndex <= game.rows - 1) {
		focusSelection(colIndex, 'col', down);
	} else if (e.code === 'ArrowLeft' && colIndex >= 0) {
		focusSelection(rowIndex, 'row', left);
	} else if (e.code === 'ArrowRight' && colIndex <= game.cols - 1) {
		focusSelection(rowIndex, 'row', right);
	}
}

const visibleChargerCount = computed(() => game.getFlatCells().filter(c => c.displayValue === 'charge').length);
const loading = computed(() => {
	const emptyRows = game.rows === 0;
	const emptyCols = game.cols === 0;
	const noChargers = visibleChargerCount.value === 0;
	const notDoneLoading = !doneLoading.value;
	return emptyRows || emptyCols || noChargers || notDoneLoading;
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

.header button:active {
	background: #333;
	border: 1px solid #ffa500bb;
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

.hidden {
	display: none;
}

.game-board-cells {
	display: grid;
	height: 100%;
}

.emoji {
	font-size: calc((20vh + 20vw) / (max(v-bind('game.rows'), v-bind('game.cols')) * 2));
	line-height: 1;
}

.game-board-cells {
	min-width: calc(v-bind('game.cols') * 1rem);
}

.game-board-cells {
	min-height: calc(v-bind('game.rows') * 1.2rem);
}

.game-board-cells {
	grid-template-columns: repeat(v-bind('game.cols'), minmax(0, 1fr));
	grid-template-rows: repeat(v-bind('game.rows'), minmax(0, 1fr));
	background: #333;
}

:deep(.row-count-cells) {
	grid-area: row-count-cells;
}

:deep(.col-count-cells) {
	grid-area: col-count-cells;
}

.game-cell {
	display: flex;
	justify-content: center;
	align-items: center;
	border-top: 1px solid #666;
	border-left: 1px solid #666;
	text-align: center;
	user-select: none;
	background: #aaa;
	padding: 0 0.5rem;
	transition: background 0s linear;
}

.game-cell span {
	display: none;
	pointer-events: none;
}

.game-cell.visible span {
	display: inline;
}

.game-cell:focus,
.header button:focus {
	outline-color: Highlight;
	outline-color: -webkit-focus-ring-color;
	outline-style: auto;
	outline-width: 1px;
	z-index: 2;
}

@supports selector(:focus-visible) {

	.game-cell:focus,
	.header button:focus {
		outline: none;
		z-index: 0;
	}

}

.game-cell:focus-visible,
.header button:focus-visible {
	outline-color: Highlight;
	outline-color: -webkit-focus-ring-color;
	outline-style: auto;
	outline-width: 1px;
	z-index: 2;
}

.game-cell.visible {
	background: #333;
	transition: background 0s linear;
}

.game-cell:not(.visible):hover,
.game-cell:not(.visible).hover,
.game-cell:not(.visible):focus-visible {
	background: #999;
	transition: background 0s linear;
}

.game-cell.visible:not(.charge):hover,
.game-cell.visible:not(.charge).hover,
.game-cell.visible:not(.charge):focus-visible {
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
