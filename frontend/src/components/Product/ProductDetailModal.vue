<template>
  <div v-if="product" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>{{ product.title }}</h2>
      <p><strong>Auteur:</strong> {{ product.author }}</p>
      <p><strong>Prix:</strong> {{ product.price }}€</p>
      <div v-html="product.description" class="description"></div>
      <p><strong>En stock:</strong> {{ product.stock }} exemplaires</p>
      <button @click="$emit('close')" class="btn-close">
        Fermer
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductDetailModal',
  props: {
    product: {
      type: Object,
      default: null
    }
  },
  emits: ['close']
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 30px;
  border: 3px solid #007bff;
  border-radius: 10px;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
}

.modal-content h2 {
  color: #007bff;
  margin-bottom: 15px;
}

.modal-content p {
  margin: 10px 0;
}

.description {
  margin: 15px 0;
  color: #666;
}

.btn-close {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
}

.btn-close:hover {
  opacity: 0.8;
}
</style>
