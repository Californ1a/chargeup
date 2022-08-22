<template>
	<div :class="`${type}-count-cells`">
		<div v-for="(rowCol, i) in rowColCount" :key="rowCol" :class="`${type}-count`"
			@mouseenter="(e) => toggleHoverClass(e, type, i)"
			@mouseleave="(e) => toggleHoverClass(e, type, i)"
			@click="(e) => displayAll(e, type, i)">
			<span class="count" :style="`color: ${color[`${type}-${i}`]}`">
				{{ carsInRowCol(i, type, 'value') }}
			</span>
		</div>
	</div>
</template>

<script setup>
const props = defineProps(['game', 'type', 'color', 'mode', 'editCell']);

const rowColCount = (props.type === 'row') ? props.game.cells : props.game.cells[0];

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
		for (const cell of cellsToChange) {
			if (typeof eType === 'boolean') {
				cell.hover = eType;
			} else {
				props.editCell(cell, props.mode);
			}
		}
	} else {
		for (const cell of cellsToNull) {
			if (typeof eType === 'boolean') {
				cell.hover = eType;
			} else {
				props.editCell(cell, null);
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

function carsInRowCol(row, rowCol, type) {
	const cells = (rowCol === 'row') ? props.game.getRow(row) : props.game.getCol(row);
	return cells.filter(cell => cell[type] === "car").length;
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
