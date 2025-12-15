<template>
  <div class="register-view">
    <h2>Créer un compte</h2>
    <div class="register-form">
      <input 
        v-model="email" 
        type="email" 
        placeholder="Email"
        class="input-field"
        @keyup.enter="handleRegister"
      />
      <input 
        v-model="password" 
        type="password" 
        placeholder="Password"
        class="input-field"
        @keyup.enter="handleRegister"
      />
      <button @click="handleRegister" class="btn-register">
        Créer le compte
      </button>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { register } from '../api/bookstoreApi';

export default {
  name: 'RegisterView',
  emits: ['registerSuccess', 'showMessage'],
  setup(props, { emit }) {
    const email = ref('');
    const password = ref('');
    const error = ref('');

    async function handleRegister() {
      console.log('[RegisterView] Attempting registration...');
      error.value = '';

      if (!email.value || !password.value) {
        error.value = 'Veuillez remplir tous les champs';
        return;
      }

      try {
        await register(email.value, password.value);
        console.log('[RegisterView] Registration successful');
        
        emit('registerSuccess');
        emit('showMessage', 'Compte créé ! Vous pouvez vous connecter');
        
        email.value = '';
        password.value = '';
      } catch (err) {
        console.error('[RegisterView] Registration error:', err);
        error.value = 'Erreur lors de l\'inscription';
      }
    }

    return {
      email,
      password,
      error,
      handleRegister
    };
  }
}
</script>

<style scoped>
.register-view {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 5px;
  max-width: 400px;
}

.register-view h2 {
  color: #333;
  margin-top: 0;
}

.register-form {
  margin-top: 20px;
}

.input-field {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.btn-register {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}

.btn-register:hover {
  opacity: 0.8;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}
</style>
