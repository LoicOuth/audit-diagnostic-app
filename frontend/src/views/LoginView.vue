<template>
  <div class="login-view">
    <h2>Connexion</h2>
    <div class="login-form">
      <input 
        v-model="email" 
        type="email" 
        placeholder="Email"
        class="input-field"
        @keyup.enter="handleLogin"
      />
      <input 
        v-model="password" 
        type="password" 
        placeholder="Mot de passe"
        class="input-field"
        @keyup.enter="handleLogin"
      />
      <button @click="handleLogin" class="btn-login">
        Se connecter
      </button>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { login } from '../api/bookstoreApi';

export default {
  name: 'LoginView',
  emits: ['loginSuccess', 'showMessage'],
  setup(props, { emit }) {
    const email = ref('');
    const password = ref('');
    const error = ref('');

    async function handleLogin() {
      console.log('[LoginView] Attempting login...');
      error.value = '';

      if (!email.value || !password.value) {
        error.value = 'Veuillez remplir tous les champs';
        return;
      }

      try {
        const data = await login(email.value, password.value);
        console.log('[LoginView] Login successful');
        
        emit('loginSuccess', {
          token: data.token,
          user: data.user
        });
        emit('showMessage', 'Connecté !');
        
        email.value = '';
        password.value = '';
      } catch (err) {
        console.error('[LoginView] Login error:', err);
        error.value = 'Erreur de connexion';
      }
    }

    return {
      email,
      password,
      error,
      handleLogin
    };
  }
}
</script>

<style scoped>
.login-view {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 5px;
  max-width: 400px;
}

.login-view h2 {
  color: #333;
  margin-top: 0;
}

.login-form {
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

.btn-login {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}

.btn-login:hover {
  opacity: 0.8;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}
</style>
