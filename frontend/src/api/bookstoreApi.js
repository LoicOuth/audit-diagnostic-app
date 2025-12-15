const API_URL = 'http://localhost:3000';

export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export async function register(email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return response.json();
}

export async function getProducts() {
  const response = await fetch(`${API_URL}/products`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

export async function getProductById(id) {
  const response = await fetch(`${API_URL}/products/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }

  return response.json();
}

export async function addToCart(token, productId, quantity = 1) {
  const response = await fetch(`${API_URL}/cart/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ productId, quantity })
  });

  if (!response.ok) {
    throw new Error('Failed to add to cart');
  }

  return response.json();
}

export async function getCart(token) {
  const response = await fetch(`${API_URL}/cart`, {
    headers: {
      'Authorization': token
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }

  return response.json();
}

export async function pay(token, cardNumber, amount) {
  const response = await fetch(`${API_URL}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ cardNumber, amount })
  });

  if (!response.ok) {
    throw new Error('Payment failed');
  }

  return response.json();
}

export async function createProduct(token, productData) {
  const response = await fetch(`${API_URL}/admin/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({
      ...productData,
      role: 'admin'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create product');
  }

  return response.json();
}
