<template>
  <v-app>
    <Header />
    <ProductList />
    <Footer />
  </v-app>
</template>

<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import ProductList from './components/ProductList.vue'

export default {
  components: { Header, Footer, ProductList }
}
</script>
