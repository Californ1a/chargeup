// Breadth-First Search
// https://www.youtube.com/watch?v=-he67EEM6z0

class Node {
	constructor(cell) {
		this.cell = cell;
		this.searched = false;
		this.parent = null;
	}
}

const nodes = new Map();

function createNodes(acc, n) {
	if (!nodes.has(n.id)) {
		const node = new Node(n);
		acc.push(node);
	}
	return acc;
}

export default function bfs(game, startCell) {
	const queue = [];
	let end;

	const start = new Node(startCell);
	start.searched = true;
	queue.push(start);
	nodes.set(startCell.id, start);
	let current;
	while (queue.length > 0) {
		current = queue.shift();
		const { cell } = current;
		if (cell.displayValue === 'charge' && !cell.displayConnection) {
			// found an unconnected charger
			end = current;
			break;
		}
		let neighbors = [];
		if (cell.displayValue === 'charge') {
			neighbors = game.getCellNeighbors(cell).filter(n => n.displayValue === 'car' && n.displayConnection).reduce(createNodes, []);
		} else if (cell.displayValue === 'car') {
			neighbors = game.getCellNeighbors(cell).filter(n => n.displayValue === 'charge').reduce(createNodes, []);
		}
		for (let i = 0; i < neighbors.length; i += 1) {
			const neighbor = neighbors[i];
			if (neighbor.searched) continue;
			neighbor.parent = current;
			neighbor.searched = true;
			queue.push(neighbor);
			nodes.set(neighbor.cell.id, neighbor);
		}
	}
	nodes.clear();
	console.log('end', end);
	if (!end) return null;

	const path = [];
	path.push(end);
	let next = end.parent;
	while (next) {
		path.push(next);
		next = next.parent;
	}
	return path.map(node => node.cell);
}
