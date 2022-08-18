import { Cell } from './Cell';

export class Board {
	constructor(rows, cols) {
		if (typeof rows === 'object' && rows instanceof Array) {
			this.rows = rows.length;
			this.cols = rows[0].length;
		} else {
			this.rows = rows;
			this.cols = cols;
		}
		this.cells = [];
		for (let i = 0; i < this.rows; i++) {
			this.cells[i] = [];
			for (let j = 0; j < this.cols; j++) {
				const value = rows?.[i]?.[j] || null;
				this.cells[i][j] = new Cell(i, j, value);
			}
		}
	}
	getCell(row, col) {
		return this.cells[row][col];
	}
	setCell(row, col, value) {
		this.cells[row][col].value = value;
	}
	getRow(row) {
		return this.cells[row];
	}
	getCol(col) {
		let colArr = [];
		for (let i = 0; i < this.rows; i++) {
			colArr.push(this.cells[i][col]);
		}
		return colArr;
	}
	getFlatCells() {
		return this.cells.flat();
	}
	getCellFromElement(element) {
		const row = element.getAttribute('data-row');
		const col = element.getAttribute('data-col');
		return this.getCell(row, col);
	}
	checkBoard() {
		const cells = this.getFlatCells()
		const correctCells = cells.filter(cell => cell.correct);
		const displayedCells = cells.filter(cell => cell.displayValue !== null);
		if (cells.length === correctCells.length) return "win";
		else if (cells.length === displayedCells.length) return "wrong";
		return false;
	}
}
