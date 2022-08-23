import { Cell } from './Cell';

export class Board {
	constructor(rows = 0, cols = 0) {
		this.id = Math.random().toString(36).substring(2, 11);
		this.cells = [];
		if (typeof rows === 'object' && rows instanceof Array) {
			const boardMatrix = rows;
			this.rows = boardMatrix.length;
			this.cols = boardMatrix[0].length;
			for (let i = 0; i < this.rows; i++) {
				this.cells[i] = [];
				for (let j = 0; j < this.cols; j++) {
					this.cells[i][j] = new Cell(i, j, boardMatrix[i][j]);
				}
			}
		} else {
			this.rows = rows;
			this.cols = cols;
			if (this.rows > 1 || this.cols > 1) {
				this.generateBoard();
			}
		}
		this.hints = [];
		this.startTime = null;
		this.endTime = null;
		this.previousDuration = 0;
	}
	setId(id) {
		this.id = id;
	}
	setPreviousDuration(duration) {
		this.previousDuration = duration;
	}
	setStartTime() {
		this.startTime = performance.now();
		return this.startTime;
	}
	setEndTime() {
		this.endTime = performance.now();
		return this.endTime;
	}
	getTime() {
		return (this.endTime) ? this.endTime - this.startTime + this.previousDuration : performance.now() - this.startTime + this.previousDuration;
	}
	getCell(row, col) {
		return this.cells[row][col];
	}
	setCell(row, col, value) {
		const cell = this.getCell(row, col);
		cell.value = value;
		if (!value.match(/(charge|car)/)) {
			cell.setConnectedCharger(null);
			cell.setConnectedCar(null);
		}
		return cell;
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
		const correctCells = cells.filter(cell => cell.correct || cell.value === 'charge');
		const displayedCells = cells.filter(cell => cell.displayValue !== null);
		if (cells.length === correctCells.length) return "win";
		else if (cells.length === displayedCells.length) return "wrong";
		return false;
	}
	getCellNeighborsWithDiagonal(cell) {
		const neighbors = [];
		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				if (i === 0 && j === 0) continue;
				const row = cell.row + i;
				const col = cell.col + j;
				if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
					neighbors.push(this.getCell(row, col));
				}
			}
		}
		return neighbors;
	}
	getCellById(id) {
		const row = id.split('-')[0];
		const col = id.split('-')[1];
		return this.getCell(row, col);
	}
	getCellNeighbors(cell) {
		const row = cell.row;
		const col = cell.col;
		const neighbors = [];
		if (row > 0) {
			neighbors.push(this.getCell(row - 1, col));
		}
		if (row < this.rows - 1) {
			neighbors.push(this.getCell(row + 1, col));
		}
		if (col > 0) {
			neighbors.push(this.getCell(row, col - 1));
		}
		if (col < this.cols - 1) {
			neighbors.push(this.getCell(row, col + 1));
		}
		return neighbors;
	}
	generateBoard() {
		for (let i = 0; i < this.rows; i++) {
			this.cells[i] = [];
			for (let j = 0; j < this.cols; j++) {
				this.cells[i][j] = new Cell(i, j, null);
			}
		}
		// Attempt to place cars at unset cells
		let remainingCells = this.getFlatCells().filter(cell => cell.value === null);
		let potentialCars = remainingCells.filter(c => this.getCellNeighborsWithDiagonal(c).filter(n => n.value === 'car').length === 0);
		while (potentialCars.length > 0) {
			const potentialCar = potentialCars[Math.floor(Math.random() * potentialCars.length)];
			const potentialChargers = this.getCellNeighbors(potentialCar).filter(c => c.value === 'road' || c.value === null);
			if (potentialChargers.length > 0) {
				const carCell = this.setCell(potentialCar.row, potentialCar.col, 'car');
				const charger = potentialChargers[Math.floor(Math.random() * potentialChargers.length)];
				const chargerCell = this.setCell(charger.row, charger.col, 'charge');
				carCell.setConnectedCharger(chargerCell);
				chargerCell.setConnectedCar(carCell);
				const emptyCarNeighbors = this.getCellNeighborsWithDiagonal(carCell).filter(c => c.value === null);
				for (const cell of emptyCarNeighbors) {
					this.setCell(cell.row, cell.col, 'road');
				}
			} else {
				this.setCell(potentialCar.row, potentialCar.col, 'road');
			}
			remainingCells = this.getFlatCells().filter(cell => cell.value === null);
			potentialCars = remainingCells.filter(c => this.getCellNeighborsWithDiagonal(c).filter(n => n.value === 'car').length === 0);
		}
		console.log(this.getAs('value'));
		// Set remaining cells to be road
		const newRemainingCells = this.getFlatCells().filter(cell => cell.value === null);
		for (const cell of newRemainingCells) {
			this.setCell(cell.row, cell.col, 'road');
		}

		// Sometimes remove a few random chargers
		// this.removeRandomChargers();
	}
	removeRandomChargers() {
		let chargers = this.getFlatCells().filter(cell => cell.value === 'charge');
		const chargersToRemove = Math.floor(chargers.length * 0.06);
		for (let i = chargersToRemove; i >= 0; i--) {
			chargers = this.getFlatCells().filter(cell => cell.value === 'charge');
			const randomCharger = chargers[Math.floor(Math.random() * chargers.length)];
			const car = randomCharger.connectedCar;
			this.setCell(car.row, car.col, 'road');
			this.setCell(randomCharger.row, randomCharger.col, 'road');
		}
	}
	getHint() {
		const incorrectCells = this.getFlatCells().filter(cell => cell.correct === false);
		if (incorrectCells.length === 0) return null;
		const randomCell = incorrectCells[Math.floor(Math.random() * incorrectCells.length)];
		return randomCell;
	}
	getHintList() {
		if (this.hints.length === 0) return [];
		const values = [...this.hints];
		return values.map(cell => ({ row: cell.row, col: cell.col }));
	}
	setHintList(hints) {
		this.hints = hints.map(hint => this.getCell(hint.row, hint.col));
	}
	getAs(type) {
		const values = [...this.cells];
		if (type === 'state') {
			return values.map(row => row.map(cell => ({
				row: cell.row,
				col: cell.col,
				value: cell.value,
				correct: cell.correct,
				displayValue: cell.displayValue,
				hint: cell.hint,
				displayConnectedCharger: cell.displayConnectedCharger ? { row: cell.displayConnectedCharger.row, col: cell.displayConnectedCharger.col } : null,
				displayConnectedCar: cell.displayConnectedCar ? { row: cell.displayConnectedCar.row, col: cell.displayConnectedCar.col } : null,
				displayConnection: cell.displayConnection,
				carIcon: cell.carIcon,
				randomHue: cell.randomHue,
				randomSaturate: cell.randomSaturate,
			})));
		} else {
			for (let i = 0; i < this.rows; i++) {
				values[i] = values[i].map(cell => cell[type]);
			}
		}
		return values;
	}
	linkCarToCharger(car, charger) {
		car.displayConnection = car.getConnectionDirection(charger);
		charger.displayConnection = charger.getConnectionDirection(car);
		car.displayConnectedCharger = charger;
		charger.displayConnectedCar = car;
	}
	setState(board) {
		if (board.length !== this.rows || board[0].length !== this.cols) {
			throw new Error('Board size does not match');
		}
		console.log("board", board);
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				const cell = this.getCell(i, j);
				const cellState = board[i][j];
				cell.value = cellState.value;
				cell.correct = cellState.correct;
				cell.displayValue = cellState.displayValue;
				cell.hint = cellState.hint;
				cell.displayConnectedCharger = cellState.displayConnectedCharger ? this.getCell(cellState.displayConnectedCharger.row, cellState.displayConnectedCharger.col) : null;
				cell.displayConnectedCar = cellState.displayConnectedCar ? this.getCell(cellState.displayConnectedCar.row, cellState.displayConnectedCar.col) : null;
				cell.displayConnection = cellState.displayConnection;
				cell.carIcon = cellState.carIcon;
				cell.randomHue = cellState.randomHue;
				cell.randomSaturate = cellState.randomSaturate;
			}
		}
		console.log("this.cells", this.cells);
	}
}
