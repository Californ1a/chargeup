<template>
	<div class="leaderboard">
		<div class="header">
			<h2>Leaderboard</h2>
		</div>
		<div class="entries">
			<div class="entry-header">
				<div class="entry-header-date">
					Date
				</div>
				<div class="entry-header-boardsize">
					Rows / Cols
				</div>
				<div class="entry-header-time">
					Time
				</div>
			</div>
			<div v-for="entry in board" :key="entry.id">
				<div class="entry">
					<div class="date">
						{{ relativeDays(entry.date.getTime()) }}
					</div>
					<div class="board-size">
						{{ entry.rows }} / {{ entry.cols }}
					</div>
					<div class="time">
						{{ entry.time.slice(0, 5) }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { liveQuery } from 'dexie';
import db from '@/store/db';
import { useObservable } from '@vueuse/rxjs';

const board = useObservable(liveQuery(async () => db.games.orderBy('date').reverse().limit(10).toArray()));

// look into https://www.npmjs.com/package/javascript-time-ago
// https://bobbyhadz.com/blog/javascript-convert-timestamp-to-time-ago
function relativeDays(timestamp) {
	const rtf = new Intl.RelativeTimeFormat('en', {
		numeric: 'auto',
	});
	const oneDayInMs = 1000 * 60 * 60 * 24;
	const daysDifference = Math.round(
		(timestamp - new Date().getTime()) / oneDayInMs,
	);

	return rtf.format(daysDifference, 'day');
}
</script>

<style scoped>
.header {
	position: sticky;
	top: 0;
	text-align: center;
	font-weight: bold;
	color: white;
	background-color: #2e2e2e;
	padding: 0.5rem;
	z-index: 1;
}

h2 {
	color: #fff;
	background: #333333aa;
	padding: 0.5rem;
}

.entries {
	/* overflow-y: auto; */
	padding: 1rem 0.5rem;
	/* height: 100%; */
	/* max-height: calc(100vh - 9rem); */
}

.entry,
.entry-header {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}

.entry-header {
	border-bottom: 1px solid #ccc;
	font-weight: bold;
}
</style>
