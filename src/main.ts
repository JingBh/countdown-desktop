import Vue from 'vue'
import { FormPlugin, FormGroupPlugin, FormInputPlugin } from 'bootstrap-vue'

import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false
Vue.use(FormPlugin)
Vue.use(FormGroupPlugin)
Vue.use(FormInputPlugin)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
