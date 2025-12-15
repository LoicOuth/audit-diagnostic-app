<template>
  <div id="app">
    <div class="container" :class="{ 'admin-container': currentPage === 'admin' }">
      <div class="header">
        <h1 class="title">
          📚 Bookstore {{ userName ? '- Bonjour ' + userName : '' }}
        </h1>
        <NavBar 
          :currentPage="currentPage"
          :isLoggedIn="!!token"
          :cartCount="cartCount"
          @changePage="changePage"
          @logout="handleLogout"
        />
      </div>

      <ProductListView 
        v-if="currentPage === 'products'"
        :token="token"
        @productAdded="handleProductAdded"
        @showMessage="showMessage"
      />

      <CartView 
        v-if="currentPage === 'cart'"
        :token="token"
        @paymentSuccess="handlePaymentSuccess"
        @showMessage="showMessage"
      />

      <LoginView 
        v-if="currentPage === 'login'"
        @loginSuccess="handleLoginSuccess"
        @showMessage="showMessage"
      />

      <RegisterView 
        v-if="currentPage === 'register'"
        @registerSuccess="handleRegisterSuccess"
        @showMessage="showMessage"
      />

      <AdminView 
        v-if="currentPage === 'admin'"
        :token="token"
        @productCreated="handleProductCreated"
        @showMessage="showMessage"
      />

      <div v-if="message" class="toast-message">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import NavBar from './components/Layout/NavBar.vue';
import ProductListView from './views/ProductListView.vue';
import CartView from './views/CartView.vue';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
import AdminView from './views/AdminView.vue';
import { getCart } from './api/bookstoreApi';

export default {
  name: 'App',
  components: {
    NavBar,
    ProductListView,
    CartView,
    LoginView,
    RegisterView,
    AdminView
  },
  setup() {
    console.log('[App] Initializing...');
    
    const currentPage = ref('products');
    const token = ref(null);
    const userName = ref('');
    const message = ref('');
    const cartItemsData = ref([]);

    const cartCount = computed(() => {
      return cartItemsData.value.reduce((sum, item) => sum + item.quantity, 0);
    });

    function changePage(page) {
      console.log('[App] Changing page to:', page);
      currentPage.value = page;
    }

    function showMessage(msg) {
      message.value = msg;
      setTimeout(() => {
        message.value = '';
      }, 3000);
    }

    async function loadCartData() {
      if (!token.value) return;
      
      try {
        const data = await getCart(token.value);
        cartItemsData.value = data.cart || [];
      } catch (error) {
        console.error('[App] Error loading cart data:', error);
      }
    }

    function handleLoginSuccess({ token: newToken, user }) {
      console.log('[App] Login successful');
      token.value = newToken;
      userName.value = user.email;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('userName', user.email);
      
      loadCartData();
      currentPage.value = 'products';
    }

    function handleRegisterSuccess() {
      console.log('[App] Registration successful');
      currentPage.value = 'login';
    }

    function handleLogout() {
      console.log('[App] Logging out...');
      token.value = null;
      userName.value = '';
      cartItemsData.value = [];
      
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      
      currentPage.value = 'login';
    }

    function handleProductAdded() {
      console.log('[App] Product added to cart');
      loadCartData();
    }

    function handlePaymentSuccess() {
      console.log('[App] Payment successful');
      cartItemsData.value = [];
      currentPage.value = 'products';
    }

    function handleProductCreated() {
      console.log('[App] Product created');
    }

    onMounted(() => {
      console.log('[App] Mounted');
      
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('userName');
      
      if (savedToken) {
        token.value = savedToken;
        userName.value = savedUser;
        console.log('[App] Token loaded from localStorage');
        loadCartData();
      }
    });

    return {
      currentPage,
      token,
      userName,
      message,
      cartCount,
      changePage,
      showMessage,
      handleLoginSuccess,
      handleRegisterSuccess,
      handleLogout,
      handleProductAdded,
      handlePaymentSuccess,
      handleProductCreated
    };
  }
}
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
  background: white;
  min-height: 100vh;
}

.container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.admin-container {
  max-width: 1200px;
}

.header {
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  color: #333;
  font-size: 28px;
  margin: 0;
}

.toast-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #007bff;
  color: white;
  padding: 15px;
  border-radius: 5px;
  max-width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 2000;
}
</style>
