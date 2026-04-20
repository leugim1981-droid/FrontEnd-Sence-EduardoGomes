import Vue from 'vue'
import App from './App.vue'
import store from './store'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

new Vue({
  store,
  vuetify: new Vuetify(),
  render: h => h(App)
}).$mount('#app')
