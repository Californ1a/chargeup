<template>
	<div class="container">
		<div class="inner-container">
			<h1>Hold up!</h1>
			<p>Failed to persist board. User interaction required. Without persistence, the browser may automatically clear game saves.</p>
		</div>
		<button
			class="action"
			@click.stop="clicked">Save</button>
	</div>
</template>

<script setup>
const emit = defineEmits(['close-toast', 'persistenceGranted', 'persistenceDenied']);
async function clicked() {
	const persist = await navigator.storage.persist();
	if (persist) {
		emit('persistenceGranted');
		emit('close-toast');
	} else {
		emit('persistenceDenied');
		emit('close-toast');
	}
}
</script>

<style scoped>
.container {
	/* width: 20vw; */
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.action {
	/* height: 40px; */
	padding: 10px 9px;
	border-radius: 5px;
	color: #fff;
	cursor: pointer;
	border: thin solid currentColor;
	background-color: #ffffff22;
	font-weight: bold;
	font-size: 1rem;
}

.action:hover {
	background-color: #ffffff44;
}
</style>
