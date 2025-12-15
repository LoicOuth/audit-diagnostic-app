<template>
  <div class="cart-view">
    <h2>Mon Panier</h2>

    <button @click="refresh" class="btn-refresh">
      Actualiser le panier
    </button>

    <div v-if="!token" class="warning">
      ⚠️ Vous devez être connecté pour voir votre panier
    </div>

    <div v-if="token && cartItems.length === 0" class="empty-state">
      Votre panier est vide
    </div>

    <div v-if="token && cartItems.length > 0">
      <div class="cart-items">
        <div v-for="(item, idx) in cartItems" :key="idx" class="cart-item">
          <div>
            <h3>{{ item.title }}</h3>
            <p>Quantité: {{ item.quantity }}</p>
            <p class="item-total">
              {{ item.price }}€ x {{ item.quantity }} = {{ (item.price * item.quantity).toFixed(2) }}€
            </p>
          </div>
        </div>
      </div>

      <div class="total-section">
        <h2>Total: {{ total.toFixed(2) }}€</h2>
      </div>

      <div class="payment-section">
        <h3>Paiement</h3>
        <input 
          v-model="cardNumber" 
          type="text" 
          placeholder="Numéro de carte"
          class="card-input"
        />
        <button @click="handlePayment" class="btn-pay">
          Payer {{ total.toFixed(2) }}€
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { getCart, pay } from '../api/bookstoreApi';

export default {
  name: 'CartView',
  props: {
    token: {
      type: String,
      default: null
    }
  },
  emits: ['paymentSuccess', 'showMessage'],
  setup(props, { emit }) {
    const cartItems = ref([]);
    const cardNumber = ref('');

    const total = computed(() => {
      return cartItems.value.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
    });

    async function loadCart() {
      if (!props.token) {
        return;
      }

      console.log('[CartView] Loading cart...');
      
      try {
        const data = await getCart(props.token);
        cartItems.value = data.cart || [];
      } catch (error) {
        console.error('[CartView] Error loading cart:', error);
        emit('showMessage', 'Erreur lors du chargement du panier');
      }
    }

    async function handlePayment() {
      console.log('[CartView] Processing payment...');

      if (!cardNumber.value) {
        emit('showMessage', 'Veuillez entrer un numéro de carte');
        return;
      }

      try {
        const data = await pay(props.token, cardNumber.value, total.value);
        console.log('[CartView] Payment successful:', data.orderId);
        
        cartItems.value = [];
        cardNumber.value = '';
        
        emit('paymentSuccess');
        emit('showMessage', `Paiement réussi ! Commande: ${data.orderId}`);
      } catch (error) {
        console.error('[CartView] Payment error:', error);
        emit('showMessage', 'Erreur de paiement');
      }
    }

    function refresh() {
      loadCart();
    }

    watch(() => props.token, (newToken) => {
      if (newToken) {
        loadCart();
      }
    });

    onMounted(() => {
      loadCart();
    });

    return {
      cartItems,
      cardNumber,
      total,
      handlePayment,
      refresh,
      token: computed(() => props.token)
    };
  }
}
</script>

<style scoped>
.cart-view {
  width: 100%;
}

.cart-view h2 {
  color: #333;
  margin-bottom: 20px;
}

.btn-refresh {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.btn-refresh:hover {
  opacity: 0.8;
}

.warning {
  padding: 20px;
  background: #fff3cd;
  border-radius: 5px;
  margin-bottom: 20px;
  color: #856404;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #666;
}

.cart-items {
  margin-bottom: 20px;
}

.cart-item {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.cart-item h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.cart-item p {
  margin: 5px 0;
  color: #666;
}

.item-total {
  font-weight: bold;
  color: #28a745 !important;
}

.total-section {
  margin-top: 20px;
  padding: 20px;
  background: #28a745;
  color: white;
  border-radius: 5px;
  text-align: right;
}

.total-section h2 {
  margin: 0;
  color: white;
}

.payment-section {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 5px;
}

.payment-section h3 {
  margin-top: 0;
  color: #333;
}

.card-input {
  width: 100%;
  max-width: 300px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-pay {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-pay:hover {
  opacity: 0.8;
}
</style>
