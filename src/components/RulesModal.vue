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
							<li>The number turns green when the correct number of cars are placed in the line. This does not mean they are in the correct place, just that the count is correct.</li>
						</ul>
					</li>
				</ul>
				<h3>Controls</h3>
				<ul>
					<li>Choose which type of tile to place with the mode buttons at the bottom.</li>
					<li>Click an individual cell or click & drag to place the selected type.</li>
					<li>Click on a row or column to fill the entire line with your selected type.
						<ul>
							<li>This will not affect cars connected to chargers so road can be easily filled once a line is complete.</li>
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
	background-color: rgba(0, 0, 0, 0.4);
	flex: 1;
}

.modal-content {
	background-color: rgb(23, 30, 36);
	margin: 15vh 28vw 38vh 28vw;
	width: 100%;
	overflow-y: overlay;
	border: 3px solid #22394d;
	border-radius: 5px;
}

.modal-content ul {
	list-style-type: disc;
	list-style-position: inside;
	padding: 0 2rem;
	line-height: 2rem;
	margin-bottom: 0.5rem;
}

.modal-content ul ul {
	padding-left: 3.5rem;
	text-indent: -1.5rem;
}

.modal-content h3 {
	margin-bottom: 5px;
	padding: 10px 15px;
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
	top: 2px;
	right: 1px;
	font-size: 2.5rem;
	z-index: 2;
	cursor: pointer;
	line-height: 1.4rem;
	overflow: hidden;
	background: #ff000044;
	border: 1px solid #ff000066;
}

.closebutton:hover {
	color: white;
	background: #ff000055;
	border: 1px solid #ff000077;
}

.closebutton:focus {
	outline: 1px dotted #bbb;
}
</style>
