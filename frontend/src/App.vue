<template>
  <!-- TODO: refactor this component, it's too big -->
  <!-- TODO: split into multiple components -->
  <!-- TODO: add proper routing -->
  
  <div id="app" :style="{ padding: '20px', maxWidth: p === 'admin' ? '1200px' : '900px', margin: '0 auto', background: 'white', minHeight: '100vh' }">
    
    <!-- Navigation très basique et bricolée -->
    <div :style="{ borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }">
      <h1 :style="{ color: '#333', fontSize: currentPage === 'login' ? '32px' : '28px' }">
        📚 Bookstore {{ userName ? '- Bonjour ' + userName : '' }}
      </h1>
      <div>
        <button @click="changePage('products')" :style="{ background: currentPage === 'products' ? '#28a745' : '#007bff' }">
          Produits
        </button>
        <button @click="changePage('cart')" :style="{ background: currentPage === 'cart' ? '#28a745' : '#007bff' }">
          Mon Panier ({{ cartItemCount }})
        </button>
        <button v-if="!token" @click="changePage('login')" :style="{ background: currentPage === 'login' ? '#28a745' : '#6c757d' }">
          Login
        </button>
        <button v-if="!token" @click="changePage('register')" :style="{ background: currentPage === 'register' ? '#28a745' : '#6c757d' }">
          S'inscrire
        </button>
        <button v-if="token" @click="logout" style="background: #dc3545;">
          Logout
        </button>
        <button @click="changePage('admin')" :style="{ background: currentPage === 'admin' ? '#ffc107' : '#17a2b8', color: '#000' }">
          Admin
        </button>
      </div>
    </div>

    <!-- Page de login -->
    <div v-if="currentPage === 'login'" :style="{ padding: '20px', background: '#f8f9fa', borderRadius: '5px' }">
      <h2>Connexion</h2>
      <div :style="{ marginTop: '20px' }">
        <input v-model="loginEmail" type="email" placeholder="Email" :style="{ width: '300px', display: 'block', marginBottom: '10px' }" />
        <input v-model="loginPassword" type="password" placeholder="Mot de passe" :style="{ width: '300px', display: 'block', marginBottom: '10px' }" />
        <button @click="doLogin" :style="{ background: '#28a745', padding: '12px 20px' }">
          Se connecter
        </button>
        <div v-if="loginError" :style="{ color: 'red', marginTop: '10px' }">
          {{ loginError }}
        </div>
      </div>
    </div>

    <!-- Page de register -->
    <div v-if="currentPage === 'register'" :style="{ padding: '20px', background: '#f8f9fa', borderRadius: '5px' }">
      <h2>Créer un compte</h2>
      <div :style="{ marginTop: '20px' }">
        <input v-model="regEmail" type="email" placeholder="Email" :style="{ width: '300px', display: 'block', marginBottom: '10px' }" />
        <input v-model="regPassword" type="password" placeholder="Password" :style="{ width: '300px', display: 'block', marginBottom: '10px' }" />
        <button @click="doRegister" :style="{ background: '#007bff', padding: '12px 20px' }">
          Créer le compte
        </button>
      </div>
    </div>

    <!-- Page produits -->
    <div v-if="currentPage === 'products'">
      <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }">
        <h2>Liste des Livres</h2>
        <button @click="loadProducts" :style="{ background: '#6c757d' }">
          Recharger la liste
        </button>
      </div>
      
      <!-- Liste des produits sans loader -->
      <div v-if="products.length === 0" :style="{ padding: '20px', textAlign: 'center', color: '#666' }">
        Aucun produit...
      </div>
      
      <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }">
        <div v-for="(product, index) in products" :key="index" 
             :style="{ 
               border: '1px solid #ddd', 
               padding: '15px', 
               borderRadius: '5px',
               background: selectedProduct && selectedProduct.id === product.id ? '#fff3cd' : 'white',
               transition: 'all 0.3s'
             }">
          <h3 :style="{ color: '#007bff', fontSize: '18px', marginBottom: '10px' }">
            {{ product.title }}
          </h3>
          <p :style="{ color: '#666', fontSize: '14px', marginBottom: '5px' }">
            Par {{ product.author }}
          </p>
          <p :style="{ fontWeight: 'bold', fontSize: '20px', color: '#28a745', marginBottom: '10px' }">
            {{ product.price }}€
          </p>
          <!-- v-html sans sanitization (MAUVAISE PRATIQUE) -->
          <div v-html="product.description" :style="{ fontSize: '12px', color: '#666', marginBottom: '10px' }"></div>
          <p :style="{ fontSize: '12px', color: product.stock > 5 ? 'green' : 'red' }">
            Stock: {{ product.stock }}
          </p>
          <button @click="viewProductDetail(product)" :style="{ background: '#17a2b8', width: '100%', marginBottom: '5px' }">
            Voir détails
          </button>
          <button @click="addToCart(product)" :style="{ background: '#28a745', width: '100%' }">
            Ajouter au panier
          </button>
        </div>
      </div>

      <!-- Détail du produit sélectionné -->
      <div v-if="selectedProduct" :style="{ 
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        background: 'white',
        padding: '30px',
        border: '3px solid #007bff',
        borderRadius: '10px',
        zIndex: 1000,
        maxWidth: '500px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }">
        <h2 :style="{ color: '#007bff' }">{{ selectedProduct.title }}</h2>
        <p><strong>Auteur:</strong> {{ selectedProduct.author }}</p>
        <p><strong>Prix:</strong> {{ selectedProduct.price }}€</p>
        <div v-html="selectedProduct.description" :style="{ margin: '15px 0' }"></div>
        <p><strong>En stock:</strong> {{ selectedProduct.stock }} exemplaires</p>
        <button @click="selectedProduct = null" :style="{ background: '#dc3545', marginTop: '15px' }">
          Fermer
        </button>
      </div>
      <div v-if="selectedProduct" @click="selectedProduct = null" :style="{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        background: 'rgba(0,0,0,0.5)',
        zIndex: 999
      }"></div>
    </div>

    <!-- Page panier -->
    <div v-if="currentPage === 'cart'">
      <h2>Mon Panier</h2>
      
      <button @click="loadCart" :style="{ background: '#6c757d', marginBottom: '20px' }">
        Actualiser le panier
      </button>

      <div v-if="!token" :style="{ padding: '20px', background: '#fff3cd', borderRadius: '5px', marginBottom: '20px' }">
        ⚠️ Vous devez être connecté pour voir votre panier
      </div>

      <div v-if="token && cartItems.length === 0" :style="{ padding: '20px', textAlign: 'center', color: '#666' }">
        Votre panier est vide
      </div>

      <div v-if="token && cartItems.length > 0">
        <div v-for="(item, idx) in cartItems" :key="idx" 
             :style="{ 
               border: '1px solid #ddd', 
               padding: '15px', 
               marginBottom: '10px',
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               background: '#f8f9fa'
             }">
          <div>
            <h3 :style="{ margin: 0, color: '#333' }">{{ item.title }}</h3>
            <p :style="{ margin: '5px 0', color: '#666' }">Quantité: {{ item.quantity }}</p>
            <p :style="{ margin: 0, fontWeight: 'bold', color: '#28a745' }">
              {{ item.price }}€ x {{ item.quantity }} = {{ (item.price * item.quantity).toFixed(2) }}€
            </p>
          </div>
        </div>

        <div :style="{ 
          marginTop: '20px', 
          padding: '20px', 
          background: '#28a745', 
          color: 'white',
          borderRadius: '5px',
          textAlign: 'right'
        }">
          <h2 :style="{ margin: 0 }">Total: {{ cartTotal.toFixed(2) }}€</h2>
        </div>

        <div :style="{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '5px' }">
          <h3>Paiement</h3>
          <input v-model="cardNumber" type="text" placeholder="Numéro de carte" 
                 :style="{ width: '300px', display: 'block', marginBottom: '10px' }" />
          <button @click="doPayment" :style="{ background: '#007bff', padding: '12px 20px' }">
            Payer {{ cartTotal.toFixed(2) }}€
          </button>
        </div>
      </div>
    </div>

    <!-- Page admin (accessible sans vraie vérification) -->
    <div v-if="currentPage === 'admin'" :style="{ padding: '20px', background: '#fff3cd', borderRadius: '5px' }">
      <h2 :style="{ color: '#856404' }">🔧 Admin Panel</h2>
      <p :style="{ color: '#856404', marginBottom: '20px' }">
        (Attention: accès non sécurisé, juste pour démo)
      </p>

      <div :style="{ background: 'white', padding: '20px', borderRadius: '5px' }">
        <h3>Créer un nouveau livre</h3>
        <input v-model="newProduct.title" placeholder="Titre" 
               :style="{ width: '100%', display: 'block', marginBottom: '10px' }" />
        <input v-model="newProduct.author" placeholder="Auteur" 
               :style="{ width: '100%', display: 'block', marginBottom: '10px' }" />
        <input v-model="newProduct.price" type="number" placeholder="Prix" 
               :style="{ width: '100%', display: 'block', marginBottom: '10px' }" />
        <textarea v-model="newProduct.description" placeholder="Description" 
                  :style="{ width: '100%', height: '100px', display: 'block', marginBottom: '10px', padding: '8px' }">
        </textarea>
        <input v-model="newProduct.stock" type="number" placeholder="Stock" 
               :style="{ width: '100%', display: 'block', marginBottom: '10px' }" />
        
        <button @click="createProduct" :style="{ background: '#28a745', padding: '12px 20px', fontSize: '16px' }">
          Créer le produit
        </button>
      </div>
    </div>

    <!-- Message de debug -->
    <div v-if="debugMessage" :style="{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: '#007bff',
      color: 'white',
      padding: '15px',
      borderRadius: '5px',
      maxWidth: '300px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      zIndex: 2000
    }">
      {{ debugMessage }}
    </div>

  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUpdated } from 'vue'

export default {
  name: 'App',
  
  setup() {
    console.log('Setup function called')
    
    // Compteur de rerenders pour la page produits
    const renderCount = ref(0);
    
    // Variables d'état mélangées sans organisation claire
    const currentPage = ref('products')
    const p = ref('products') // Variable mal nommée (MAUVAISE PRATIQUE)
    const products = ref([])
    const selectedProduct = ref(null)
    const cartItems = ref([])
    const token = ref(null)
    const userName = ref('')
    const loginEmail = ref('')
    const loginPassword = ref('')
    const loginError = ref('')
    const regEmail = ref('')
    const regPassword = ref('')
    const cardNumber = ref('')
    const debugMessage = ref('')
    
    // Objet pour le nouveau produit admin
    const newProduct = ref({
      title: '',
      author: '',
      price: 0,
      description: '',
      stock: 0
    })

    // URL de l'API en dur (MAUVAISE PRATIQUE)
    const API_URL = 'http://localhost:3000'

    console.log('Variables initialized')

    // Charger le token depuis localStorage (non sécurisé)
    onMounted(() => {
      console.log('Component mounted')
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('userName')
      
      if (savedToken) {
        token.value = savedToken
        userName.value = savedUser
        console.log('Token loaded from localStorage:', savedToken)
      }
      
      // Charger les produits au montage
      loadProducts()
      
      console.log('Initial load complete')
    })

    onUpdated(() => {
      renderCount.value++;
      console.log('[RENDER] App updated - render count =', renderCount.value);
   });

    // Computed property lourde avec calculs inutiles (MAUVAISE PRATIQUE)
    const cartItemCount = computed(() => {
      console.log('Computing cart item count...')
      let count = 0
      for (let i = 0; i < cartItems.value.length; i++) {
        count += cartItems.value[i].quantity
        // Calcul inutile pour ralentir
        for (let j = 0; j < 1000; j++) {
          Math.sqrt(j)
        }
      }
      console.log('Cart item count:', count)
      return count
    })

    // Computed property pour le total du panier
    const cartTotal = computed(() => {
      console.log('Computing cart total...')
      let total = 0
      cartItems.value.forEach(item => {
        total += item.price * item.quantity
      })
      console.log('Cart total:', total)
      return total
    })

    // Watcher très large qui se déclenche trop souvent (MAUVAISE PRATIQUE)
    watch(currentPage, (newVal, oldVal) => {
      console.log('Page changed from', oldVal, 'to', newVal)
      p.value = newVal
      
      // Recharger les produits à chaque changement de page (inutile - MAUVAISE PRATIQUE)
      if (newVal === 'products') {
        console.log('Reloading products because page changed...')
        loadProducts()
      }
      
      if (newVal === 'cart' && token.value) {
        console.log('Reloading cart because page changed...')
        loadCart()
      }
    })

    // Watcher sur les produits qui recharge encore (MAUVAISE PRATIQUE)
    watch(products, () => {
      console.log('Products changed, length:', products.value.length)
      // Faire quelque chose d'inutile
      products.value.forEach(p => {
        console.log('Product:', p.title)
      })
    })

    // Fonction pour charger les produits (appel API dupliqué partout)
    function loadProducts() {
      const start = performance.now();
      console.log('Loading products...')
      console.log('Fetching from:', API_URL + '/products')
      
      // Pas de gestion de loader (MAUVAISE PRATIQUE)
      
      // fetch dupliqué au lieu d'une fonction réutilisable (MAUVAISE PRATIQUE)
      fetch(API_URL + '/products')
        .then(response => {
          console.log('Response received:', response.status)
          return response.json()
        })
        .then(data => {
          console.log('Products data:', data)
          products.value = data
          const duration = performance.now() - start;
          console.log('[PERF-FRONT] loadProducts - ' + Math.round(duration) + ' ms');
          console.log('Products loaded successfully')
        })
        .catch(error => {
          console.log('Error loading products:', error) // Juste console.log (MAUVAISE PRATIQUE)
        })
    }

    // Fonction pour voir le détail d'un produit
    function viewProductDetail(product) {
      console.log('Viewing product:', product.id)
      
      // Refaire un appel API au lieu d'utiliser les données déjà chargées (MAUVAISE PRATIQUE)
      fetch(API_URL + '/products/' + product.id)
        .then(response => response.json())
        .then(data => {
          console.log('Product detail:', data)
          selectedProduct.value = data
        })
        .catch(error => {
          console.log('Error:', error)
        })
    }

    // Fonction de login (duplication de code fetch)
    function doLogin() {
      console.log('Attempting login...')
      console.log('Email:', loginEmail.value)
      console.log('Password:', loginPassword.value) // Logger le password (TRÈS MAUVAISE PRATIQUE)
      
      loginError.value = ''
      
      // Pas de validation (MAUVAISE PRATIQUE)
      
      fetch(API_URL + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginEmail.value,
          password: loginPassword.value
        })
      })
      .then(response => {
        console.log('Login response:', response.status)
        if (response.ok) {
          return response.json()
        } else {
          throw new Error('Login failed')
        }
      })
      .then(data => {
        console.log('Login successful:', data)
        console.log('Token:', data.token) // Logger le token (MAUVAISE PRATIQUE)
        
        // Stocker le token dans localStorage (non sécurisé - MAUVAISE PRATIQUE)
        token.value = data.token
        userName.value = data.user.email
        localStorage.setItem('token', data.token)
        localStorage.setItem('userName', data.user.email)
        
        debugMessage.value = 'Connecté !'
        setTimeout(() => { debugMessage.value = '' }, 2000)
        
        // Changer de page
        currentPage.value = 'products'
        
        // Charger le panier
        loadCart()
      })
      .catch(error => {
        console.log('Login error:', error)
        loginError.value = 'Erreur de connexion'
      })
    }

    // Fonction de register (encore de la duplication)
    function doRegister() {
      console.log('Attempting registration...')
      console.log('Email:', regEmail.value)
      console.log('Password:', regPassword.value) // Logger le password (TRÈS MAUVAISE PRATIQUE)
      
      // Aucune validation (MAUVAISE PRATIQUE)
      
      fetch(API_URL + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: regEmail.value,
          password: regPassword.value
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Registration successful:', data)
        debugMessage.value = 'Compte créé ! Vous pouvez vous connecter'
        setTimeout(() => { debugMessage.value = '' }, 3000)
        currentPage.value = 'login'
      })
      .catch(error => {
        console.log('Registration error:', error)
      })
    }

    // Fonction pour ajouter au panier
    function addToCart(product) {
      console.log('Adding to cart:', product.id)
      
      if (!token.value) {
        console.log('No token, cannot add to cart')
        alert('Vous devez être connecté') // alert au lieu d'un message UI propre (MAUVAISE PRATIQUE)
        return
      }
      
      // Duplication de code fetch (MAUVAISE PRATIQUE)
      fetch(API_URL + '/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token.value
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Added to cart:', data)
        debugMessage.value = 'Produit ajouté !'
        setTimeout(() => { debugMessage.value = '' }, 2000)
        
        // Recharger le panier immédiatement (appel API inutile - MAUVAISE PRATIQUE)
        loadCart()
      })
      .catch(error => {
        console.log('Error adding to cart:', error)
      })
    }

    // Fonction pour charger le panier
    function loadCart() {
      console.log('Loading cart...')
      
      if (!token.value) {
        console.log('No token, cannot load cart')
        return
      }
      
      fetch(API_URL + '/cart', {
        headers: {
          'Authorization': token.value
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log('Cart loaded:', data)
        cartItems.value = data.cart || []
      })
      .catch(error => {
        console.log('Error loading cart:', error)
      })
    }

    // Fonction de paiement
    function doPayment() {
      console.log('Processing payment...')
      console.log('Card number:', cardNumber.value) // Logger les données sensibles (TRÈS MAUVAISE PRATIQUE)
      
      // Pas de validation du numéro de carte (MAUVAISE PRATIQUE)
      
      fetch(API_URL + '/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token.value
        },
        body: JSON.stringify({
          cardNumber: cardNumber.value,
          amount: cartTotal.value
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Payment successful:', data)
        alert('Paiement réussi ! Commande: ' + data.orderId) // alert (MAUVAISE PRATIQUE)
        
        // Vider le panier local
        cartItems.value = []
        cardNumber.value = ''
        
        currentPage.value = 'products'
      })
      .catch(error => {
        console.log('Payment error:', error)
        alert('Erreur de paiement')
      })
    }

    // Fonction pour créer un produit (admin)
    function createProduct() {
      console.log('Creating product...')
      console.log('Product data:', newProduct.value)
      
      // Pas de validation (MAUVAISE PRATIQUE)
      // Pas de vérification du rôle réel (MAUVAISE PRATIQUE)
      
      fetch(API_URL + '/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token.value || 'fake-token'
        },
        body: JSON.stringify({
          ...newProduct.value,
          role: 'admin' // Passer le rôle en clair (TRÈS MAUVAISE PRATIQUE)
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Product created:', data)
        alert('Produit créé avec succès !') // alert (MAUVAISE PRATIQUE)
        
        // Reset du formulaire
        newProduct.value = {
          title: '',
          author: '',
          price: 0,
          description: '',
          stock: 0
        }
        
        // Recharger les produits
        loadProducts()
      })
      .catch(error => {
        console.log('Error creating product:', error)
        alert('Erreur lors de la création')
      })
    }

    // Fonction logout
    function logout() {
      console.log('Logging out...')
      token.value = null
      userName.value = ''
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      cartItems.value = []
      currentPage.value = 'login'
      console.log('Logged out')
    }

    // Fonction pour changer de page
    function changePage(page) {
      console.log('Changing page to:', page)
      currentPage.value = page
    }

    console.log('Setup complete')

    // Retourner toutes les variables et fonctions (liste très longue - MAUVAISE PRATIQUE)
    return {
      currentPage,
      p,
      products,
      selectedProduct,
      cartItems,
      token,
      userName,
      loginEmail,
      loginPassword,
      loginError,
      regEmail,
      regPassword,
      cardNumber,
      debugMessage,
      newProduct,
      cartItemCount,
      cartTotal,
      loadProducts,
      viewProductDetail,
      doLogin,
      doRegister,
      addToCart,
      loadCart,
      doPayment,
      createProduct,
      logout,
      changePage
    }
  }
}
</script>

<style scoped>
/* Quelques styles scoped mais mal organisés */
/* TODO: move to external CSS file */

#app {
  font-family: Arial, sans-serif;
}

h2 {
  color: #333;
  margin-bottom: 15px;
}

button:hover {
  opacity: 0.8;
}

/* Style qui va potentiellement causer des conflits */
div div div {
  /* Sélecteur trop large */
}
</style>
