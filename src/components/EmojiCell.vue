<template>
	<span
		v-if="connection && cell.displayConnection === 'up'"
		:style="`filter: hue-rotate(${hue}deg) saturate(${saturate})`">
		<span class="up">^<br /></span>{{ icon }}
	</span>
	<span
		v-else-if="connection && cell.displayConnection === 'down'"
		:style="`filter: hue-rotate(${hue}deg) saturate(${saturate})`">
		{{ icon }}<span class="down"><br />v</span>
	</span>
	<span
		v-else-if="connection && cell.displayConnection === 'left'"
		:style="`filter: hue-rotate(${hue}deg) saturate(${saturate})`">
		<span class="left">&lt;</span>{{ icon }}
	</span>
	<span
		v-else-if="connection && cell.displayConnection === 'right'"
		:style="`filter: hue-rotate(${hue}deg) saturate(${saturate})`">
		{{ icon }}<span class="right">&gt;</span>
	</span>
	<span v-else
		:style="`${(type==='car') ? `filter: hue-rotate(${hue}deg) saturate(${saturate})` : ''}`">
		{{ icon }}
	</span>
</template>

<script setup>
const props = defineProps(['type', 'cell']);

const hue = (props.type === 'car') ? props.cell.randomHue : 100;
const saturate = (props.type === 'car') ? props.cell.randomSaturate : 2.5;
const icon = (props.type === 'car') ? props.cell.carIcon : '⛽';
const connection = (props.type === 'car') ? props.cell.displayConnectedCharger?.displayValue : props.cell.displayConnectedCar?.displayValue;
</script>
