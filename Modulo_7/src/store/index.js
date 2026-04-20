import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    products: [],
    loading: false,
    error: false
  },
  mutations: {
    SET_PRODUCTS(state, products) { state.products = products },
    SET_LOADING(state, val) { state.loading = val },
    SET_ERROR(state, val) { state.error = val }
  },
  actions: {
    async fetchProducts({ commit }) {
      commit('SET_LOADING', true)
      try {
        const res = await axios.get('https://fakestoreapi.com/products')
        commit('SET_PRODUCTS', res.data)
      } catch {
        commit('SET_ERROR', true)
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
})
