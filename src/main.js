import { createApp, defineAsyncComponent } from 'vue';

import './assets/main.css';

createApp(defineAsyncComponent(() => import('./App.vue'))).mount('#app');
