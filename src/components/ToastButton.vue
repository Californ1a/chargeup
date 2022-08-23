<template>
	<div class="container">
		<span>Failed to save board.</span>
		<button
			class="action"
			@click.stop="clicked">Save</button>
	</div>
</template>

<script setup>
const emit = defineEmits(['close-toast']);
async function clicked() {
	const persist = await navigator.storage.persist();
	if (persist) {
		emit('close-toast');
	} else {
		emit('close-toast');
	}
}
</script>

<style scoped>
.container {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.action {
	height: 40px;
	padding: 5px 10px;
	border-radius: 5px;
	color: #fff;
	cursor: pointer;
	border: thin solid currentColor;
	background-color: #ffffff22;
}

.action:hover {
	background-color: #ffffff44;
}
</style>
