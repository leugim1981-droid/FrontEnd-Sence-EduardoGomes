<template>
  <v-card>
    <v-card-title>{{ product.title }}</v-card-title>
    <v-card-text>{{ product.description }}</v-card-text>
  </v-card>
</template>

<script>
export default {
  props: ['product'],
  mounted() {
    console.log('ProductCard mounted')
  }
}
</script>
