<template>
	<div :class="`${type}-count-cells`">
		<div v-for="(rowCol, i) in rowColCount"
			:key="rowCol"
			tabindex="0"
			:class="`${type}-count`"
			@mouseenter="(e) => toggleHoverClass(e, type, i)"
			@focus="(e) => toggleHoverClass(e, type, i)"
			@mouseleave="(e) => toggleHoverClass(e, type, i)"
			@blur="(e) => toggleHoverClass(e, type, i)"
			@click="(e) => displayAll(e, type, i)"
			@keydown="(e) => displayAll(e, type, i)">
			<span class="count" :style="`color: ${getCountColor(i, type)}`">
				{{ carsInRowCol(i, type, 'value') }}
			</span>
		</div>
	</div>
</template>

<script setup>
import Board from '@/classes/Board';

const props = defineProps({
	game: Board,
	type: {
		type: String,
		default: 'row',
		required: true,
	},
	mode: {
		type: String,
		default: 'road',
		required: true,
	},
	editCell: {
		type: Function,
		default: () => {},
		required: true,
	},
});

const rowColCount = (props.type === 'row') ? props.game.cells : props.game.cells[0];

function editCells(cells, type, val) {
	for (let i = 0; i < cells.length; i += 1) {
		const cell = cells[i];
		if (typeof type === 'boolean') {
			cell.hover = type;
		} else if (i === cells.length - 1) {
			props.editCell(cell, val);
		} else if (i !== cells.length - 1) {
			props.editCell(cell, val, false);
		}
	}
}

function dealWithRowCol(rowOrCol, i, eType) {
	const rowCol = (rowOrCol === 'row') ? props.game.getRow(i) : props.game.getCol(i);
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
		if (cell.displayValue !== props.mode) {
			cellsToChange.push(cell);
		} else {
			cellsToNull.push(cell);
		}
	}
	// console.log(cellsToChange, cellsToNull);
	if (cellsToChange.length > 0) {
		editCells(cellsToChange, eType, props.mode);
	} else {
		editCells(cellsToNull, eType, null);
	}
}

function toggleHoverClass(e, type, i) {
	const eType = Boolean(e.type.match(/^(mouseenter|focus)$/)); // .toggle() can get stuck on if hot reload while hovering
	dealWithRowCol(type, i, eType);
}

function selectCell(all, current, type, reverse) {
	const index = Array.prototype.indexOf.call(all, current);
	if (index >= 0) {
		const viableCells = document.querySelectorAll(`.game-board-cells [data-${type}="${index}"]:not(.charge)`);
		if (viableCells.length > 0) {
			const i = (reverse) ? 0 : viableCells.length - 1;
			viableCells[i].focus();
		}
	}
}

function displayAll(e, type, i) {
	if (e.type === 'click' || (e.type === 'keydown' && (e.code === 'Enter' || e.code === 'Space'))) {
		dealWithRowCol(type, i);
		return;
	}
	if (!e.code.match(/^Arrow(Up|Down|Left|Right)$/)) return;
	// focus next element
	const all = document.querySelectorAll(`.${type}-count-cells [tabindex="0"]`);
	const current = document.querySelector(`.${type}-count-cells [tabindex="0"]:focus-visible,.${type}-count-cells [tabindex="0"]:focus`);
	const next = current?.nextElementSibling;
	const prev = current?.previousElementSibling;
	if (e.code === 'ArrowDown' && type === 'row' && next) {
		next.focus();
	} else if (e.code === 'ArrowDown' && type === 'row' && !next) {
		all[0].focus();
	} else if (e.code === 'ArrowUp' && type === 'row' && prev) {
		prev.focus();
	} else if (e.code === 'ArrowUp' && type === 'row' && !prev) {
		all[all.length - 1].focus();
	} else if (e.code === 'ArrowRight' && type === 'col' && next) {
		next.focus();
	} else if (e.code === 'ArrowRight' && type === 'col' && !next) {
		all[0].focus();
	} else if (e.code === 'ArrowLeft' && type === 'col' && prev) {
		prev.focus();
	} else if (e.code === 'ArrowLeft' && type === 'col' && !prev) {
		all[all.length - 1].focus();
	} else if (e.code === 'ArrowLeft' && type === 'row' && all && current) {
		selectCell(all, current, type);
	} else if (e.code === 'ArrowUp' && type === 'col' && all && current) {
		selectCell(all, current, type);
	} else if (e.code === 'ArrowRight' && type === 'row' && all && current) {
		selectCell(all, current, type, true);
	} else if (e.code === 'ArrowDown' && type === 'col' && all && current) {
		selectCell(all, current, type, true);
	}
}

function carsInRowCol(row, rowCol, type) {
	const cells = (rowCol === 'row') ? props.game.getRow(row) : props.game.getCol(row);
	return cells.filter(cell => cell[type] === 'car').length;
}

function getCountColor(i, type) {
	const getFunc = `get${type.charAt(0).toUpperCase()}${type.slice(1)}`;
	const cars = props.game[getFunc](i).filter(c => c.value === 'car');
	const displayedCars = props.game[getFunc](i).filter(c => c.displayValue === 'car');
	if (displayedCars.length === cars.length) {
		return 'green';
	}
	return 'white';
}
</script>

<style scoped>
.row-count-cells,
.col-count-cells {
	display: grid;
	height: 100%;
	border-right: 1px solid #666;
	border-bottom: 1px solid #666;
}

.col-count-cells {
	min-width: calc(v-bind(cols) * 1rem);
	min-height: 30px;
	grid-template-columns: repeat(v-bind('props.game.cols'), minmax(0, 1fr));
}

.row-count-cells {
	min-height: calc(v-bind(rows) * 1.2rem);
	min-width: 30px;
	grid-template-rows: repeat(v-bind('props.game.rows'), minmax(0, 1fr));
}

.row-count,
.col-count {
	display: flex;
	justify-content: center;
	align-items: center;
	border-top: 1px solid #666;
	border-left: 1px solid #666;
	text-align: center;
	user-select: none;
	background: #222;
	font-weight: bold;
}

.row-count {
	padding: 0 0.1vw;
}

.col-count {
	padding: 0.1vh 0;
}
</style>
