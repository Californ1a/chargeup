<template>
	<div ref="element">
		{{ timestamp }}
	</div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

const props = defineProps({
	date: {
		type: Date,
		required: true,
	},
	timeAgo: {
		type: Object,
		required: true,
	},
	pause: {
		type: Boolean,
		required: true,
		default: false,
	},
});
const timestamp = ref(props.timeAgo.format(props.date.getTime()));
const element = ref(null);
let interval;

function updateTime() {
	if (props.pause || !element.value) {
		clearInterval(interval);
		return;
	}
	const rect = element.value.getBoundingClientRect();
	if (rect.top < 0 || rect.bottom > window.innerHeight) return;
	timestamp.value = props.timeAgo.format(props.date.getTime());
}

watchEffect(() => {
	if (props.pause) return;
	interval = setInterval(updateTime, 1000 * 10);
});
</script>

<style scoped>

</style>
