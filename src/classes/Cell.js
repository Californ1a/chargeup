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
		this.carIcon = (Math.random() < 0.5) ? "🚗" : "🚙";
	}

	display(value) {
		this.displayValue = value;
		if (value === this.value) {
			this.correct = true;
		} else {
			this.correct = false;
		}
	}
}
