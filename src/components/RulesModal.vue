<template>
	<div ref="modalElement" class="modal">
		<div class="modal-content">
			<button class="closebutton" @click="close">&times;</button>
			<div class="modal-content-inner">
				<h3>Rules</h3>
				<ul>
					<li>Each charger can only be connected to one car.</li>
					<li>Each car must not touch any other car, including diagonally.</li>
					<li>The numbers given in the rows and columns describe how many cars are in that line.
						<ul>
							<li>The number turns green when the correct number of cars are placed in the line.</li>
							<li>This does not mean they are in the correct place, just that the count is correct.</li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
const props = defineProps(['close', 'display']);
const modalElement = ref(null);

onMounted(() => {
	window.addEventListener("click", (event) => {
		if (event.target === modalElement.value) {
			props.close();
		}
	});
});
</script>

<style scoped>
.modal {
	display: v-bind('display');
	position: fixed;
	z-index: 1;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	overflow: auto;
	background-color: rgb(0, 0, 0);
	background-color: rgba(0, 0, 0, 0.4);
	flex: 1;
}

.modal-content {
	background-color: rgb(23, 30, 36);
	margin: 15vh 28vw 50vh 28vw;
	width: 100%;
	overflow-y: overlay;
	padding-right: 10px;
}

.modal-content ul {
	list-style-type: disc;
	list-style-position: inside;
	padding-left: 2rem;
	line-height: 2rem;
}

.modal-content h3 {
	margin: 10px 5px;
	padding: 5px 10px;
	position: sticky;
	top: 0;
	background-color: rgba(4, 18, 27, 0.75);
	backdrop-filter: blur(0.15em);
	z-index: 1;
}

.closebutton {
	float: right;
	position: sticky;
	background: none;
	color: #ccc;
	border: none;
	top: 15px;
	right: 7px;
	font-size: 2.5rem;
	z-index: 2;
	cursor: pointer;
	line-height: 1.4rem;
	overflow: hidden;
}

.closebutton:hover {
	color: white;
}

.closebutton:focus {
	outline: 1px dotted #bbb;
}
</style>
