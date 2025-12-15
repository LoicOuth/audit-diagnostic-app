<template>
  <div class="product-list-view">
    <div class="header">
      <h2>Liste des Livres</h2>
      <button @click="refresh" class="btn-refresh">
        Recharger la liste
      </button>
    </div>

    <div v-if="products.length === 0" class="empty-state">
      Aucun produit...
    </div>

    <div class="product-grid">
      <ProductCard 
        v-for="product in products" 
        :key="product.id"
        :product="product"
        @viewDetail="viewDetail"
        @addToCart="handleAddToCart"
      />
    </div>

    <ProductDetailModal 
      :product="selectedProduct"
      @close="selectedProduct = null"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import ProductCard from '../components/Product/ProductCard.vue';
import ProductDetailModal from '../components/Product/ProductDetailModal.vue';
import { getProducts, getProductById, addToCart } from '../api/bookstoreApi';

export default {
  name: 'ProductListView',
  components: {
    ProductCard,
    ProductDetailModal
  },
  props: {
    token: {
      type: String,
      default: null
    }
  },
  emits: ['productAdded', 'showMessage'],
  setup(props, { emit }) {
    const products = ref([]);
    const selectedProduct = ref(null);

    async function loadProducts() {
      const start = performance.now();
      console.log('[ProductListView] Loading products...');
      
      try {
        products.value = await getProducts();
        const duration = performance.now() - start;
        console.log(`[PERF-FRONT] ProductListView loaded in ${Math.round(duration)} ms`);
      } catch (error) {
        console.error('[ProductListView] Error loading products:', error);
        emit('showMessage', 'Erreur lors du chargement des produits');
      }
    }

    async function viewDetail(product) {
      console.log('[ProductListView] Viewing product detail:', product.id);
      
      try {
        selectedProduct.value = await getProductById(product.id);
      } catch (error) {
        console.error('[ProductListView] Error loading product detail:', error);
      }
    }

    async function handleAddToCart(product) {
      console.log('[ProductListView] Adding product to cart:', product.id);
      
      if (!props.token) {
        emit('showMessage', 'Vous devez être connecté pour ajouter au panier');
        return;
      }

      try {
        await addToCart(props.token, product.id, 1);
        emit('productAdded');
        emit('showMessage', 'Produit ajouté au panier !');
      } catch (error) {
        console.error('[ProductListView] Error adding to cart:', error);
        emit('showMessage', 'Erreur lors de l\'ajout au panier');
      }
    }

    function refresh() {
      loadProducts();
    }

    onMounted(() => {
      loadProducts();
    });

    return {
      products,
      selectedProduct,
      viewDetail,
      handleAddToCart,
      refresh
    };
  }
}
</script>

<style scoped>
.product-list-view {
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  color: #333;
  margin: 0;
}

.btn-refresh {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-refresh:hover {
  opacity: 0.8;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #666;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}
</style>
