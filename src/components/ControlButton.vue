<template>
	<div class="control" tabindex="0">
		<input :id="btnType"
			type="radio"
			:value="btnType"
			@click="$emit('update:modelValue', $event)">
		<label :for="btnType" :class="{ selected: mode === btnType }">{{ capsFirst(btnType) }}</label>
	</div>
</template>

<script setup>
defineEmits(['update:modelValue']);
defineProps({
	mode: {
		type: String,
		default: 'road',
		required: true,
	},
	btnType: {
		type: String,
		default: 'road',
		required: true,
	},
});

function capsFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
</script>

<style scoped>
.control {
	color: #fff;
	text-align: center;
	font-size: 1rem;
	height: fit-content;
}

input[type="radio"] {
	display: none;
}

.control label {
	display: block;
	cursor: pointer;
	background: #111;
	color: #fff;
	padding: 3px;
	border-radius: 5px;
	border: 1px solid #fff;
	transition: all 0.2s ease-in-out;
}

.control:focus {
	outline-color: Highlight;
	outline-color: -webkit-focus-ring-color;
	outline-style: auto;
	outline-width: 1px;
	z-index: 2;
	background: #333;
}

@supports selector(:focus-visible) {

	.control:focus {
		outline: none;
		z-index: 0;
		background: initial;
	}

}

.control:focus-visible {
	outline-color: Highlight;
	outline-color: -webkit-focus-ring-color;
	outline-style: auto;
	outline-width: 3px;
	z-index: 2;
	background: #333;
}

.control label:hover,
.control:focus-visible label {
	background: #333;
}

.control label.selected {
	background: #444;
}
</style>
