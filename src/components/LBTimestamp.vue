<template>
	<div>
		{{ time }}
	</div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
	date: {
		type: Date,
		required: true,
	},
	timeAgo: {
		type: Object,
		required: true,
	},
});
const time = ref(props.timeAgo.format(props.date.getTime()));

setInterval(() => {
	time.value = props.timeAgo.format(props.date.getTime());
}, 10000);
</script>

<style scoped>

</style>
