<template>
	<div class="controls">
		<div class="control-group">
			<label for="mode">Mode</label>
			<ControlButton :mode="mode" btnType="car" @update:modelValue="$emit('update:modelValue', $event.target.value)" />
			<ControlButton :mode="mode" btnType="road" @update:modelValue="$emit('update:modelValue', $event.target.value)" />
		</div>
	</div>
</template>

<script setup>
import ControlButton from './ControlButton.vue';
defineProps(['mode']);
</script>

<style scoped>
.controls {
	padding-top: 15px;
	grid-area: controls;
	color: #fff;
	text-align: center;
	font-size: 1rem;
	justify-content: center;
	align-items: center;
	display: flex;
	user-select: none;
	position: sticky;
	bottom: 0;
	background: #222222f9;
}

.control-group {
	width: 50%;
	max-width: 300px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	grid-template-areas:
		"label label"
		"control control2";
	gap: 5px 20px;
	justify-content: space-evenly;
}

.control-group>label {
	grid-area: label;
	color: #fff;
	text-align: center;
	font-size: 1rem;
	font-weight: bold;
}

.control-group :deep(.control:first-child) {
	grid-area: control;
}

.control-group :deep(.control:nth-child(1)) {
	grid-area: control2;
}

.control-group :deep(.control) {
	color: #fff;
	text-align: center;
	font-size: 1rem;
}

.control-group :deep(input[type="radio"]) {
	display: none;
}

.control-group :deep(.control label) {
	display: block;
	cursor: pointer;
	background: #111;
	color: #fff;
	padding: 3px;
	border-radius: 5px;
	border: 1px solid #fff;
	transition: all 0.2s ease-in-out;
}

.control-group :deep(.control label:hover) {
	background: #333;
}

.control-group :deep(.control label.selected) {
	background: #444;
}
</style>
