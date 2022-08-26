<template>
	<div class="control">
		<input type="radio"
			:id="btnType"
			:value="btnType"
			@click="$emit('update:modelValue', $event)">
		<label :for="btnType" :class="{selected:mode===btnType}">{{ capsFirst(btnType) }}</label>
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

</style>
