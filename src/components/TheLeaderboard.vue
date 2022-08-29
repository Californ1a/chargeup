<template>
	<div class="leaderboard">
		<div class="header">
			<h2>Leaderboard</h2>
		</div>
		<div class="entry-headers">
			<div class="entry-header board-size">
				Size
			</div>
			<div class="entry-header hints">
				Hints
			</div>
			<div class="entry-header time">
				Time
			</div>
			<div class="entry-header time-per-cell">
				per Cell
			</div>
			<div class="entry-header time-per-car">
				per Car
			</div>
			<div class="entry-header date">
				Timestamp
			</div>
		</div>
		<div ref="entriesList" class="entries">
			<div v-for="entry in board"
				:key="entry.id"
				class="entry"
				:title="formatTimestamp(entry.date)">
				<div class="board-size">
					{{ entry.rows }} / {{ entry.cols }}
				</div>
				<div class="hints">
					{{ entry.hints.length }}
				</div>
				<div class="time">
					{{ formatMs(entry.time * 1000) }}
				</div>
				<div class="time-per-cell">
					{{ formatSec(entry.timePerCell) }}
				</div>
				<div class="time-per-car">
					{{ formatSec(entry.timePerCar) }}
				</div>
				<LBTimestamp :date="entry.date"
					:pause="pause"
					:time-ago="timeAgo"
					class="date" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import LBTimestamp from '@/components/LBTimestamp.vue';
import { liveQuery } from 'dexie';
import TimeAgo from 'javascript-time-ago';
import { useObservable } from '@vueuse/rxjs';
import { useMutationObserver } from '@vueuse/core';
import db from '@/store/db';
import formatMs from '@/util/formatMs';

// create timeAgo here so there's only 1 instance for the entire board
// rather than 1 instance per entry if it were in the component
const timeAgo = new TimeAgo('en-US');

const entriesList = ref(null);
const board = useObservable(liveQuery(async () => db.games.orderBy('date').toArray()));
const pause = ref(false);

useMutationObserver(entriesList, (mutations) => {
	if (mutations[0]) {
		const target = entriesList.value;
		if (mutations.length > 1) {
			target.scrollTop = target.scrollHeight;
			return;
		}
		target.scrollTo({
			top: target.scrollHeight,
			behavior: 'smooth',
		});
	}
}, {
	childList: true,
});

function formatTimestamp(date) {
	let d;
	if (date instanceof Date) {
		d = date;
	} else {
		d = new Date(date);
	}
	return new Intl.DateTimeFormat('default', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}

function formatSec(t) {
	return parseFloat(t).toFixed(2);
}

document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible') {
		pause.value = false;
	} else {
		pause.value = true;
	}
});
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
	min-width: 295px;
}

h2 {
	color: #fff;
	background: #333333aa;
	padding: 0.5rem;
}

.entries {
	overflow-y: scroll;
	position: absolute;
	top: 7rem;
	left: 1rem;
	right: 1rem;
	bottom: 1rem;
	border: 1px solid #cccccc66;
}

.entry,
.entry-headers {
	display: grid;
	grid-template-columns: 1fr 0.5fr 1fr 1fr 1fr 1.5fr;
	gap: 0;
	text-align: center;
	font-size: 0.8rem;
	white-space: nowrap;
}

.entry-headers {
	position: sticky;
	top: 0;
	padding: 0.3rem 0;
	padding-bottom: 0.2rem;
	background: #2e2e2e;
}

.entry:nth-child(even) {
	background: #33333366;
}

.entry-header.time {
	padding-right: 0.5rem;
}

.entry-header.board-size {
	padding-left: 0rem;
}

.entry .time,
.entry .time-per-cell,
.entry .time-per-car,
.entry .date,
.entry-header.time,
.entry-header.time-per-cell,
.entry-header.time-per-car {
	text-align: right;
}

.entry .date {
	font-size: 0.7rem;
	padding-right: 0.2rem;
}

.entry-header {
	font-weight: bold;
}

.entry>*,
.entry-header>* {
	padding-left: 10px;
}

.entry:hover {
	background: #333333aa;
}

::-webkit-scrollbar {
	width: 0.5rem;
}
</style>
