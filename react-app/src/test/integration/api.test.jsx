import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('API Integration', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('handles authentication flow', async () => {
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    });
    
    const data = await loginResponse.json();
    
    expect(loginResponse.ok).toBe(true);
    expect(data.token).toBe('mock-token');
    expect(data.user.email).toBe('test@example.com');
  });

  it('handles product fetching', async () => {
    const response = await fetch('/api/products');
    const products = await response.json();
    
    expect(response.ok).toBe(true);
    expect(products).toHaveLength(2);
    expect(products[0].name).toBe('Laptop');
  });

  it('handles cart operations', async () => {
    // Get cart
    const getResponse = await fetch('/api/cart');
    const cart = await getResponse.json();
    
    expect(getResponse.ok).toBe(true);
    expect(cart.items).toHaveLength(1);
    
    // Add to cart
    const addResponse = await fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: '2', quantity: 1, price: 599.99 })
    });
    
    expect(addResponse.ok).toBe(true);
  });

  it('handles error responses', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      })
    );
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@example.com', password: 'wrong' })
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid credentials');
  });

  it('handles network errors gracefully', async () => {
    server.use(
      http.get('/api/products', () => {
        return HttpResponse.error();
      })
    );
    
    try {
      await fetch('/api/products');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
