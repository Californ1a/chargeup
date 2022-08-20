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
		this.hint = false;
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

}
