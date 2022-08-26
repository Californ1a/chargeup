import Dexie from 'dexie';

const db = new Dexie('ChargeUp');
db.version(1).stores({
	games: '++id, rows, cols, time, hintCount, timePerCell, timePerCar, date', // board, hints
	currentGame: 'id, date, time', // board, display, hints
});
export default db;
