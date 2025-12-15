<template>
  <div class="product-card">
    <h3>{{ product.title }}</h3>
    <p class="author">Par {{ product.author }}</p>
    <p class="price">{{ product.price }}€</p>
    <div v-html="product.description" class="description"></div>
    <p :class="['stock', { 'low-stock': product.stock <= 5 }]">
      Stock: {{ product.stock }}
    </p>
    <button @click="$emit('viewDetail', product)" class="btn-detail">
      Voir détails
    </button>
    <button @click="$emit('addToCart', product)" class="btn-add">
      Ajouter au panier
    </button>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  emits: ['viewDetail', 'addToCart']
}
</script>

<style scoped>
.product-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  background: white;
  transition: all 0.3s;
}

.product-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-card h3 {
  color: #007bff;
  font-size: 18px;
  margin-bottom: 10px;
}

.author {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.price {
  font-weight: bold;
  font-size: 20px;
  color: #28a745;
  margin-bottom: 10px;
}

.description {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.stock {
  font-size: 12px;
  color: green;
  margin-bottom: 10px;
}

.stock.low-stock {
  color: red;
}

.btn-detail {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 10px;
  width: 100%;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-add {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px;
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
}

.btn-detail:hover,
.btn-add:hover {
  opacity: 0.8;
}
</style>
