<template>
  <div class="admin-view">
    <h2>🔧 Admin Panel</h2>
    <p class="warning-text">
      (Attention: accès non sécurisé, juste pour démo)
    </p>

    <div class="admin-form">
      <h3>Créer un nouveau livre</h3>
      <input 
        v-model="form.title" 
        placeholder="Titre"
        class="input-field"
      />
      <input 
        v-model="form.author" 
        placeholder="Auteur"
        class="input-field"
      />
      <input 
        v-model.number="form.price" 
        type="number" 
        placeholder="Prix"
        class="input-field"
      />
      <textarea 
        v-model="form.description" 
        placeholder="Description"
        class="textarea-field"
      ></textarea>
      <input 
        v-model.number="form.stock" 
        type="number" 
        placeholder="Stock"
        class="input-field"
      />
      
      <button @click="handleCreateProduct" class="btn-create">
        Créer le produit
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { createProduct } from '../api/bookstoreApi';

export default {
  name: 'AdminView',
  props: {
    token: {
      type: String,
      default: null
    }
  },
  emits: ['productCreated', 'showMessage'],
  setup(props, { emit }) {
    const form = ref({
      title: '',
      author: '',
      price: 0,
      description: '',
      stock: 0
    });

    async function handleCreateProduct() {
      console.log('[AdminView] Creating product...');

      if (!form.value.title || !form.value.author) {
        emit('showMessage', 'Veuillez remplir au moins le titre et l\'auteur');
        return;
      }

      try {
        const data = await createProduct(props.token || 'fake-token', form.value);
        console.log('[AdminView] Product created:', data.productId);
        
        form.value = {
          title: '',
          author: '',
          price: 0,
          description: '',
          stock: 0
        };
        
        emit('productCreated');
        emit('showMessage', 'Produit créé avec succès !');
      } catch (error) {
        console.error('[AdminView] Error creating product:', error);
        emit('showMessage', 'Erreur lors de la création');
      }
    }

    return {
      form,
      handleCreateProduct
    };
  }
}
</script>

<style scoped>
.admin-view {
  padding: 20px;
  background: #fff3cd;
  border-radius: 5px;
}

.admin-view h2 {
  color: #856404;
  margin-top: 0;
}

.warning-text {
  color: #856404;
  margin-bottom: 20px;
}

.admin-form {
  background: white;
  padding: 20px;
  border-radius: 5px;
}

.admin-form h3 {
  margin-top: 0;
  color: #333;
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

.textarea-field {
  width: 100%;
  height: 100px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  resize: vertical;
}

.btn-create {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-create:hover {
  opacity: 0.8;
}
</style>
