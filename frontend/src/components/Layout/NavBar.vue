<template>
  <div class="navbar">
    <button 
      @click="$emit('changePage', 'products')"
      :class="{ active: currentPage === 'products' }">
      Produits
    </button>
    <button 
      @click="$emit('changePage', 'cart')"
      :class="{ active: currentPage === 'cart' }">
      Mon Panier ({{ cartCount }})
    </button>
    <button 
      v-if="!isLoggedIn"
      @click="$emit('changePage', 'login')"
      :class="{ active: currentPage === 'login', secondary: true }">
      Login
    </button>
    <button 
      v-if="!isLoggedIn"
      @click="$emit('changePage', 'register')"
      :class="{ active: currentPage === 'register', secondary: true }">
      S'inscrire
    </button>
    <button 
      v-if="isLoggedIn"
      @click="$emit('logout')"
      class="danger">
      Logout
    </button>
    <button 
      @click="$emit('changePage', 'admin')"
      :class="{ active: currentPage === 'admin', admin: true }">
      Admin
    </button>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    currentPage: {
      type: String,
      required: true
    },
    isLoggedIn: {
      type: Boolean,
      default: false
    },
    cartCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['changePage', 'logout']
}
</script>

<style scoped>
.navbar {
  display: flex;
  gap: 10px;
}

.navbar button {
  padding: 10px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.navbar button:hover {
  opacity: 0.8;
}

.navbar button.active {
  background: #28a745;
}

.navbar button.secondary {
  background: #6c757d;
}

.navbar button.danger {
  background: #dc3545;
}

.navbar button.admin {
  background: #17a2b8;
  color: #000;
}

.navbar button.admin.active {
  background: #ffc107;
}
</style>
