<template>
	<span v-if="connection && cell.displayConnection === 'up'"
		:style="`filter: hue-rotate(${hue}deg) saturate(${saturate})`">
		<span class="up">^<br></span>{{ icon }}
	</span>
	<span v-else-if="connection && cell.displayConnection === 'down'"
		:style="`filter: hue-rotate(${hue}deg) saturate(${saturate})`">
		{{ icon }}<span class="down"><br>v</span>
	</span>
	<span v-else-if="connection && cell.displayConnection === 'left'"
		:style="`filter: hue-rotate(${hue}deg) saturate(${saturate})`">
		<span class="left">&lt;</span>{{ icon }}
	</span>
	<span v-else-if="connection && cell.displayConnection === 'right'"
		:style="`filter: hue-rotate(${hue}deg) saturate(${saturate})`">
		{{ icon }}<span class="right">&gt;</span>
	</span>
	<span v-else
		:style="`${(type==='car') ? `filter: hue-rotate(${hue}deg) saturate(${saturate})` : ''}`">
		{{ icon }}
	</span>
</template>

<script setup>
import { computed } from 'vue';
import { Cell } from '@/classes/Cell';
const props = defineProps({
	type: {
		type: String,
		default: 'road',
		required: true,
	},
	cell: {
		type: Cell,
		required: true,
	},
	rows: {
		type: Number,
		default: 0,
		required: true,
	},
	cols: {
		type: Number,
		default: 0,
		required: true,
	},
});

const hue = (props.type === 'car') ? props.cell.randomHue : 100;
const saturate = (props.type === 'car') ? props.cell.randomSaturate : 2.5;
const icon = (props.type === 'car') ? props.cell.carIcon : '⛽';
const connection = computed(() => {
	return (props.type === 'car') ? props.cell.displayConnectedCharger?.displayValue : props.cell.displayConnectedCar?.displayValue;
});
</script>

<style scoped>
span {
	white-space: nowrap;
}

.up {
	font-size: calc((13vh + 13vw) / (max(v-bind('rows'), v-bind('cols')) * 2));
}

.down,
.left,
.right {
	font-size: calc((10vh + 10vw) / (max(v-bind('rows'), v-bind('cols')) * 2));
}
</style>
