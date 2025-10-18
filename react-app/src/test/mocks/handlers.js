import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      token: 'mock-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      token: 'mock-token',
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    });
  }),

  // Products endpoints
  http.get('/api/products', () => {
    return HttpResponse.json([
      { _id: '1', name: 'Laptop', price: 999.99, stock: 10, category: 'Electronics' },
      { _id: '2', name: 'Phone', price: 599.99, stock: 5, category: 'Electronics' }
    ]);
  }),

  // Cart endpoints
  http.get('/api/cart', () => {
    return HttpResponse.json({
      items: [
        { productId: '1', quantity: 2, price: 999.99 }
      ]
    });
  }),

  http.post('/api/cart/items', () => {
    return HttpResponse.json({ message: 'Item added to cart' });
  }),

  // Orders endpoints
  http.get('/api/orders', () => {
    return HttpResponse.json([
      { _id: '1', total: 1999.98, status: 'pending', createdAt: '2023-01-01' }
    ]);
  }),

  http.post('/api/orders', () => {
    return HttpResponse.json({ _id: '1', total: 1999.98, status: 'pending' });
  })
];
