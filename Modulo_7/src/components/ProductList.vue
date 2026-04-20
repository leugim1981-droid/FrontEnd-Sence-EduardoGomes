<template>
  <div>
    <div v-if="loading">Cargando...</div>
    <div v-if="error">Error al cargar</div>
    <ProductCard v-for="p in products" :key="p.id" :product="p" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ProductCard from './ProductCard.vue'

export default {
  components: { ProductCard },
  computed: mapState(['products', 'loading', 'error']),
  created() {
    this.$store.dispatch('fetchProducts')
  }
}
</script>
