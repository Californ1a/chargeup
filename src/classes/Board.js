import { Cell } from './Cell';

export class Board {
	constructor(rows, cols) {
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
			this.generateBoard();
		}
		this.hints = [];
		this.startTime = null;
		this.endTime = null;
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
		return (this.endTime) ? this.endTime - this.startTime : null;
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
		let attempts = 0;
		const maxAttempts = this.rows * this.cols * 15;
		while (this.getFlatCells().filter(cell => cell.value === null).length > 0 && attempts < maxAttempts) {
			const randomRow = Math.floor(Math.random() * this.rows);
			const randomCol = Math.floor(Math.random() * this.cols);
			const cell = this.getCell(randomRow, randomCol);
			if (cell.value !== null) {
				attempts++;
				continue;
			}

			const chargerNeighbors = this.getCellNeighbors(cell);
			const emptyChargerNeighbors = chargerNeighbors.filter(cell => cell.value === null);
			if (emptyChargerNeighbors.length === 0) {
				// no empty neighbors so this cell can't be a charger
				attempts++;
				continue;
			}

			const allowsCar = [];
			for (const potentialCar of emptyChargerNeighbors) {
				// Check if the potential car has any neighbors that are already a car
				const carNeighbors = this.getCellNeighborsWithDiagonal(potentialCar);
				const carNeighborsWithObject = carNeighbors.filter(cell => {
					// Get cells with a car or charger, excluding the charger this car would be attached to
					return cell.value === 'car'
						|| (cell.value === 'charge' && cell.row !== randomRow && cell.col !== randomCol);
				});
				if (carNeighborsWithObject.length !== 0) continue;
				// If there are no car neighbors, then we know there is at least one neighbor
				// of the charger that can be a car
				allowsCar.push(potentialCar);
			}

			if (allowsCar.length === 0) {
				// no allowable cars for this charger location so this cell can't be a charger
				attempts++;
				continue;
			}

			// There was at least one place to put a car, so we can place the charger
			const chargerCell = this.setCell(randomRow, randomCol, 'charge');
			let randomEmptyChargerNeighbor;
			let carNeighbors;
			// We already know one of the neighbors allowed a car, so we can pick one of those
			randomEmptyChargerNeighbor = allowsCar[Math.floor(Math.random() * allowsCar.length)];
			carNeighbors = this.getCellNeighborsWithDiagonal(randomEmptyChargerNeighbor);
			const carNeighborsWithObject = carNeighbors.filter(cell => cell.value === 'car');
			if (carNeighborsWithObject.length === 0) {
				const carCell = this.setCell(randomEmptyChargerNeighbor.row, randomEmptyChargerNeighbor.col, 'car');
				carCell.setConnectedCharger(chargerCell);
				chargerCell.setConnectedCar(carCell);
			}
			// Now set all the other neighbors to be road
			const neighborsOfCarWithoutValue = carNeighbors.filter(cell => cell.value === null);
			for (const cell of neighborsOfCarWithoutValue) {
				if (cell.value === null) {
					this.setCell(cell.row, cell.col, 'road');
				}
			}
		}
		console.log(this.getAs('value'));
		// Attempt to place extra cars at unset cells
		let remainingCells = this.getFlatCells().filter(cell => cell.value === null);
		let potentialCars = remainingCells.filter(c => this.getCellNeighborsWithDiagonal(c).filter(n => n.value === 'car').length === 0);
		while (potentialCars.length > 0) {
			const randomCar = potentialCars[Math.floor(Math.random() * potentialCars.length)];
			const potentialChargers = this.getCellNeighbors(randomCar).filter(c => c.value === 'road' || c.value === null);
			if (potentialChargers.length > 0) {
				const carCell = this.setCell(randomCar.row, randomCar.col, 'car');
				const charger = potentialChargers[Math.floor(Math.random() * potentialChargers.length)];
				const chargerCell = this.setCell(charger.row, charger.col, 'charge');
				carCell.setConnectedCharger(chargerCell);
				chargerCell.setConnectedCar(carCell);
			} else {
				this.setCell(randomCar.row, randomCar.col, 'road');
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
	getAs(type) {
		const values = [...this.cells];
		for (let i = 0; i < this.rows; i++) {
			values[i] = values[i].map(cell => cell[type]);
		}
		return values;
	}
}
