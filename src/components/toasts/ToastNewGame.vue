<template>
	<div class="container">
		<div class="inner-container">
			<h1>Are You Sure?</h1>
			<p>
				Give up your current game and start a new one?
			</p>
		</div>
		<div class="buttons">
			<button type="button"
				tabindex="0"
				class="action yes"
				@click.stop="clickedYes">
				Yes
			</button>
			<button type="button"
				tabindex="0"
				class="action no"
				@click.stop="clickedNo">
				Cancel
			</button>
		</div>
	</div>
</template>

<script setup>
import { onUnmounted } from 'vue';

const emit = defineEmits(['close-toast', 'yes', 'no']);
async function clickedYes() {
	emit('yes');
	emit('close-toast');
}
async function clickedNo() {
	emit('no');
	emit('close-toast');
}
onUnmounted(() => {
	emit('no');
});
</script>

<style scoped>
.container {
	/* width: 20vw; */
	display: grid;
	grid-template-columns: 1fr 1fr;
	/* grid-template-rows: 1fr 1fr; */
	grid-template-areas:
		"content content"
		"buttons buttons";
}

.inner-container {
	grid-area: content;
	display: flex;
	flex-direction: column;
	margin-right: 5rem;
	margin-bottom: 0.4rem;
	white-space: nowrap;
	/* justify-content: center; */
	/* align-items: center; */
}

.buttons {
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
	grid-area: buttons;
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

.action.yes {
	background-color: #00ff0022;
}

.action.yes:hover {
	background-color: #00ff0044;
}

.action.no {
	background-color: #ff000022;
}

.action.no:hover {
	background-color: #ff000044;
}
</style>
