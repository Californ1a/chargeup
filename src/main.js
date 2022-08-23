import { createApp } from 'vue';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import App from './App.vue';

import './assets/main.css';

const app = createApp(App);

const toastOptions = {
	position: "top-right",
	timeout: 5000,
	closeOnClick: true,
	pauseOnFocusLoss: false,
	pauseOnHover: true,
	draggable: true,
	draggablePercent: 0.6,
	showCloseButtonOnHover: false,
	hideProgressBar: false,
	closeButton: "button",
	icon: true,
	rtl: false,
	transition: "Vue-Toastification__fade",
	toastClassName: "toast",
}

app.use(Toast, toastOptions);

app.mount('#app');
