const carIcons = ["🚗", "🚙"];

export class Cell {
	constructor(row, col, value) {
		this.id = `${row}-${col}`;
		this.row = row;
		this.col = col;
		this.value = value; // 🚗 ⛽
		this.correct = false;
		this.element = null;
		this.hover = false;
		this.displayValue = null;
		this.carIcon = carIcons[Math.floor(Math.random() * carIcons.length)];
		this.connectedCharger = null;
		this.connectedCar = null;
		this.displayConnectedCharger = null;
		this.displayConnectedCar = null;
		this.displayConnection = null;
		this.hint = false;
		this.randomHue = (Math.random() * 361).toFixed(2);
		this.randomSaturate = Math.floor(Math.random() * (2.5 - 0.5 + 1)) + 0.5;
	}

	display(value) {
		this.displayValue = value;
		if (value === this.value) {
			this.correct = true;
		} else {
			this.correct = false;
		}
	}
	setConnectedCar(cell) {
		this.connectedCar = cell;
	}
	setConnectedCharger(cell) {
		this.connectedCharger = cell;
	}

	setDisplayConnection(cell) {
		const dir = this.getConnectionDirection(cell);
		const reverseDir = cell.getConnectionDirection(this);
		this.displayConnection = dir;
		cell.displayConnection = reverseDir;
	}

	getConnectionDirection(cell) {
		const colOffset = cell.col - this.col;
		const rowOffset = cell.row - this.row;
		return (colOffset === 0) ? (rowOffset > 0 ? "down" : "up") : (colOffset > 0 ? "right" : "left");
	}
	clearDisplayConnections() {
		this.displayConnectedCharger = null;
		this.displayConnectedCar = null;
		this.displayConnection = null;
	}
}
