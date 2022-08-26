<template>
	<div class="loader">
		<div class="lds-ring">
			<!-- https://loading.io/css/ -->
			<div />
			<div />
			<div />
			<div />
		</div>
		<p class="generating">
			{{ loadingText }}
		</p>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const loadingText = ref(null);
let interval;
let attempts = 0;

function setLoadingText(text = 'Generating') {
	loadingText.value = text;
}

function ellipsis() {
	interval = setInterval(() => {
		if (attempts > 3) {
			setLoadingText();
			attempts = 0;
		} else {
			loadingText.value += '.';
		}
		attempts += 1;
	}, 300);
}

onMounted(() => {
	setLoadingText();
	ellipsis();
});
onUnmounted(() => {
	clearInterval(interval);
	console.log('Done loading');
});
</script>

<style scoped>
.loader {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 30px;
	margin: calc(20vh - 11%) auto auto auto;
}

.generating {
	font-size: 1.2rem;
	font-weight: bold;
	color: #ffa500dd;
}

.lds-ring {
	display: inline-block;
	position: relative;
	width: 80px;
	height: 80px;
}

.lds-ring div {
	box-sizing: border-box;
	display: block;
	position: absolute;
	width: 64px;
	height: 64px;
	margin: 8px;
	border: 8px solid #ffa500;
	border-radius: 50%;
	animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
	border-color: #ffa500 transparent transparent transparent;
}

.lds-ring div:nth-child(1) {
	animation-delay: -0.45s;
}

.lds-ring div:nth-child(2) {
	animation-delay: -0.3s;
}

.lds-ring div:nth-child(3) {
	animation-delay: -0.15s;
}

@keyframes lds-ring {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}
</style>
